import mongoose from "mongoose";

export const eventCategory = ["Tech", "Music", "Workshop", "Community"];
export const eventStatus = ["published", "active", "completed", "cancelled"];

export type EventCategory = "Tech" | "Music" | "Workshop" | "Community";
export type EventStatus = "published" | "active" | "completed" | "cancelled";

export interface IEvent extends mongoose.Document {
  image: string;
  title: string;
  description: string;
  location: string;
  category: EventCategory;
  startDate: Date;
  endDate: Date;
  // registrationDeadline?: Date;
  capacity: number;
  // price: number;
  // tags: string[];
  isFeatured: boolean;
  status: EventStatus;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
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
      // validate: {
      //   validator(this: IEvent, value: Date) {
      //     return !this.startDate || value > this.startDate;
      //   },
      //   message: "endDate must be later than startDate.",
      // },
    },
    // registrationDeadline: {
    //   type: Date,
    //   validate: {
    //     validator(this: IEvent, value?: Date) {
    //       return !value || !this.startDate || value <= this.startDate;
    //     },
    //     message: "registrationDeadline must be on or before startDate.",
    //   },
    // },
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
    // price: {
    //   type: Number,
    //   default: 0,
    //   min: 0,
    // },
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
    // tags: {
    //   type: [String],
    //   default: [],
    //   validate: {
    //     validator: (values: string[]) => values.length <= 10,
    //     message: "An event can have at most 10 tags.",
    //   },
    // },
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
    attendees: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

eventSchema.index({ attendees: 1 });
eventSchema.index({ title: "text", description: "text", tags: "text" });
eventSchema.index({ status: 1, startDate: 1 });

const Event = mongoose.model<IEvent>("Event", eventSchema);
export { Event };
