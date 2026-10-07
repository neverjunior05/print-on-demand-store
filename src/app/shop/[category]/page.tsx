import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopBrowser } from "@/components/shop-browser";
import { getCategoryName } from "@/lib/catalog";
import { site } from "@/config/site";

export async function generateStaticParams() {
  return site.categories.map(({ slug }) => ({ category: slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  if (!site.categories.some((item) => item.slug === category)) return { title: "Collection not found | THREADFORM" };
  return { title: `${getCategoryName(category)} | THREADFORM`, description: `Shop independent artist-designed ${getCategoryName(category).toLowerCase()}, made on demand.` };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (!site.categories.some((item) => item.slug === category)) notFound();
  return <div className="category-page"><div className="category-page-hero"><span className="eyebrow">A LITTLE SOMETHING FOR EVERYBODY</span><h1>{getCategoryName(category)}<span className="category-page-spark">✳</span></h1><p>Designed by independent creators. Made just for you.</p></div><ShopBrowser initialCategory={category} /></div>;
}
