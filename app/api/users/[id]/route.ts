import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Revenue from "@/models/Revenue";
import Event from "@/models/Event";

type Ctx = { params: { id: string } };

function isValidId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_: NextRequest, { params }: Ctx) {
  try {
    await connectToDatabase();

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const [user, transactions, recentEvents] = await Promise.all([
      User.findById(params.id).lean(),
      Revenue.find({ userId: params.id })
        .sort({ date: -1 })
        .limit(20)
        .lean(),
      Event.find({ userId: params.id })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean(),
    ]);

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ ...user, transactions, recentEvents });
  } catch (err) {
    console.error("[users/:id GET]", err);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  try {
    await connectToDatabase();

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const body = await request.json() as Record<string, unknown>;

    // Only allow specific fields to be updated
    const allowed = ["name", "email", "role", "plan", "status", "country", "city", "avatar"];
    const update: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    if (update.email) {
      update.email = (update.email as string).trim().toLowerCase();
      const emailStr = update.email as string;
      const conflict = await User.findOne({ email: emailStr, _id: { $ne: params.id } });
      if (conflict) {
        return NextResponse.json({ error: "Email already in use" }, { status: 409 });
      }
    }

    const updated = await User.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[users/:id PUT]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  try {
    await connectToDatabase();

    if (!isValidId(params.id)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(params.id);
    if (!deleted) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Cascade: remove associated revenue records and anonymise events
    const oid = new mongoose.Types.ObjectId(params.id);
    await Promise.all([
      Revenue.deleteMany({ userId: oid }),
      Event.updateMany({ userId: oid }, { $unset: { userId: "" } }),
    ]);

    return NextResponse.json({ message: "User deleted" });
  } catch (err) {
    console.error("[users/:id DELETE]", err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
