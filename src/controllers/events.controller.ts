import type { Request, Response } from "express";
import { Event } from "../models/event.model";

export async function createEvent(req: Request, res: Response) {
  try {
    const { title, description, location, startDate, endDate, capacity } =
      req.body;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (user.role !== "organizer") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create events",
      });
    }

    const newEvent = await Event.create({
      title,
      description,
      location,
      startDate,
      endDate,
      capacity,
      organizer: user.id,
    });

    return res.status(201).json({
      success: true,
      message: "Event created successfully",
      event: newEvent.toObject(),
    });
  } catch (error) {
    console.error("CREATE_EVENT_CONTROLLER_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function fetchAllEvents(req: Request, res: Response) {
  try {
    const events = await Event.find().lean();
    return res.status(200).json({
      success: true,
      message: "Events fetched successfully",
      events,
    });
  } catch (error) {
    console.error("FETCH_ALL_EVENT_CONTROLLER_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function fetchEventById(req: Request, res: Response) {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found!",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error("FETCH_EVENT_BY_ID_CONTROLLER_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function registerUserForEvent(req: Request, res: Response) {
  try {
    if (!req.user) throw new Error("user is not defined!");
    const { eventId } = req.params;
    const event = await Event.findOneAndUpdate(
      {
        _id: eventId!,
        status: "active",
        attendees: { $ne: req.user.id },
        $expr: { $lt: [{ $size: "$attendees" }, "$capacity"] },
      },
      { $push: { attendees: req.user.id } },
      { returnDocument: "after" },
    );

    if (!event) {
      return res.status(400).json({
        success: false,
        message: "Unable to update event",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Event updated successfully",
      event,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User is not authenticated",
      });
    }

    const { eventId } = req.params;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: "eventId is required",
      });
    }

    // Admin can delete any event
    if (req.user.role === "admin") {
      const event = await Event.findOneAndDelete({
        _id: eventId,
      });

      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found!",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Event deleted successfully",
        event,
      });
    }

    // Organizer can delete only their own event
    const event = await Event.findOneAndDelete({
      _id: eventId,
      organizer: req.user.id,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you are not the organizer",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      event,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
