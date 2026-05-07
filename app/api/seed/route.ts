import { NextResponse } from "next/server";
import { seedDatabase } from "@/lib/seed";

let seeded = false;

export async function GET() {
  if (seeded) {
    return NextResponse.json(
      { message: "Database already seeded in this server instance. Restart to re-seed." },
      { status: 200 }
    );
  }

  try {
    const result = await seedDatabase();
    seeded = true;
    return NextResponse.json({
      message: "Database seeded successfully",
      counts: result,
    });
  } catch (err) {
    console.error("[seed]", err);
    return NextResponse.json(
      { error: "Seeding failed", detail: String(err) },
      { status: 500 }
    );
  }
}
