"use client";
import {
  RadarChart as RechartsRadarChart, Radar,
  PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface DataItem { subject: string; value: number }

interface Props {
  data: DataItem[];
  height?: number;
  color?: string;
}

export default function RadarChart({ data, height = 280, color = "var(--chart-1)" }: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsRadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="var(--chart-grid)" />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "var(--chart-axis)" }} />
        <Tooltip
          contentStyle={{
            background: "var(--card-bg)", border: "1px solid var(--border)",
            borderRadius: "8px", fontSize: "12px", color: "var(--foreground)",
          }}
          labelStyle={{ color: "var(--muted)" }}
        />
        <Radar name="Value" dataKey="value" stroke={color} fill={color} fillOpacity={0.15}
          strokeWidth={2} isAnimationActive animationDuration={900} animationEasing="ease-out" />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
}
