import { NextRequest, NextResponse } from "next/server";
import { MOCK_USERS, MOCK_TRANSACTIONS } from "@/lib/mockData";

type Ctx = { params: { id: string } };

export async function GET(_: NextRequest, { params }: Ctx) {
  const user = MOCK_USERS.find((u) => u._id === params.id) ?? MOCK_USERS[0];
  const idx  = MOCK_USERS.indexOf(user);
  const txs  = MOCK_TRANSACTIONS.filter((_, i) => i % 7 === idx % 7).slice(0, 4);
  return NextResponse.json({ ...user, transactions: txs, recentEvents: [] });
}

export async function PUT(request: NextRequest, { params }: Ctx) {
  const body   = await request.json() as Record<string, unknown>;
  const user   = MOCK_USERS.find((u) => u._id === params.id) ?? MOCK_USERS[0];
  return NextResponse.json({ ...user, ...body });
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  return NextResponse.json({ message: "User deleted", id: params.id });
}
