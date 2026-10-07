import { media } from "@/config/media";

export type Creator = { handle: string; name: string; studio: string; bio: string; avatar: string; accent: string; products: string[]; earnings: string };

export const creators: Creator[] = [
  { handle: "mina-park", name: "Mina Park", studio: "Mina Makes", bio: "Soft shapes, sunny thoughts, things that make your day feel a little lighter.", avatar: media.creators.avatars[0], accent: "#f5cd4e", products: ["daybreak-tee", "daily-carry-tote", "big-feelings-print"], earnings: "$2,480" },
  { handle: "cloud-study", name: "Rae Kim", studio: "Cloud Study", bio: "Little reminders to find the funny, the kind, and the wonderfully weird.", avatar: media.creators.avatars[1], accent: "#c9d8e8", products: ["main-character-tee", "slow-morning-mug", "good-luck-case"], earnings: "$1,820" },
  { handle: "tilly-studio", name: "Tilly Morgan", studio: "Tilly Studio", bio: "A tiny universe of florals, friendly faces, and very good tote bags.", avatar: media.creators.avatars[2], accent: "#d8e4bd", products: ["flower-power-tee", "market-day-tote", "tiny-world-sticker-pack"], earnings: "$1,675" },
  { handle: "night-dept", name: "Theo James", studio: "Night Dept.", bio: "After-hours art for daydreamers, overthinkers, and the last ones at the party.", avatar: media.creators.avatars[3], accent: "#c1c4e2", products: ["night-shift-hoodie", "sunroom-poster", "weekend-uniform-crew"], earnings: "$1,420" },
  { handle: "sunday-club", name: "Ari Ellis", studio: "Sunday Club", bio: "Comfort-core color and cheerful pieces for the slow side of life.", avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=ari", accent: "#f0d4ba", products: ["good-energy-hoodie", "first-sip-mug", "house-plant-sweatshirt"], earnings: "$1,295" },
  { handle: "studio-supply", name: "Jules Reed", studio: "Studio Supply", bio: "Useful things, drawn with a wink. Everyday objects with a little edge.", avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=jules", accent: "#ead2ce", products: ["classic-tee", "studio-mug", "bold-type-phone-case"], earnings: "$1,060" },
  { handle: "good-people-press", name: "Sam Rivera", studio: "Good People Press", bio: "Good words for good people. Made slowly, worn often.", avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=sam", accent: "#d8d4f2", products: ["inside-voice-tee", "everything-print", "mini-mood-stickers"], earnings: "$980" },
  { handle: "little-things", name: "Morgan Lee", studio: "Little Things", bio: "A collection of small joys, found in the everyday and printed by the piece.", avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=morgan", accent: "#f3d2a5", products: ["tiny-treasures-tote", "flower-phone-case", "block-party-hoodie"], earnings: "$740" },
];

export const getCreator = (handle: string) => creators.find((creator) => creator.handle === handle);
