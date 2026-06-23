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

// Canonical absolute origin (scheme + host [+ port]), single-sourced for
// metadataBase, canonical/hreflang, the sitemap, and robots. Overridable via
// NEXT_PUBLIC_SITE_ORIGIN on Vercel previews; falls back to the production
// domain. No other module should hardcode an origin.
//
// Resolved through the URL parser and normalized once here so every consumer
// inherits a well-formed origin. Any misconfigured env — empty, whitespace-only,
// missing scheme, protocol-relative ("//host"), trailing slash, or path/query/
// hash-bearing — collapses to the true origin (no trailing slash or path) or, when
// unparseable or a non-http(s) scheme, to the production default. This prevents an
// origin-less "/en" (localeUrl) or a double-slash "origin//sitemap.xml" (robots).
const PRODUCTION_ORIGIN = "https://meal-loop.com";

function resolveOrigin(raw: string | undefined): string {
  try {
    const { origin, protocol } = new URL(raw ?? "");
    return protocol === "https:" || protocol === "http:"
      ? origin
      : PRODUCTION_ORIGIN;
  } catch {
    return PRODUCTION_ORIGIN;
  }
}

export const SITE_ORIGIN = resolveOrigin(process.env.NEXT_PUBLIC_SITE_ORIGIN);

// Absolute per-locale URL, single-sourced for canonical/hreflang (Story 3.2)
// and the sitemap/robots (Story 3.3). localePrefix is "always", so every
// locale page lives at /{locale} — never hardcode an absolute URL elsewhere.
export const localeUrl = (locale: string): string => `${SITE_ORIGIN}/${locale}`;

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
