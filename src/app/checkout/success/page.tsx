import type { Metadata } from "next";
import Link from "next/link";
import { OrderStatus } from "@/components/order-status";
import { Icon } from "@/components/icons";

export const metadata: Metadata = { title: "You're all set | THREADFORM", robots: { index: false, follow: false } };

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ order?: string; id?: string; session_id?: string }> }) {
  const { order, id } = await searchParams;
  return <div className="success-page"><div className="success-confetti" aria-hidden="true"><span>✳</span><span>✴</span><span>✦</span><span>◒</span></div><div className="success-stamp"><Icon name="check" size={34} /></div><span className="eyebrow">IT'S OFFICIAL / NICE WORK</span><h1>Good things<br /><span>are happening.</span></h1><p className="success-copy">Your order is in. We’re getting everything ready, one thoughtful print at a time.</p>{order && <div className="success-order-number"><span>YOUR ORDER NUMBER</span><strong>{order}</strong><span aria-hidden="true">✳</span></div>}<div className="success-status-card"><OrderStatus orderId={id} initialStatus="received" /></div><div className="success-actions"><Link href="/shop" className="button button-dark">Find another good thing <Icon name="arrow" size={17} /></Link><Link href="/dashboard/orders" className="text-link">View your orders <Icon name="arrowUp" size={15} /></Link></div><div className="success-footnote"><span>THANK YOU FOR MAKING SPACE FOR INDEPENDENT IDEAS.</span><span>THREADFORM <b>✳</b></span></div></div>;
}
