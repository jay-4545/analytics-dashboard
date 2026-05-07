import { NextResponse } from "next/server";
import { startOfDay, startOfMonth, subDays, subMonths } from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import Revenue from "@/models/Revenue";
import Event from "@/models/Event";

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const startOfThisMonth = startOfMonth(now);
    const startOfLastMonth = startOfMonth(subMonths(now, 1));
    const sevenDaysAgo     = subDays(now, 7);
    const todayStart       = startOfDay(now);

    const [
      totalUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      activeUsers,
      totalRevenueAgg,
      revenueThisMonthAgg,
      revenueLastMonthAgg,
      totalEvents,
      eventsToday,
      usersByPlan,
      usersByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ joinedAt: { $gte: startOfThisMonth } }),
      User.countDocuments({ joinedAt: { $gte: startOfLastMonth, $lt: startOfThisMonth } }),
      User.countDocuments({ lastActiveAt: { $gte: sevenDaysAgo } }),

      Revenue.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Revenue.aggregate([
        { $match: { status: "paid", date: { $gte: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Revenue.aggregate([
        { $match: { status: "paid", date: { $gte: startOfLastMonth, $lt: startOfThisMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),

      Event.countDocuments(),
      Event.countDocuments({ timestamp: { $gte: todayStart } }),

      User.aggregate([
        { $group: { _id: "$plan", count: { $sum: 1 } } },
        { $project: { plan: "$_id", count: 1, _id: 0 } },
      ]),
      User.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { status: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    const totalRevenue      = totalRevenueAgg[0]?.total ?? 0;
    const revenueThisMonth  = revenueThisMonthAgg[0]?.total ?? 0;
    const revenueLastMonth  = revenueLastMonthAgg[0]?.total ?? 0;

    const calcGrowth = (current: number, previous: number) =>
      previous > 0
        ? Math.round(((current - previous) / previous) * 1000) / 10
        : current > 0 ? 100 : 0;

    return NextResponse.json({
      totalUsers,
      newUsersThisMonth,
      userGrowthPercent:     calcGrowth(newUsersThisMonth, newUsersLastMonth),
      activeUsers,
      totalRevenue,
      revenueThisMonth,
      revenueGrowthPercent:  calcGrowth(revenueThisMonth, revenueLastMonth),
      totalEvents,
      eventsToday,
      usersByPlan,
      usersByStatus,
    });
  } catch (err) {
    console.error("[dashboard]", err);
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 });
  }
}
