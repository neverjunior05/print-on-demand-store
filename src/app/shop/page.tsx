import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";

export const metadata: Metadata = { title: "Shop all the good stuff | THREADFORM", description: "Explore independent artist-designed tees, hoodies, totes, mugs, art, cases, and stickers." };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = "" } = await searchParams;
  return <div className="shop-page"><div className="shop-page-hero"><span className="eyebrow">THE THREADFORM COLLECTION / VOL. 01</span><h1>Good things.<br /><span>Good people.</span></h1><p>Independent ideas, printed one at a time. Find the thing you didn't know you needed.</p><span className="shop-hero-stamp">24<br />GOOD<br />IDEAS ✳</span><div className="shop-hero-meta"><span>DESIGNED BY PEOPLE</span><span>MADE WHEN YOU ORDER</span><span>ALWAYS ONE OF A KIND</span></div></div><ShopBrowser initialQuery={q} /></div>;
}
