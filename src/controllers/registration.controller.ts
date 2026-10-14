import type { Request, Response } from "express";
import mongoose from "mongoose";
import { Event, type IEvent } from "../models/event.model";
import { Registration, type IRegistration } from "../models/registration.model";
import redisClient from "../redis.config";

export async function registerUserForEvent(req: Request, res: Response) {
  const id = req.params.eventId!;
  const user = req.user;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event ID",
    });
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const filter: mongoose.QueryFilter<IRegistration> = {
    user: user.id,
    event: id,
  };

  try {
    const [ev, existingRegistration] = await Promise.all([
      Event.findById(id).lean(),
      Registration.findOne(filter).lean(),
    ]);

    if (!ev) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (ev.status !== "published") {
      return res.status(400).json({
        success: false,
        message: `Event is ${ev.status}, cannot register`,
      });
    }

    if (existingRegistration?.status === "confirmed") {
      return res.status(409).json({
        success: false,
        message: "Already registered for event",
      });
    }

    const session = await mongoose.startSession();

    let ticket: InstanceType<typeof Registration> | null = null;
    let reservationFailed = false;

    try {
      await session.withTransaction(async () => {
        // 1. Reserve a spot atomically.
        const updatedEvent = await Event.updateOne(
          {
            _id: id,
            status: "published",
            startDate: { $gt: new Date() },
            $expr: {
              $lt: ["$registeredCount", "$capacity"],
            },
          },
          {
            $inc: { registeredCount: 1 },
          },
          { session },
        );

        if (updatedEvent.modifiedCount !== 1) {
          reservationFailed = true;
          return;
        }

        // 2. Reactivate a cancelled ticket or create a new one.
        if (existingRegistration) {
          ticket = await Registration.findOneAndUpdate(
            {
              user: user.id,
              event: id,
              status: "cancelled",
            },
            {
              $set: { status: "confirmed" },
            },
            {
              returnDocument: "after",
              runValidators: true,
              session,
            },
          );

          if (!ticket) throw new Error("REGISTRATION_STATE_CHANGED");
        } else {
          const [createdTicket] = await Registration.create(
            [
              {
                user: user.id,
                event: ev._id,
                status: "confirmed",
              },
            ],
            { session },
          );

          ticket = createdTicket || null;
        }
      });
    } finally {
      await session.endSession();
    }

    if (reservationFailed) {
      return res.status(409).json({
        success: false,
        message: "Event is full, has started, or is no longer available",
      });
    }

    if (!ticket) {
      return res.status(500).json({
        success: false,
        message: "Unable to create ticket",
      });
    }

    await redisClient.del(`events:${id}`);

    return res.status(201).json({
      success: true,
      message: existingRegistration
        ? "Registration reactivated successfully"
        : "Event registration successful",
      ticket,
    });
  } catch (error) {
    console.error("REGISTER_EVENT_ERROR:", error);

    if (
      error instanceof Error &&
      error.message === "REGISTRATION_STATE_CHANGED"
    ) {
      return res.status(409).json({
        success: false,
        message: "Registration changed. Please try again.",
      });
    }

    // Handles concurrent requests hitting the unique index.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message: "Already registered for event",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function cancelRegistration(req: Request, res: Response) {
  const id = req.params.eventId!;
  const user = req.user;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event ID",
    });
  }

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const session = await mongoose.startSession();

  try {
    let ticket: InstanceType<typeof Registration> | null = null;

    await session.withTransaction(async function () {
      const filter: mongoose.QueryFilter<IRegistration> = {
        user: user.id,
        event: id,
        status: "confirmed",
      };

      ticket = await Registration.findOneAndUpdate(
        filter,
        { $set: { status: "cancelled" } },
        { returnDocument: "after", runValidators: true, session },
      );

      if (!ticket) return;

      const newFilter: mongoose.QueryFilter<IEvent> = {
        _id: id,
        status: "published",
        startDate: { $gt: new Date() },
        registeredCount: { $gt: 0 },
      };

      const updatedEvent = await Event.updateOne(
        newFilter,
        { $inc: { registeredCount: -1 } },
        { session },
      );

      if (updatedEvent.modifiedCount !== 1)
        throw new Error("Could not update the event registration counter");
    });

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, message: "Confirmed registration not found" });

    await redisClient.del(`events:${id}`);

    return res.status(200).json({
      success: true,
      message: "Registration cancelled successfully",
      ticket,
    });
  } catch (error) {
    console.error("CANCEL_REGISTRATION_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  } finally {
    await session.endSession();
  }
}
