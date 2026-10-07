"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Icon } from "@/components/icons";
import { CartDrawer } from "@/components/cart-drawer";
import { site } from "@/config/site";
import { useStore } from "@/store/store-provider";

export function SiteHeader() {
  const { cartCount, setCartOpen, theme, toggleTheme } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(`/shop${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`);
    setSearchOpen(false);
  };
  return <>
    <div className="announcement"><span className="announcement-star">✳</span> FREE SHIPPING ON ORDERS $75+ <span className="announcement-divider">·</span> MADE WHEN YOU ORDER <span className="announcement-star">✳</span></div>
    <header className="site-header">
      <div className="header-inner">
        <button className="mobile-menu-trigger icon-button" onClick={() => setMenuOpen(true)} aria-label="Open categories"><Icon name="menu" size={22} /></button>
        <Link href="/" className="wordmark" aria-label="THREADFORM home"><span className="wordmark-stitch">T<span>F</span></span><span className="wordmark-name">THREADFORM</span><sup>®</sup></Link>
        <nav className="desktop-nav" aria-label="Main navigation">{site.nav.map((item) => <Link key={item.href} href={item.href} className={pathname === item.href ? "nav-active" : ""}>{item.label}</Link>)}</nav>
        <div className="header-actions">
          {searchOpen ? <form className="header-search" onSubmit={submitSearch}><label className="sr-only" htmlFor="site-search">Search the shop</label><input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search everything"/><button type="button" className="icon-button" aria-label="Close search" onClick={() => setSearchOpen(false)}><Icon name="close" size={18} /></button></form> : <button className="header-action icon-button" aria-label="Search products" onClick={() => setSearchOpen(true)}><Icon name="search" size={20} /></button>}
          <Link href="/dashboard" className="header-action icon-button account-shortcut" aria-label="Your account"><Icon name="user" size={20} /></Link>
          <button className="header-action icon-button theme-toggle" aria-label={`Theme: ${theme}. Switch to ${theme === "system" ? "light" : theme === "light" ? "dark" : "system"} mode`} title={`Theme: ${theme}`} onClick={toggleTheme}><Icon name={theme === "light" ? "moon" : "sun"} size={19} /></button>
          <button className="bag-button" onClick={() => setCartOpen(true)} aria-label={`Open shopping bag, ${cartCount} items`}><Icon name="bag" size={19} /><span>Bag</span><b aria-live="polite">{cartCount}</b></button>
        </div>
      </div>
      {menuOpen && <div className="mobile-menu-scrim" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setMenuOpen(false); }}><div className="mobile-menu-panel" role="dialog" aria-modal="true" aria-label="Shop categories"><div className="mobile-menu-head"><span className="eyebrow">PICK YOUR LANE</span><button className="icon-button" onClick={() => setMenuOpen(false)} aria-label="Close categories"><Icon name="close" /></button></div><Link href="/shop" className="mobile-menu-all" onClick={() => setMenuOpen(false)}>Shop everything <Icon name="arrow" /></Link>{site.categories.map((category) => <Link href={`/shop/${category.slug}`} key={category.slug} onClick={() => setMenuOpen(false)}><span>{category.mark}</span>{category.label}<Icon name="arrowUp" size={15} /></Link>)}<Link href="/studio" className="mobile-menu-cta" onClick={() => setMenuOpen(false)}>Make something yours <Icon name="spark" /></Link></div></div>}
    </header>
    <CartDrawer />
  </>;
}
