'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  DollarSign,
  FileBarChart,
  Settings,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navSections = [
  {
    label: 'MAIN',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/dashboard/analytics', label: 'Analytics', icon: TrendingUp },
    ],
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/dashboard/users', label: 'Users', icon: Users },
      { href: '/dashboard/revenue', label: 'Revenue', icon: DollarSign },
      { href: '/dashboard/reports', label: 'Reports', icon: FileBarChart },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [{ href: '/dashboard/settings', label: 'Settings', icon: Settings }],
  },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-30 flex flex-col bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)]"
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-3 border-b border-[var(--sidebar-border)] shrink-0 relative">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-3 font-bold text-slate-900 dark:text-white whitespace-nowrap overflow-hidden"
            >
              AnalyticsPro
            </motion.span>
          )}
        </AnimatePresence>

        <button
          onClick={onToggle}
          className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white dark:bg-slate-800 border border-[var(--sidebar-border)] rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-slate-700 transition-all z-50"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-400 dark:text-slate-500 uppercase"
                >
                  {section.label}
                </motion.p>
              )}
            </AnimatePresence>

            <ul className="space-y-0.5">
              {section.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(href);
                return (
                  <li key={href}>
                    <div className="relative group">
                      <Link
                        href={href}
                        className={cn(
                          'sidebar-link',
                          active ? 'sidebar-link-active' : 'sidebar-link-inactive',
                          collapsed && 'justify-center px-0'
                        )}
                      >
                        {/* Active indicator */}
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-600 rounded-r-full" />
                        )}
                        <Icon className={cn('w-5 h-5 shrink-0', active && 'text-indigo-600')} />
                        <AnimatePresence initial={false}>
                          {!collapsed && (
                            <motion.span
                              initial={{ opacity: 0, width: 0 }}
                              animate={{ opacity: 1, width: 'auto' }}
                              exit={{ opacity: 0, width: 0 }}
                              transition={{ duration: 0.2 }}
                              className="whitespace-nowrap overflow-hidden"
                            >
                              {label}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </Link>

                      {/* Tooltip when collapsed */}
                      {collapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
                          {label}
                          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-[var(--sidebar-border)] pt-3 shrink-0 overflow-hidden">
        <div className="relative group">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className={cn(
              'sidebar-link w-full sidebar-link-inactive text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40',
              collapsed && 'justify-center px-0'
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 dark:bg-slate-700 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg">
              Logout
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-700" />
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
