import type { MetadataRoute } from "next";
import { site } from "@/config/site";
import { products } from "@/lib/catalog";
import { creators } from "@/lib/creators";

export default function sitemap(): MetadataRoute.Sitemap {
  const core = ["", "/shop", "/studio"].map((path) => ({ url: `${site.url}${path}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: path === "" ? 1 : .8 }));
  const categories = site.categories.map(({ slug }) => ({ url: `${site.url}/shop/${slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: .7 }));
  const productEntries = products.map(({ slug }) => ({ url: `${site.url}/product/${slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: .65 }));
  const creatorEntries = creators.map(({ handle }) => ({ url: `${site.url}/creator/${handle}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: .55 }));
  return [...core, ...categories, ...productEntries, ...creatorEntries];
}
