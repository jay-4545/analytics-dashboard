import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IEvent extends Document {
  type: "pageview" | "click" | "signup" | "purchase" | "logout";
  page: string;
  userId?: Types.ObjectId;
  country: string;
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  timestamp: Date;
}

const EventSchema = new Schema<IEvent>({
  type:      { type: String, enum: ["pageview", "click", "signup", "purchase", "logout"], required: true },
  page:      { type: String, required: true },
  userId:    { type: Schema.Types.ObjectId, ref: "User", default: null },
  country:   { type: String, default: "" },
  device:    { type: String, enum: ["desktop", "mobile", "tablet"], required: true },
  browser:   { type: String, default: "" },
  timestamp: { type: Date, default: Date.now },
});

EventSchema.index({ timestamp: -1 });
EventSchema.index({ type: 1, timestamp: -1 });
EventSchema.index({ userId: 1 });

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
