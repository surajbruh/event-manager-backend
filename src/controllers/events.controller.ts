import type { Request, Response } from "express";
import { Event, type IEvent } from "../models/event.model";
import redisClient from "../redis.config";
import { supabase } from "../supbase.config";
import { generateFilename } from "../utils";
import mongoose from "mongoose";

export async function createEvent(req: Request, res: Response) {
  try {
    const {
      title,
      description,
      location,
      category,
      startDate,
      endDate,
      capacity,
    } = req.body;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (user.role !== "organizer" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizers can create events",
      });
    }

    const file = req.file;

    if (!file)
      return res
        .status(400)
        .json({ success: false, message: "no images uploaded!" });

    const filename = generateFilename(file);
    const { error } = await supabase.storage
      .from("images")
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) return res.status(500).json({ error: error.message });

    const { data: publicURLData } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    const newEvent = await Event.create({
      image: publicURLData.publicUrl,
      title,
      description,
      location,
      category,
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
    const { q, category, page = "1", limit = "8", featured } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);

    const filter: Record<string, unknown> = {};

    if (category) filter.category = category;

    if (q) {
      const search = String(q).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rx = new RegExp(search, "i");

      filter.$or = [{ title: rx }, { location: rx }];
    }

    if (featured) filter.isFeatured = true;

    const [events, total] = await Promise.all([
      Event.find(filter)
        .sort({ startDate: 1 })
        .skip((currentPage - 1) * pageLimit)
        .populate("organizer", "name")
        .limit(pageLimit),
      Event.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      events,
      page: currentPage,
      total,
      pages: Math.max(1, Math.ceil(total / pageLimit)),
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

    const cacheKey = `events:${eventId}`;
    const TTL = 300;

    const cachedEvent = await redisClient.get(cacheKey);

    if (cachedEvent)
      return res.status(200).json({
        success: true,
        message: "cached data",
        event: JSON.parse(cachedEvent),
      });

    const event = await Event.findById(eventId).populate("organizer", "name");

    await redisClient.setEx(cacheKey, TTL, JSON.stringify(event));

    if (!event)
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });

    return res.status(200).json({
      success: true,
      message: "Event fetched successfully",
      event,
    });
  } catch (error) {
    console.error("FETCH__EVENT_CONTROLLER_ERROR:", error);
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

    const cacheKey = `events:${eventId}`;
    await redisClient.del(cacheKey);

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

export async function updateEvent(req: Request, res: Response) {
  try {
    const { eventId } = req.params;

    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (user.role !== "organizer" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizers and admins can update events",
      });
    }

    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }

    // Only allow fields that the client is permitted to update.
    const allowedFields = [
      "title",
      "description",
      "location",
      "category",
      "startDate",
      "endDate",
      "capacity",
      "isFeatured",
      "status",
    ] as const;

    const payload: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        payload[field] = req.body[field];
      }
    }

    // Upload a replacement image only when one was provided.
    if (req.file) {
      const filename = generateFilename(req.file);

      const { error } = await supabase.storage
        .from("images")
        .upload(filename, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (error) {
        return res.status(500).json({
          success: false,
          message: "Image upload failed",
        });
      }

      const { data } = supabase.storage.from("images").getPublicUrl(filename);

      payload.image = data.publicUrl;
    }

    if (Object.keys(payload).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No update fields provided",
      });
    }

    // Admins can update any event; organizers only their own.
    const filter =
      user.role === "admin"
        ? { _id: eventId! }
        : { _id: eventId!, organizer: user.id };

    const updatedEvent = await Event.findOneAndUpdate(
      filter,
      { $set: payload },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found or you do not have permission to update it",
      });
    }

    await redisClient.del(`events:${eventId}`);

    return res.status(200).json({
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (error) {
    console.error("UPDATE_EVENT_CONTROLLER_ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
