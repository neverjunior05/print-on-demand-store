import type { Metadata } from "next";
import { DashboardWishlist } from "@/components/dashboard-pages";
export const metadata: Metadata = { title: "Your wishlist | THREADFORM", robots: { index: false, follow: false } };
export default function WishlistPage() { return <DashboardWishlist />; }
