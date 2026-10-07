import type { Metadata } from "next";
import { DashboardAddresses } from "@/components/dashboard-pages";
export const metadata: Metadata = { title: "Saved addresses | THREADFORM", robots: { index: false, follow: false } };
export default function AddressesPage() { return <DashboardAddresses />; }
