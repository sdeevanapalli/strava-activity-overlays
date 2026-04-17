import { getSession, encryptSession, COOKIE_NAME } from "@/lib/session";
import { cookies } from "next/headers";

const STRAVA_API = "https://www.strava.com/api/v3";

async function getAccessToken(): Promise<string> {
  const session = await getSession();
  if (!session?.accessToken) throw new Error("No access token");

  // Auto-refresh if within 5 minutes of expiry
  if (Date.now() / 1000 > session.expiresAt - 300) {
    const res = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.STRAVA_CLIENT_ID!,
        client_secret: process.env.STRAVA_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: session.refreshToken,
      }),
    });
    if (res.ok) {
      const refreshed = await res.json();
      // Persist refreshed token so next request doesn't re-refresh
      try {
        const newSession = {
          ...session,
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token ?? session.refreshToken,
          expiresAt: refreshed.expires_at,
        };
        const token = await encryptSession(newSession);
        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        });
      } catch {
        // Server Components are read-only; skip silently
      }
      return refreshed.access_token;
    }
  }

  return session.accessToken;
}

export async function getActivities(page = 1, perPage = 10, sportType?: string) {
  const token = await getAccessToken();
  const params = new URLSearchParams({
    page: String(page),
    per_page: String(perPage),
  });
  if (sportType && sportType !== "All") {
    params.append("type", sportType);
  }
  const res = await fetch(`${STRAVA_API}/athlete/activities?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
}

export async function getActivity(id: string) {
  const token = await getAccessToken();
  const res = await fetch(`${STRAVA_API}/activities/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch activity");
  return res.json();
}

export async function getActivityStreams(id: string) {
  const token = await getAccessToken();
  const keys = "latlng,altitude,velocity_smooth,heartrate,time";
  const res = await fetch(
    `${STRAVA_API}/activities/${id}/streams?keys=${keys}&key_by_type=true`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) throw new Error("Failed to fetch streams");
  return res.json();
}
