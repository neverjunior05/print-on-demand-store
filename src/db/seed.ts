import "dotenv/config";
import { and, eq } from "drizzle-orm";
import { db, pool } from "@/db";
import { addresses, creators as creatorTable, designs, orderItems, orders, products as productTable, promoCodes, reviews, users, variants } from "@/db/schema";
import { products } from "@/lib/catalog";
import { creators } from "@/lib/creators";
import { hashPassword } from "@/lib/auth";

const DEMO_EMAIL = "demo@threadform.shop";
const ADMIN_EMAIL = "admin@threadform.shop";
const DEMO_PASSWORD = "threadform123";

async function seed() {
  await db.insert(users).values({ email: DEMO_EMAIL, name: "Taylor Threadform", passwordHash: hashPassword(DEMO_PASSWORD), role: "customer" }).onConflictDoNothing();
  await db.insert(users).values({ email: ADMIN_EMAIL, name: "Threadform Admin", passwordHash: hashPassword(DEMO_PASSWORD), role: "admin" }).onConflictDoNothing();
  const [demoUser] = await db.select().from(users).where(eq(users.email, DEMO_EMAIL)).limit(1);

  await db.insert(creatorTable).values(creators.map((creator) => ({ handle: creator.handle, displayName: creator.name, bio: creator.bio, avatarUrl: creator.avatar, accent: creator.accent, sales: Number(creator.earnings.replace(/[$,]/g, "")) }))).onConflictDoNothing();
  const creatorRows = await db.select().from(creatorTable);

  await db.insert(productTable).values(products.map((product) => ({
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: product.category,
    priceCents: product.priceCents,
    compareAtCents: product.compareAtCents ?? null,
    imageUrl: product.image,
    colorOptions: product.colors.map((color) => `${color.name}|${color.hex}`),
    sizeOptions: product.sizes,
    tags: [product.tag, product.maker],
    featured: Boolean(product.featured),
    popularity: product.popularity,
  }))).onConflictDoNothing();
  const productRows = await db.select().from(productTable);
  const variantRows = productRows.flatMap((row) => {
    const catalogProduct = products.find((product) => product.slug === row.slug);
    if (!catalogProduct) return [];
    return catalogProduct.colors.flatMap((color) => catalogProduct.sizes.map((size) => ({
      productId: row.id,
      sku: `TF-${row.slug}-${color.name}-${size}`.toUpperCase().replace(/[^A-Z0-9]+/g, "-"),
      color: color.name,
      size,
      priceCents: row.priceCents,
      available: true,
    })));
  });
  if (variantRows.length) await db.insert(variants).values(variantRows).onConflictDoNothing();

  const promoRows = [
    { code: "WELCOME10", percentOff: 10, active: true, usageLimit: 1000 },
    { code: "STUDIO15", percentOff: 15, active: true, usageLimit: 500 },
    { code: "MAKER20", percentOff: 20, active: true, usageLimit: 250 },
  ];
  await db.insert(promoCodes).values(promoRows).onConflictDoNothing();

  const existingReviews = await db.select({ id: reviews.id }).from(reviews).limit(1);
  if (!existingReviews.length) {
    const names = ["Jamie R.", "Nico L.", "Alex M.", "Sam P.", "Riley T.", "Taylor K.", "Jordan B.", "Casey W.", "Morgan D.", "Avery S."];
    const titles = ["Better than the mockup", "Instant favorite", "A genuinely good gift", "The print is perfect", "Exactly my kind of thing", "Wore it twice this week", "Good quality, good idea", "Made my day", "I need another one", "Worth the wait"];
    const notes = ["The colors are even better in person and the fabric feels great.", "Arrived right when they said it would. I love knowing it was made just for me.", "A thoughtful gift that felt truly one of a kind.", "The quality surprised me in the best way. Soft, well-made, and very wearable.", "I got stopped twice on my first day wearing it. Would absolutely recommend."];
    const reviewRows = Array.from({ length: 40 }, (_, index) => ({
      productSlug: products[index % products.length].slug,
      customerName: names[index % names.length],
      rating: index % 9 === 0 ? 4 : 5,
      title: titles[index % titles.length],
      body: notes[index % notes.length],
      verified: true,
      createdAt: new Date(Date.now() - (index + 1) * 86_400_000),
    }));
    await db.insert(reviews).values(reviewRows);
  }

  const existingDesigns = await db.select({ id: designs.id }).from(designs).limit(1);
  if (!existingDesigns.length) {
    const titles = ["Good ideas go places", "A little sunshine", "Slow mornings club", "Flower study no. 4", "Better in color", "Keep making things", "The good energy drop", "Tiny world, big feeling", "Coffee then anything", "Soft shapes, loud ideas", "Made of good stuff", "Find the funny", "On my own time", "Sunroom forever", "Everyday is a canvas", "Big feelings, small print", "More room for joy", "Stay curious", "Make nice things", "One good day", "Idea in bloom", "The market tote", "First sip ritual", "An artful afternoon", "Good people only", "Weekend uniform", "Little lucky star", "Hello, new favorite", "Night shift thoughts", "A very good thing"];
    await db.insert(designs).values(titles.map((title, index) => {
      const product = products[index % products.length];
      return { userId: demoUser.id, creatorId: creatorRows[index % creatorRows.length]?.id ?? null, title, imageUrl: product.image, productSlug: product.slug, isPublic: true, markupCents: 700 + (index % 7) * 100 };
    }));
  }

  const savedAddress = await db.select({ id: addresses.id }).from(addresses).where(eq(addresses.userId, demoUser.id)).limit(1);
  if (!savedAddress.length) await db.insert(addresses).values({ userId: demoUser.id, label: "Home", fullName: "Taylor Threadform", line1: "123 Good Idea Lane", city: "Brooklyn", region: "NY", postalCode: "11222", country: "US", isDefault: true });

  const existingOrder = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.userId, demoUser.id), eq(orders.orderNumber, "TF-2025-DEMO42"))).limit(1);
  if (!existingOrder.length) {
    const sample = products[0];
    const [activeOrder] = await db.insert(orders).values({ userId: demoUser.id, orderNumber: "TF-2025-DEMO42", status: "printing", email: DEMO_EMAIL, subtotalCents: sample.priceCents, shippingCents: 0, discountCents: 0, totalCents: sample.priceCents, trackingNumber: null, paymentReference: "seed-demo-order", shippingAddress: { fullName: "Taylor Threadform", line1: "123 Good Idea Lane", city: "Brooklyn", region: "NY", postalCode: "11222", country: "US" } }).returning();
    await db.insert(orderItems).values({ orderId: activeOrder.id, productSlug: sample.slug, productName: sample.name, imageUrl: sample.image, color: sample.colors[0].name, size: sample.sizes[2] ?? sample.sizes[0], quantity: 1, priceCents: sample.priceCents });
  }
  console.log(`THREADFORM seeded: ${products.length} products, ${variantRows.length} variants, ${creators.length} creators, 40 reviews, and 30 designs.`);
  console.log(`Demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD} · Admin: ${ADMIN_EMAIL} / ${DEMO_PASSWORD}`);
}

seed().catch((error: unknown) => {
  console.error("THREADFORM seed failed", error);
  process.exitCode = 1;
}).finally(async () => {
  await pool.end();
});
