import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    name: text("name").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("customer"),
    avatarUrl: text("avatar_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("users_email_idx").on(table.email)],
);

export const creators = pgTable(
  "creators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    handle: text("handle").notNull(),
    displayName: text("display_name").notNull(),
    bio: text("bio").notNull().default(""),
    avatarUrl: text("avatar_url").notNull().default(""),
    accent: text("accent").notNull().default("#FFD23F"),
    sales: integer("sales").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("creators_handle_idx").on(table.handle)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priceCents: integer("price_cents").notNull(),
    compareAtCents: integer("compare_at_cents"),
    imageUrl: text("image_url").notNull(),
    colorOptions: jsonb("color_options").$type<string[]>().notNull().default([]),
    sizeOptions: jsonb("size_options").$type<string[]>().notNull().default([]),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    popularity: integer("popularity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("products_slug_idx").on(table.slug), index("products_category_idx").on(table.category)],
);

export const variants = pgTable(
  "variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    color: text("color").notNull(),
    size: text("size").notNull(),
    priceCents: integer("price_cents").notNull(),
    available: boolean("available").notNull().default(true),
  },
  (table) => [uniqueIndex("variants_sku_idx").on(table.sku), index("variants_product_idx").on(table.productId)],
);

export const designs = pgTable(
  "designs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    creatorId: uuid("creator_id").references(() => creators.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    productSlug: text("product_slug").notNull().default("classic-tee"),
    isPublic: boolean("is_public").notNull().default(false),
    markupCents: integer("markup_cents").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("designs_user_idx").on(table.userId), index("designs_public_idx").on(table.isPublic)],
);

export const designLayers = pgTable(
  "design_layers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    designId: uuid("design_id").notNull().references(() => designs.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    position: integer("position").notNull().default(0),
  },
  (table) => [index("design_layers_design_idx").on(table.designId)],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    label: text("label").notNull().default("Home"),
    fullName: text("full_name").notNull(),
    line1: text("line1").notNull(),
    line2: text("line2"),
    city: text("city").notNull(),
    region: text("region").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull().default("US"),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (table) => [index("addresses_user_idx").on(table.userId)],
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    orderNumber: text("order_number").notNull(),
    status: text("status").notNull().default("received"),
    email: text("email").notNull(),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    trackingNumber: text("tracking_number"),
    paymentReference: text("payment_reference"),
    shippingAddress: jsonb("shipping_address").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("orders_number_idx").on(table.orderNumber), index("orders_email_idx").on(table.email)],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(),
    productName: text("product_name").notNull(),
    imageUrl: text("image_url").notNull(),
    color: text("color").notNull(),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull(),
    priceCents: integer("price_cents").notNull(),
    designId: uuid("design_id").references(() => designs.id, { onDelete: "set null" }),
  },
  (table) => [index("order_items_order_idx").on(table.orderId)],
);

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productSlug: text("product_slug").notNull(),
    customerName: text("customer_name").notNull(),
    rating: integer("rating").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    verified: boolean("verified").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("reviews_product_idx").on(table.productSlug)],
);

export const wishlist = pgTable(
  "wishlist",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    productSlug: text("product_slug").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("wishlist_user_product_idx").on(table.userId, table.productSlug)],
);

export const promoCodes = pgTable(
  "promo_codes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull(),
    percentOff: integer("percent_off").notNull(),
    active: boolean("active").notNull().default(true),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [uniqueIndex("promo_code_idx").on(table.code)],
);
