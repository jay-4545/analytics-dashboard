import { NextRequest, NextResponse } from "next/server";
import { subMonths, startOfMonth } from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import Revenue from "@/models/Revenue";

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate   = searchParams.get("endDate");
    const plan      = searchParams.get("plan");
    const status    = searchParams.get("status");
    const page      = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
    const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

    // Build the transaction filter
    const filter: Record<string, unknown> = {};

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) dateFilter.$gte = new Date(startDate);
      if (endDate)   dateFilter.$lte = new Date(endDate);
      filter.date = dateFilter;
    }
    if (plan)   filter.plan   = plan;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    // Last 6 months window for chart data
    const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5));

    const [
      transactions,
      totalCount,
      totalRevenueAgg,
      revenueByMonth,
      revenueByPlan,
      revenueByStatus,
    ] = await Promise.all([
      // Paginated transaction list with user info
      Revenue.find(filter)
        .populate("userId", "name email avatar plan")
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Revenue.countDocuments(filter),

      // Sum of paid revenue for the current filter
      Revenue.aggregate([
        { $match: { ...filter, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
      ]),

      // Monthly revenue for the last 6 months (always paid, ignores date filter)
      Revenue.aggregate([
        { $match: { status: "paid", date: { $gte: sixMonthsAgo } } },
        { $group: {
          _id:     { $dateToString: { format: "%Y-%m", date: "$date" } },
          revenue: { $sum: "$amount" },
          count:   { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
        { $project: { month: "$_id", revenue: 1, count: 1, _id: 0 } },
      ]),

      // Revenue breakdown by plan (paid only, ignores date filter)
      Revenue.aggregate([
        { $match: { status: "paid" } },
        { $group: {
          _id:     "$plan",
          revenue: { $sum: "$amount" },
          count:   { $sum: 1 },
        }},
        { $project: { plan: "$_id", revenue: 1, count: 1, _id: 0 } },
      ]),

      // All statuses breakdown (respects date filter)
      Revenue.aggregate([
        { $match: filter },
        { $group: {
          _id:   "$status",
          count: { $sum: 1 },
          total: { $sum: "$amount" },
        }},
        { $project: { status: "$_id", count: 1, total: 1, _id: 0 } },
      ]),
    ]);

    return NextResponse.json({
      transactions,
      totalCount,
      totalPages:    Math.ceil(totalCount / limit),
      page,
      limit,
      totalRevenue:  totalRevenueAgg[0]?.total ?? 0,
      paidCount:     totalRevenueAgg[0]?.count ?? 0,
      revenueByMonth,
      revenueByPlan,
      revenueByStatus,
    });
  } catch (err) {
    console.error("[revenue]", err);
    return NextResponse.json({ error: "Failed to fetch revenue data" }, { status: 500 });
  }
}
