"use client";

import Link from "next/link";
import { useState } from "react";
import { media } from "@/config/media";
import { products, type Product } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductArtwork } from "@/components/product-artwork";
import { useStore } from "@/store/store-provider";

const galleryFor = (product: Product) => [product.image, media.products.teeOnBody, media.products.garmentRack];

export function ProductDetails({ product }: { product: Product }) {
  const { addToCart, wishlist, toggleWishlist } = useStore();
  const [colorIndex, setColorIndex] = useState(0);
  const [size, setSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [guideOpen, setGuideOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [shareMessage, setShareMessage] = useState("");
  const color = product.colors[colorIndex] ?? product.colors[0];
  const gallery = galleryFor(product);
  const apparel = ["tees", "hoodies", "sweatshirts"].includes(product.category);
  const favorite = wishlist.includes(product.slug);
  const saveShare = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setShareMessage("Link copied"); }
    catch { setShareMessage("Copy this page URL to share"); }
    window.setTimeout(() => setShareMessage(""), 2200);
  };
  return <>
    <div className="product-detail-layout"><div className="detail-gallery"><div className="detail-main-image"><ProductArtwork product={{ ...product, image: gallery[activeImage] }} color={color} /><span className="gallery-index">0{activeImage + 1} <i>/</i> 03</span><button className={`favorite-button detail-favorite ${favorite ? "is-favorite" : ""}`} onClick={() => toggleWishlist(product.slug)} aria-label={favorite ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={favorite}><Icon name="heart" /></button></div><div className="detail-thumbnails">{gallery.map((image, index) => <button key={`${image}-${index}`} className={activeImage === index ? "thumbnail-active" : ""} onClick={() => setActiveImage(index)} aria-label={`View product photo ${index + 1}`}><img src={image} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span>{["FRONT VIEW", "ON BODY", "DETAIL"][index]}</span></button>)}</div></div>
      <div className="product-detail-info"><div className="detail-breadcrumb"><Link href="/shop">SHOP</Link><span>/</span><Link href={`/shop/${product.category}`}>{product.category.toUpperCase()}</Link></div><div className="detail-review-line"><span className="star-line">★★★★★</span><span>{product.rating.toFixed(1)} ({product.reviewCount} reviews)</span><span className="detail-dot" /> <span>DESIGNED BY {product.maker.toUpperCase()}</span></div><h1>{product.name}</h1><div className="detail-price-line"><strong>{formatMoney(product.priceCents)}</strong>{product.compareAtCents && <del>{formatMoney(product.compareAtCents)}</del>}<span className="made-to-order-pill"><span /> MADE TO ORDER</span></div><p className="product-detail-description">{product.description}</p><div className="detail-divider" />
        <div className="option-heading"><span>COLOR <b>— {color?.name}</b></span><span>{product.colors.length} COLORS</span></div><div className="detail-swatches">{product.colors.map((item, index) => <button key={item.name} className={`detail-swatch ${index === colorIndex ? "detail-swatch-active" : ""}`} type="button" onClick={() => setColorIndex(index)} aria-label={item.name} aria-pressed={index === colorIndex} title={item.name} style={{ backgroundColor: item.hex }}><span className="sr-only">{item.name}</span></button>)}</div>
        <div className="option-heading size-option-heading"><span>SIZE <b>— {size}</b></span>{apparel && <button className="size-guide-link" onClick={() => setGuideOpen(true)}>SIZE GUIDE <Icon name="arrowUp" size={13} /></button>}</div><div className="size-options">{product.sizes.map((item) => <button key={item} type="button" className={size === item ? "size-selected" : ""} onClick={() => setSize(item)} aria-pressed={size === item}>{item}</button>)}</div>
        <div className="detail-add-row"><div className="quantity-control detail-quantity"><button aria-label="Decrease quantity" onClick={() => setQuantity(Math.max(1, quantity - 1))}><Icon name="minus" size={15} /></button><span>{quantity}</span><button aria-label="Increase quantity" onClick={() => setQuantity(Math.min(20, quantity + 1))}><Icon name="plus" size={15} /></button></div><button className="button button-primary add-to-bag-button" onClick={() => addToCart(product, { color: color?.name, size, quantity })}>Add to bag · {formatMoney(product.priceCents * quantity)} <Icon name="arrow" size={18} /></button></div>
        <Link className="button button-outline customize-button" href={`/studio?product=${product.slug}`}><Icon name="spark" size={17} /> Customize this</Link>
        <div className="detail-reassurance"><div><span className="reassurance-icon">✳</span><span><strong>Made just for you</strong><small>Printed only after you order.</small></span></div><div><span className="reassurance-icon">↗</span><span><strong>Thoughtful materials</strong><small>Made to keep, not replace.</small></span></div><button className="detail-share" onClick={saveShare}><Icon name="share" size={16} /> {shareMessage || "Share this find"}</button></div>
      </div></div>
    <section className="reviews-section" id="reviews"><div className="reviews-heading"><div><span className="eyebrow">REAL PEOPLE, REAL GOOD TASTE</span><h2>Good things said.</h2></div><div className="reviews-score"><span className="star-line">★★★★★</span><strong>{product.rating.toFixed(1)} <small>/ 5</small></strong><span>FROM {product.reviewCount} REVIEWS</span></div></div><div className="review-grid">{[{ name: "Jamie R.", title: "Better than the mockup", text: "The print feels like it was made for this shirt. Great quality and it arrived right when they said it would.", date: "2 weeks ago" }, { name: "Nico L.", title: "Instant favorite", text: "I got stopped twice on my first day wearing it. The color is even better in person.", date: "1 month ago" }, { name: "Alex M.", title: "A genuinely good gift", text: "Ordered one for my best friend and now I'm ordering one for myself. Soft fabric, lovely print.", date: "6 weeks ago" }].map((review) => <article className="review-card" key={review.name}><span className="star-line">★★★★★</span><h3>{review.title}</h3><p>“{review.text}”</p><div className="review-author"><span className="review-avatar">{review.name.slice(0, 1)}</span><span><strong>{review.name}</strong><small>VERIFIED BUYER · {review.date}</small></span><Icon name="check" size={15} /></div></article>)}</div></section>
    <section className="detail-related"><div className="section-heading"><div><span className="eyebrow">YOU MIGHT ALSO LIKE</span><h2>More good stuff.</h2></div><Link className="text-link" href="/shop">See it all <Icon name="arrow" size={17} /></Link></div><div className="product-grid">{products.filter((item) => item.slug !== product.slug && (item.category === product.category || item.featured)).slice(0, 4).map((item, index) => <Link className="related-card" key={item.slug} href={`/product/${item.slug}`}><ProductArtwork product={item} compact /><span>{item.name}</span><strong>{formatMoney(item.priceCents)}</strong></Link>)}</div></section>
    {guideOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setGuideOpen(false); }}><section className="size-guide-modal" role="dialog" aria-modal="true" aria-labelledby="size-guide-title"><div className="modal-topline"><span className="eyebrow">FIT NOTES / 01</span><button className="icon-button" onClick={() => setGuideOpen(false)} aria-label="Close size guide"><Icon name="close" /></button></div><h2 id="size-guide-title">Find your fit.</h2><p>Our tees have a relaxed, everyday fit. If you like a closer feel, size down.</p><div className="size-guide-table"><div><span>SIZE</span><span>CHEST</span><span>LENGTH</span><span>FIT</span></div>{[["XS", "34–36 in", "26 in", "Easy"], ["S", "36–38 in", "27 in", "Relaxed"], ["M", "39–41 in", "28 in", "Relaxed"], ["L", "42–44 in", "29 in", "Roomy"], ["XL", "45–48 in", "30 in", "Roomy"], ["2XL", "49–52 in", "31 in", "Oversized"]].map((row) => <div key={row[0]}><span>{row[0]}</span><span>{row[1]}</span><span>{row[2]}</span><span>{row[3]}</span></div>)}</div><button className="button button-dark modal-done" onClick={() => setGuideOpen(false)}>Got it <Icon name="check" size={16} /></button></section></div>}
  </>;
}
