import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "user" | "organizer" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "organizer", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

export const User = mongoose.model<IUser>("User", userSchema);
