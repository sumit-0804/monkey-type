import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  email: string;
  name: string;
  avatarUrl: string;
  bio: string;
  degree?: string;
  startYear?: number;
  tags: string[];
  isAdmin: boolean;
  isCheater: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "" },
    degree: { type: String },
    startYear: { type: Number },
    tags: { type: [String], default: [] },
    isAdmin: { type: Boolean, default: false },
    isCheater: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
