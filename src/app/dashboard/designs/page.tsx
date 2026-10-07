import type { Metadata } from "next";
import { DashboardDesigns } from "@/components/dashboard-pages";
export const metadata: Metadata = { title: "Saved designs | THREADFORM", robots: { index: false, follow: false } };
export default function DesignsPage() { return <DashboardDesigns />; }
