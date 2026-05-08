import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS } from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.trim().toLowerCase() ?? "";
  const plan   = searchParams.get("plan")   ?? "";
  const status = searchParams.get("status") ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  const filtered = MOCK_USERS.filter((u) => {
    if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) return false;
    if (plan   && u.plan   !== plan)   return false;
    if (status && u.status !== status) return false;
    return true;
  });

  return NextResponse.json({
    users:      filtered.slice((page - 1) * limit, page * limit),
    totalCount: filtered.length,
    totalPages: Math.ceil(filtered.length / limit) || 1,
    page,
    limit,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as Record<string, unknown>;
  const { name, email, role, plan, status, country, city } = body as {
    name?: string; email?: string; role?: string; plan?: string;
    status?: string; country?: string; city?: string;
  };

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "name and email are required" }, { status: 400 });
  }

  const newUser = {
    _id:          `mock_user_${Date.now()}`,
    name:         name.trim(),
    email:        email.trim().toLowerCase(),
    avatar:       `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=6366f1&color=fff`,
    role:         role    ?? "user",
    plan:         plan    ?? "free",
    status:       status  ?? "active",
    country:      country ?? "",
    city:         city    ?? "",
    revenue:      0,
    joinedAt:     new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
  };

  return NextResponse.json(newUser, { status: 201 });
}
