"use client";
import {
  PieChart as RechartsPieChart, Pie, Cell,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#ef4444","#ec4899","#f97316"];

interface DataItem { name: string; value: number }

interface Props {
  data: DataItem[];
  height?: number;
  donut?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

const Tip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number }[] }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-[var(--foreground)] capitalize mb-0.5">{payload[0].name}</p>
      <p className="text-[var(--muted)]">{payload[0].value.toLocaleString()}</p>
    </div>
  );
};

const renderLegend = ({ payload }: { payload?: { value: string; color: string }[] }) => (
  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-3">
    {payload?.map((e, i) => (
      <li key={i} className="flex items-center gap-1.5 text-xs text-[var(--muted)] capitalize">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: e.color }} />
        {e.value}
      </li>
    ))}
  </ul>
);

export default function PieChart({ data, height = 280, donut, showLegend = true, colors }: Props) {
  const palette = colors ?? COLORS;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsPieChart>
        <Pie data={data} cx="50%" cy={showLegend ? "45%" : "50%"}
          innerRadius={donut ? "40%" : "0%"} outerRadius="70%"
          paddingAngle={2} dataKey="value" nameKey="name" strokeWidth={0}
          isAnimationActive animationBegin={0} animationDuration={900} animationEasing="ease-out">
          {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
        </Pie>
        <Tooltip content={<Tip />} />
        {showLegend && <Legend content={renderLegend as (props: unknown) => React.ReactNode} />}
      </RechartsPieChart>
    </ResponsiveContainer>
  );
}
