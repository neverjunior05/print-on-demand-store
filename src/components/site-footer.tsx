"use client";

import Link from "next/link";
import { mediaCredits } from "@/config/media";
import { site } from "@/config/site";
import { Icon } from "@/components/icons";

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="footer-main">
      <div className="footer-brand"><Link href="/" className="wordmark footer-wordmark"><span className="wordmark-stitch">T<span>F</span></span><span className="wordmark-name">THREADFORM</span><sup>®</sup></Link><p>Good ideas.<br />Great things to wear.</p><span className="footer-stamp">MADE TO ORDER<br />MADE TO MATTER</span></div>
      <div className="footer-column"><span className="eyebrow">THE GOOD STUFF</span><Link href="/shop">Shop all</Link><Link href="/shop/tees">Tees & tops</Link><Link href="/shop/art">Art prints</Link><Link href="/studio">Design studio</Link></div>
      <div className="footer-column"><span className="eyebrow">YOUR THREADFORM</span><Link href="/dashboard">My account</Link><Link href="/dashboard/orders">Order tracking</Link><Link href="/dashboard/designs">My designs</Link><Link href="/creator/mina-park">Creator shops</Link></div>
      <div className="footer-note"><div className="footer-sticker"><Icon name="spark" size={25} /><span>IDEAS<br />IN GOOD<br />COMPANY</span></div><p>Made when you order.<br />No warehouse. No waste.<br />Just good stuff.</p><a href="mailto:hello@threadform.example">Say hello <Icon name="arrowUp" size={14} /></a></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} THREADFORM STUDIO. PRINTED WITH PURPOSE.</span><details className="media-credits"><summary>Media & credits</summary><div>{mediaCredits.map((credit) => <p key={credit}>{credit}</p>)}</div></details><div className="footer-legal"><Link href="/">Privacy</Link><Link href="/">Terms</Link><span>BUILT FOR GOOD IDEAS <b>✳</b></span></div></div>
  </footer>;
}
