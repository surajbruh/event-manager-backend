import mongoose from "mongoose";

export const eventCategory = ["Tech", "Music", "Workshop", "Community"];
export const eventStatus = ["published", "active", "completed", "cancelled"];

export type EventCategory = "Tech" | "Music" | "Workshop" | "Community";
export type EventStatus = "published" | "active" | "completed" | "cancelled";

export interface IEvent {
  image: string;
  title: string;
  description: string;
  location: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  capacity: number;
  isFeatured: boolean;
  status: EventStatus;
  organizer: mongoose.Types.ObjectId;
  registeredCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new mongoose.Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    startDate: {
      type: Date,
      required: true,
      index: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
      min: 1,
      max: 100000,
      validate: {
        validator: Number.isInteger,
        message: "capacity must be a whole number.",
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["Tech", "Music", "Workshop", "Community"],
      required: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["published", "active", "completed", "cancelled"],
      default: "published",
      index: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    registeredCount: {
      type: Number,
      // required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ title: "text", description: "text" });
eventSchema.index({ status: 1, startDate: 1 });

const Event = mongoose.model<IEvent>("Event", eventSchema);
export { Event };
