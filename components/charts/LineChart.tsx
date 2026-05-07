"use client";
import {
  ResponsiveContainer, LineChart as RechartsLineChart,
  Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from "recharts";

interface Series { key: string; color: string; name?: string }

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  series: Series[];
  height?: number;
  formatY?: (v: number) => string;
  formatX?: (v: string) => string;
}

const Tip = ({ active, payload, label, formatY }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[];
  label?: string; formatY?: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg p-3 text-sm">
      <p className="text-[var(--muted)] mb-1.5 text-xs">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="font-medium text-[var(--foreground)]">
            {formatY ? formatY(p.value) : p.value.toLocaleString()}
          </span>
          {p.name && <span className="text-[var(--muted)] text-xs">{p.name}</span>}
        </div>
      ))}
    </div>
  );
};

export default function LineChart({ data, xKey, series, height = 280, formatY, formatX }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false} axisLine={false} tickFormatter={formatX} />
        <YAxis tick={{ fontSize: 11, fill: "var(--chart-axis)" }} tickLine={false} axisLine={false}
          tickFormatter={formatY ?? ((v) => v.toLocaleString())} width={45} />
        <Tooltip content={<Tip formatY={formatY} />} />
        {series.map((s) => (
          <Line key={s.key} type="monotone" dataKey={s.key} name={s.name ?? s.key}
            stroke={s.color} strokeWidth={2} dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive animationDuration={900} animationEasing="ease-out" />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
