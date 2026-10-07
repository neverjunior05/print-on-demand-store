"use client";

import Link from "next/link";
import { useEffect } from "react";
import { products } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductArtwork } from "@/components/product-artwork";
import { getCartItemKey, useStore } from "@/store/store-provider";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, removeFromCart, updateQuantity, cartTotal } = useStore();
  useEffect(() => {
    if (!cartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setCartOpen(false); };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [cartOpen, setCartOpen]);
  if (!cartOpen) return null;
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setCartOpen(false); }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your bag">
        <div className="drawer-heading"><div><span className="eyebrow">GOOD CHOICES</span><h2>Your bag <span className="drawer-count">({cart.length})</span></h2></div><button className="icon-button" onClick={() => setCartOpen(false)} aria-label="Close bag"><Icon name="close" /></button></div>
        {cart.length === 0 ? <div className="drawer-empty"><span className="empty-doodle">✳</span><h3>Your bag is a blank canvas.</h3><p>Fill it with something one-of-a-kind.</p><Link className="button button-dark" href="/shop" onClick={() => setCartOpen(false)}>Find your thing <Icon name="arrow" size={17} /></Link></div> : <>
          <div className="drawer-items" aria-live="polite">{cart.map((item) => {
            const product = products.find((entry) => entry.slug === item.slug);
            if (!product) return null;
            return <div className="drawer-item" key={getCartItemKey(item)}><Link href={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className="drawer-thumb"><ProductArtwork product={product} compact /></Link><div className="drawer-item-content"><div className="drawer-item-heading"><Link href={`/product/${product.slug}`} onClick={() => setCartOpen(false)}>{product.name}</Link><button className="text-icon-button" onClick={() => removeFromCart(getCartItemKey(item))} aria-label={`Remove ${product.name}`}><Icon name="trash" size={15} /></button></div><p>{item.color} · {item.size}</p><div className="drawer-item-footer"><div className="quantity-control"><button aria-label="Decrease quantity" onClick={() => updateQuantity(getCartItemKey(item), item.quantity - 1)}><Icon name="minus" size={14} /></button><span>{item.quantity}</span><button aria-label="Increase quantity" onClick={() => updateQuantity(getCartItemKey(item), item.quantity + 1)}><Icon name="plus" size={14} /></button></div><strong>{formatMoney(product.priceCents * item.quantity)}</strong></div></div></div>;
          })}</div>
          <div className="drawer-summary"><p><span>Subtotal</span><strong>{formatMoney(cartTotal)}</strong></p><small>Shipping & taxes calculated at checkout.</small><Link className="button button-primary drawer-checkout" href="/checkout" onClick={() => setCartOpen(false)}>Go to checkout <Icon name="arrow" size={18} /></Link><button className="continue-shopping" onClick={() => setCartOpen(false)}>Keep looking around</button></div>
        </>}
      </aside>
    </div>
  );
}
