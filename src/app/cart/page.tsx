import type { Metadata } from "next";
import { CartPageClient } from "@/components/cart-page-client";

export const metadata: Metadata = { title: "Your bag | THREADFORM", description: "Review the good things you've picked out." };

export default function CartPage() { return <CartPageClient />; }
