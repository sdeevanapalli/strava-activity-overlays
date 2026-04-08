# Deauthorization Logic (Strava + PostgreSQL)

Use this server-side endpoint for your "Disconnect Strava" action.

```ts
// Express route example
import type { Request, Response } from "express";
import fetch from "node-fetch";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Assume req.user.id is set by your auth middleware
export async function disconnectStrava(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const client = await pool.connect();
  try {
    const tokenResult = await client.query(
      "SELECT strava_access_token FROM user_integrations WHERE user_id = $1 LIMIT 1",
      [userId]
    );

    const accessToken = tokenResult.rows[0]?.strava_access_token;
    if (!accessToken) {
      return res.status(200).json({ ok: true, message: "Already disconnected" });
    }

    const stravaRes = await fetch("https://www.strava.com/oauth/deauthorize", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        access_token: accessToken,
      }),
    });

    if (!stravaRes.ok) {
      const body = await stravaRes.text();
      return res.status(502).json({ error: "Failed to deauthorize on Strava", detail: body });
    }

    await client.query(
      `
      UPDATE user_integrations
      SET
        strava_access_token = NULL,
        strava_refresh_token = NULL,
        strava_expires_at = NULL,
        strava_athlete_id = NULL,
        updated_at = NOW()
      WHERE user_id = $1
      `,
      [userId]
    );

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Disconnect failed:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
}
```

## UI Trigger Example
- Add a "Disconnect Strava" button in account settings.
- Button should call your backend endpoint (for example `POST /api/integrations/strava/disconnect`).
- On success, redirect user to a disconnected state and prompt reconnect if needed.
