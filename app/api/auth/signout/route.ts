import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL!;
  const res = NextResponse.redirect(`${baseUrl}/`);
  clearSessionCookie(res);
  return res;
}
