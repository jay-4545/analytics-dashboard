import { cn } from "@/lib/utils";

export type BadgeVariant = "success" | "warning" | "danger" | "info" | "secondary" | "purple";

const STYLES: Record<BadgeVariant, string> = {
  success:   "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  danger:    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  info:      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  secondary: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  purple:    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

interface Props {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

export default function Badge({ children, variant = "secondary", className }: Props) {
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize", STYLES[variant], className)}>
      {children}
    </span>
  );
}

export function planVariant(plan: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = { free: "secondary", pro: "info", enterprise: "purple" };
  return map[plan] ?? "secondary";
}

export function statusVariant(status: string): BadgeVariant {
  const map: Record<string, BadgeVariant> = { active: "success", inactive: "secondary", banned: "danger", paid: "success", pending: "warning", failed: "danger", refunded: "secondary" };
  return map[status] ?? "secondary";
}
