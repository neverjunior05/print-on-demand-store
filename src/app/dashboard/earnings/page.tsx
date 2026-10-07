import type { Metadata } from "next";
import { DashboardEarnings } from "@/components/dashboard-pages";
export const metadata: Metadata = { title: "Creator earnings | THREADFORM", robots: { index: false, follow: false } };
export default function EarningsPage() { return <DashboardEarnings />; }
