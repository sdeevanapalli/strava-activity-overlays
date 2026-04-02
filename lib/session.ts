import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const COOKIE_NAME = "strava_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  user: {
    id: string;
    name: string;
    image: string;
  };
}

function getKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not set");
  // Pad/truncate to exactly 32 bytes for A256GCM
  const buf = Buffer.alloc(32);
  Buffer.from(secret, "utf8").copy(buf);
  return new Uint8Array(buf);
}

export async function encryptSession(data: SessionData): Promise<string> {
  return new EncryptJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .encrypt(getKey());
}

export async function decryptSession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtDecrypt(token, getKey());
    return payload as unknown as SessionData;
  } catch {
    return null;
  }
}

/** Read session from the request cookie store (server components / route handlers). */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  return decryptSession(cookie.value);
}

/** Write session into a NextResponse cookie. */
export async function setSessionCookie(
  res: NextResponse,
  data: SessionData
): Promise<void> {
  const token = await encryptSession(data);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

/** Clear the session cookie. */
export function clearSessionCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
