import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "user" | "viewer";
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "banned";
  country: string;
  city: string;
  revenue: number;
  joinedAt: Date;
  lastActiveAt: Date;
}

const UserSchema = new Schema<IUser>({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
  avatar:       { type: String, default: "" },
  role:         { type: String, enum: ["admin", "user", "viewer"], default: "user" },
  plan:         { type: String, enum: ["free", "pro", "enterprise"], default: "free" },
  status:       { type: String, enum: ["active", "inactive", "banned"], default: "active" },
  country:      { type: String, default: "" },
  city:         { type: String, default: "" },
  revenue:      { type: Number, default: 0 },
  joinedAt:     { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

UserSchema.index({ email: 1 });
UserSchema.index({ plan: 1, status: 1 });
UserSchema.index({ joinedAt: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
