"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { products } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductArtwork } from "@/components/product-artwork";
import { getCartItemKey, useStore } from "@/store/store-provider";

export function CartPageClient() {
  const { cart, cartTotal, removeFromCart, updateQuantity } = useStore();
  const [promo, setPromo] = useState("");
  const [promoStatus, setPromoStatus] = useState("");
  const [discount, setDiscount] = useState(0);
  useEffect(() => {
    const saved = localStorage.getItem("threadform-promo");
    if (saved) { setPromo(saved); setDiscount(({ WELCOME10: 10, STUDIO15: 15, MAKER20: 20 } as Record<string, number>)[saved] ?? 0); }
  }, []);
  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const value = ({ WELCOME10: 10, STUDIO15: 15, MAKER20: 20 } as Record<string, number>)[code];
    if (!value) { setPromoStatus("That code didn't find its way into our print shop."); setDiscount(0); localStorage.removeItem("threadform-promo"); return; }
    setPromo(code); setDiscount(value); setPromoStatus(`${value}% off is yours. Nice find.`); localStorage.setItem("threadform-promo", code);
  };
  const shipping = cartTotal >= 7500 ? 0 : 695;
  const total = Math.max(0, cartTotal - Math.round(cartTotal * discount / 100) + shipping);
  if (!cart.length) return <div className="cart-page empty-cart-page"><div className="empty-cart-art">✳</div><span className="eyebrow">NOTHING TO SEE (YET)</span><h1>Your bag is a <span>blank canvas.</span></h1><p>Let's find you something that feels like you.</p><Link className="button button-primary" href="/shop">Go find your thing <Icon name="arrow" size={18} /></Link><div className="cart-empty-recos"><span>GOOD PLACES TO START</span><div>{["daybreak-tee", "first-sip-mug", "mini-mood-stickers"].map((slug) => { const product = products.find((item) => item.slug === slug); return product ? <Link href={`/product/${product.slug}`} key={slug}><ProductArtwork product={product} compact /><span>{product.name}</span></Link> : null; })}</div></div></div>;
  return <div className="cart-page"><div className="cart-page-heading"><div><span className="eyebrow">A VERY GOOD PLACE TO BE</span><h1>Your bag <span>({cart.reduce((sum, item) => sum + item.quantity, 0)})</span></h1></div><Link className="text-link" href="/shop"><Icon name="arrow" size={16} /> Keep shopping</Link></div><div className="cart-page-grid"><section className="cart-line-items" aria-label="Items in your bag">{cart.map((item) => { const product = products.find((entry) => entry.slug === item.slug); if (!product) return null; const key = getCartItemKey(item); return <article className="cart-line-item" key={key}><Link className="cart-line-thumb" href={`/product/${product.slug}`}><ProductArtwork product={product} compact /></Link><div className="cart-line-copy"><span className="eyebrow">{product.category.toUpperCase()} · BY {product.maker.toUpperCase()}</span><Link href={`/product/${product.slug}`} className="cart-line-name">{product.name}</Link><p>{item.color} · {item.size}</p><div className="cart-line-controls"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => updateQuantity(key, item.quantity - 1)}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(key, item.quantity + 1)}><Icon name="plus" size={14} /></button></div><button className="remove-line" onClick={() => removeFromCart(key)}><Icon name="trash" size={14} /> Remove</button></div></div><strong className="cart-line-price">{formatMoney(product.priceCents * item.quantity)}</strong></article>; })}<div className="cart-note"><span>✳</span><p><strong>Made when you order.</strong> Each item is printed just for you, so it may take a little longer. That's a good thing.</p></div></section><aside className="cart-summary-card"><div className="summary-card-top"><span className="eyebrow">THE FINISHING TOUCHES</span><h2>Order summary</h2></div><div className="promo-entry"><label htmlFor="cart-promo">GOT A GOOD CODE?</label><div><input id="cart-promo" value={promo} onChange={(event) => setPromo(event.target.value)} placeholder="Type it right here"/><button onClick={applyPromo}>Apply</button></div><p className={promoStatus.includes("%") ? "promo-success" : "promo-error"} role="status">{promoStatus}</p><small>Try WELCOME10 for 10% off.</small></div><div className="summary-lines"><p><span>Subtotal</span><strong>{formatMoney(cartTotal)}</strong></p>{discount > 0 && <p><span>Promo · {promo}</span><strong>−{formatMoney(Math.round(cartTotal * discount / 100))}</strong></p>}<p><span>Shipping</span><strong>{shipping ? formatMoney(shipping) : <em>On us</em>}</strong></p></div><div className="summary-total"><span>TOTAL <small>USD</small></span><strong>{formatMoney(total)}</strong></div><div className="free-shipping-note"><div><span style={{ width: `${Math.min(100, cartTotal / 7500 * 100)}%` }} /></div><p>{cartTotal >= 7500 ? "You've unlocked free shipping. Nice." : `You're ${formatMoney(7500 - cartTotal)} from free shipping.`}</p></div><Link className="button button-primary checkout-link" href="/checkout">Head to checkout <Icon name="arrow" size={18} /></Link><p className="secure-checkout"><Icon name="lock" size={13} /> Secure checkout · mock payment or Stripe test</p><Link href="/shop" className="continue-link">Need one more thing? Keep browsing.</Link></aside></div></div>;
}
