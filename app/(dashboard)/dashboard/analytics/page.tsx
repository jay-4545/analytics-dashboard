"use client";
import { useState, useEffect, useMemo } from "react";
import { format, subDays, startOfWeek } from "date-fns";
import type { DateRange } from "react-day-picker";
import {
  MOCK_EVENTS_TIMELINE,
  MOCK_TOP_PAGES,
  MOCK_DEVICE_BREAKDOWN,
  MOCK_COUNTRY_BREAKDOWN,
  MOCK_EVENT_TYPES,
  MOCK_BROWSER_BREAKDOWN,
} from "@/lib/mockData";
import { Eye, MousePointer, Activity } from "lucide-react";
import StatCard from "@/components/ui/StatCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import DateRangePicker from "@/components/ui/DateRangePicker";
import ExportButton from "@/components/ui/ExportButton";
import AreaChart from "@/components/charts/AreaChart";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";

type AnalyticsData = {
  eventsTimeline: { date: string; views: number }[];
  topPages: { name: string; views: number }[];
  deviceBreakdown: { device: string; count: number }[];
  countryBreakdown: { country: string; count: number }[];
  eventTypes: Record<string, number>;
  browserBreakdown: { browser: string; count: number }[];
};

export default function AnalyticsPage() {
  const [range, setRange] = useState<DateRange>({ from: subDays(new Date(), 30), to: new Date() });
  const [groupBy, setGroupBy] = useState("day");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setData({
        eventsTimeline: MOCK_EVENTS_TIMELINE,
        topPages:         MOCK_TOP_PAGES,
        deviceBreakdown:  MOCK_DEVICE_BREAKDOWN,
        countryBreakdown: MOCK_COUNTRY_BREAKDOWN,
        eventTypes:       MOCK_EVENT_TYPES,
        browserBreakdown: MOCK_BROWSER_BREAKDOWN,
      });
      setLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [range, groupBy]);

  const totalViews  = data?.eventTypes.pageview ?? 0;
  const totalClicks = data?.eventTypes.click ?? 0;
  const totalEvents = useMemo(() => Object.values(data?.eventTypes ?? {}).reduce((a, b) => a + b, 0), [data]);

  const timelineChart = useMemo(() => {
    if (!data) return [];
    if (groupBy === "day") {
      return data.eventsTimeline.map((d) => ({ ...d, label: format(new Date(d.date), "MMM d") }));
    }
    if (groupBy === "week") {
      const buckets: Record<string, { views: number; label: string }> = {};
      data.eventsTimeline.forEach((d) => {
        const ws = startOfWeek(new Date(d.date));
        const key = ws.toISOString().slice(0, 10);
        if (!buckets[key]) buckets[key] = { views: 0, label: format(ws, "MMM d") };
        buckets[key].views += d.views;
      });
      return Object.entries(buckets).sort().map(([, v]) => ({ date: "", views: v.views, label: v.label }));
    }
    // month
    const buckets: Record<string, { views: number; label: string }> = {};
    data.eventsTimeline.forEach((d) => {
      const key = d.date.slice(0, 7);
      if (!buckets[key]) buckets[key] = { views: 0, label: format(new Date(key + "-01"), "MMM yyyy") };
      buckets[key].views += d.views;
    });
    return Object.entries(buckets).sort().map(([, v]) => ({ date: "", views: v.views, label: v.label }));
  }, [data, groupBy]);

  const devicePie  = useMemo(() => data?.deviceBreakdown.map((d) => ({ name: d.device,  value: d.count })) ?? [], [data]);
  const countryBar = useMemo(() => data?.countryBreakdown.map((d) => ({ name: d.country, value: d.count })) ?? [], [data]);
  const topPages   = useMemo(() => data?.topPages.map((p) => ({ name: p.name, value: p.views })) ?? [], [data]);

  const handleExportPDF = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Analytics Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${format(range.from!, "MMM d, yyyy")} – ${format(range.to ?? new Date(), "MMM d, yyyy")}`, 14, 25);
    doc.text(`Total Pageviews: ${totalViews}`, 14, 35);
    doc.text(`Total Clicks: ${totalClicks}`, 14, 42);
    doc.text(`Total Events: ${totalEvents}`, 14, 49);
    let y = 62;
    doc.setFontSize(12);
    doc.text("Top Pages", 14, y); y += 8;
    doc.setFontSize(9);
    data?.topPages.forEach((p) => { doc.text(`${p.name}: ${p.views} views`, 14, y); y += 6; });
    doc.save("analytics-report.pdf");
  };

  const handleExportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data?.eventsTimeline ?? []), "Timeline");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data?.topPages ?? []), "Top Pages");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data?.deviceBreakdown ?? []), "Devices");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data?.countryBreakdown ?? []), "Countries");
    XLSX.writeFile(wb, "analytics-export.xlsx");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Analytics</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Track pageviews, events, and visitor behaviour.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
          <DateRangePicker range={range} onChange={setRange} />
          <ExportButton onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} loading={loading} />
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Pageviews" value={totalViews} icon={<Eye className="w-5 h-5" />} iconBg="bg-indigo-500" />
            <StatCard title="Total Clicks" value={totalClicks} icon={<MousePointer className="w-5 h-5" />} iconBg="bg-violet-500" />
            <StatCard title="Total Events" value={totalEvents} icon={<Activity className="w-5 h-5" />} iconBg="bg-cyan-500" />
          </>
        )}
      </div>

      {/* Pageviews timeline */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Pageviews Over Time</h3>
        {loading ? <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
          <AreaChart data={timelineChart} xKey="label"
            series={[{ key: "views", color: "#6366f1", name: "Pageviews" }]} height={288} />
        )}
      </div>

      {/* Top pages bar */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Top 10 Pages by Views</h3>
        {loading ? <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
          <BarChart data={topPages} xKey="name" yKey="value" horizontal height={320} />
        )}
      </div>

      {/* Device + Country */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Device Breakdown</h3>
          {loading ? <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <PieChart data={devicePie} donut colors={["#6366f1","#8b5cf6","#06b6d4"]} />
          )}
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Top Countries</h3>
          {loading ? <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <BarChart data={countryBar} xKey="name" yKey="value" horizontal height={280} />
          )}
        </div>
      </div>
    </div>
  );
}
