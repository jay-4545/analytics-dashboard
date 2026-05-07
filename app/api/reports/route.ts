import { NextRequest, NextResponse } from "next/server";
import { subDays } from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Revenue from "@/models/Revenue";
import Event from "@/models/Event";

type ReportType = "users" | "revenue" | "analytics";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const type      = (searchParams.get("type") ?? "users") as ReportType;
    const startDate = searchParams.get("startDate");
    const endDate   = searchParams.get("endDate");

    const from = startDate ? new Date(startDate) : subDays(new Date(), 30);
    const to   = endDate   ? new Date(endDate)   : new Date();

    if (!["users", "revenue", "analytics"].includes(type)) {
      return NextResponse.json(
        { error: "type must be one of: users | revenue | analytics" },
        { status: 400 }
      );
    }

    if (type === "users") {
      const users = await User.find({ joinedAt: { $gte: from, $lte: to } })
        .sort({ joinedAt: -1 })
        .lean();

      const summary = {
        total:       users.length,
        byPlan:      tally(users, "plan"),
        byStatus:    tally(users, "status"),
        byRole:      tally(users, "role"),
        totalRevenue: users.reduce((s, u) => s + (u.revenue ?? 0), 0),
      };

      return NextResponse.json({ type, from, to, summary, data: users });
    }

    if (type === "revenue") {
      const dateFilter = { date: { $gte: from, $lte: to } };

      const [transactions, aggregates] = await Promise.all([
        Revenue.find(dateFilter)
          .populate("userId", "name email plan")
          .sort({ date: -1 })
          .lean(),
        Revenue.aggregate([
          { $match: dateFilter },
          { $group: {
            _id:      "$status",
            count:    { $sum: 1 },
            subtotal: { $sum: "$amount" },
          }},
        ]),
      ]);

      const summary = {
        total:      transactions.length,
        byStatus:   aggregates.reduce<Record<string, { count: number; subtotal: number }>>(
          (acc, r) => ({ ...acc, [r._id]: { count: r.count, subtotal: r.subtotal } }),
          {}
        ),
        totalPaid:  aggregates.find((r) => r._id === "paid")?.subtotal ?? 0,
      };

      return NextResponse.json({ type, from, to, summary, data: transactions });
    }

    // type === "analytics"
    const tsFilter = { timestamp: { $gte: from, $lte: to } };

    const [dailyEvents, topPages, deviceBreakdown, countryBreakdown, eventTypes] =
      await Promise.all([
        Event.aggregate([
          { $match: tsFilter },
          { $group: {
            _id:   { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            total: { $sum: 1 },
          }},
          { $sort: { _id: 1 } },
          { $project: { date: "$_id", total: 1, _id: 0 } },
        ]),

        Event.aggregate([
          { $match: { ...tsFilter, type: "pageview" } },
          { $group: { _id: "$page", views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 20 },
          { $project: { page: "$_id", views: 1, _id: 0 } },
        ]),

        Event.aggregate([
          { $match: tsFilter },
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $project: { device: "$_id", count: 1, _id: 0 } },
        ]),

        Event.aggregate([
          { $match: tsFilter },
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          { $project: { country: "$_id", count: 1, _id: 0 } },
        ]),

        Event.aggregate([
          { $match: tsFilter },
          { $group: { _id: "$type", count: { $sum: 1 } } },
          { $project: { type: "$_id", count: 1, _id: 0 } },
        ]),
      ]);

    const totalEvents = dailyEvents.reduce((s, d) => s + d.total, 0);

    return NextResponse.json({
      type, from, to,
      summary: { totalEvents, eventTypes },
      data: { dailyEvents, topPages, deviceBreakdown, countryBreakdown },
    });
  } catch (err) {
    console.error("[reports]", err);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}

function tally(arr: unknown[], key: string) {
  return (arr as Record<string, unknown>[]).reduce<Record<string, number>>((acc, item) => {
    const val = String(item[key] ?? "unknown");
    acc[val] = (acc[val] ?? 0) + 1;
    return acc;
  }, {});
}
