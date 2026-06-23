// Single typed JSON-LD builder for the home route (FR-9). Returns one
// SoftwareApplication node with a nested Organization publisher, serialized once
// into a single <script type="application/ld+json"> by page.tsx — no section
// hand-rolls its own script. Pure function of its arguments: the page resolves
// the locale + translated description and passes them in, so this stays
// import-light and the route stays statically prerendered (AR-4). Typed with a
// local interface to avoid a new dependency (schema-dts is optional; AR-6).

import { APP_STORE_LIVE, APP_STORE_URL, SITE, SITE_ORIGIN, localeUrl } from "@/lib/site";

type Organization = {
  "@type": "Organization";
  name: string;
  url: string;
  logo: string;
};

type SoftwareApplication = {
  "@context": "https://schema.org";
  "@type": "SoftwareApplication";
  name: string;
  applicationCategory: "LifestyleApplication";
  operatingSystem: "iOS";
  description: string;
  url: string;
  inLanguage: string;
  publisher: Organization;
  // Added only once the App Store listing is live (APP_STORE_LIVE).
  installUrl?: string;
};

export function buildStructuredData({
  locale,
  description,
}: {
  locale: string;
  description: string;
}): SoftwareApplication {
  const data: SoftwareApplication = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "LifestyleApplication",
    operatingSystem: "iOS",
    description,
    url: localeUrl(locale),
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE_ORIGIN,
      // Baked-color brand mark (green on paper) served at /icon.svg — a crawler
      // reads it with no DOM/CSS context, so a currentColor asset would render
      // black. Never swap in public/brand/brand-mark.svg here.
      logo: `${SITE_ORIGIN}/icon.svg`,
    },
  };

  // Pre-listing scope (AC3): no installUrl / offers / aggregateRating while
  // APP_STORE_URL is "#". When the real listing lands, APP_STORE_LIVE flips and
  // the URL becomes a valid installUrl with zero other edits.
  if (APP_STORE_LIVE) {
    data.installUrl = APP_STORE_URL;
  }

  return data;
}
