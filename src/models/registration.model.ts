import mongoose, { Document, Schema, Types } from "mongoose";

export interface IRegistration extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed",
    },
  },
  {
    timestamps: true,
  },
);

// A user can have only one registration record per event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export const Registration = mongoose.model<IRegistration>(
  "Registration",
  registrationSchema,
);
