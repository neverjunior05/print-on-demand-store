import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { orderItems, orders, promoCodes } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createMockFulfillment } from "@/lib/fulfillment";
import { makeOrderNumber } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validators";
import { getProduct } from "@/lib/catalog";
import { eq } from "drizzle-orm";
import { isRateLimited } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
  if (isRateLimited(`checkout:${ip}`, 15)) return Response.json({ error: "A few too many checkout attempts. Please wait a moment." }, { status: 429 });
  const parsed = checkoutSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Please check the shipping details and cart items." }, { status: 400 });
  const input = parsed.data;
  const pricedItems = input.items.map((item) => {
    const product = getProduct(item.slug);
    if (!product) return null;
    if (!product.colors.some((color) => color.name === item.color) || !product.sizes.includes(item.size)) return null;
    return { ...item, product, unitCents: product.priceCents };
  });
  if (pricedItems.some((item) => item === null)) return Response.json({ error: "One or more cart items are no longer available. Refresh your bag and try again." }, { status: 400 });
  const items = pricedItems as NonNullable<(typeof pricedItems)[number]>[];
  const subtotalCents = items.reduce((sum, item) => sum + item.unitCents * item.quantity, 0);
  let discountPercent = 0;
  let appliedCode = "";
  const promoCode = input.promoCode.trim().toUpperCase();
  if (promoCode) {
    const fallbackPromos: Record<string, number> = { WELCOME10: 10, STUDIO15: 15, MAKER20: 20 };
    const [savedPromo] = await db.select().from(promoCodes).where(eq(promoCodes.code, promoCode)).limit(1);
    const isValidSavedPromo = savedPromo?.active && (!savedPromo.expiresAt || savedPromo.expiresAt > new Date()) && (!savedPromo.usageLimit || savedPromo.usageCount < savedPromo.usageLimit);
    if (isValidSavedPromo) { discountPercent = savedPromo.percentOff; appliedCode = promoCode; }
    else if (!savedPromo && fallbackPromos[promoCode]) { discountPercent = fallbackPromos[promoCode]; appliedCode = promoCode; }
    else return Response.json({ error: "That promo code isn't valid right now." }, { status: 400 });
  }
  const discountCents = Math.round(subtotalCents * discountPercent / 100);
  const shippingCents = subtotalCents >= 7500 ? 0 : 695;
  const totalCents = Math.max(0, subtotalCents - discountCents + shippingCents);
  const orderNumber = makeOrderNumber();
  const orderId = randomUUID();
  const user = await getCurrentUser();
  const address = { fullName: input.fullName, line1: input.line1, line2: input.line2, city: input.city, region: input.region, postalCode: input.postalCode, country: input.country };
  let paymentReference = "mock-paid";
  let orderStatus = "received";
  let stripeUrl: string | null = null;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    const form = new URLSearchParams({ mode: "payment", customer_email: input.email, success_url: `${origin}/checkout/success?order=${orderNumber}&id=${orderId}&session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/checkout?canceled=1`, "metadata[order_number]": orderNumber, "metadata[order_id]": orderId });
    items.forEach((item, index) => {
      const discountedUnit = Math.round(item.unitCents * (100 - discountPercent) / 100);
      form.set(`line_items[${index}][price_data][currency]`, "usd");
      form.set(`line_items[${index}][price_data][unit_amount]`, String(discountedUnit));
      form.set(`line_items[${index}][price_data][product_data][name]`, item.product.name);
      form.set(`line_items[${index}][quantity]`, String(item.quantity));
    });
    if (shippingCents > 0) {
      const index = items.length;
      form.set(`line_items[${index}][price_data][currency]`, "usd");
      form.set(`line_items[${index}][price_data][unit_amount]`, String(shippingCents));
      form.set(`line_items[${index}][price_data][product_data][name]`, "Shipping");
      form.set(`line_items[${index}][quantity]`, "1");
    }
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", { method: "POST", headers: { Authorization: `Bearer ${stripeSecret}`, "Content-Type": "application/x-www-form-urlencoded" }, body: form.toString(), cache: "no-store" });
    const session = await stripeResponse.json() as { id?: string; url?: string; error?: { message?: string } };
    if (!stripeResponse.ok || !session.id || !session.url) return Response.json({ error: session.error?.message ?? "We could not start secure checkout. Please try again." }, { status: 502 });
    paymentReference = session.id;
    stripeUrl = session.url;
    orderStatus = "awaiting_payment";
  }
  const fulfillment = createMockFulfillment(orderNumber);
  const [created] = await db.insert(orders).values({
    id: orderId,
    userId: user?.id ?? null,
    orderNumber,
    status: orderStatus,
    email: input.email.toLowerCase(),
    subtotalCents,
    shippingCents,
    discountCents,
    totalCents,
    trackingNumber: stripeSecret ? null : fulfillment.trackingNumber,
    paymentReference,
    shippingAddress: address,
  }).returning({ id: orders.id, orderNumber: orders.orderNumber, status: orders.status });
  await db.insert(orderItems).values(items.map((item) => ({
    orderId: created.id,
    productSlug: item.product.slug,
    productName: item.product.name,
    imageUrl: item.product.image,
    color: item.color,
    size: item.size,
    quantity: item.quantity,
    priceCents: item.unitCents,
  })));
  if (appliedCode) {
    const [currentPromo] = await db.select({ usageCount: promoCodes.usageCount }).from(promoCodes).where(eq(promoCodes.code, appliedCode)).limit(1);
    if (currentPromo) await db.update(promoCodes).set({ usageCount: currentPromo.usageCount + 1 }).where(eq(promoCodes.code, appliedCode));
  }
  return Response.json({ orderId: created.id, orderNumber: created.orderNumber, status: created.status, subtotalCents, shippingCents, discountCents, totalCents, provider: stripeUrl ? "stripe" : "mock", url: stripeUrl }, { status: 201 });
}
