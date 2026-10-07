"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { site } from "@/config/site";
import { products, type Product } from "@/lib/catalog";
import { ProductGrid } from "@/components/product-card";
import { Icon } from "@/components/icons";

export function ShopBrowser({ initialCategory = "all", initialQuery = "" }: { initialCategory?: string; initialQuery?: string }) {
  const [category, setCategory] = useState(initialCategory);
  const [query, setQuery] = useState(initialQuery);
  const [sort, setSort] = useState("popular");
  const [maxPrice, setMaxPrice] = useState(100);
  const [color, setColor] = useState("all");
  const [size, setSize] = useState("all");
  const [tag, setTag] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let items = products.filter((product) => {
      const text = `${product.name} ${product.description} ${product.category} ${product.maker} ${product.tag}`.toLowerCase();
      const matchesQuery = !query || text.includes(query.toLowerCase());
      const matchesCategory = category === "all" || product.category === category;
      const matchesPrice = product.priceCents <= maxPrice * 100;
      const matchesColor = color === "all" || product.colors.some((item) => item.name === color);
      const matchesSize = size === "all" || product.sizes.includes(size);
      const matchesTag = tag === "all" || product.tag === tag;
      return matchesQuery && matchesCategory && matchesPrice && matchesColor && matchesSize && matchesTag;
    });
    if (sort === "new") items = [...items].reverse();
    if (sort === "price-low") items.sort((a, b) => a.priceCents - b.priceCents);
    if (sort === "price-high") items.sort((a, b) => b.priceCents - a.priceCents);
    if (sort === "popular") items.sort((a, b) => b.popularity - a.popularity);
    return items;
  }, [category, query, sort, maxPrice, color, size, tag]);

  const clearFilters = () => { setCategory("all"); setQuery(""); setMaxPrice(100); setColor("all"); setSize("all"); setTag("all"); };
  const filterControls = <>
    <label className="filter-control"><span>COLOR</span><select value={color} onChange={(event) => setColor(event.target.value)}><option value="all">Any color</option>{Array.from(new Set(products.flatMap((product) => product.colors.map((item) => item.name)))).map((name) => <option key={name}>{name}</option>)}</select></label>
    <label className="filter-control"><span>SIZE</span><select value={size} onChange={(event) => setSize(event.target.value)}><option value="all">Any size</option>{["XS", "S", "M", "L", "XL", "2XL", "One size", "11 oz", "A4", "A3"].map((item) => <option key={item}>{item}</option>)}</select></label>
    <label className="filter-control"><span>PRICE UP TO <b>${maxPrice}</b></span><input aria-label="Maximum price" type="range" min="10" max="100" step="5" value={maxPrice} onChange={(event) => setMaxPrice(Number(event.target.value))} /></label>
    <label className="filter-control"><span>VIBE</span><select value={tag} onChange={(event) => setTag(event.target.value)}><option value="all">Any mood</option>{Array.from(new Set(products.map((product) => product.tag))).map((item) => <option key={item}>{item}</option>)}</select></label>
  </>;

  return <div className="shop-browser"><div className="shop-filter-row"><div className="shop-categories" role="tablist" aria-label="Product category">{[{ label: "Everything", slug: "all" }, ...site.categories].map((item) => <button type="button" key={item.slug} role="tab" aria-selected={category === item.slug} className={category === item.slug ? "category-filter-active" : ""} onClick={() => setCategory(item.slug)}>{item.label}</button>)}</div><label className="shop-search"><Icon name="search" size={17} /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by idea, item, or maker…" /></label></div>
    <div className="shop-filter-toolbar"><div className="filter-toggle-wrap"><button className="filter-toggle" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><Icon name="layers" size={16} /> Filters <span>{[color !== "all", size !== "all", tag !== "all", maxPrice < 100].filter(Boolean).length || "+"}</span></button>{filtersOpen && <div className="filter-popover">{filterControls}<button className="clear-filter" onClick={clearFilters}>Clear all filters</button></div>}</div><span className="result-count"><strong>{filtered.length}</strong> good things to choose from</span><label className="sort-select"><span>SORT</span><select value={sort} onChange={(event) => setSort(event.target.value)}><option value="popular">Most loved</option><option value="new">Just in</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select><Icon name="chevron" size={15} /></label></div>
    {filtersOpen && <div className="shop-filter-expanded">{filterControls}<button className="clear-filter" onClick={clearFilters}>Clear all</button></div>}
    {filtered.length ? <ProductGrid items={filtered} /> : <div className="empty-state shop-empty"><span className="empty-doodle">✳</span><h3>Nothing on this shelf. Yet.</h3><p>Try another search or give those filters a little more room.</p><button className="button button-dark" onClick={clearFilters}>Clear all filters <Icon name="arrow" size={16} /></button></div>}
  </div>;
}
