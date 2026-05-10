"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  LogOut,
  ChevronRight,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/analytics": "Analytics",
  "/dashboard/users": "Users",
  "/dashboard/revenue": "Revenue",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
};

function buildBreadcrumbs(pathname: string) {
  const label = breadcrumbMap[pathname];
  if (!label || pathname === "/dashboard") return [{ label: "Dashboard", href: "/dashboard" }];
  return [
    { label: "Dashboard", href: "/dashboard" },
    { label, href: pathname },
  ];
}

interface HeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export default function Header({ userName, userEmail }: HeaderProps) {
  const pathname = usePathname();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const crumbs = buildBreadcrumbs(pathname);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const isDark = resolvedTheme === "dark";

  return (
    <header className="h-16 flex items-center justify-between px-4 md:px-6 bg-[var(--sidebar-bg)] border-b border-[var(--sidebar-border)] sticky top-0 z-20">
      {/* Left: current page name (mobile) + breadcrumb (desktop) */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Current page label — mobile only */}
        <span className="md:hidden text-sm font-semibold text-slate-900 dark:text-white truncate">
          {crumbs[crumbs.length - 1]?.label}
        </span>

        {/* Breadcrumb — desktop only */}
        <nav className="hidden md:flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <span key={crumb.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              <span
                className={cn(
                  i === crumbs.length - 1
                    ? "font-semibold text-slate-900 dark:text-white"
                    : "text-slate-500 dark:text-slate-400"
                )}
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4.5 h-4.5 w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
          </button>
        )}

        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
          <Bell className="w-[18px] h-[18px]" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[var(--sidebar-bg)]" />
        </button>

        {/* Avatar dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold">
              {userName?.[0]?.toUpperCase() ?? "A"}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
              {userName ?? "Admin"}
            </span>
            <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 border border-slate-200 dark:border-slate-700 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{userEmail}</p>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <User className="w-4 h-4" />
                My Profile
              </Link>
              <Link
                href="/dashboard/settings?tab=appearance"
                onClick={() => setDropdownOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <div className="border-t border-slate-100 dark:border-slate-700 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
