import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product-card";
import { creators, getCreator } from "@/lib/creators";
import { products } from "@/lib/catalog";
import { Icon } from "@/components/icons";

export async function generateStaticParams() { return creators.map(({ handle }) => ({ handle })); }
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params; const creator = getCreator(handle);
  return creator ? { title: `${creator.studio} | THREADFORM Creator Shop`, description: creator.bio } : { title: "Creator not found | THREADFORM" };
}

export default async function CreatorPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params; const creator = getCreator(handle); if (!creator) notFound();
  const items = creator.products.map((slug) => products.find((product) => product.slug === slug)).filter((item): item is NonNullable<typeof item> => Boolean(item));
  return <div className="creator-page"><div className="creator-shop-cover" style={{ "--creator-accent": creator.accent } as React.CSSProperties}><span className="eyebrow">THREADFORM CREATOR SHOP / 0{creators.findIndex((item) => item.handle === handle) + 1}</span><span className="creator-shop-mark">✳</span><h1>{creator.studio}<span>®</span></h1><p>Independent ideas, made to order.</p><div className="creator-cover-label">PRINTED<br />ONE AT<br /><b>A TIME.</b></div></div><div className="creator-shop-profile"><img src={creator.avatar} alt={creator.name} loading="lazy" /><div><span className="eyebrow">MADE BY A REAL PERSON</span><h2>{creator.name}</h2><p>{creator.bio}</p></div><div className="creator-stat"><strong>{items.length.toString().padStart(2, "0")}</strong><span>GOOD IDEAS<br />FOR YOU</span></div><button className="creator-follow" aria-label={`Follow ${creator.name}`}><Icon name="plus" size={16} /> Follow</button></div><section className="creator-shop-products"><div className="section-heading"><div><span className="eyebrow">THE COLLECTION</span><h2>Small batch. <span>Big feeling.</span></h2></div><span className="creator-product-count">{items.length} PIECES / ALL MADE ON DEMAND</span></div><ProductGrid items={items} /></section><div className="creator-shop-footer"><span>✳</span><p>Every THREADFORM piece is made just for you, after you order it.</p><span>NO INVENTORY. NO LIMITS.</span></div></div>;
}
