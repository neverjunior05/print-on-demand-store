"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { media } from "@/config/media";
import { site } from "@/config/site";
import { creators } from "@/lib/creators";
import { products } from "@/lib/catalog";
import { Icon } from "@/components/icons";
import { ProductGrid } from "@/components/product-card";

export function Hero() {
  const [imageFailed, setImageFailed] = useState(false);
  return <section className="hero-section">
    <div className="hero-grid-paper" aria-hidden="true" />
    <div className="hero-content">
      <div className="hero-kicker"><span className="kicker-dot" /> THE INTERNET'S LITTLE PRINT SHOP <span className="kicker-index">NO. 001 / 2025—∞</span></div>
      <h1>GOOD IDEAS.<br /><span className="hero-outline-word">GREAT THINGS</span><br />TO <span className="hero-highlight">WEAR<span className="hero-period">.</span></span></h1>
      <p className="hero-copy">That thing you wish existed? <strong>Make it.</strong> Design your own apparel, art, and everyday goods. We print it only when you order it.</p>
      <div className="hero-actions"><Link href="/studio" className="button button-primary hero-cta">Make something yours <Icon name="arrow" size={18} /></Link><Link href="/shop" className="text-link hero-secondary">Shop the good stuff <Icon name="arrowUp" size={16} /></Link></div>
      <div className="hero-proof"><div className="avatar-stack">{media.creators.avatars.slice(0, 3).map((avatar, index) => <img key={avatar} src={avatar} alt="" loading="lazy" style={{ zIndex: 3 - index }} />)}</div><span><strong>12,400+</strong> ideas out in the world</span><span className="proof-divider" /> <span className="proof-stars">★★★★★ <small>4.9 / 5</small></span></div>
    </div>
    <div className="hero-art-wrap">
      <div className="hero-art-frame"><img className="hero-campaign" src={imageFailed ? media.hero.poster : media.hero.image} alt="An artist wearing an original screen-printed THREADFORM tee" onError={() => setImageFailed(true)} /><div className="hero-image-caption"><span>FIG. 01</span><span>THE FIRST PRINT<br />IS ALWAYS A GOOD ONE</span></div></div>
      <div className="hero-floating hero-float-top"><span>DESIGNED<br />BY YOU</span><Icon name="spark" size={24} /></div>
      <div className="hero-floating hero-float-bottom"><span>NOT A<br />WAREHOUSE</span><b>✳</b></div>
      <div className="hero-side-note">MADE WHEN<br />YOU MAKE IT ↗</div>
      <div className="hero-circle-stamp">NO<br />STOCK<br /><b>NO<br />STRESS</b></div>
    </div>
    <div className="hero-footnote"><span>INDEPENDENT IDEAS, PRINTED ON DEMAND</span><span>SCROLL TO FIND YOURS <b>↓</b></span></div>
  </section>;
}

export function Marquee() {
  return <div className="marquee-band" aria-label="No inventory, no limits"><div className="marquee-track">{Array.from({ length: 2 }, (_, i) => <span key={i}>NO INVENTORY <b>✳</b> NO LIMITS <b>✳</b> YOUR IDEA, YOUR RULES <b>✳</b> PRINTED WITH PURPOSE <b>✳</b> MADE TO BE YOURS <b>✳</b></span>)}</div></div>;
}

export function CategoryTiles() {
  return <section className="section category-section" aria-labelledby="category-title"><div className="section-heading"><div><span className="eyebrow">A PLACE FOR EVERY GOOD IDEA</span><h2 id="category-title">Pick your <span className="underlined-word">canvas.</span></h2></div><Link className="text-link" href="/shop">Shop everything <Icon name="arrow" size={17} /></Link></div><div className="category-grid">{site.categories.map((category, index) => <Link className={`category-tile category-tile-${index + 1}`} key={category.slug} href={`/shop/${category.slug}`}><img src={media.categories[category.slug as keyof typeof media.categories]} alt={`${category.label} collection`} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} /><span className="category-tile-shade" /><span className="category-mark">{category.mark}</span><span className="category-tile-label"><strong>{category.label}</strong><small>EXPLORE THE DROP <Icon name="arrowUp" size={13} /></small></span></Link>)}</div></section>;
}

export function FeaturedDrop() {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  return <section className="section featured-section" aria-labelledby="featured-title"><div className="section-heading"><div><span className="eyebrow">THE CURRENT OBSESSION</span><h2 id="featured-title">Good things, <span className="scribble-word">made fresh.</span></h2></div><Link className="button button-outline" href="/shop">Shop all 24 <Icon name="arrow" size={17} /></Link></div><ProductGrid items={featured} /><div className="featured-bottom"><span>DESIGNED BY PEOPLE, NOT DEPARTMENTS.</span><Link href="/shop" className="small-caps-link">MEET THE FULL COLLECTION <Icon name="arrowUp" size={14} /></Link></div></section>;
}

const steps = [
  { number: "01", title: "Dream it.", copy: "Pick a blank. Start with a sketch, a photo, a typeface, or absolutely nothing but an idea.", icon: "✳", className: "step-yellow" },
  { number: "02", title: "Make it yours.", copy: "Drag, drop, scribble, undo. Our little studio gives your big idea room to breathe.", icon: "↗", className: "step-blue" },
  { number: "03", title: "Give it a spin.", copy: "See your design on the real thing before it goes anywhere near a press.", icon: "◌", className: "step-coral" },
  { number: "04", title: "We make it real.", copy: "We print just one: yours. Then pack it up and send it straight to your door.", icon: "☻", className: "step-green" },
];

export function HowItWorks() {
  return <section className="how-section" id="how-it-works"><div className="how-inner"><div className="how-intro"><span className="eyebrow">NO STOCK. NO STRESS.</span><h2>From <span className="how-marker">brainwave</span><br />to doorstep.</h2><p>Four small steps. One big “I made that” feeling.</p><Link href="/studio" className="button button-dark">See you in the studio <Icon name="arrow" size={18} /></Link><span className="how-side-label">THE THREADFORM PROCESS / 001</span></div><div className="steps-grid">{steps.map((step) => <article className={`step-card ${step.className}`} key={step.number}><div className="step-top"><span>{step.number} / STEP</span><span className="step-icon">{step.icon}</span></div><div className="step-illustration" aria-hidden="true"><div className="step-shape">{step.icon}</div></div><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div></div></section>;
}

export function CreatorSpotlight() {
  const creator = creators[0];
  return <section className="creator-section"><div className="creator-editorial"><div className="creator-image-wrap"><img src={media.products.garmentRack} alt="A printmaker's colorful studio and garment rack" loading="lazy" /><span className="creator-image-sticker">SMALL<br />IDEAS.<br /><b>BIG<br />ENERGY.</b></span><span className="creator-caption">STUDIO VISIT / 004</span></div><div className="creator-story"><span className="eyebrow">THE PEOPLE BEHIND THE PRINTS</span><span className="creator-overline">CREATOR SPOTLIGHT <span>↘</span></span><h2>“I wanted to make things that feel like a <span>deep breath</span>.”</h2><p>Meet Mina, illustrator, color enthusiast, and the person behind the little sunrise that keeps finding its way onto everybody's favorite tee.</p><div className="creator-byline"><img src={creator.avatar} alt="Mina Park" loading="lazy" /><span><strong>{creator.name}</strong><small>ILLUSTRATOR & THREADFORM CREATOR</small></span><Link href={`/creator/${creator.handle}`} aria-label="Explore Mina's shop"><Icon name="arrowUp" size={20} /></Link></div><Link href={`/creator/${creator.handle}`} className="text-link">Take a look around {creator.studio} <Icon name="arrow" size={16} /></Link></div></div><div className="creator-strip"><span>THE CREATOR ECONOMY, WITHOUT THE WAREHOUSE.</span><Link href="/creator/mina-park">YOUR IDEAS DESERVE A SHOP <Icon name="arrowUp" size={14} /></Link></div></section>;
}

export function StudioCta() {
  return <section className="studio-cta"><div className="cta-sticker" aria-hidden="true"><span>YOUR<br />IDEA<br />HERE</span><Icon name="spark" size={24} /></div><div className="studio-cta-copy"><span className="eyebrow">THE BLANK CANVAS IS CALLING</span><h2>It starts with<br /><span>“what if?”</span></h2><p>No design degree. No minimums. Just you, your idea, and an unreasonable number of possibilities.</p><Link href="/studio" className="button button-primary">Open the design studio <Icon name="arrow" size={18} /></Link></div><div className="cta-doodles"><span>✳</span><span>↗</span><span>◯</span><span>✴</span></div></section>;
}

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); if (email.includes("@")) setSubscribed(true); };
  return <section className="newsletter-section"><div><span className="eyebrow">GOOD MAIL, OCCASIONALLY</span><h2>A little more <span>good stuff.</span></h2><p>New drops, artist stories, and the occasional excuse to make something.</p></div><form className="newsletter-form" onSubmit={submit}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email goes here" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={subscribed} /><button className="button button-dark" type="submit" disabled={subscribed}>{subscribed ? "You're on the list ✓" : "Count me in"} {!subscribed && <Icon name="arrow" size={17} />}</button><small>{subscribed ? "High fives. Check your inbox soon." : "No spam, no weirdness. Unsubscribe whenever."}</small></form><span className="newsletter-spark" aria-hidden="true">✳</span></section>;
}
