"use client";
import { useState, useEffect, useMemo } from "react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { DollarSign, CheckCircle, XCircle } from "lucide-react";
import {
  MOCK_TRANSACTIONS,
  MOCK_REVENUE_BY_MONTH,
  MOCK_REVENUE_BY_PLAN,
  MOCK_REVENUE_BY_STATUS,
} from "@/lib/mockData";
import * as XLSX from "xlsx";
import StatCard from "@/components/ui/StatCard";
import SkeletonCard from "@/components/ui/SkeletonCard";
import SkeletonTable from "@/components/ui/SkeletonTable";
import DateRangePicker from "@/components/ui/DateRangePicker";
import BarChart from "@/components/charts/BarChart";
import PieChart from "@/components/charts/PieChart";
import Pagination from "@/components/tables/Pagination";
import TableFilters from "@/components/tables/TableFilters";
import Badge, { planVariant, statusVariant } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";


export default function RevenuePage() {
  const [range, setRange]     = useState<DateRange>({ from: subDays(new Date(), 180), to: new Date() });
  const [plan, setPlan]       = useState("");
  const [status, setStatus]   = useState("");
  const [search, setSearch]   = useState("");
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => { setPage(1); }, [range, plan, status, debouncedSearch]);

  const allFiltered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter((tx) => {
      if (plan   && tx.plan   !== plan)   return false;
      if (status && tx.status !== status) return false;
      if (debouncedSearch && !tx.description.toLowerCase().includes(debouncedSearch.toLowerCase())) return false;
      return true;
    });
  }, [plan, status, debouncedSearch]);

  const totalCount = allFiltered.length;
  const totalPages = Math.ceil(totalCount / 10) || 1;
  const transactions = useMemo(() => allFiltered.slice((page - 1) * 10, page * 10), [allFiltered, page]);

  const paid   = MOCK_REVENUE_BY_STATUS.find((s) => s.status === "paid");
  const failed = MOCK_REVENUE_BY_STATUS.find((s) => s.status === "failed");

  const monthChart = useMemo(() => MOCK_REVENUE_BY_MONTH.map((m) => ({
    name: format(new Date(m.month + "-01"), "MMM yyyy"),
    value: m.revenue,
  })), []);

  const planPie   = useMemo(() => MOCK_REVENUE_BY_PLAN.map((p) => ({ name: p.plan, value: p.revenue })), []);
  const statusPie = useMemo(() => MOCK_REVENUE_BY_STATUS.map((s) => ({ name: s.status, value: s.total })), []);

  const handleExport = () => {
    const rows = allFiltered.map((tx) => ({
      Date: format(new Date(tx.date), "yyyy-MM-dd"),
      User: tx.userId?.name ?? "",
      Email: tx.userId?.email ?? "",
      Plan: tx.plan,
      Status: tx.status,
      Amount: tx.amount,
      Description: tx.description,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    XLSX.writeFile(wb, "revenue-export.xlsx");
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--foreground)]">Revenue</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">Track payments, plans and financial trends.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={plan} onChange={(e) => setPlan(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Plans</option>
            {["free","pro","enterprise"].map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option value="">All Statuses</option>
            {["paid","pending","failed","refunded"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <DateRangePicker range={range} onChange={setRange} />
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-[var(--border)] bg-[var(--card-bg)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Export Excel
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loading ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />) : (
          <>
            <StatCard title="Total Revenue" value={182090}
              format={formatCurrency}
              icon={<DollarSign className="w-5 h-5" />} iconBg="bg-indigo-500" />
            <StatCard title="Successful Payments" value={paid?.count ?? 0}
              icon={<CheckCircle className="w-5 h-5" />} iconBg="bg-emerald-500"
              suffix={` (${formatCurrency(paid?.total ?? 0)})`} />
            <StatCard title="Failed Payments" value={failed?.count ?? 0}
              icon={<XCircle className="w-5 h-5" />} iconBg="bg-red-500"
              suffix={` (${formatCurrency(failed?.total ?? 0)})`} />
          </>
        )}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Revenue by Month</h3>
        {loading ? <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
          <BarChart data={monthChart} xKey="name" yKey="value" height={288}
            formatY={(v) => `$${(v / 1000).toFixed(0)}k`} colors={["#6366f1"]} />
        )}
      </div>

      {/* Pie charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Revenue by Plan</h3>
          {loading ? <div className="h-60 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <PieChart data={planPie} donut colors={["#94a3b8","#6366f1","#8b5cf6"]} />
          )}
        </div>
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-4">Revenue by Status</h3>
          {loading ? <div className="h-60 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" /> : (
            <PieChart data={statusPie} donut colors={["#10b981","#f59e0b","#ef4444","#94a3b8"]} />
          )}
        </div>
      </div>

      {/* Transactions table */}
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        <TableFilters search={search} onSearchChange={setSearch} searchPlaceholder="Search description…" />
        {loading ? <SkeletonTable rows={10} cols={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Date","User","Plan","Status","Description","Amount"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-[var(--muted)]">No transactions found.</td></tr>
                ) : transactions.map((tx) => (
                  <tr key={tx._id} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-[var(--muted)]">{format(new Date(tx.date), "MMM d, yyyy")}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {tx.userId?.avatar && <img src={tx.userId.avatar} className="w-7 h-7 rounded-full" alt="" />}
                        <span className="font-medium text-[var(--foreground)]">{tx.userId?.name ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3"><Badge variant={planVariant(tx.plan)}>{tx.plan}</Badge></td>
                    <td className="px-4 py-3"><Badge variant={statusVariant(tx.status)}>{tx.status}</Badge></td>
                    <td className="px-4 py-3 text-[var(--muted)] max-w-[200px] truncate">{tx.description}</td>
                    <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{formatCurrency(tx.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} limit={10} onPageChange={setPage} />
      </div>
    </div>
  );
}
