# Addendum — MealLoop Marketing Site v2

Technical-how, mechanism choices, and rejected alternatives that inform but do not belong in the PRD body. Downstream architecture/UX work owns the final calls; this captures the reasoning available at PRD time.

## i18n mechanism (FR-1–FR-5)

- **Library:** next-intl, the App-Router-native i18n choice (vs. next-i18next, which is Pages-Router-oriented and legacy for new App Router apps). Rejected: detection-only without subpaths — loses per-Locale Canonical/hreflang and shareable language URLs (FR-7).
- **Routing:** Locale subpath (`/en`, `/uk`). **Fork note:** Next.js 16 renames Middleware to **Proxy** — the file is `proxy.ts` at the project (or `src`) root, not `middleware.ts` (see `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`). next-intl's docs still say "middleware"; verify its integration maps onto this fork's Proxy convention during build (FR-1/FR-2). The Proxy performs the FR-2 `Accept-Language` redirect from the Locale-less root.
- **Persisted preference (Open Question 3):** cookie vs `localStorage`. A cookie is readable in the Proxy (so detection can honor it server-side before render); `localStorage` is client-only and would require a client redirect. Leaning cookie, classified as **essential** (it stores a UX preference, not tracking) so it sits outside the Consent banner — confirm during build and document in the Cookie Policy either way.

## Analytics + consent (FR-18–FR-20)

- **Tool:** Vercel Analytics (`@vercel/analytics`) — already integrated, zero-config on the Vercel deploy, cookieless, supports custom events via its `track()` API for FR-19 (CTA clicks, locale switches).
- **Rejected (kept as fallback):** Plausible — cookieless and EU-hosted (stronger data-residency story for the Ukrainian/EU audience) but paid or self-hosted and an extra integration. Revisit only if EU data residency becomes a hard requirement.
- **Consent scope:** because Vercel Analytics is cookieless, a consent banner is not strictly mandatory *for analytics alone*; the banner still ships (FR-20) to (a) maintain a clean GDPR posture for the EU/Ukrainian audience and (b) gate any future Non-essential cookies/tracking. Implementation can be a lightweight banner that gates analytics load behind consent if a stricter reading is preferred.

## Brand assets (FR-12–FR-14)

- **Source:** `../MealLoop/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg` (Brand mark/Wordmark) and `AppIcon.appiconset/AppIcon.png` (icon source). Reuse/adapt; do not redraw.
- **Favicon/app-icon set:** generate the multi-size set from the locked SVG/PNG (e.g. via the Next.js Metadata `icons` API and/or a favicon generator). Apple touch icon from `AppIcon.png`.
- **OG image:** prefer a **static** `opengraph-image.png` exported from the brand assets over `next/og` `ImageResponse` — Satori (the `next/og` renderer) is flexbox-only, caps at ~500KB, and only partially supports SVG, which fights a brand-mark composition. Final composition is Open Question 2.

## SEO mechanics (FR-6–FR-11)

- **Metadata:** per-Locale `title`/`description` via the App Router `generateMetadata`, resolved from Message catalogs.
- **Canonical + hreflang:** `alternates.canonical` (self-referential per Locale) and `alternates.languages` for `en`, `uk`, and `x-default` (FR-7). Requires a single-sourced `metadataBase` (site origin) in the root metadata — otherwise relative alternate URLs error/resolve wrong at build. Single-source the origin alongside `APP_STORE_URL` in `src/lib/site.ts`.
- **Sitemap/robots:** `app/sitemap.ts` enumerating both Locale URLs (+ legal pages) with language annotations; `app/robots.ts` referencing the sitemap (FR-8).
- **Structured data type (FR-9):** prefer `SoftwareApplication` (with `applicationCategory: LifestyleApplication`, `operatingSystem: iOS`, and the App Store `installUrl`/`url` once `APP_STORE_URL` is live) plus an `Organization` publisher entity. `MobileApplication` is a less-standard schema.org type and is not preferred. Add the App Store rating/price entities only once the listing exists.
