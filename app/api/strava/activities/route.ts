import { NextRequest, NextResponse } from "next/server";
import { getActivities } from "@/lib/strava";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page") || 1);
    const perPage = Number(searchParams.get("per_page") || 10);
    const sportType = searchParams.get("sport_type") || undefined;

    const activities = await getActivities(page, perPage, sportType);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}
