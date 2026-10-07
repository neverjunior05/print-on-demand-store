import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { setSessionCookie, verifyPassword } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(`login:${ip}`, 8)) return Response.json({ error: "Too many attempts. Please try again in a minute." }, { status: 429 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a valid email and password." }, { status: 400 });
  const [user] = await db.select().from(users).where(eq(users.email, parsed.data.email.toLowerCase())).limit(1);
  if (!user || !verifyPassword(parsed.data.password, user.passwordHash)) return Response.json({ error: "That email and password don't match." }, { status: 401 });
  await setSessionCookie(user.id);
  return Response.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
}
