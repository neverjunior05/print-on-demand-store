import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { site } from "@/config/site";
import { SiteShell } from "@/components/site-shell";
import { StoreProvider } from "@/store/store-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: "THREADFORM — Good ideas. Great things to wear.", template: "%s | THREADFORM" },
  description: "Design it in minutes, wear it in days, no inventory needed. Independent apparel and home goods, printed one at a time.",
  applicationName: site.name,
  manifest: "/manifest.json",
  openGraph: { type: "website", siteName: site.name, title: "THREADFORM — Good ideas. Great things to wear.", description: site.description, images: [{ url: "/images/threadform-hero.png", width: 1280, height: 960, alt: "THREADFORM independent print shop campaign" }] },
  twitter: { card: "summary_large_image", title: "THREADFORM — Good ideas. Great things to wear.", description: site.description, images: ["/images/threadform-hero.png"] },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: [{ media: "(prefers-color-scheme: light)", color: "#fff8ec" }, { media: "(prefers-color-scheme: dark)", color: "#101018" }] };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" data-theme="light" suppressHydrationWarning><body><StoreProvider><SiteShell>{children}</SiteShell></StoreProvider></body></html>;
}
