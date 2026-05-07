"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";
import type { Session } from "next-auth";

export default function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            className: "!bg-white dark:!bg-slate-800 !text-slate-900 dark:!text-white !shadow-lg !border !border-slate-200 dark:!border-slate-700",
            duration: 3000,
          }}
        />
      </ThemeProvider>
    </SessionProvider>
  );
}
