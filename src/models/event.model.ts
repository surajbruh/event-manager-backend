import mongoose, { Document, Schema, Types } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  organizer: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
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
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
