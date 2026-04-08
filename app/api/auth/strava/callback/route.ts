import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/session";

type StravaTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  athlete: {
    id: number;
    firstname?: string;
    lastname?: string;
    profile_medium?: string;
    profile?: string;
  };
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL!;

  // Handle user denying access
  if (error) {
    return NextResponse.redirect(`${baseUrl}/?error=access_denied`);
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=no_code`);
  }

  // Verify state to prevent CSRF
  const storedState = request.cookies.get("strava_oauth_state")?.value;
  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${baseUrl}/?error=invalid_state`);
  }

  // Exchange code for tokens directly with Strava
  let tokenData: StravaTokenResponse;
  try {
    const tokenRes = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error("Strava token exchange failed:", tokenRes.status, errBody);
      return NextResponse.redirect(`${baseUrl}/?error=token_exchange_failed`);
    }

    tokenData = (await tokenRes.json()) as StravaTokenResponse;
  } catch (err) {
    console.error("Token exchange fetch error:", err);
    return NextResponse.redirect(`${baseUrl}/?error=token_exchange_failed`);
  }

  // tokenData from Strava includes: access_token, refresh_token, expires_at,
  // expires_in, token_type, athlete (user profile object)
  const athlete = tokenData.athlete;

  const sessionData = {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token,
    expiresAt: tokenData.expires_at, // unix timestamp in seconds
    user: {
      id: String(athlete.id),
      name: `${athlete.firstname} ${athlete.lastname}`.trim(),
      image: athlete.profile_medium || athlete.profile || "",
    },
  };

  const res = NextResponse.redirect(`${baseUrl}/dashboard`);

  // Clear the state cookie
  res.cookies.set("strava_oauth_state", "", { maxAge: 0, path: "/" });

  // Write encrypted session cookie
  await setSessionCookie(res, sessionData);

  return res;
}
