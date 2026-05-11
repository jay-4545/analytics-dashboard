"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) return null;

  const sidebarWidth = collapsed ? 64 : 260;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="hidden md:block">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      </div>

      {/* Main area */}
      <div
        className="flex flex-col min-h-screen transition-all duration-[250ms] ease-in-out md:ml-[var(--sidebar-w)]"
        style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
      >
        <Header
          userName={session.user?.name}
          userEmail={session.user?.email}
        />

        {/* Page content with route-change transition */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-auto"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
