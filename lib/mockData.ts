/**
 * Comprehensive static mock data used as fallback when MongoDB is unavailable.
 * All data is deterministic so the demo looks consistent on every load.
 */

// ─── Helpers ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function monthStr(monthsBack: number): string {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - monthsBack);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// ─── USERS (50 mock users) ────────────────────────────────────────────────────

const USER_NAMES = [
  ["Alice Johnson",    "alice.johnson",    "6366f1"],
  ["Bob Smith",        "bob.smith",        "8b5cf6"],
  ["Carol White",      "carol.white",      "06b6d4"],
  ["David Brown",      "david.brown",      "f59e0b"],
  ["Emma Wilson",      "emma.wilson",      "10b981"],
  ["Frank Garcia",     "frank.garcia",     "ec4899"],
  ["Grace Martinez",   "grace.martinez",   "6366f1"],
  ["Henry Davis",      "henry.davis",      "8b5cf6"],
  ["Iris Taylor",      "iris.taylor",      "06b6d4"],
  ["Jack Anderson",    "jack.anderson",    "f59e0b"],
  ["Kate Thomas",      "kate.thomas",      "10b981"],
  ["Liam Jackson",     "liam.jackson",     "ec4899"],
  ["Maya Harris",      "maya.harris",      "6366f1"],
  ["Noah Martin",      "noah.martin",      "8b5cf6"],
  ["Olivia Lewis",     "olivia.lewis",     "06b6d4"],
  ["Paul Lee",         "paul.lee",         "f59e0b"],
  ["Quinn Walker",     "quinn.walker",     "10b981"],
  ["Rachel Hall",      "rachel.hall",      "ec4899"],
  ["Sam Allen",        "sam.allen",        "6366f1"],
  ["Tara Young",       "tara.young",       "8b5cf6"],
  ["Uma Clark",        "uma.clark",        "06b6d4"],
  ["Victor King",      "victor.king",      "f59e0b"],
  ["Wendy Wright",     "wendy.wright",     "10b981"],
  ["Xavier Scott",     "xavier.scott",     "ec4899"],
  ["Yara Green",       "yara.green",       "6366f1"],
  ["Zach Adams",       "zach.adams",       "8b5cf6"],
  ["Aria Baker",       "aria.baker",       "06b6d4"],
  ["Blake Nelson",     "blake.nelson",     "f59e0b"],
  ["Chloe Carter",     "chloe.carter",     "10b981"],
  ["Dylan Mitchell",   "dylan.mitchell",   "ec4899"],
  ["Eva Perez",        "eva.perez",        "6366f1"],
  ["Finn Roberts",     "finn.roberts",     "8b5cf6"],
  ["Gia Turner",       "gia.turner",       "06b6d4"],
  ["Hugo Phillips",    "hugo.phillips",    "f59e0b"],
  ["Isla Campbell",    "isla.campbell",    "10b981"],
  ["James Parker",     "james.parker",     "ec4899"],
  ["Karen Evans",      "karen.evans",      "6366f1"],
  ["Leo Edwards",      "leo.edwards",      "8b5cf6"],
  ["Mia Collins",      "mia.collins",      "06b6d4"],
  ["Nate Stewart",     "nate.stewart",     "f59e0b"],
  ["Opal Sanchez",     "opal.sanchez",     "10b981"],
  ["Percy Morris",     "percy.morris",     "ec4899"],
  ["Rose Rogers",      "rose.rogers",      "6366f1"],
  ["Sean Reed",        "sean.reed",        "8b5cf6"],
  ["Tina Cook",        "tina.cook",        "06b6d4"],
  ["Uri Morgan",       "uri.morgan",       "f59e0b"],
  ["Vera Bell",        "vera.bell",        "10b981"],
  ["Will Murphy",      "will.murphy",      "ec4899"],
  ["Xena Bailey",      "xena.bailey",      "6366f1"],
  ["Yusuf Rivera",     "yusuf.rivera",     "8b5cf6"],
] as const;

const LOCATIONS = [
  ["United States", "New York"],
  ["United States", "Los Angeles"],
  ["United States", "Chicago"],
  ["United Kingdom", "London"],
  ["United Kingdom", "Manchester"],
  ["Germany",        "Berlin"],
  ["Germany",        "Munich"],
  ["France",         "Paris"],
  ["Canada",         "Toronto"],
  ["Canada",         "Vancouver"],
  ["Australia",      "Sydney"],
  ["Australia",      "Melbourne"],
  ["Japan",          "Tokyo"],
  ["Brazil",         "São Paulo"],
  ["India",          "Bangalore"],
  ["India",          "Mumbai"],
  ["Spain",          "Madrid"],
  ["Netherlands",    "Amsterdam"],
  ["Singapore",      "Singapore"],
  ["South Korea",    "Seoul"],
];

const PLANS    = ["free", "pro", "enterprise", "free", "free", "pro", "pro", "free", "enterprise", "pro"] as const;
const ROLES    = ["user", "user", "viewer",    "user", "admin", "user", "viewer", "user", "user", "viewer"] as const;
const STATUSES = ["active", "active", "active", "inactive", "active", "active", "active", "banned", "active", "active"] as const;

const PLAN_REVENUE: Record<string, number> = { free: 0, pro: 49, enterprise: 299 };

export type MockUser = {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  plan: string;
  status: string;
  country: string;
  city: string;
  revenue: number;
  joinedAt: string;
  lastActiveAt: string;
  transactions?: MockTransaction[];
};

export const MOCK_USERS: MockUser[] = USER_NAMES.map(([name, emailBase, color], i) => {
  const plan         = i === 0 ? "enterprise" : PLANS[i % PLANS.length];
  const role         = i === 0 ? "admin"      : ROLES[i % ROLES.length];
  const status       = i === 0 ? "active"     : STATUSES[i % STATUSES.length];
  const [country, city] = LOCATIONS[i % LOCATIONS.length];
  const joinedDays   = 365 - i * 7;
  const revMonths    = Math.floor(1 + (i % 8));
  return {
    _id:          `mock_user_${String(i + 1).padStart(3, "0")}`,
    name,
    email:        i === 0 ? "admin@demo.com" : `${emailBase}${i + 1}@example.com`,
    avatar:       `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=fff`,
    role,
    plan,
    status,
    country,
    city,
    revenue:      PLAN_REVENUE[plan] * revMonths,
    joinedAt:     daysAgo(joinedDays),
    lastActiveAt: daysAgo(Math.max(0, i - 5)),
  };
});

// ─── TRANSACTIONS (50 mock transactions) ─────────────────────────────────────

const TX_DESCRIPTIONS: Record<string, string[]> = {
  pro:        ["Pro Plan - Monthly", "Pro Plan - Annual", "Pro Plan - Renewal", "Pro Plan - Upgrade"],
  enterprise: ["Enterprise Plan - Annual", "Enterprise Plan - Monthly", "Enterprise Plan - Custom", "Enterprise Plan - Seat Addition"],
  free:       ["Pro Plan - Monthly", "Enterprise Plan - Annual"],
};

const TX_STATUSES = ["paid", "paid", "paid", "paid", "paid", "pending", "paid", "paid", "failed", "refunded"] as const;
const TX_PLANS    = ["pro", "pro", "enterprise", "pro", "enterprise", "pro", "pro", "free", "enterprise", "pro"] as const;
const TX_AMOUNTS  = [49, 99, 299, 79, 499, 49, 39, 199, 399, 49, 799, 29, 999, 199, 49, 99, 299, 49, 39, 79];

export type MockTransaction = {
  _id: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  date: string;
  description: string;
  userId: { name: string; email: string; avatar: string };
};

export const MOCK_TRANSACTIONS: MockTransaction[] = Array.from({ length: 50 }, (_, i) => {
  const user    = MOCK_USERS[i % 20];
  const plan    = TX_PLANS[i % TX_PLANS.length];
  const status  = TX_STATUSES[i % TX_STATUSES.length];
  const amount  = TX_AMOUNTS[i % TX_AMOUNTS.length];
  const descs   = TX_DESCRIPTIONS[plan];
  return {
    _id:         `mock_tx_${String(i + 1).padStart(3, "0")}`,
    amount,
    currency:    "USD",
    plan,
    status,
    date:        daysAgo(i * 4),
    description: descs[i % descs.length],
    userId: {
      name:   user.name,
      email:  user.email,
      avatar: user.avatar,
    },
  };
});

// ─── REVENUE BY MONTH (last 6 months) ────────────────────────────────────────

export const MOCK_REVENUE_BY_MONTH = [
  { month: monthStr(5), revenue: 18420, count: 24 },
  { month: monthStr(4), revenue: 22850, count: 29 },
  { month: monthStr(3), revenue: 26100, count: 33 },
  { month: monthStr(2), revenue: 31780, count: 38 },
  { month: monthStr(1), revenue: 38250, count: 45 },
  { month: monthStr(0), revenue: 44690, count: 52 },
];

// ─── REVENUE BY PLAN ─────────────────────────────────────────────────────────

export const MOCK_REVENUE_BY_PLAN = [
  { plan: "free",       revenue: 0,      count: 6  },
  { plan: "pro",        revenue: 89340,  count: 148 },
  { plan: "enterprise", revenue: 92750,  count: 67 },
];

// ─── REVENUE BY STATUS ───────────────────────────────────────────────────────

export const MOCK_REVENUE_BY_STATUS = [
  { status: "paid",     count: 182, total: 172840 },
  { status: "pending",  count: 10,  total: 4900   },
  { status: "failed",   count: 5,   total: 1450   },
  { status: "refunded", count: 3,   total: 950    },
];

// ─── EVENTS TIMELINE (last 30 days) ──────────────────────────────────────────

const BASE_VIEWS = [
  28, 34, 41, 38, 45, 52, 49, 43, 56, 61,
  58, 65, 70, 67, 72, 78, 74, 80, 85, 82,
  88, 91, 86, 94, 98, 103, 99, 107, 112, 118,
];

export const MOCK_EVENTS_TIMELINE = BASE_VIEWS.map((views, i) => ({
  date:  new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
  views,
}));

// ─── TOP PAGES ───────────────────────────────────────────────────────────────

export const MOCK_TOP_PAGES = [
  { name: "/dashboard",          views: 892 },
  { name: "/dashboard/analytics",views: 634 },
  { name: "/dashboard/revenue",  views: 521 },
  { name: "/dashboard/users",    views: 478 },
  { name: "/dashboard/reports",  views: 356 },
  { name: "/login",              views: 298 },
  { name: "/dashboard/settings", views: 241 },
  { name: "/pricing",            views: 187 },
  { name: "/",                   views: 134 },
  { name: "/docs",               views: 98  },
];

// ─── DEVICE BREAKDOWN ────────────────────────────────────────────────────────

export const MOCK_DEVICE_BREAKDOWN = [
  { device: "desktop", count: 558 },
  { device: "mobile",  count: 352 },
  { device: "tablet",  count: 90  },
];

// ─── COUNTRY BREAKDOWN ───────────────────────────────────────────────────────

export const MOCK_COUNTRY_BREAKDOWN = [
  { country: "United States",  count: 312 },
  { country: "United Kingdom", count: 148 },
  { country: "Germany",        count: 97  },
  { country: "India",          count: 86  },
  { country: "Canada",         count: 74  },
  { country: "Australia",      count: 61  },
  { country: "France",         count: 55  },
  { country: "Japan",          count: 43  },
  { country: "Brazil",         count: 38  },
  { country: "Spain",          count: 29  },
];

// ─── BROWSER BREAKDOWN ───────────────────────────────────────────────────────

export const MOCK_BROWSER_BREAKDOWN = [
  { browser: "Chrome",  count: 512 },
  { browser: "Safari",  count: 218 },
  { browser: "Firefox", count: 134 },
  { browser: "Edge",    count: 98  },
  { browser: "Opera",   count: 38  },
];

// ─── EVENT TYPES ─────────────────────────────────────────────────────────────

export const MOCK_EVENT_TYPES: Record<string, number> = {
  pageview: 550,
  click:    220,
  purchase: 110,
  signup:   60,
  logout:   60,
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const MOCK_DASHBOARD_STATS = {
  totalUsers:           50,
  newUsersThisMonth:    8,
  userGrowthPercent:    14.3,
  activeUsers:          31,
  totalRevenue:         182090,
  revenueThisMonth:     44690,
  revenueGrowthPercent: 16.8,
  totalEvents:          1000,
  eventsToday:          42,
  usersByPlan: [
    { plan: "free",       count: 28 },
    { plan: "pro",        count: 17 },
    { plan: "enterprise", count: 5  },
  ],
  usersByStatus: [
    { status: "active",   count: 39 },
    { status: "inactive", count: 9  },
    { status: "banned",   count: 2  },
  ],
};

// ─── REPORT MOCK DATA ─────────────────────────────────────────────────────────

export function getMockUsersReport() {
  return {
    type:    "users",
    summary: {
      total:        50,
      byPlan:       { free: 28, pro: 17, enterprise: 5 },
      byStatus:     { active: 39, inactive: 9, banned: 2 },
      byRole:       { user: 35, viewer: 12, admin: 3 },
      totalRevenue: 182090,
    },
    data: MOCK_USERS,
  };
}

export function getMockRevenueReport() {
  return {
    type:    "revenue",
    summary: {
      total:     200,
      byStatus:  {
        paid:     { count: 182, subtotal: 172840 },
        pending:  { count: 10,  subtotal: 4900   },
        failed:   { count: 5,   subtotal: 1450   },
        refunded: { count: 3,   subtotal: 950    },
      },
      totalPaid: 172840,
    },
    data: MOCK_TRANSACTIONS,
  };
}

export function getMockAnalyticsReport() {
  return {
    type:    "analytics",
    summary: {
      totalEvents: 1000,
      eventTypes:  MOCK_EVENT_TYPES,
    },
    data: {
      dailyEvents:      MOCK_EVENTS_TIMELINE.map((d) => ({ date: d.date, total: d.views })),
      topPages:         MOCK_TOP_PAGES.map((p) => ({ page: p.name, views: p.views })),
      deviceBreakdown:  MOCK_DEVICE_BREAKDOWN,
      countryBreakdown: MOCK_COUNTRY_BREAKDOWN,
    },
  };
}
