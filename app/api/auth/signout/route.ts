import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (session?.accessToken) {
    const deauthBody = new URLSearchParams({
      access_token: session.accessToken,
    });

    // Best-effort deauthorization; always continue local sign-out.
    await fetch("https://www.strava.com/oauth/deauthorize", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: deauthBody,
      cache: "no-store",
    }).catch(() => null);
  }

  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = NextResponse.redirect(`${baseUrl}/`);
  clearSessionCookie(res);
  return res;
}
