import { eq } from "drizzle-orm";
import { db } from "@/db";
import { designs } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [design] = await db.select().from(designs).where(eq(designs.id, id)).limit(1);
  if (!design) return Response.json({ error: "Design not found." }, { status: 404 });
  const user = await getCurrentUser();
  if (!design.isPublic && design.userId !== user?.id) return Response.json({ error: "Design not found." }, { status: 404 });
  return Response.json(design);
}
