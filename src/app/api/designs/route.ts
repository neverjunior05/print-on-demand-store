import { desc, eq } from "drizzle-orm";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { designs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { designSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  const rows = user
    ? await db.select().from(designs).where(eq(designs.userId, user.id)).orderBy(desc(designs.createdAt)).limit(50)
    : await db.select().from(designs).where(eq(designs.isPublic, true)).orderBy(desc(designs.createdAt)).limit(30);
  return Response.json(rows);
}

export async function POST(request: NextRequest) {
  const parsed = designSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the design title and image." }, { status: 400 });
  const user = await getCurrentUser();
  const [saved] = await db.insert(designs).values({
    userId: user?.id ?? null,
    title: parsed.data.title,
    imageUrl: parsed.data.image,
    productSlug: parsed.data.productSlug,
    isPublic: parsed.data.isPublic,
  }).returning({ id: designs.id, title: designs.title, isPublic: designs.isPublic });
  return Response.json(saved, { status: 201 });
}
