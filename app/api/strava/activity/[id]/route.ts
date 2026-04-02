import { NextRequest, NextResponse } from "next/server";
import { getActivity } from "@/lib/strava";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const activity = await getActivity(id);
    return NextResponse.json(activity);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}
