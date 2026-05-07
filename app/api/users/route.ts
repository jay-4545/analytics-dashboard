import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User, { type IUser } from "@/models/User";

const VALID_SORT_FIELDS = new Set([
  "name", "email", "plan", "status", "role", "revenue", "joinedAt", "lastActiveAt",
]);

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const search    = searchParams.get("search")?.trim() ?? "";
    const plan      = searchParams.get("plan");
    const status    = searchParams.get("status");
    const role      = searchParams.get("role");
    const rawSort   = searchParams.get("sortBy") ?? "joinedAt";
    const sortBy    = VALID_SORT_FIELDS.has(rawSort) ? rawSort : "joinedAt";
    const sortOrder = searchParams.get("sortOrder") === "asc" ? 1 : -1;
    const page      = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
    const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    const rawFilter: Record<string, unknown> = {};

    if (search) {
      rawFilter.$or = [
        { name:  { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (plan)   rawFilter.plan   = plan;
    if (status) rawFilter.status = status;
    if (role)   rawFilter.role   = role;

    // Cast required: filter is built dynamically; Mongoose types enforce strict enums
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter = rawFilter as any;

    const skip = (page - 1) * limit;

    const [users, totalCount] = await Promise.all([
      User.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter as Parameters<typeof User.countDocuments>[0]),
    ]);

    return NextResponse.json({
      users,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      page,
      limit,
    });
  } catch (err) {
    console.error("[users GET]", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json() as Record<string, unknown>;
    const { name, email, role, plan, status, country, city } = body as {
      name?: string; email?: string; role?: string; plan?: string;
      status?: string; country?: string; city?: string;
    };

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "name and email are required" }, { status: 400 });
    }

    const normalised = email.trim().toLowerCase();
    const existing   = await User.findOne({ email: normalised });
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const initials = encodeURIComponent(name.trim());
    const user = await User.create({
      name:         name.trim(),
      email:        normalised,
      avatar:       `https://ui-avatars.com/api/?name=${initials}&background=6366f1&color=fff`,
      role:         (role   ?? "user")   as IUser["role"],
      plan:         (plan   ?? "free")   as IUser["plan"],
      status:       (status ?? "active") as IUser["status"],
      country:      country ?? "",
      city:         city    ?? "",
      revenue:      0,
      joinedAt:     new Date(),
      lastActiveAt: new Date(),
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error("[users POST]", err);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
