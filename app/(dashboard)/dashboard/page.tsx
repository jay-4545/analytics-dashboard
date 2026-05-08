"use client";
import { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { Users, DollarSign, Activity, UserCheck } from "lucide-react";
import {
  MOCK_DASHBOARD_STATS,
  MOCK_TRANSACTIONS,
  MOCK_EVENTS_TIMELINE,
  MOCK_TOP_PAGES,
  MOCK_REVENUE_BY_MONTH,
  MOCK_EVENT_TYPES,
} from "@/lib/mockData";
import StatCard from "@/components/ui/StatCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import SkeletonTable from "@/components/ui/SkeletonTable";
import AreaChart from "@/components/charts/AreaChart";
import LineChart from "@/components/charts/LineChart";
import PieChart from "@/components/charts/PieChart";
import RadarChart from "@/components/charts/RadarChart";
import Badge, { planVariant, statusVariant } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

type DashStats = {
  totalUsers: number; newUsersThisMonth: number; userGrowthPercent: number;
  activeUsers: number; totalRevenue: number; revenueThisMonth: number;
  revenueGrowthPercent: number; totalEvents: number; eventsToday: number;
  usersByPlan: { plan: string; count: number }[];
  usersByStatus: { status: string; count: number }[];
};

type RevenueData = {
  transactions: { _id: string; amount: number; plan: string; status: string; date: string; description: string; userId: { name: string; email: string; avatar: string } }[];
  revenueByMonth: { month: string; revenue: number; count: number }[];
};

type AnalyticsData = {
  eventsTimeline: { date: string; views: number }[];
  topPages: { name: string; views: number }[];
  eventTypes: Record<string, number>;
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setStats(MOCK_DASHBOARD_STATS);
      setRevenue({ transactions: MOCK_TRANSACTIONS, revenueByMonth: MOCK_REVENUE_BY_MONTH });
      setAnalytics({ eventsTimeline: MOCK_EVENTS_TIMELINE, topPages: MOCK_TOP_PAGES, eventTypes: MOCK_EVENT_TYPES });
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const revSpark   = useMemo(() => revenue?.revenueByMonth.map((m) => ({ v: m.revenue })) ?? [], [revenue]);
  const visitSpark = useMemo(() => analytics?.eventsTimeline.slice(-12).map((d) => ({ v: d.views })) ?? [], [analytics]);
  const radarData  = useMemo(() => analytics
    ? Object.entries(analytics.eventTypes).map(([type, count]) => ({ subject: type, value: count }))
    : [], [analytics]);
  const planPie  = useMemo(() => stats?.usersByPlan.map((p) => ({ name: p.plan, value: p.count })) ?? [], [stats]);
  const revChart = useMemo(() => revenue?.revenueByMonth.map((m) => ({
    ...m, label: format(new Date(m.month + "-01"), "MMM"),
  })) ?? [], [revenue]);
  const visitChart = useMemo(() => analytics?.eventsTimeline.map((d) => ({
    ...d, label: format(new Date(d.date), "MMM d"),
  })) ?? [], [analytics]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Welcome back — here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Row 1 — Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard title="Total Users" value={stats?.totalUsers ?? 0}
              growth={stats?.userGrowthPercent} icon={<Users className="w-5 h-5" />}
              iconBg="bg-indigo-500" sparkData={visitSpark} />
            <StatCard title="Revenue This Month" value={stats?.revenueThisMonth ?? 0}
              format={formatCurrency}
              growth={stats?.revenueGrowthPercent} icon={<DollarSign className="w-5 h-5" />}
              iconBg="bg-violet-500" sparkData={revSpark} />
            <StatCard title="Total Events" value={stats?.totalEvents ?? 0}
              growth={null} icon={<Activity className="w-5 h-5" />}
              iconBg="bg-cyan-500" suffix="" sparkData={visitSpark} />
            <StatCard title="Active Users" value={stats?.activeUsers ?? 0}
              growth={null} icon={<UserCheck className="w-5 h-5" />}
              iconBg="bg-emerald-500" />
          </>
        )}
      </div>

      {/* Row 2 — Area + Line charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Revenue (Last 6 Months)">
          {loading ? <div className="h-[280px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <AreaChart data={revChart} xKey="label"
              series={[{ key: "revenue", color: "#6366f1", name: "Revenue" }]}
              formatY={(v) => `$${(v / 1000).toFixed(0)}k`} />
          )}
        </ChartCard>
        <ChartCard title="Daily Visitors (Last 30 Days)">
          {loading ? <div className="h-[280px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <LineChart data={visitChart} xKey="label"
              series={[{ key: "views", color: "#8b5cf6", name: "Visitors" }]}
              formatX={(v) => v.split(" ")[1] ?? v} />
          )}
        </ChartCard>
      </div>

      {/* Row 3 — Pie + Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Users by Plan">
          {loading ? <div className="h-[280px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <PieChart data={planPie} donut showLegend colors={["#94a3b8","#6366f1","#8b5cf6"]} />
          )}
        </ChartCard>
        <ChartCard title="Events by Type">
          {loading ? <div className="h-[280px] bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <RadarChart data={radarData} />
          )}
        </ChartCard>
      </div>

      {/* Row 4 — Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent transactions */}
        <ChartCard title="Recent Transactions">
          {loading ? <SkeletonTable rows={5} cols={4} /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {["User", "Plan", "Amount", "Status"].map((h) => (
                      <th key={h} className="pb-2 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {revenue?.transactions.slice(0, 5).map((tx) => (
                    <tr key={tx._id} className="border-b border-[var(--border)] last:border-0">
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <img src={tx.userId?.avatar} alt="" className="w-7 h-7 rounded-full" />
                          <span className="font-medium text-[var(--foreground)] truncate max-w-[100px]">{tx.userId?.name}</span>
                        </div>
                      </td>
                      <td><Badge variant={planVariant(tx.plan)}>{tx.plan}</Badge></td>
                      <td className="font-semibold text-[var(--foreground)]">{formatCurrency(tx.amount)}</td>
                      <td><Badge variant={statusVariant(tx.status)}>{tx.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        {/* Top pages */}
        <ChartCard title="Top Pages">
          {loading ? <SkeletonTable rows={5} cols={3} /> : (
            <div className="space-y-2.5">
              {analytics?.topPages.slice(0, 7).map((p, i) => {
                const max = analytics.topPages[0]?.views ?? 1;
                const pct = Math.round((p.views / max) * 100);
                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[var(--foreground)] font-medium truncate">{p.name}</span>
                      <span className="text-[var(--muted)] tabular-nums ml-4">{p.views.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: `hsl(${245 - i * 15},70%,60%)` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
