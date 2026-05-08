import { NextRequest, NextResponse } from "next/server";
import {
  MOCK_TRANSACTIONS,
  MOCK_REVENUE_BY_MONTH,
  MOCK_REVENUE_BY_PLAN,
  MOCK_REVENUE_BY_STATUS,
} from "@/lib/mockData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan   = searchParams.get("plan")   ?? "";
  const status = searchParams.get("status") ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page")  ?? "1",  10));
  const limit  = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10", 10)));

  const filtered = MOCK_TRANSACTIONS.filter((tx) => {
    if (plan   && tx.plan   !== plan)   return false;
    if (status && tx.status !== status) return false;
    return true;
  });

  return NextResponse.json({
    transactions:    filtered.slice((page - 1) * limit, page * limit),
    totalCount:      filtered.length,
    totalPages:      Math.ceil(filtered.length / limit) || 1,
    page,
    limit,
    totalRevenue:    182090,
    paidCount:       182,
    revenueByMonth:  MOCK_REVENUE_BY_MONTH,
    revenueByPlan:   MOCK_REVENUE_BY_PLAN,
    revenueByStatus: MOCK_REVENUE_BY_STATUS,
  });
}
