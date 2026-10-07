import type { Metadata } from "next";
import { DashboardOverview } from "@/components/dashboard-pages";

export const metadata: Metadata = { title: "Your THREADFORM | Dashboard", robots: { index: false, follow: false } };
export default function DashboardPage() { return <DashboardOverview />; }
