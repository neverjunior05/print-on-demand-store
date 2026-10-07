"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";
import { useStore } from "@/store/store-provider";

export function MobileTabBar() {
  const pathname = usePathname();
  const { cartCount, setCartOpen } = useStore();
  return <nav className="mobile-tabbar" aria-label="Quick navigation">
    <Link href="/" className={pathname === "/" ? "tab-active" : ""}><Icon name="sun" size={20} /><span>Home</span></Link>
    <Link href="/shop" className={pathname.startsWith("/shop") ? "tab-active" : ""}><Icon name="search" size={20} /><span>Shop</span></Link>
    <Link href="/studio" className="tab-studio"><span className="studio-tab-icon"><Icon name="spark" size={21} /></span><span>Studio</span></Link>
    <button onClick={() => setCartOpen(true)} aria-label={`Bag, ${cartCount} items`}><span className="tab-icon-with-count"><Icon name="bag" size={20} />{cartCount > 0 && <i>{cartCount}</i>}</span><span>Bag</span></button>
    <Link href="/dashboard" className={pathname.startsWith("/dashboard") ? "tab-active" : ""}><Icon name="user" size={20} /><span>Account</span></Link>
  </nav>;
}
