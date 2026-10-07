import { randomBytes, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state") ?? "";
  const savedState = request.cookies.get("threadform_google_state")?.value ?? "";
  const response = NextResponse.redirect(new URL("/dashboard", origin));
  response.cookies.delete("threadform_google_state");
  const supplied = Buffer.from(state);
  const expected = Buffer.from(savedState);
  if (!code || !savedState || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return NextResponse.redirect(new URL("/login?error=google-signin-failed", origin));
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI ?? `${origin}/api/auth/google/callback`;
  if (!clientId || !clientSecret) return NextResponse.redirect(new URL("/login?error=google-not-configured", origin));
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: clientId, client_secret: clientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }), cache: "no-store" });
  if (!tokenResponse.ok) return NextResponse.redirect(new URL("/login?error=google-signin-failed", origin));
  const token = await tokenResponse.json() as { access_token?: string };
  if (!token.access_token) return NextResponse.redirect(new URL("/login?error=google-signin-failed", origin));
  const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${token.access_token}` }, cache: "no-store" });
  if (!profileResponse.ok) return NextResponse.redirect(new URL("/login?error=google-signin-failed", origin));
  const profile = await profileResponse.json() as { email?: string; name?: string; picture?: string; email_verified?: boolean };
  if (!profile.email || !profile.email_verified) return NextResponse.redirect(new URL("/login?error=google-signin-failed", origin));
  let [user] = await db.select().from(users).where(eq(users.email, profile.email.toLowerCase())).limit(1);
  if (!user) {
    [user] = await db.insert(users).values({ email: profile.email.toLowerCase(), name: profile.name ?? "THREADFORM maker", passwordHash: hashPassword(randomBytes(32).toString("hex")), avatarUrl: profile.picture }).returning();
  }
  await setSessionCookie(user.id);
  return response;
}
