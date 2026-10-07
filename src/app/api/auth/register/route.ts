import { eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { isRateLimited } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(`signup:${ip}`, 6)) return Response.json({ error: "Too many attempts. Take a minute and try again." }, { status: 429 });
  const parsed = signupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please enter your name, a valid email, and a password of at least 8 characters." }, { status: 400 });
  const email = parsed.data.email.toLowerCase();
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return Response.json({ error: "An account with that email already exists." }, { status: 409 });
  const [user] = await db.insert(users).values({ name: parsed.data.name, email, passwordHash: hashPassword(parsed.data.password) }).returning({ id: users.id, name: users.name, email: users.email, role: users.role });
  await setSessionCookie(user.id);
  return Response.json({ user }, { status: 201 });
}
