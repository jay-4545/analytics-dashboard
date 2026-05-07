import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IRevenue extends Document {
  amount: number;
  currency: string;
  plan: "free" | "pro" | "enterprise";
  status: "paid" | "pending" | "failed" | "refunded";
  userId: Types.ObjectId;
  date: Date;
  description: string;
}

const RevenueSchema = new Schema<IRevenue>({
  amount:      { type: Number, required: true },
  currency:    { type: String, default: "USD" },
  plan:        { type: String, enum: ["free", "pro", "enterprise"], required: true },
  status:      { type: String, enum: ["paid", "pending", "failed", "refunded"], default: "paid" },
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  date:        { type: Date, required: true },
  description: { type: String, default: "" },
});

RevenueSchema.index({ date: -1 });
RevenueSchema.index({ userId: 1 });
RevenueSchema.index({ plan: 1, status: 1 });

const Revenue: Model<IRevenue> =
  mongoose.models.Revenue || mongoose.model<IRevenue>("Revenue", RevenueSchema);

export default Revenue;
