"use client";
import { useState } from "react";
import { format, subDays } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Users, DollarSign, BarChart3, Download, Clock, FileText, Table2 } from "lucide-react";
import toast from "react-hot-toast";
import DateRangePicker from "@/components/ui/DateRangePicker";
import Badge from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { getMockUsersReport, getMockRevenueReport, getMockAnalyticsReport } from "@/lib/mockData";

type ReportType = "users" | "revenue" | "analytics";

interface ReportConfig {
  type: ReportType;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBg: string;
}

interface GeneratedReport {
  id: string;
  type: ReportType;
  from: string;
  to: string;
  generatedAt: Date;
  summary: Record<string, unknown>;
  data: unknown[];
}

const CONFIGS: ReportConfig[] = [
  { type: "users", title: "Users Report", description: "User registrations, plans, status breakdown and revenue attributed per user.", icon: <Users className="w-5 h-5" />, iconBg: "bg-indigo-500" },
  { type: "revenue", title: "Revenue Report", description: "Payment transactions, revenue by plan, status summaries and financial KPIs.", icon: <DollarSign className="w-5 h-5" />, iconBg: "bg-violet-500" },
  { type: "analytics", title: "Analytics Report", description: "Daily event counts, top pages, device and country breakdowns.", icon: <BarChart3 className="w-5 h-5" />, iconBg: "bg-cyan-500" },
];

export default function ReportsPage() {
  const [ranges, setRanges] = useState<Record<ReportType, DateRange>>({
    users:     { from: subDays(new Date(), 30), to: new Date() },
    revenue:   { from: subDays(new Date(), 30), to: new Date() },
    analytics: { from: subDays(new Date(), 30), to: new Date() },
  });
  const [generating, setGenerating] = useState<Record<ReportType, boolean>>({ users: false, revenue: false, analytics: false });
  const [preview, setPreview]       = useState<GeneratedReport | null>(null);
  const [history, setHistory]       = useState<GeneratedReport[]>([]);

  const generate = (type: ReportType) => {
    const r = ranges[type];
    if (!r.from) return;
    setGenerating((prev) => ({ ...prev, [type]: true }));
    setTimeout(() => {
      const mockFn = type === "revenue" ? getMockRevenueReport
                   : type === "analytics" ? getMockAnalyticsReport
                   : getMockUsersReport;
      const json = mockFn();
      const report: GeneratedReport = {
        id: crypto.randomUUID(),
        type,
        from: format(r.from!, "yyyy-MM-dd"),
        to:   format(r.to ?? new Date(), "yyyy-MM-dd"),
        generatedAt: new Date(),
        summary: json.summary as Record<string, unknown>,
        data: Array.isArray(json.data) ? json.data as unknown[] : Object.values(json.data ?? {}).flat(),
      };
      setPreview(report);
      setHistory((h) => [report, ...h].slice(0, 5));
      toast.success(`${type} report generated`);
      setGenerating((prev) => ({ ...prev, [type]: false }));
    }, 600);
  };

  const downloadPDF = async (report: GeneratedReport) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`${report.type.charAt(0).toUpperCase() + report.type.slice(1)} Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Period: ${report.from} – ${report.to}`, 14, 25);
    doc.text(`Generated: ${format(report.generatedAt, "MMM d, yyyy HH:mm")}`, 14, 32);

    let y = 44;
    doc.setFontSize(12);
    doc.text("Summary", 14, y); y += 8;
    doc.setFontSize(9);
    Object.entries(report.summary).forEach(([k, v]) => {
      const line = `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`;
      doc.text(line.slice(0, 90), 14, y); y += 6;
      if (y > 270) { doc.addPage(); y = 14; }
    });

    if (report.data.length > 0 && typeof report.data[0] === "object") {
      y += 4;
      doc.setFontSize(12);
      doc.text("Data Preview (first 20 rows)", 14, y); y += 8;
      doc.setFontSize(8);
      const keys = Object.keys(report.data[0] as Record<string, unknown>).slice(0, 6);
      doc.text(keys.join("  |  "), 14, y); y += 5;
      report.data.slice(0, 20).forEach((row) => {
        const line = keys.map((k) => String((row as Record<string, unknown>)[k] ?? "")).join("  |  ");
        doc.text(line.slice(0, 100), 14, y); y += 5;
        if (y > 275) { doc.addPage(); y = 14; }
      });
    }

    doc.save(`${report.type}-report-${report.from}.pdf`);
  };

  const downloadExcel = async (report: GeneratedReport) => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    const summarySheet = XLSX.utils.json_to_sheet([report.summary]);
    XLSX.utils.book_append_sheet(wb, summarySheet, "Summary");
    if (report.data.length) {
      const dataSheet = XLSX.utils.json_to_sheet(report.data as Record<string, unknown>[]);
      XLSX.utils.book_append_sheet(wb, dataSheet, "Data");
    }
    XLSX.writeFile(wb, `${report.type}-report-${report.from}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Reports</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Generate, preview and download data reports.</p>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CONFIGS.map((cfg) => (
          <div key={cfg.type} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${cfg.iconBg}`}>
                {cfg.icon}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-[var(--foreground)]">{cfg.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5 leading-relaxed">{cfg.description}</p>
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-lg p-3">
              <p className="text-xs text-[var(--muted)] mb-2">Date Range</p>
              <DateRangePicker range={ranges[cfg.type]} onChange={(r) => setRanges((prev) => ({ ...prev, [cfg.type]: r }))} />
            </div>

            <button
              onClick={() => generate(cfg.type)}
              disabled={generating[cfg.type]}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generating[cfg.type] ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating…</>
              ) : "Generate Report"}
            </button>
          </div>
        ))}
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-[var(--foreground)] capitalize">{preview.type} Report Preview</h3>
              <Badge variant="info">{preview.from} – {preview.to}</Badge>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadPDF(preview)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <FileText className="w-4 h-4 text-red-500" /> PDF
              </button>
              <button onClick={() => downloadExcel(preview)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-[var(--border)] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <Table2 className="w-4 h-4 text-green-500" /> Excel
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="p-5 border-b border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wide mb-3">Summary</p>
            <div className="flex flex-wrap gap-3">
              {Object.entries(preview.summary).map(([k, v]) => (
                <div key={k} className="bg-slate-50 dark:bg-slate-800/60 rounded-lg px-3 py-2">
                  <p className="text-xs text-[var(--muted)] capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
                  <p className="font-semibold text-sm text-[var(--foreground)]">
                    {typeof v === "number" ? (k.toLowerCase().includes("revenue") || k.toLowerCase().includes("total") && v > 100 ? formatCurrency(v) : v.toLocaleString()) : String(v)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Data table preview */}
          {preview.data.length > 0 && typeof preview.data[0] === "object" && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    {Object.keys(preview.data[0] as Record<string, unknown>).slice(0, 7).map((k) => (
                      <th key={k} className="px-4 py-3 text-left text-xs font-semibold text-[var(--muted)] uppercase tracking-wide">{k.replace(/_/g, " ")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.data.slice(0, 10).map((row, i) => {
                    const r = row as Record<string, unknown>;
                    return (
                      <tr key={i} className="border-b border-[var(--border)] last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        {Object.keys(r).slice(0, 7).map((k) => (
                          <td key={k} className="px-4 py-3 text-[var(--foreground)] truncate max-w-[180px]">
                            {typeof r[k] === "object" && r[k] !== null ? JSON.stringify(r[k]).slice(0, 40) : String(r[k] ?? "—")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {preview.data.length > 10 && (
                <p className="px-4 py-2 text-xs text-[var(--muted)] border-t border-[var(--border)]">
                  Showing 10 of {preview.data.length} rows. Download for full data.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Recent exports */}
      {history.length > 0 && (
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--muted)]" /> Recent Exports
          </h3>
          <div className="space-y-2.5">
            {history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2.5 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs ${CONFIGS.find((c) => c.type === h.type)?.iconBg ?? "bg-slate-500"}`}>
                    {h.type[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)] capitalize">{h.type} Report</p>
                    <p className="text-xs text-[var(--muted)]">{h.from} – {h.to} · {format(h.generatedAt, "HH:mm")}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => downloadPDF(h)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted)] hover:text-red-500 transition-colors"><FileText className="w-4 h-4" /></button>
                  <button onClick={() => downloadExcel(h)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[var(--muted)] hover:text-green-500 transition-colors"><Download className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
