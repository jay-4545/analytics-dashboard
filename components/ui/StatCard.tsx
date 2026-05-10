"use client";
import { type ReactNode, useEffect, useState } from "react";
import { animate } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: number | string;
  growth?: number | null;
  icon: ReactNode;
  iconBg?: string;
  sparkData?: { v: number }[];
  prefix?: string;
  suffix?: string;
  /** Custom formatter applied to the animated number (only for numeric values) */
  format?: (v: number) => string;
}

export default function StatCard({
  title, value, growth, icon,
  iconBg = "bg-indigo-500",
  sparkData, prefix = "", suffix = "", format,
}: Props) {
  const isNum = typeof value === "number";
  const [display, setDisplay] = useState<number | string>(isNum ? 0 : value);

  useEffect(() => {
    if (!isNum) { setDisplay(value); return; }
    const controls = animate(0, value as number, {
      duration: 1.4,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, isNum]);

  const formatted =
    isNum
      ? format
        ? format(display as number)
        : `${prefix}${(display as number).toLocaleString()}${suffix}`
      : (display as string);

  const pos = (growth ?? 0) >= 0;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-sm text-[var(--muted)] font-medium truncate">{title}</p>
          <p className="text-2xl font-bold text-[var(--foreground)] mt-0.5 tabular-nums">
            {formatted}
          </p>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ml-3", iconBg)}>
          {icon}
        </div>
      </div>

      {growth !== undefined && growth !== null && (
        <div className="flex items-center gap-1.5">
          <span className={cn(
            "flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
            pos ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
          )}>
            {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth).toFixed(1)}%
          </span>
          <span className="text-xs text-[var(--muted)]">vs last month</span>
        </div>
      )}

      {sparkData && sparkData.length > 0 && (
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`sg-${title.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="var(--chart-1)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="var(--chart-1)" strokeWidth={1.5}
                fill={`url(#sg-${title.replace(/\s/g, "")})`} dot={false} isAnimationActive />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
