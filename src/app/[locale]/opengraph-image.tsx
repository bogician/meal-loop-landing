import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { notFound } from "next/navigation";

import { LOCALES } from "@/lib/site";

// Static-bytes OG route (AR-9): returns a pre-rendered, committed per-locale PNG
// instead of rasterizing at runtime — no `next/og`/Satori. Next reads `size`/
// `contentType` to emit the absolute `og:image`/`:width`/`:height`/`:type` tags
// (URL resolved against `metadataBase` = SITE_ORIGIN). The richer per-locale OG/
// Twitter metadata is Story 3.5; this story ships only the image + auto tags.

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MealLoop — a calm weekly meal planner";

// Metadata routes don't inherit the parent layout's params in Next 16 — without
// this the route renders once at `/-/opengraph-image` as `ƒ` (dynamic). Enumerate
// the locales here so it prerenders one static PNG response per locale.
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  // Build-time guard: this route only prerenders the `generateStaticParams`
  // locales, so this narrows `locale` to a known value before it reaches the
  // file path. Defense-in-depth — unknown-locale requests are already handled
  // upstream by the locale proxy, not here.
  if (!(LOCALES as readonly string[]).includes(locale)) {
    notFound();
  }

  const bytes = await readFile(join(process.cwd(), "public", "og", `og-${locale}.png`));
  return new Response(new Uint8Array(bytes), {
    headers: { "Content-Type": contentType },
  });
}
