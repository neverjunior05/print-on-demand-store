import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { promoCodes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
const promoInput = z.object({ code: z.string().trim().min(3).max(40).regex(/^[A-Z0-9_-]+$/i), percentOff: z.number().int().min(1).max(70), usageLimit: z.number().int().min(1).max(100000).nullable().optional() });

export async function GET() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "Admin access required." }, { status: 403 });
  return Response.json(await db.select().from(promoCodes).orderBy(asc(promoCodes.code)));
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "Admin access required." }, { status: 403 });
  const parsed = promoInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter a code and a discount from 1–70%." }, { status: 400 });
  const [saved] = await db.insert(promoCodes).values({ code: parsed.data.code.toUpperCase(), percentOff: parsed.data.percentOff, usageLimit: parsed.data.usageLimit ?? null, active: true }).onConflictDoUpdate({ target: promoCodes.code, set: { percentOff: parsed.data.percentOff, usageLimit: parsed.data.usageLimit ?? null, active: true } }).returning();
  return Response.json(saved, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "Admin access required." }, { status: 403 });
  const parsed = z.object({ code: z.string().min(3).max(40) }).safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "A promo code is required." }, { status: 400 });
  await db.delete(promoCodes).where(eq(promoCodes.code, parsed.data.code.toUpperCase()));
  return Response.json({ ok: true });
}
