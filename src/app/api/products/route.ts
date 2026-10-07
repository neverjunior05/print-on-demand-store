import { NextRequest } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { products as productTable } from "@/db/schema";
import { products as seedProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams;
  const category = search.get("category");
  const query = (search.get("q") ?? "").trim().toLowerCase();
  try {
    let rows = await db.select().from(productTable).orderBy(asc(productTable.name));
    if (!rows.length) return Response.json(seedProducts.filter((product) => (!category || product.category === category) && (!query || `${product.name} ${product.description} ${product.maker} ${product.category}`.toLowerCase().includes(query))));
    if (category) rows = rows.filter((product) => product.category === category);
    if (query) rows = rows.filter((product) => `${product.name} ${product.description} ${product.category}`.toLowerCase().includes(query));
    return Response.json(rows);
  } catch {
    return Response.json(seedProducts.filter((product) => (!category || product.category === category) && (!query || `${product.name} ${product.description} ${product.maker} ${product.category}`.toLowerCase().includes(query))));
  }
}
