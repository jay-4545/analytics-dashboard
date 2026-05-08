import { NextRequest, NextResponse } from "next/server";
import { getMockUsersReport, getMockRevenueReport, getMockAnalyticsReport } from "@/lib/mockData";

type ReportType = "users" | "revenue" | "analytics";

export async function GET(request: NextRequest) {
  const type = (new URL(request.url).searchParams.get("type") ?? "users") as ReportType;
  const fn   = type === "revenue"   ? getMockRevenueReport
             : type === "analytics" ? getMockAnalyticsReport
             :                        getMockUsersReport;
  return NextResponse.json(fn());
}
