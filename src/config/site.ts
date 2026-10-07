export const site = {
  name: "THREADFORM",
  tagline: "Good ideas. Great things to wear.",
  description: "Design it in minutes, wear it in days, no inventory needed.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  nav: [
    { label: "Shop", href: "/shop" },
    { label: "Studio", href: "/studio" },
    { label: "Our thing", href: "/#how-it-works" },
  ],
  categories: [
    { label: "Tees", slug: "tees", mark: "✳" },
    { label: "Hoodies", slug: "hoodies", mark: "↗" },
    { label: "Totes", slug: "bags", mark: "◒" },
    { label: "Mugs", slug: "mugs", mark: "☕" },
    { label: "Art prints", slug: "art", mark: "▧" },
    { label: "Phone cases", slug: "tech", mark: "▯" },
    { label: "Stickers", slug: "stickers", mark: "✦" },
    { label: "Sweatshirts", slug: "sweatshirts", mark: "◌" },
  ],
} as const;
