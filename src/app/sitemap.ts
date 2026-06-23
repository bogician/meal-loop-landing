import type { MetadataRoute } from "next";

import { DEFAULT_LOCALE, LOCALES, localeUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  // Reciprocal hreflang set, identical on every entry and byte-equal to the
  // alternates.languages emitted by generateMetadata (app/[locale]/page.tsx)
  // — the single hreflang authority. Keep this literal in lockstep with it.
  const languages = {
    en: localeUrl("en"),
    uk: localeUrl("uk"),
    "x-default": localeUrl(DEFAULT_LOCALE),
  };

  return LOCALES.map((locale) => ({
    url: localeUrl(locale),
    alternates: { languages },
  }));
}
