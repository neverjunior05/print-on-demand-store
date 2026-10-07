import type { Metadata } from "next";
import { DashboardOrders } from "@/components/dashboard-pages";
export const metadata: Metadata = { title: "My orders | THREADFORM", robots: { index: false, follow: false } };
export default function OrdersPage() { return <DashboardOrders />; }
