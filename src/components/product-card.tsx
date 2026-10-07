"use client";

import Link from "next/link";
import { useState } from "react";
import { products, type Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductArtwork } from "@/components/product-artwork";
import { useStore } from "@/store/store-provider";

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [colorIndex, setColorIndex] = useState(0);
  const selected = product.colors[colorIndex] ?? product.colors[0];
  return (
    <article className="product-card" style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}>
      <div className="product-card-media">
        <Link href={`/product/${product.slug}`} className="product-card-image-link" aria-label={`View ${product.name}`}>
          <ProductArtwork product={product} color={selected} />
        </Link>
        <button className={`favorite-button ${wishlist.includes(product.slug) ? "is-favorite" : ""}`} type="button" onClick={() => toggleWishlist(product.slug)} aria-label={wishlist.includes(product.slug) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`} aria-pressed={wishlist.includes(product.slug)}><Icon name="heart" size={18} /></button>
        <span className="product-badge">{product.tag}</span>
        <button className="quick-add" type="button" onClick={() => addToCart(product, { color: selected.name, size: product.sizes[0] })} aria-label={`Add ${product.name} to bag`}><span>Quick add</span><Icon name="plus" size={17} /></button>
      </div>
      <div className="product-card-info">
        <div className="product-card-topline"><Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link><span className="product-price">{formatMoney(product.priceCents)}</span></div>
        <div className="product-card-bottomline"><span className="product-maker">by {product.maker}</span><div className="swatch-row" aria-label="Available colors">{product.colors.slice(0, 4).map((item, colorPosition) => <button key={item.name} type="button" className={`swatch ${colorPosition === colorIndex ? "swatch-active" : ""}`} style={{ backgroundColor: item.hex }} aria-label={`Show ${item.name}`} title={item.name} onClick={() => setColorIndex(colorPosition)} />)}{product.colors.length > 4 && <span className="swatch-more">+{product.colors.length - 4}</span>}</div></div>
      </div>
    </article>
  );
}

export function ProductGrid({ items, limit }: { items: Product[]; limit?: number }) {
  const visible = typeof limit === "number" ? items.slice(0, limit) : items;
  return <div className="product-grid">{visible.map((product, index) => <ProductCard key={product.slug} product={product} index={index} />)}</div>;
}

export function ProductRecommendations({ currentSlug }: { currentSlug?: string }) {
  const recommendations = products.filter((product) => product.slug !== currentSlug && product.featured).slice(0, 4);
  return <ProductGrid items={recommendations} />;
}
