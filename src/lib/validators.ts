import { z } from "zod";

export const cartItemSchema = z.object({
  slug: z.string().min(1).max(120),
  quantity: z.number().int().min(1).max(20),
  color: z.string().min(1).max(60),
  size: z.string().min(1).max(40),
});

export const checkoutSchema = z.object({
  email: z.string().email().max(255),
  fullName: z.string().trim().min(2).max(100),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(80),
  region: z.string().trim().min(2).max(80),
  postalCode: z.string().trim().min(3).max(20),
  country: z.string().trim().min(2).max(56).default("US"),
  promoCode: z.string().trim().max(40).optional().default(""),
  items: z.array(cartItemSchema).min(1).max(30),
});

export const designSchema = z.object({
  title: z.string().trim().min(1).max(80),
  image: z.string().regex(/^data:image\/(?:png|jpeg|svg\+xml);base64,/, "Use a PNG, JPEG, or SVG data image.").max(14_000_000),
  productSlug: z.string().min(1).max(120).default("daybreak-tee"),
  isPublic: z.boolean().default(false),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(120),
});

export const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(120),
});
