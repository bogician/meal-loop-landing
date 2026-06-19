// Site-wide constants for the MealLoop marketing site.

// Single source of truth for the supported locales. next-intl's routing config
// (src/i18n/routing.ts) consumes these — do not redeclare the list elsewhere.
export const LOCALES = ["en", "uk"] as const;
export const DEFAULT_LOCALE: (typeof LOCALES)[number] = "en";

// Fixed visible abbreviations for the locale switcher — shown identically on
// every surface (a /uk visitor still sees "EN" for the English option). These
// are locale-code labels, not translatable copy, so they live here with LOCALES
// rather than being duplicated across both message catalogs.
export const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  en: "EN",
  uk: "УК",
};

// Canonical absolute origin, single-sourced for metadataBase (and later
// sitemap/robots/OG in Epic 3). Overridable via env on Vercel previews; falls
// back to the production domain. No other module should hardcode an origin.
export const SITE_ORIGIN =
  process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://meal-loop.com";

// MealLoop is not on the App Store yet. When the listing is live, replace this
// single value with the real product URL and every App Store button updates.
export const APP_STORE_URL = "#";
export const APP_STORE_LIVE = APP_STORE_URL !== "#";

export const SITE = {
  name: "MealLoop",
  email: "hello@meal-loop.com",
} as const;

// Copy lives in the catalog (nav.links.*); the `key` maps each anchor to its
// label under the `nav` namespace in messages/*.json.
export const NAV_LINKS = [
  { key: "howItWorks", href: "#how-it-works" },
  { key: "features", href: "#features" },
  { key: "loop", href: "#loop" },
] as const;
