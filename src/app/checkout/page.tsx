import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutClient } from "@/components/checkout-client";

export const metadata: Metadata = { title: "Checkout | THREADFORM", robots: { index: false, follow: false } };

export default function CheckoutPage() { return <Suspense fallback={<div className="checkout-skeleton" aria-label="Loading checkout"><span className="loading-spinner" /></div>}><CheckoutClient /></Suspense>; }
