"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

const links = [{ href: "/admin", label: "Overview", icon: "sun" as const }, { href: "/admin/products", label: "Products", icon: "shirt" as const }, { href: "/admin/orders", label: "Orders", icon: "box" as const }, { href: "/admin/promos", label: "Promo codes", icon: "spark" as const }, { href: "/admin/analytics", label: "Analytics", icon: "arrowUp" as const }];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);
  useEffect(() => { void fetch("/api/auth/me").then((response) => response.json()).then((result: { user?: { role?: string } }) => setAllowed(result.user?.role === "admin")).catch(() => setAllowed(false)); }, []);
  if (allowed === null) return <div className="admin-loading"><span className="loading-spinner" /> Checking the keys…</div>;
  if (!allowed) return <div className="admin-denied"><span className="empty-doodle">✳</span><span className="eyebrow">STAFF ONLY</span><h1>Little print shop, <span>big keys.</span></h1><p>This corner is for THREADFORM admins. Sign in with the seeded admin account to come on in.</p><Link className="button button-primary" href="/login">Sign in as an admin <Icon name="arrow" size={17} /></Link><Link href="/" className="text-link">Back to the shop</Link></div>;
  return <div className="admin-layout"><aside className="admin-sidebar"><Link href="/" className="wordmark"><span className="wordmark-stitch">T<span>F</span></span><span className="wordmark-name">THREADFORM</span><sup>®</sup></Link><span className="admin-label">PRINT SHOP / BACK OFFICE</span><nav aria-label="Admin navigation">{links.map((link) => <Link href={link.href} key={link.href} className={pathname === link.href ? "admin-nav-active" : ""}><Icon name={link.icon} size={18} />{link.label}</Link>)}</nav><div className="admin-sidebar-footer"><span className="admin-status-dot" /> ALL SYSTEMS PRINTING</div></aside><main className="admin-main"><header className="admin-header"><div><span className="eyebrow">THREADFORM / ADMIN</span><h1>{links.find((link) => link.href === pathname)?.label ?? "Back office"}</h1></div><div><span className="admin-live">● LIVE</span><Link href="/" className="text-link">VIEW STOREFRONT <Icon name="arrowUp" size={13} /></Link><button className="icon-button" aria-label="Sign out" onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); }}>↗</button></div></header>{children}</main></div>;
}
