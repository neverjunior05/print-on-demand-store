"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { products } from "@/lib/catalog";
import { formatMoney } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { ProductArtwork } from "@/components/product-artwork";
import { getCartItemKey, useStore } from "@/store/store-provider";

type CheckoutReply = { orderId?: string; orderNumber?: string; url?: string; error?: string };

export function CheckoutClient() {
  const { cart, cartTotal, clearCart } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [promoCode, setPromoCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ email: "", fullName: "", line1: "", line2: "", city: "", region: "", postalCode: "", country: "US" });
  useEffect(() => { setPromoCode(localStorage.getItem("threadform-promo") ?? ""); }, []);
  const shipping = cartTotal >= 7500 ? 0 : 695;
  const promoPercent = ({ WELCOME10: 10, STUDIO15: 15, MAKER20: 20 } as Record<string, number>)[promoCode.toUpperCase()] ?? 0;
  const total = Math.max(0, cartTotal - Math.round(cartTotal * promoPercent / 100) + shipping);
  const update = (field: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [field]: event.target.value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cart.length) { setError("Your bag is empty. Add something first."); return; }
    setPending(true); setError("");
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, promoCode, items: cart }) });
      const result = await response.json() as CheckoutReply;
      if (!response.ok) { setError(result.error ?? "We couldn't place that order. Please check your details and try again."); setPending(false); return; }
      if (result.url) { window.location.assign(result.url); return; }
      clearCart();
      localStorage.removeItem("threadform-promo");
      router.push(`/checkout/success?order=${encodeURIComponent(result.orderNumber ?? "")}&id=${encodeURIComponent(result.orderId ?? "")}`);
    } catch {
      setError("We couldn't reach checkout. Check your connection and give it another try.");
      setPending(false);
    }
  };
  if (!cart.length) return <div className="checkout-empty"><span className="empty-doodle">✳</span><h1>Your bag looks <span>a little empty.</span></h1><p>Pick a good thing and meet us back here.</p><Link className="button button-primary" href="/shop">Find your thing <Icon name="arrow" size={17} /></Link></div>;
  return <div className="checkout-page"><div className="checkout-page-heading"><span className="eyebrow">LET'S MAKE IT OFFICIAL</span><h1>One last <span>little thing.</span></h1><p>Fill this bit out and we’ll get your good stuff on its way.</p></div>{searchParams.get("canceled") && <div className="checkout-notice">Checkout was canceled — your bag is still right here.</div>}<div className="checkout-grid"><form className="checkout-form" onSubmit={submit} noValidate><div className="checkout-step-heading"><span>01</span><div><h2>Where should it go?</h2><p>We only use this to get your order to you.</p></div></div><div className="checkout-fields"><label className="field-full">EMAIL ADDRESS<input type="email" autoComplete="email" value={form.email} onChange={update("email")} required placeholder="you@example.com" /></label><label className="field-full">FULL NAME<input autoComplete="name" value={form.fullName} onChange={update("fullName")} required minLength={2} placeholder="Name on the mailbox" /></label><label className="field-full">STREET ADDRESS<input autoComplete="address-line1" value={form.line1} onChange={update("line1")} required minLength={3} placeholder="123 Good Idea Lane" /></label><label className="field-full">APARTMENT, SUITE, ETC. <span>OPTIONAL</span><input autoComplete="address-line2" value={form.line2} onChange={update("line2")} placeholder="Apartment, studio, or floor" /></label><label>CITY<input autoComplete="address-level2" value={form.city} onChange={update("city")} required minLength={2} placeholder="City" /></label><label>STATE / REGION<input autoComplete="address-level1" value={form.region} onChange={update("region")} required minLength={2} placeholder="State" /></label><label>POSTAL CODE<input autoComplete="postal-code" value={form.postalCode} onChange={update("postalCode")} required minLength={3} placeholder="10001" /></label><label>COUNTRY<select autoComplete="country-name" value={form.country} onChange={update("country")}><option value="US">United States</option><option value="CA">Canada</option><option value="GB">United Kingdom</option><option value="AU">Australia</option></select></label></div><div className="checkout-step-heading checkout-payment-heading"><span>02</span><div><h2>Pay the easy way.</h2><p>{process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true" ? "Secure payment via Stripe Checkout." : "Mock payment is active — no card needed to test your order."}</p></div></div><div className="mock-payment-card"><span className="mock-payment-icon"><Icon name="lock" size={19} /></span><span><strong>{process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true" ? "Stripe secure checkout" : "THREADFORM mock checkout"}</strong><small>{process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true" ? "You'll enter card details on Stripe's secure page." : "Your order is placed immediately. No payment information is collected."}</small></span><Icon name="check" size={17} /></div>{error && <div className="checkout-error" role="alert">{error}</div>}<button className="button button-primary place-order-button" disabled={pending}>{pending ? <><span className="button-spinner" /> Getting your order ready…</> : <>Place my order · {formatMoney(total)} <Icon name="arrow" size={18} /></>}</button><p className="checkout-terms"><Icon name="lock" size={13} /> By placing your order, you agree to our terms. Your details stay private.</p><Link href="/cart" className="checkout-back-link"><Icon name="arrow" size={15} /> Back to your bag</Link></form><aside className="checkout-order-card"><span className="eyebrow">YOUR VERY GOOD CHOICES</span><h2>Order summary</h2><div className="checkout-order-items">{cart.map((item) => { const product = products.find((entry) => entry.slug === item.slug); if (!product) return null; return <div className="checkout-order-item" key={getCartItemKey(item)}><div className="checkout-order-thumb"><ProductArtwork product={product} compact /><i>{item.quantity}</i></div><span><strong>{product.name}</strong><small>{item.color} · {item.size}</small></span><b>{formatMoney(product.priceCents * item.quantity)}</b></div>; })}</div>{promoCode && <div className="checkout-promo-line"><span>Promo {promoCode}</span><strong>−{formatMoney(Math.round(cartTotal * promoPercent / 100))}</strong></div>}<div className="checkout-summary-line"><span>Subtotal</span><b>{formatMoney(cartTotal)}</b></div><div className="checkout-summary-line"><span>Shipping</span><b>{shipping ? formatMoney(shipping) : "On us"}</b></div><div className="checkout-total-line"><span>TOTAL <small>USD</small></span><strong>{formatMoney(total)}</strong></div><div className="checkout-note"><span>✳</span><p>Nothing gets printed until you order. That's our thing.</p></div></aside></div></div>;
}
