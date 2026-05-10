"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, Users, DollarSign, FileBarChart } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
  { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
];

export default function MobileNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--sidebar-bg)] border-t border-[var(--sidebar-border)] flex md:hidden safe-area-inset-bottom">
      {links.map(({ href, label, icon: Icon }) => {
        const active = isActive(href);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors",
              active
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <span className={cn(
              "flex items-center justify-center w-10 h-6 rounded-full transition-colors",
              active ? "bg-indigo-100 dark:bg-indigo-950/60" : ""
            )}>
              <Icon className={cn("w-4.5 h-4.5 w-[18px] h-[18px]", active ? "text-indigo-600 dark:text-indigo-400" : "")} />
            </span>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
