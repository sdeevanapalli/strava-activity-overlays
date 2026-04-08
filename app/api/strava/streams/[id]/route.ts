import { NextRequest, NextResponse } from "next/server";
import { getActivityStreams } from "@/lib/strava";
import { getSession } from "@/lib/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const streams = await getActivityStreams(id);
    return NextResponse.json(streams);
  } catch {
    return NextResponse.json({ error: "Failed to fetch streams" }, { status: 500 });
  }
}
