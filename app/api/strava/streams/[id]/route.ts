import { NextRequest, NextResponse } from "next/server";
import { getActivityStreams } from "@/lib/strava";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const streams = await getActivityStreams(id);
    return NextResponse.json(streams);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
  }
}
