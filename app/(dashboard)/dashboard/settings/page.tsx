"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sun, Moon, Monitor, Check, Bell, Lock, Palette, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "appearance" | "notifications" | "security";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile",       label: "Profile",       icon: <User className="w-4 h-4" /> },
  { id: "appearance",    label: "Appearance",    icon: <Palette className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "security",      label: "Security",      icon: <Lock className="w-4 h-4" /> },
];

const ACCENT_COLORS = [
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Blue",   value: "#3b82f6" },
  { name: "Teal",   value: "#14b8a6" },
  { name: "Rose",   value: "#f43f5e" },
];

const pwSchema = z.object({
  current: z.string().min(6, "Minimum 6 characters"),
  newPw:   z.string().min(8, "Minimum 8 characters"),
  confirm: z.string(),
}).refine((d) => d.newPw === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
type PwForm = z.infer<typeof pwSchema>;

interface Prefs {
  accent:           string;
  sidebarCollapsed: boolean;
  notifications:    { emailSignup: boolean; emailRevenue: boolean; emailWeekly: boolean; emailMarketing: boolean };
}

const DEFAULT_PREFS: Prefs = {
  accent: "#6366f1",
  sidebarCollapsed: false,
  notifications: { emailSignup: true, emailRevenue: true, emailWeekly: false, emailMarketing: false },
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [tab, setTab]       = useState<Tab>("profile");
  const [prefs, setPrefs]   = useState<Prefs>(DEFAULT_PREFS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("dashboard-prefs");
      if (saved) setPrefs(JSON.parse(saved) as Prefs);
    } catch { /* ignore */ }
  }, []);

  const savePrefs = (next: Prefs) => {
    setPrefs(next);
    localStorage.setItem("dashboard-prefs", JSON.stringify(next));
    toast.success("Settings saved");
  };

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PwForm>({ resolver: zodResolver(pwSchema) });
  const onPwSubmit = (data: PwForm) => {
    console.log("pw change", data.current, data.newPw);
    toast.success("Password updated (demo — no real change)");
    reset();
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn("w-10 h-6 rounded-full relative transition-colors", checked ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-600")}
    >
      <span className={cn("absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform", checked && "translate-x-4")} />
    </button>
  );

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">Manage your account and preferences.</p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
                tab === t.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Profile tab */}
          {tab === "profile" && (
            <div className="space-y-5">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-3xl font-bold text-white shrink-0">
                  {session?.user?.name?.[0]?.toUpperCase() ?? "A"}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">{session?.user?.name ?? "Admin User"}</p>
                  <p className="text-sm text-[var(--muted)]">{session?.user?.email}</p>
                  <p className="text-xs text-indigo-500 mt-1">Admin</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Full Name", value: session?.user?.name ?? "", readOnly: false },
                  { label: "Email Address", value: session?.user?.email ?? "", readOnly: true },
                  { label: "Role", value: "Admin", readOnly: true },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-[var(--foreground)] mb-1">{f.label}</label>
                    <input
                      defaultValue={f.value}
                      readOnly={f.readOnly}
                      className={cn(
                        "w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500",
                        f.readOnly && "opacity-60 cursor-not-allowed"
                      )}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => toast.success("Profile saved (demo)")}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                Save Profile
              </button>
            </div>
          )}

          {/* Appearance tab */}
          {tab === "appearance" && (
            <div className="space-y-6">
              {mounted && (
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)] mb-3">Theme</p>
                  <div className="flex gap-3">
                    {[
                      { v: "light",  label: "Light",  icon: <Sun className="w-4 h-4" /> },
                      { v: "dark",   label: "Dark",   icon: <Moon className="w-4 h-4" /> },
                      { v: "system", label: "System", icon: <Monitor className="w-4 h-4" /> },
                    ].map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setTheme(opt.v)}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors",
                          theme === opt.v
                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600"
                            : "border-[var(--border)] text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800"
                        )}
                      >
                        {opt.icon} {opt.label}
                        {theme === opt.v && <Check className="w-3.5 h-3.5 ml-1" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-[var(--foreground)] mb-3">Accent Color</p>
                <div className="flex gap-3">
                  {ACCENT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => savePrefs({ ...prefs, accent: c.value })}
                      title={c.name}
                      className="relative w-9 h-9 rounded-full transition-transform hover:scale-110"
                      style={{ background: c.value }}
                    >
                      {prefs.accent === c.value && (
                        <Check className="w-4 h-4 text-white absolute inset-0 m-auto" strokeWidth={3} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-[var(--border)]">
                <div>
                  <p className="text-sm font-medium text-[var(--foreground)]">Collapse Sidebar by Default</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">Start with the sidebar in icon-only mode.</p>
                </div>
                <Toggle checked={prefs.sidebarCollapsed} onChange={(v) => savePrefs({ ...prefs, sidebarCollapsed: v })} />
              </div>
            </div>
          )}

          {/* Notifications tab */}
          {tab === "notifications" && (
            <div className="space-y-1">
              {([
                ["emailSignup",    "New user signup",           "Receive an email when a new user registers."],
                ["emailRevenue",   "Successful payment",        "Get notified for each successful payment."],
                ["emailWeekly",    "Weekly digest",             "Weekly summary of key metrics and trends."],
                ["emailMarketing", "Product updates & offers",  "News about new features and special offers."],
              ] as [keyof Prefs["notifications"], string, string][]).map(([k, title, desc]) => (
                <div key={k} className="flex items-center justify-between py-4 border-b border-[var(--border)] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
                    <p className="text-xs text-[var(--muted)] mt-0.5">{desc}</p>
                  </div>
                  <Toggle
                    checked={prefs.notifications[k]}
                    onChange={(v) => savePrefs({ ...prefs, notifications: { ...prefs.notifications, [k]: v } })}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Security tab */}
          {tab === "security" && (
            <form onSubmit={handleSubmit(onPwSubmit)} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Current Password</label>
                <input {...register("current")} type="password" placeholder="••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.current && <p className="mt-1 text-xs text-red-500">{errors.current.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">New Password</label>
                <input {...register("newPw")} type="password" placeholder="Min. 8 characters"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.newPw && <p className="mt-1 text-xs text-red-500">{errors.newPw.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">Confirm New Password</label>
                <input {...register("confirm")} type="password" placeholder="Repeat new password"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm.message}</p>}
              </div>
              <button type="submit"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
