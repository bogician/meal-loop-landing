// Site-wide constants for the MealLoop marketing site.

// Single source of truth for the supported locales. next-intl's routing config
// (src/i18n/routing.ts) consumes these — do not redeclare the list elsewhere.
export const LOCALES = ["en", "uk"] as const;
export const DEFAULT_LOCALE: (typeof LOCALES)[number] = "en";

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
  tagline: "Plan a week of meals from the dishes you already cook.",
  description:
    "A calm weekly meal planner for small households. Build a library of the dishes you actually cook, plan the week, and let the grocery list write itself.",
  email: "hello@meal-loop.com",
} as const;

export const NAV_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "The loop", href: "#loop" },
] as const;
