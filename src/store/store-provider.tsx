"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { products, type Product } from "@/lib/catalog";

export type CartEntry = { slug: string; quantity: number; color: string; size: string };
type StoreContextValue = {
  cart: CartEntry[];
  cartCount: number;
  cartTotal: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (product: Product, options?: { color?: string; size?: string; quantity?: number }) => void;
  removeFromCart: (key: string) => void;
  updateQuantity: (key: string, quantity: number) => void;
  clearCart: () => void;
  wishlist: string[];
  toggleWishlist: (slug: string) => void;
  notice: string;
  theme: "light" | "dark" | "system";
  toggleTheme: () => void;
  hydrated: boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);
const itemKey = (item: CartEntry) => `${item.slug}|${item.color}|${item.size}`;

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("threadform-cart");
      const savedWishlist = localStorage.getItem("threadform-wishlist");
      const savedTheme = localStorage.getItem("threadform-theme");
      if (savedCart) setCart(JSON.parse(savedCart) as CartEntry[]);
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist) as string[]);
      if (savedTheme === "dark" || savedTheme === "light" || savedTheme === "system") setTheme(savedTheme);
    } catch {
      localStorage.removeItem("threadform-cart");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("threadform-cart", JSON.stringify(cart));
    localStorage.setItem("threadform-wishlist", JSON.stringify(wishlist));
    localStorage.setItem("threadform-theme", theme);
    const mediaPreference = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const effectiveTheme = theme === "system" ? (mediaPreference.matches ? "dark" : "light") : theme;
      document.documentElement.dataset.theme = effectiveTheme;
      document.documentElement.style.colorScheme = effectiveTheme;
    };
    applyTheme();
    if (theme === "system") {
      mediaPreference.addEventListener("change", applyTheme);
      return () => mediaPreference.removeEventListener("change", applyTheme);
    }
  }, [cart, wishlist, theme, hydrated]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const addToCart = useCallback((product: Product, options: { color?: string; size?: string; quantity?: number } = {}) => {
    const entry: CartEntry = {
      slug: product.slug,
      color: options.color ?? product.colors[0]?.name ?? "Natural",
      size: options.size ?? product.sizes[0] ?? "One size",
      quantity: options.quantity ?? 1,
    };
    setCart((items) => {
      const match = items.find((item) => itemKey(item) === itemKey(entry));
      return match
        ? items.map((item) => itemKey(item) === itemKey(entry) ? { ...item, quantity: Math.min(20, item.quantity + entry.quantity) } : item)
        : [...items, entry];
    });
    setNotice(`${product.name} added to your bag`);
  }, []);

  const removeFromCart = useCallback((key: string) => setCart((items) => items.filter((item) => itemKey(item) !== key)), []);
  const updateQuantity = useCallback((key: string, quantity: number) => {
    setCart((items) => quantity < 1 ? items.filter((item) => itemKey(item) !== key) : items.map((item) => itemKey(item) === key ? { ...item, quantity: Math.min(20, quantity) } : item));
  }, []);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWishlist = useCallback((slug: string) => {
    setWishlist((items) => items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]);
  }, []);
  const toggleTheme = useCallback(() => setTheme((current) => current === "system" ? "light" : current === "light" ? "dark" : "system"), []);

  const value = useMemo(() => {
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (products.find((product) => product.slug === item.slug)?.priceCents ?? 0) * item.quantity, 0);
    return { cart, cartCount, cartTotal, cartOpen, setCartOpen, addToCart, removeFromCart, updateQuantity, clearCart, wishlist, toggleWishlist, notice, theme, toggleTheme, hydrated };
  }, [cart, cartOpen, addToCart, removeFromCart, updateQuantity, clearCart, wishlist, toggleWishlist, notice, theme, toggleTheme, hydrated]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}

export function getCartItemKey(item: CartEntry) {
  return itemKey(item);
}
