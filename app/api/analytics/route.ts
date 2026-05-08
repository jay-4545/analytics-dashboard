import { NextResponse } from "next/server";
import {
  MOCK_EVENTS_TIMELINE,
  MOCK_TOP_PAGES,
  MOCK_DEVICE_BREAKDOWN,
  MOCK_COUNTRY_BREAKDOWN,
  MOCK_EVENT_TYPES,
  MOCK_BROWSER_BREAKDOWN,
} from "@/lib/mockData";

export async function GET() {
  return NextResponse.json({
    eventsTimeline:   MOCK_EVENTS_TIMELINE,
    topPages:         MOCK_TOP_PAGES,
    deviceBreakdown:  MOCK_DEVICE_BREAKDOWN,
    countryBreakdown: MOCK_COUNTRY_BREAKDOWN,
    eventTypes:       MOCK_EVENT_TYPES,
    browserBreakdown: MOCK_BROWSER_BREAKDOWN,
    meta: { groupBy: "day" },
  });
}
