import { defineRouting } from "next-intl/routing";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/site";

// Locales are single-sourced from src/lib/site.ts. `localePrefix: "always"`
// means every URL is locale-prefixed (/en, /uk) — there is no unprefixed root.
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // next-intl 4.x defaults NEXT_LOCALE to a session cookie (no maxAge); an
  // explicit maxAge makes the locale choice durable across browser sessions.
  // next-intl does not set `secure` itself, so add it for production.
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365, // 1 year
    secure: true,
  },
  localeDetection: true,
});
