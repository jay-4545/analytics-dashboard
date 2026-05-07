"use client";
import PageError from "@/components/ui/PageError";
export default function AnalyticsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <PageError error={error} reset={reset} title="Failed to load analytics" />;
}
