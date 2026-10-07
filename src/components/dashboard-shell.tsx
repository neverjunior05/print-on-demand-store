"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/icons";

type User = { id: string; name: string; email: string; role: string } | null;
const dashboardLinks = [
  { href: "/dashboard", label: "Overview", icon: "sun" as const },
  { href: "/dashboard/orders", label: "My orders", icon: "box" as const },
  { href: "/dashboard/designs", label: "Saved designs", icon: "spark" as const },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: "heart" as const },
  { href: "/dashboard/addresses", label: "Addresses", icon: "truck" as const },
  { href: "/dashboard/earnings", label: "Creator earnings", icon: "arrowUp" as const },
];

export function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User>(null);
  const [loaded, setLoaded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => { void fetch("/api/auth/me").then((response) => response.json()).then((result: { user?: User }) => setUser(result.user ?? null)).catch(() => setUser(null)).finally(() => setLoaded(true)); }, []);
  const signOut = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.push("/"); router.refresh(); };
  return <div className="dashboard-layout"><aside className={`dashboard-sidebar ${menuOpen ? "dashboard-sidebar-open" : ""}`}><Link href="/" className="wordmark dashboard-wordmark"><span className="wordmark-stitch">T<span>F</span></span><span className="wordmark-name">THREADFORM</span><sup>®</sup></Link><div className="dashboard-sidebar-label">YOUR LITTLE CORNER</div><nav aria-label="Account navigation">{dashboardLinks.map((item) => <Link href={item.href} key={item.href} onClick={() => setMenuOpen(false)} className={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href)) ? "dashboard-nav-active" : ""}><Icon name={item.icon} size={18} /><span>{item.label}</span>{item.href === "/dashboard/designs" && <i>✳</i>}</Link>)}</nav><div className="dashboard-sidebar-bottom"><Link href="/shop"><Icon name="arrow" size={16} /> Back to the good stuff</Link>{loaded && user ? <button onClick={() => void signOut()}><Icon name="external" size={15} /> Sign out</button> : <Link href="/login"><Icon name="user" size={15} /> Sign in</Link>}<div className="dashboard-user-pill"><span className="dashboard-user-avatar">{user?.name?.slice(0, 1).toUpperCase() ?? "T"}</span><span><strong>{user?.name ?? "Threadform friend"}</strong><small>{user?.email ?? "A good idea in progress"}</small></span><Icon name="chevron" size={15} /></div></div></aside><main className="dashboard-main"><div className="dashboard-mobile-header"><button onClick={() => setMenuOpen(!menuOpen)} aria-label="Open account navigation"><Icon name="menu" /></button><span className="eyebrow">YOUR THREADFORM</span><Link href="/" className="dashboard-mini-logo">TF<sup>®</sup></Link></div>{children}</main></div>;
}
