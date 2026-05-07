import {
  subDays,
  subMonths,
  addDays,
  startOfDay,
  differenceInDays,
} from "date-fns";
import { connectToDatabase } from "./mongodb";
import User, { type IUser } from "@/models/User";
import Revenue from "@/models/Revenue";
import Event from "@/models/Event";

// ─── Static lookup tables ────────────────────────────────────────────────────

const FIRST_NAMES = [
  "Alice", "Bob", "Carol", "David", "Emma", "Frank", "Grace", "Henry",
  "Iris", "Jack", "Kate", "Liam", "Maya", "Noah", "Olivia", "Paul",
  "Quinn", "Rachel", "Sam", "Tara", "Uma", "Victor", "Wendy", "Xavier",
  "Yara", "Zach", "Aria", "Blake", "Chloe", "Dylan", "Evelyn", "Felix",
  "Gina", "Hugo", "Isla", "James", "Karen", "Leo", "Mia", "Nate",
  "Opal", "Percy", "Rose", "Sean", "Tina", "Uri", "Vera", "Will",
  "Xena", "Yusuf",
];

const LAST_NAMES = [
  "Johnson", "Smith", "Brown", "Davis", "Miller", "Wilson", "Moore",
  "Taylor", "Anderson", "Thomas", "Jackson", "White", "Harris", "Martin",
  "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez", "Lewis",
  "Lee", "Walker", "Hall", "Allen", "Young", "Hernandez", "King",
  "Wright", "Lopez", "Hill", "Scott", "Green", "Adams", "Baker",
  "Gonzalez", "Nelson", "Carter", "Mitchell", "Perez", "Roberts",
  "Turner", "Phillips", "Campbell", "Parker", "Evans", "Edwards",
  "Collins", "Stewart", "Sanchez", "Morris",
];

const LOCATIONS: { country: string; city: string }[] = [
  { country: "United States", city: "New York" },
  { country: "United States", city: "Los Angeles" },
  { country: "United States", city: "Chicago" },
  { country: "United States", city: "Houston" },
  { country: "United States", city: "Seattle" },
  { country: "United Kingdom", city: "London" },
  { country: "United Kingdom", city: "Manchester" },
  { country: "United Kingdom", city: "Birmingham" },
  { country: "Germany", city: "Berlin" },
  { country: "Germany", city: "Munich" },
  { country: "France", city: "Paris" },
  { country: "France", city: "Lyon" },
  { country: "Canada", city: "Toronto" },
  { country: "Canada", city: "Vancouver" },
  { country: "Australia", city: "Sydney" },
  { country: "Australia", city: "Melbourne" },
  { country: "Japan", city: "Tokyo" },
  { country: "Japan", city: "Osaka" },
  { country: "Brazil", city: "São Paulo" },
  { country: "India", city: "Bangalore" },
  { country: "India", city: "Mumbai" },
  { country: "Spain", city: "Madrid" },
  { country: "Netherlands", city: "Amsterdam" },
  { country: "Singapore", city: "Singapore" },
  { country: "South Korea", city: "Seoul" },
];

const PAGES = [
  "/dashboard", "/dashboard/analytics", "/dashboard/users",
  "/dashboard/revenue", "/dashboard/reports", "/dashboard/settings",
  "/login", "/", "/pricing", "/docs",
];

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];

const REVENUE_DESCRIPTIONS: Record<string, string[]> = {
  free: ["Free Plan"],
  pro: [
    "Pro Plan - Monthly", "Pro Plan - Annual", "Pro Plan - Upgrade",
    "Pro Plan - Renewal",
  ],
  enterprise: [
    "Enterprise Plan - Annual", "Enterprise Plan - Monthly",
    "Enterprise Plan - Seat Addition", "Enterprise Plan - Renewal",
    "Enterprise Plan - Custom",
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rng(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(items: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

/**
 * Returns a random Date between `from` and `to`, biased towards `to`
 * when bias > 1 (exponential distribution — more recent dates are more likely).
 */
function randomDateBiased(from: Date, to: Date, bias = 2): Date {
  const range = differenceInDays(to, from);
  const u = Math.random();
  // Apply power curve: u^(1/bias) skews towards 1 (recent)
  const t = Math.pow(u, 1 / bias);
  return addDays(from, Math.floor(t * range));
}

function randomDateUniform(from: Date, to: Date): Date {
  const range = differenceInDays(to, from);
  return addDays(from, rng(0, range));
}

function planAmount(plan: string): number {
  switch (plan) {
    case "pro":        return pick([29, 39, 49, 79, 99]);
    case "enterprise": return pick([199, 299, 399, 499, 799, 999]);
    default:           return 0;
  }
}

// ─── Seed function ────────────────────────────────────────────────────────────

export async function seedDatabase(): Promise<{
  users: number;
  revenue: number;
  events: number;
}> {
  await connectToDatabase();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Revenue.deleteMany({}),
    Event.deleteMany({}),
  ]);

  const now = new Date();
  const twelveMonthsAgo = startOfDay(subMonths(now, 12));
  const sixMonthsAgo   = startOfDay(subMonths(now, 6));
  const thirtyDaysAgo  = startOfDay(subDays(now, 30));

  // ── 1. Users (50) ──────────────────────────────────────────────────────────
  const userData: Partial<IUser>[] = [];

  // Ensure one guaranteed admin
  const adminFirst = FIRST_NAMES[0];
  const adminLast  = LAST_NAMES[0];
  userData.push({
    name:         `${adminFirst} ${adminLast}`,
    email:        "admin@demo.com",
    avatar:       `https://ui-avatars.com/api/?name=${adminFirst}+${adminLast}&background=6366f1&color=fff`,
    role:         "admin",
    plan:         "enterprise",
    status:       "active",
    country:      "United States",
    city:         "New York",
    revenue:      0,
    joinedAt:     subMonths(now, 12),
    lastActiveAt: subDays(now, 1),
  });

  for (let i = 1; i < 50; i++) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length];
    const last  = LAST_NAMES[i  % LAST_NAMES.length];
    const loc   = pick(LOCATIONS);

    const plan   = weightedPick(
      ["free", "pro", "enterprise"] as const,
      [55, 35, 10]
    );
    const role   = weightedPick(
      ["user", "viewer", "admin"] as const,
      [70, 25, 5]
    );
    const status = weightedPick(
      ["active", "inactive", "banned"] as const,
      [78, 18, 4]
    );

    // Earlier users joined longer ago; recent users joined more recently
    const joinedAt = randomDateBiased(twelveMonthsAgo, now, 0.6);

    userData.push({
      name:         `${first} ${last}`,
      email:        `${first.toLowerCase()}.${last.toLowerCase()}${i}@example.com`,
      avatar:       `https://ui-avatars.com/api/?name=${first}+${last}&background=${pick(["6366f1","8b5cf6","06b6d4","f59e0b","10b981"])}&color=fff`,
      role,
      plan,
      status,
      country:      loc.country,
      city:         loc.city,
      revenue:      0,
      joinedAt,
      lastActiveAt: randomDateUniform(joinedAt, now),
    });
  }

  const insertedUsers = await User.insertMany(userData);

  // ── 2. Revenue (200 transactions, last 6 months, growth-biased) ───────────
  const paidUsers = insertedUsers.filter((u) => u.plan !== "free");
  const allUsers  = insertedUsers;

  const revenueData = [];
  const totalsByUser: Record<string, number> = {};

  for (let i = 0; i < 200; i++) {
    // 80% of transactions come from pro/enterprise users
    const user = Math.random() < 0.8 && paidUsers.length
      ? pick(paidUsers)
      : pick(allUsers);

    const userPlan    = (user.plan ?? "free") as "free" | "pro" | "enterprise";
    const plan        = userPlan === "free" ? pick(["pro", "enterprise"] as const) : userPlan;
    const amount      = planAmount(plan);
    const description = pick(REVENUE_DESCRIPTIONS[plan]);

    // Growth bias: recent dates are ~3× more likely
    const date = randomDateBiased(sixMonthsAgo, now, 3);

    const status = weightedPick(
      ["paid", "pending", "failed", "refunded"] as const,
      [80, 10, 6, 4]
    );

    revenueData.push({
      amount,
      currency: "USD",
      plan,
      status,
      userId: user._id,
      date,
      description,
    });

    if (status === "paid") {
      totalsByUser[user._id.toString()] =
        (totalsByUser[user._id.toString()] ?? 0) + amount;
    }
  }

  await Revenue.insertMany(revenueData);

  // Back-fill revenue totals onto users
  const bulkOps = Object.entries(totalsByUser).map(([userId, total]) => ({
    updateOne: {
      filter: { _id: userId },
      update: { $set: { revenue: total } },
    },
  }));
  if (bulkOps.length) await User.bulkWrite(bulkOps);

  // ── 3. Events (1000, last 30 days) ────────────────────────────────────────
  const eventData = [];

  for (let i = 0; i < 1000; i++) {
    const type = weightedPick(
      ["pageview", "click", "signup", "purchase", "logout"] as const,
      [55, 22, 6, 11, 6]
    );
    const device = weightedPick(
      ["desktop", "mobile", "tablet"] as const,
      [55, 35, 10]
    );
    const loc     = pick(LOCATIONS);
    const hasUser = Math.random() < 0.75;

    // Slightly more events on recent days
    const timestamp = randomDateBiased(thirtyDaysAgo, now, 1.5);

    eventData.push({
      type,
      page:      pick(PAGES),
      userId:    hasUser ? pick(insertedUsers)._id : null,
      country:   loc.country,
      device,
      browser:   pick(BROWSERS),
      timestamp,
    });
  }

  await Event.insertMany(eventData);

  return {
    users:   insertedUsers.length,
    revenue: revenueData.length,
    events:  eventData.length,
  };
}
