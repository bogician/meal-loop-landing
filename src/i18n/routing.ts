import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/site";

// Locales are single-sourced from src/lib/site.ts. `localePrefix: "always"`
// means every URL is locale-prefixed (/en, /uk) — there is no unprefixed root.
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
});
