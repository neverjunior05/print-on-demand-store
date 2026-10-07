import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Sign in to follow this order." }, { status: 401 });
  const { id } = await params;
  const [order] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  if (!order || order.userId !== user.id) return Response.json({ error: "Order not found." }, { status: 404 });
  const encoder = new TextEncoder();
  let interval: ReturnType<typeof setInterval> | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (event: string, data: unknown) => controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      send("status", { id: order.id, orderNumber: order.orderNumber, status: order.status, trackingNumber: order.trackingNumber });
      interval = setInterval(async () => {
        try {
          const [current] = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
          if (current) send("status", { id: current.id, orderNumber: current.orderNumber, status: current.status, trackingNumber: current.trackingNumber });
        } catch { send("heartbeat", { at: Date.now() }); }
      }, 5000);
      timeout = setTimeout(() => { if (interval) clearInterval(interval); controller.close(); }, 60_000);
      request.signal.addEventListener("abort", () => { if (interval) clearInterval(interval); if (timeout) clearTimeout(timeout); controller.close(); }, { once: true });
    },
    cancel() { if (interval) clearInterval(interval); if (timeout) clearTimeout(timeout); },
  });
  return new Response(stream, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" } });
}
