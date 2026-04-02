import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  // Generate a random state value for CSRF protection
  const state = crypto.randomBytes(16).toString("hex");

  // Store state in a short-lived cookie to verify on callback
  const cookieStore = await cookies();

  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/strava/callback`,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });

  const res = NextResponse.redirect(
    `https://www.strava.com/oauth/authorize?${params}`
  );

  // Store state in cookie for verification in callback
  res.cookies.set("strava_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });

  return res;
}
