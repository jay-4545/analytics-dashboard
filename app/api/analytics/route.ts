import { NextRequest, NextResponse } from "next/server";
import { parseISO, subDays } from "date-fns";
import { connectToDatabase } from "@/lib/mongodb";
import Event from "@/models/Event";

type GroupBy = "day" | "week" | "month";

const DATE_FORMATS: Record<GroupBy, string> = {
  day:   "%Y-%m-%d",
  week:  "%Y-W%V",
  month: "%Y-%m",
};

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate   = searchParams.get("endDate");
    const groupBy   = (searchParams.get("groupBy") ?? "day") as GroupBy;

    const from = startDate ? parseISO(startDate) : subDays(new Date(), 30);
    const to   = endDate   ? parseISO(endDate)   : new Date();

    if (!DATE_FORMATS[groupBy]) {
      return NextResponse.json({ error: "groupBy must be day | week | month" }, { status: 400 });
    }

    const dateFormat  = DATE_FORMATS[groupBy];
    const rangeFilter = { timestamp: { $gte: from, $lte: to } };

    const [
      eventsTimeline,
      topPages,
      deviceBreakdown,
      countryBreakdown,
      eventTypeCounts,
      browserBreakdown,
    ] = await Promise.all([
      // Pageviews over time, grouped by day/week/month
      Event.aggregate([
        { $match: { ...rangeFilter, type: "pageview" } },
        { $group: {
          _id:   { $dateToString: { format: dateFormat, date: "$timestamp" } },
          views: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
        { $project: { date: "$_id", views: 1, _id: 0 } },
      ]),

      // Top 10 pages by pageview count
      Event.aggregate([
        { $match: { ...rangeFilter, type: "pageview" } },
        { $group: { _id: "$page", views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
        { $project: { name: "$_id", views: 1, _id: 0 } },
      ]),

      // Desktop / mobile / tablet counts
      Event.aggregate([
        { $match: rangeFilter },
        { $group: { _id: "$device", count: { $sum: 1 } } },
        { $project: { device: "$_id", count: 1, _id: 0 } },
      ]),

      // Top 10 countries
      Event.aggregate([
        { $match: rangeFilter },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { country: "$_id", count: 1, _id: 0 } },
      ]),

      // Count per event type
      Event.aggregate([
        { $match: rangeFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
        { $project: { type: "$_id", count: 1, _id: 0 } },
      ]),

      // Browser breakdown
      Event.aggregate([
        { $match: rangeFilter },
        { $group: { _id: "$browser", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { browser: "$_id", count: 1, _id: 0 } },
      ]),
    ]);

    // Shape event type counts into a flat object for easy consumption
    const eventTypes = eventTypeCounts.reduce<Record<string, number>>(
      (acc, { type, count }) => ({ ...acc, [type]: count }),
      {}
    );

    return NextResponse.json({
      eventsTimeline,
      topPages,
      deviceBreakdown,
      countryBreakdown,
      eventTypes,
      browserBreakdown,
      meta: { from, to, groupBy },
    });
  } catch (err) {
    console.error("[analytics]", err);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
