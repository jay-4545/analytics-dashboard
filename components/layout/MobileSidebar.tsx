"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  DollarSign,
  FileBarChart,
  Settings,
  LogOut,
  BarChart3,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navSections = [
  {
    label: "MAIN",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/dashboard/users", label: "Users", icon: Users },
      { href: "/dashboard/revenue", label: "Revenue", icon: DollarSign },
      { href: "/dashboard/reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "ACCOUNT",
    items: [{ href: "/dashboard/settings", label: "Settings", icon: Settings }],
  },
];

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    onClose();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed left-0 top-0 h-full w-72 z-50 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] md:hidden shadow-2xl"
          >
            {/* Logo + close */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--sidebar-border)] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">AnalyticsPro</span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5 text-[var(--muted)]" />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
              {navSections.map((section) => (
                <div key={section.label}>
                  <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                    {section.label}
                  </p>
                  <ul className="space-y-0.5">
                    {section.items.map(({ href, label, icon: Icon }) => {
                      const active = isActive(href);
                      return (
                        <li key={href}>
                          <Link
                            href={href}
                            className={cn(
                              "sidebar-link relative",
                              active ? "sidebar-link-active" : "sidebar-link-inactive"
                            )}
                          >
                            {active && (
                              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full" />
                            )}
                            <Icon className={cn("w-5 h-5 shrink-0", active && "text-indigo-600")} />
                            <span>{label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>

            {/* Logout */}
            <div className="px-2 pb-6 border-t border-[var(--sidebar-border)] pt-3 shrink-0">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="sidebar-link w-full sidebar-link-inactive text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
