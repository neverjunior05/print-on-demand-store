import type { CSSProperties } from "react";
import type { Product, ProductColor } from "@/lib/catalog";
import { Icon } from "@/components/icons";

export function PrintMark({ graphic, color = "#ff4d2e", size = 56 }: { graphic: string; color?: string; size?: number }) {
  const common = { fill: "none", stroke: color, strokeWidth: 3.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (graphic === "type") return <span className="type-mark" style={{ color }}>OK!</span>;
  if (graphic === "sun") return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><circle cx="40" cy="40" r="14" fill={color}/><g {...common}>{Array.from({ length: 8 }, (_, index) => <path key={index} d="M40 7v10" transform={`rotate(${index * 45} 40 40)`}/>)}</g></svg>;
  if (graphic === "flower") return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><g fill={color}>{Array.from({ length: 6 }, (_, index) => <ellipse key={index} cx="40" cy="21" rx="8" ry="14" transform={`rotate(${index * 60} 40 40)`}/>)}</g><circle cx="40" cy="40" r="9" fill="#ffd23f"/></svg>;
  if (graphic === "wave") return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><path d="M8 29c11 0 11 18 22 18s11-18 22-18 11 18 22 18M8 46c11 0 11 15 22 15s11-15 22-15 11 15 22 15" {...common}/></svg>;
  if (graphic === "moon") return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><path d="M55 10A28 28 0 1 0 70 55 26 26 0 0 1 55 10Z" fill={color}/><path d="m19 19 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" fill="#ffd23f"/></svg>;
  if (graphic === "square") return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><rect x="14" y="14" width="52" height="52" rx="2" fill={color}/><path d="M23 56 56 23" stroke="#fff8ec" strokeWidth="5"/></svg>;
  return <svg viewBox="0 0 80 80" width={size} height={size} aria-hidden="true"><path d="m40 7 8 23 25 10-25 8-8 25-8-25-25-8 25-10 8-23Z" fill={color}/><circle cx="62" cy="17" r="5" fill="#ffd23f"/></svg>;
}

export function ProductArtwork({ product, color, compact = false }: { product: Product; color?: ProductColor; compact?: boolean }) {
  const selected = color ?? product.colors[0];
  const style = { "--art-ground": product.ground, "--garment-color": selected?.hex ?? product.ground } as CSSProperties;
  return (
    <div className={`product-art ${compact ? "product-art-compact" : ""}`} style={style}>
      <img className="product-photo" src={product.image} alt={product.imageAlt} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />
      <span className="photo-wash" aria-hidden="true" />
      <span className={`print-graphic print-graphic-${product.category}`} aria-hidden="true"><PrintMark graphic={product.graphic} color={product.graphicColor} size={compact ? 42 : 58} /></span>
      {!compact && <span className="art-product-label">{product.category === "art" ? "ART PRINT" : product.category === "mugs" ? "CERAMIC" : product.category === "bags" ? "CANVAS" : "MADE FOR YOU"}</span>}
      {!compact && <span className="art-corner-mark" aria-hidden="true"><Icon name="spark" size={15} /></span>}
    </div>
  );
}
