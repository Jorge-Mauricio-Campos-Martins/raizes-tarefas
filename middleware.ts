import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/session";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const authed = token ? await verifySessionToken(token) : false;

  if (!authed) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Protect everything except:
     * - /login (the password entry page itself)
     * - /api/login (the auth check endpoint)
     * - static assets and Next internals
     */
    "/((?!login|api/login|_next/static|_next/image|favicon.ico).*)",
  ],
};
