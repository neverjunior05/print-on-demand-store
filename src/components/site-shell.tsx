"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PwaRegister } from "@/components/pwa-register";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { useStore } from "@/store/store-provider";

export function SiteShell({ children }: { children: ReactNode }) {
  const { notice } = useStore();
  const pathname = usePathname();
  const immersive = pathname === "/studio" || pathname === "/login" || pathname === "/register" || pathname.startsWith("/dashboard") || pathname.startsWith("/admin");
  return <><PwaRegister /><a className="skip-link" href="#main-content">Skip to content</a>{!immersive && <SiteHeader />}<main id="main-content" tabIndex={-1}>{children}</main>{!immersive && <><SiteFooter /><MobileTabBar /></>}<div className={`toast ${notice ? "toast-visible" : ""}`} role="status" aria-live="polite"><span>✳</span>{notice}</div></>;
}
