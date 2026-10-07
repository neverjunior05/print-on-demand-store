const unsplash = (id: string, width = 1000) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;

export const media = {
  hero: {
    image: "/images/threadform-hero.png",
    fallback: "#f3c23a",
    poster: unsplash("photo-1521335629791-ce4aec67dd47", 1500),
  },
  products: {
    tee: unsplash("photo-1521572163474-6864f9cf17ab"),
    teeOnBody: unsplash("photo-1503342217505-b0a15ec3261c"),
    garmentRack: unsplash("photo-1523381210434-271e8be1f52b"),
    hoodie: unsplash("photo-1556821840-3a63f95609a7"),
    hoodieModel: unsplash("photo-1556821840-3a63f95609a7", 1100),
    tote: unsplash("photo-1544816155-12df9643f363"),
    bag: unsplash("photo-1590874103328-eac38a683ce7"),
    mug: unsplash("photo-1514228742587-6b1558fcca3d"),
    coffee: unsplash("photo-1495474472287-4d71bcdd2085"),
    poster: unsplash("photo-1579783902614-a3fb3927b6a5"),
    gallery: unsplash("photo-1577083552431-6e5fd01aa342"),
    phone: unsplash("photo-1601593346740-925612772716"),
    stickers: unsplash("photo-1614036634955-ae5e4f7ad81f"),
    sweatshirt: unsplash("photo-1578681994506-b8f463449011"),
  },
  categories: {
    tees: unsplash("photo-1521572163474-6864f9cf17ab", 900),
    hoodies: unsplash("photo-1556821840-3a63f95609a7", 900),
    bags: unsplash("photo-1544816155-12df9643f363", 900),
    mugs: unsplash("photo-1514228742587-6b1558fcca3d", 900),
    art: unsplash("photo-1579783902614-a3fb3927b6a5", 900),
    tech: unsplash("photo-1601593346740-925612772716", 900),
    stickers: unsplash("photo-1614036634955-ae5e4f7ad81f", 900),
    sweatshirts: unsplash("photo-1578681994506-b8f463449011", 900),
  },
  creators: {
    avatars: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=160&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
    ],
    fallback: "https://api.dicebear.com/9.x/notionists/svg?seed=threadform",
  },
  placeholders: {
    image: "https://picsum.photos/seed/threadform/900/1100",
    color: "#efe4d3",
  },
} as const;

export const mediaCredits = [
  "Product and category photography sourced from Unsplash (Unsplash License).",
  "Creator portrait imagery sourced from Unsplash; avatars fall back to DiceBear Notionists.",
  "Original THREADFORM campaign image generated for this project.",
];
