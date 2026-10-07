import type { Metadata } from "next";
import { Hero, Marquee, CategoryTiles, FeaturedDrop, HowItWorks, CreatorSpotlight, StudioCta, Newsletter } from "@/components/home-sections";

export const metadata: Metadata = {
  title: "THREADFORM — Good ideas. Great things to wear.",
  description: "Design custom tees, hoodies, totes, mugs, prints, and more. Printed one at a time, only when you order.",
  openGraph: { title: "THREADFORM — Good ideas. Great things to wear.", description: "Design it in minutes, wear it in days, no inventory needed.", images: ["/images/threadform-hero.png"] },
};

export default function HomePage() {
  return <><Hero /><Marquee /><FeaturedDrop /><CategoryTiles /><HowItWorks /><CreatorSpotlight /><StudioCta /><Newsletter /></>;
}
