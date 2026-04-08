import { NextRequest, NextResponse } from "next/server";
import { jwtDecrypt } from "jose";
import { COOKIE_NAME } from "@/lib/session";

// Replicate decryptSession inline — middleware runs on Edge and cannot use
// next/headers, so we can't import the full lib/session here.
function getKey(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  const buf = Buffer.alloc(32);
  Buffer.from(secret, "utf8").copy(buf);
  return new Uint8Array(buf);
}

async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get(COOKIE_NAME);
  if (!cookie?.value) return false;
  try {
    await jwtDecrypt(cookie.value, getKey());
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPaths = ["/dashboard", "/editor"];
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !(await isAuthenticated(request))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.png).*)"],
};
