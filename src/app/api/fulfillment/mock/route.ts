import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { nextFulfillmentStatus } from "@/lib/fulfillment";

const updateSchema = z.object({ orderId: z.string().uuid() });

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") return Response.json({ error: "Admin access required." }, { status: 403 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "A valid order ID is required." }, { status: 400 });
  const [order] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1);
  if (!order) return Response.json({ error: "Order not found." }, { status: 404 });
  const status = nextFulfillmentStatus(order.status);
  const trackingNumber = status === "shipped" ? order.trackingNumber ?? `TF${Date.now().toString().slice(-9)}US` : order.trackingNumber;
  const [updated] = await db.update(orders).set({ status, trackingNumber, updatedAt: new Date() }).where(eq(orders.id, order.id)).returning({ id: orders.id, status: orders.status, trackingNumber: orders.trackingNumber });
  return Response.json(updated);
}
