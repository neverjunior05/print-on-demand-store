import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to see your orders." }, { status: 401 });
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(100);
  const data = await Promise.all(rows.map(async (order) => ({ ...order, items: await db.select().from(orderItems).where(eq(orderItems.orderId, order.id)) })));
  return Response.json(data);
}
