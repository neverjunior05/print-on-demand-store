import { createHmac, timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";

export const runtime = "nodejs";

function verifyStripeSignature(payload: string, header: string, secret: string) {
  const parts = header.split(",").map((part) => part.split("="));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  return signatures.some((signature) => {
    const left = Buffer.from(signature ?? "");
    const right = Buffer.from(expected);
    return left.length === right.length && timingSafeEqual(left, right);
  });
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ received: true, configured: false });
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature") ?? "";
  if (!verifyStripeSignature(rawBody, signature, secret)) return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  const event = JSON.parse(rawBody) as { type?: string; data?: { object?: { id?: string; payment_status?: string } } };
  if (event.type === "checkout.session.completed" && event.data?.object?.id && event.data.object.payment_status === "paid") {
    await db.update(orders).set({ status: "received", updatedAt: new Date() }).where(eq(orders.paymentReference, event.data.object.id));
  }
  return Response.json({ received: true });
}
