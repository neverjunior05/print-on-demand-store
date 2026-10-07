import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetails } from "@/components/product-details";
import { products, getProduct } from "@/lib/catalog";
import { site } from "@/config/site";

export async function generateStaticParams() { return products.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found | THREADFORM" };
  return { title: `${product.name} | THREADFORM`, description: product.description, openGraph: { title: product.name, description: product.description, images: [product.image] }, twitter: { card: "summary_large_image", title: product.name, description: product.description } };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.image, brand: { "@type": "Brand", name: site.name }, offers: { "@type": "Offer", priceCurrency: "USD", price: (product.priceCents / 100).toFixed(2), availability: "https://schema.org/InStock", url: `${site.url}/product/${product.slug}` }, aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewCount } };
  return <div className="product-page"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} /><ProductDetails product={product} /></div>;
}
