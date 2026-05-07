"use client";
import {
  ResponsiveContainer, BarChart as RechartsBarChart,
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from "recharts";

const PALETTE = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#f97316"];

interface Props {
  data: Record<string, unknown>[];
  xKey: string;
  yKey: string;
  color?: string;
  height?: number;
  horizontal?: boolean;
  formatY?: (v: number) => string;
  formatX?: (v: string) => string;
  colors?: string[];
}

const Tip = ({ active, payload, label, formatY }: {
  active?: boolean; payload?: { value: number }[];
  label?: string; formatY?: (v: number) => string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg p-3 text-sm">
      <p className="text-[var(--muted)] mb-1 text-xs truncate max-w-[180px]">{label}</p>
      <p className="font-semibold text-[var(--foreground)]">
        {formatY ? formatY(payload[0].value) : payload[0].value.toLocaleString()}
      </p>
    </div>
  );
};

export default function BarChart({
  data, xKey, yKey, height = 280,
  horizontal, formatY, formatX, colors,
}: Props) {
  const palette = colors ?? PALETTE;

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart data={data} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
            tickLine={false} axisLine={false}
            tickFormatter={formatY ?? ((v) => v.toLocaleString())} />
          <YAxis type="category" dataKey={xKey} tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
            tickLine={false} axisLine={false} width={110}
            tickFormatter={formatX ?? ((v: string) => v.length > 16 ? v.slice(0, 16) + "…" : v)} />
          <Tooltip content={<Tip formatY={formatY} />}
            cursor={{ fill: "rgba(99,102,241,0.06)" }} />
          <Bar dataKey={yKey} radius={[0, 4, 4, 0]} maxBarSize={22}
            isAnimationActive animationDuration={900} animationEasing="ease-out">
            {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "var(--chart-axis)" }}
          tickLine={false} axisLine={false} tickFormatter={formatX} />
        <YAxis tick={{ fontSize: 11, fill: "var(--chart-axis)" }} tickLine={false} axisLine={false}
          tickFormatter={formatY ?? ((v) => v.toLocaleString())} width={50} />
        <Tooltip content={<Tip formatY={formatY} />}
          cursor={{ fill: "rgba(99,102,241,0.06)" }} />
        <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={48}
          isAnimationActive animationDuration={900} animationEasing="ease-out">
          {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}
