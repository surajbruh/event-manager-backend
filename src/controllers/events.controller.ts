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
