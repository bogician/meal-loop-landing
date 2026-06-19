---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
lastStep: 8
status: 'complete'
completedAt: '2026-06-19'
inputDocuments:
  - docs/v2-scope-brief.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/prd.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/addendum.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/reconcile-v2-scope-brief.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/review-technical-feasibility.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/DESIGN.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md
workflowType: 'architecture'
project_name: 'MealLoop Marketing Site — v2'
user_name: 'Bogdan'
date: '2026-06-19'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements (24 FRs across 7 groups):**
- **i18n (FR-1–5):** `/en`+`/uk` subpath routing via next-intl; first-visit
  `Accept-Language` detection + persisted preference; nav locale switcher;
  externalized message catalogs with per-string `en` fallback; per-locale
  `<html lang>`. Architecturally the spine — drives routing, the Proxy layer,
  and the static-vs-request rendering boundary.
- **SEO (FR-6–11):** per-locale metadata via `generateMetadata`; self-referential
  canonical + `hreflang` (en/uk/x-default); `sitemap.xml` + `robots.txt`; JSON-LD
  (Organization + SoftwareApplication); social cards/OG image; one `<h1>` +
  semantic headings. Metadata-mechanics-heavy; depends on `metadataBase`.
- **Brand (FR-12–14):** real brand mark site-wide (light/dark), favicon/app-icon
  set, OG image — all derived from the iOS app's locked `brand-logo.svg`/`AppIcon.png`.
- **Mobile (FR-15–17):** hamburger/sheet mobile menu, responsive integrity to a
  320px floor, ≥44px touch targets, ≥16px mobile body type.
- **Analytics + consent (FR-18–20):** Vercel Analytics (cookieless) pageviews +
  custom events (CTA click, locale switch); consent banner gating any
  non-essential cookies/tracking.
- **Legal (FR-21–22):** per-locale Privacy/Terms/Cookie pages; resolved footer links.
- **Conversion/CTA (FR-23–24):** single-source `APP_STORE_URL` + `APP_STORE_LIVE`
  flag; calm Coming-soon state that still records intent.

**Non-Functional Requirements (PRD §10, §11, §12):**
- **Performance/CWV:** mobile LCP ≤2.5s, CLS ≤0.1, INP ≤200ms; measured via Vercel
  Speed Insights / Lighthouse mobile; CWV is both UX quality and an SEO input.
- **Responsive baseline:** Tailwind breakpoints, hard 320px floor, ≥16px mobile body.
- **Accessibility:** WCAG 2.1 AA — landmarks, keyboard-operable nav/menu/switcher,
  visible focus, ≥44px targets, AA contrast (light brand green fixed to `#2E7D4F`).
- **Architecture constraints:** Next.js 16 App Router + RSC, minimal client islands,
  Tailwind v4 CSS-first `@theme` (no JS config), next-intl.
- **Maintainability:** all copy in message catalogs; site constants single-sourced
  in `src/lib/site.ts`; CTA single-sourced via `APP_STORE_URL`.
- **Deployment:** Vercel via GitHub auto-deploy on push to `main`; must not break
  the existing pipeline.
- **Privacy/compliance:** cookieless-by-default analytics, no PII capture, GDPR/
  ePrivacy posture for EU + Ukrainian audience.

**Scale & Complexity:**
- Primary domain: web frontend — static-leaning marketing site (Next.js App Router
  + RSC) on Vercel; no backend services, no datastore, no auth.
- Complexity level: medium — low domain complexity, but meaningful cross-cutting
  concerns in routing, rendering mode, SEO, and consent.
- Estimated architectural surfaces: routing/Proxy layer, RSC page tree + client
  islands, i18n catalog system, metadata/SEO layer, brand-asset pipeline,
  analytics/consent layer, legal pages — ~7 areas, no service tier.

### Technical Constraints & Dependencies

- **Next.js 16 "Proxy" fork drift:** middleware is renamed to `proxy.ts`; next-intl
  docs still say "middleware." The locale-redirect/root-resolution layer must be
  verified against this fork's Proxy convention (highest build-time risk).
- **Static-prerender discipline:** the persisted-preference cookie may be read only
  in the Proxy; cookie reads in page/metadata bodies would opt `/en`/`/uk` out of
  static rendering and harm CWV.
- **`metadataBase` is a hard dependency** for canonical/hreflang absolute URLs;
  site origin must be single-sourced (alongside `APP_STORE_URL`) in `src/lib/site.ts`.
- **Brand-asset lock is the critical path:** favicons (FR-13), OG image (FR-14),
  and JSON-LD logo (FR-9) all derive from the iOS `brand-logo.svg`; OG composition
  (Open Q2) blocks FR-10/14. Prefer a static `opengraph-image` over `next/og`
  (Satori flexbox-only, ~500KB cap, partial SVG support).
- **Analytics consent-gate semantics:** decision needed on whether cookieless
  analytics loads unconditionally (banner is posture-only) or is consent-gated —
  the two readings materially change SM-1/SM-3 data.
- **Locale-aware navigation:** locale switching and (any) localized legal slugs
  require next-intl pathname-aware navigation, not naive `/en`↔`/uk` string swaps.

### Cross-Cutting Concerns Identified

- **Internationalization** — touches routing, rendering mode, metadata, every
  section component, and legal pages.
- **Rendering mode (RSC/static vs request-time)** — the discipline that protects CWV.
- **SEO metadata** — per-locale, must stay parity-consistent across metadata,
  sitemap, and hreflang.
- **Consent & privacy** — gates analytics/cookies; classifies the locale cookie.
- **Performance / CWV** — an SEO input and a mobile-quality metric simultaneously.
- **Accessibility** — spans every interactive surface in both locales and color schemes.
- **Single-sourced configuration** — `src/lib/site.ts` (origin, `APP_STORE_URL`,
  `APP_STORE_LIVE`) and message catalogs as the single sources of truth.

## Starter Template Evaluation

### Primary Technology Domain

Web frontend — a static-leaning marketing site on **Next.js 16 (App Router, RSC,
Turbopack)**. This is a **brownfield** project: v1 is live on Vercel, scaffolded
originally with `create-next-app`. No new starter applies; v2 extends the existing
repository.

### Starter Options Considered

- **New starter (e.g. fresh `create-next-app`, T3, a marketing-site template)** —
  Rejected. v1 already encodes the locked brand tokens (`globals.css`), the section
  components, the device mockups, and the `src/lib/site.ts` constants. Re-scaffolding
  would discard working, brand-aligned code and the live Vercel pipeline for no gain.
- **Extend the existing v1 repo (selected)** — Keep the established foundation and
  layer in the v2 capabilities (i18n, SEO, consent) as additive changes.

### Selected Starter: None — extend existing v1 repository

**Rationale for Selection:**
The stack is already fixed by the PRD architecture constraints (§10) and proven in
v1. The v2 work is additive (i18n routing, metadata, consent, mobile menu, legal
pages), not a re-platform. The only new dependencies are the i18n and analytics
libraries below.

**Established Foundation (already in the repo — verified):**

- **Language & Runtime:** TypeScript 5, React 19.2, Next.js 16.2.9 (App Router, RSC,
  Turbopack).
- **Styling Solution:** Tailwind v4 CSS-first `@theme` in `src/app/globals.css`
  (no JS config); locked MealLoop brand tokens. shadcn/ui on **Base UI**
  (`@base-ui/react`), `class-variance-authority`, `tailwind-merge`, `clsx`,
  `tw-animate-css`.
- **Animation:** Motion v12 (`motion`), isolated in `src/components/motion.tsx`.
- **Icons:** `lucide-react`.
- **Build/Lint:** Turbopack dev/build; ESLint 9 (`eslint-config-next`).
- **Code Organization:** `src/app` (routes), `src/components/sections/*`,
  `src/components/ui/*`, `src/lib/site.ts` (constants), `src/lib/utils.ts`.
- **Testing:** none configured in v1 (a gap to address in the decisions phase).
- **Deployment:** Vercel via GitHub auto-deploy on push to `main`.

**Net-new v2 dependencies (versions verified Jun 2026):**

- **`next-intl@^4.13`** — App-Router-native i18n. Integrates via `createMiddleware`
  in Next.js 16's **`proxy.ts`** (the renamed middleware file); provides
  locale-aware navigation/pathname helpers (needed so the switcher and any localized
  legal slugs are not naive string swaps).
- **`@vercel/analytics@^2`** — cookieless analytics; `track()` custom events for
  FR-19. **Constraint: custom events require a Vercel Pro/Enterprise plan** — if the
  deployment stays on Hobby, revisit the addendum's Plausible fallback (cookieless,
  custom events on all tiers, EU-hosted). To be resolved in the analytics decision.

**Note:** Adding `next-intl` and restructuring routes under `app/[locale]` (plus the
`proxy.ts` locale negotiation) should be the first implementation story, since every
other v2 feature renders inside the localized route tree.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Localized route structure (`app/[locale]/…`) + `proxy.ts` locale negotiation.
- Single-sourced `SITE_ORIGIN` → `metadataBase` (build dependency for canonical/hreflang).
- RSC-default with a minimal set of named client islands.

**Important Decisions (Shape Architecture):**
- Analytics: Vercel Analytics on a **Pro** plan; CWV via Vercel Speed Insights.
- Consent: **posture-only** banner (cookieless analytics + FR-19 events run unconditionally).
- Legal routes: **identical slugs** across locales (`/en/privacy`, `/uk/privacy`).
- Brand-asset pipeline: static `opengraph-image` + Metadata `icons` API from locked iOS assets.
- Message-catalog organization (one file per locale, section-namespaced, `en` fallback).

**Deferred Decisions (Post-MVP / stretch):**
- OS-driven dark mode (tokens exist; not wired/verified in v2).
- Real device screenshots replacing HTML/CSS mockups.
- Additional JSON-LD types (FAQ/Breadcrumb) and App Store rating/price entities (post-listing).
- Automated Lighthouse CI / Playwright e2e — **not** in v2 (lean gate chosen); revisit if the
  site grows beyond the landing + legal pages.

### Data Architecture

**N/A — no datastore, ORM, or migrations.** "Content as data" lives in two places:
- **next-intl message catalogs** — `messages/en.json`, `messages/uk.json`, namespaced by
  section (`nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`,
  `legal`, `consent`). Single source of all copy + metadata strings; missing `uk` keys fall
  back to `en` at string granularity (FR-4).
- **Site constants** — `src/lib/site.ts`: `SITE_ORIGIN`, `APP_STORE_URL`, `APP_STORE_LIVE`,
  `LOCALES`/`DEFAULT_LOCALE`, the locale→URL map used by metadata + sitemap.

### Authentication & Security

**N/A — no auth, accounts, or PII capture.** Security surface is minimal:
- No tracking cookies set without consent; cookieless analytics; no email/waitlist.
- Locale preference uses **next-intl's built-in `NEXT_LOCALE` cookie**, classified
  **essential/functional** and exempt from the consent banner — readable in the Proxy for
  first-paint locale negotiation (resolves PRD Open Q3). Disclosed in the Cookie Policy.
- Consent choice stored in a first-party functional `mealloop_consent` cookie (also essential).

### API & Communication Patterns

**N/A — static site, no application APIs.** The only request-time logic is the `proxy.ts`
locale redirect; the only outbound traffic is the Vercel Analytics/Speed Insights beacon.

### Frontend Architecture

- **Rendering model:** RSC-default. `/en` and `/uk` (and legal pages) are **statically
  prerendered** via `generateStaticParams` over `LOCALES`; pages call next-intl's
  `setRequestLocale` to stay static. **No cookie/header reads in page or `generateMetadata`
  bodies** — that work lives only in `proxy.ts`, protecting CWV (§10).
- **Client islands (only these are `'use client'`):** `LocaleSwitcher`, `MobileMenu` (shadcn
  `Sheet`), `ConsentBanner`, and the analytics/Speed-Insights providers. The Motion v12 loop
  stays isolated in `motion.tsx`. Everything else (all sections) remains RSC.
- **State management:** no global store. Locale is owned by next-intl; consent is a tiny
  client provider over the `mealloop_consent` cookie; menu open-state is local to the island.
- **Routing:** `app/[locale]/layout.tsx`, `app/[locale]/page.tsx`,
  `app/[locale]/{privacy,terms,cookies}/page.tsx`; `proxy.ts` at repo root. All internal
  navigation and the locale switcher use next-intl's locale-aware `Link`/`useRouter`
  (`@/i18n/navigation`), never raw string swaps. Identical legal slugs mean no `pathnames`
  map is required.
- **Typography/perf:** add the **`cyrillic` subset** to the Outfit `next/font` config
  (load-bearing for `/uk`, per DESIGN.md); preserve the 16px mobile body floor and the
  320px no-overflow rule.

### Internationalization & Routing (the spine)

- **`next-intl@^4.13`**, `createMiddleware` initialized in **`proxy.ts`** (Next.js 16's
  renamed middleware). `localePrefix: 'always'`, locales `['en','uk']`, default `en`
  (also the fallback).
- **Detection:** the Proxy resolves the locale-less root by persisted `NEXT_LOCALE` cookie →
  `Accept-Language` → `en`, and redirects before paint (FR-2). Explicit `/uk`/`/en` paths
  always win and update the persisted cookie (UJ-1 edge case).
- **Switching** swaps locale on the current surface via locale-aware navigation, sets the new
  `<html lang>`, and manages focus (FR-3).

### SEO & Metadata

- **`metadataBase`** set in the root layout from `SITE_ORIGIN` (single-sourced in
  `src/lib/site.ts`) — without it, relative canonical/hreflang URLs error at build.
- **`generateMetadata`** per locale resolves title/description from catalogs; emits
  self-referential `alternates.canonical` and `alternates.languages` for `en`, `uk`,
  `x-default` (FR-7).
- **`app/sitemap.ts` + `app/robots.ts`** enumerate both locales (+ legal pages) from the same
  locale→URL map, with hreflang annotations kept in parity with the metadata alternates (FR-8).
- **JSON-LD:** `SoftwareApplication` (`applicationCategory: LifestyleApplication`,
  `operatingSystem: iOS`) + `Organization` publisher; `installUrl`/rating added only once
  `APP_STORE_LIVE` (FR-9, scoped pre-listing).
- **OG/icons:** static `opengraph-image.(png|jpg)` per locale and the favicon/Apple-touch set
  via the Metadata `icons` API — all derived from the **locked** iOS `brand-logo.svg` /
  `AppIcon.png`. Composition (OQ-2) is a design task gating FR-10/14.

### Analytics & Consent

- **`@vercel/analytics@^2`** — `<Analytics/>` for cookieless pageviews + `track()` for FR-19
  (CTA-click and locale-switch events). Requires a **Vercel Pro** plan (your decision) so
  custom events record.
- **`@vercel/speed-insights@2.0.0`** — field CWV (LCP/CLS/INP) for SM-4 and the §10 budget,
  since the lean quality gate carries no Lighthouse CI.
- **Consent = posture-only** (your decision): cookieless analytics and FR-19 events load
  unconditionally; the banner is GDPR transparency and gates only any *future* non-essential
  cookie/PII. Non-blocking, single-prompt, revocable via a footer link (FR-20). This keeps
  SM-1/SM-3 fully measured.

### Infrastructure & Deployment

- **Vercel (Pro) via GitHub auto-deploy on `main`** — unchanged pipeline; Pro unlocks custom
  events.
- **Quality gates = lean** (your decision): `tsc --noEmit` + ESLint on build, plus **manual**
  responsive/a11y QA across a defined viewport set (**320 / 360 / 390 / 768 px**) and on-device
  AA verification (incl. the light-green `#2E7D4F` fix). No automated Lighthouse/e2e in v2.
- **Config/env:** `SITE_ORIGIN`, `APP_STORE_URL`, `APP_STORE_LIVE` single-sourced in
  `src/lib/site.ts` (origin may read a Vercel env with a constant fallback).

### Decision Impact Analysis

**Implementation Sequence:**
1. i18n scaffolding — add next-intl, restructure to `app/[locale]`, add `proxy.ts`, create the
   `en` catalog. (Everything else renders inside this tree — must be first.)
2. Single-source `SITE_ORIGIN` + wire `metadataBase`.
3. Externalize all copy to the `en` catalog → produce + review the `uk` catalog (+ Cyrillic
   font subset).
4. Lock brand assets → favicon set + static OG image → SEO metadata, JSON-LD, social cards.
5. Mobile-menu + locale-switcher client islands (focus management, ≥44px targets).
6. Analytics (Pro) + Speed Insights + posture-only consent banner.
7. Legal pages (identical slugs) + resolved footer links.

**Cross-Component Dependencies:**
- `metadataBase` ← `SITE_ORIGIN`; canonical, hreflang, and sitemap all derive from it.
- Favicons, OG image, and the JSON-LD logo ← the brand-asset lock (critical path).
- FR-19 events ← Vercel Pro **and** posture-only consent (so events fire for all visitors).
- Locale switcher correctness ← identical legal slugs (no `pathnames` map needed).
- `/uk` brand fidelity ← Outfit `cyrillic` subset (load-bearing).
- Static prerender of `/en`,`/uk` ← cookie/header reads confined to `proxy.ts`.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 9 areas where AI agents could diverge —
RSC/client boundary, catalog key structure, locale-aware navigation, token/styling
usage, single-sourced constants, metadata derivation, analytics event naming, the
accessibility contract, and reduced-motion handling. (No DB/API/auth patterns — none
exist in this project.)

### Naming Patterns

**Files & Components (match existing v1 convention — do not introduce a second style):**
- Component files: **kebab-case** — `locale-switcher.tsx`, `mobile-menu.tsx`,
  `how-it-works.tsx` (as in v1).
- Component identifiers: **PascalCase** — `LocaleSwitcher`, `MobileMenu`.
- Hooks/functions: **camelCase** — `useConsent`, `getMessages`.
- Section components live in `src/components/sections/`; reusable primitives in
  `src/components/ui/` (shadcn/Base UI); cross-cutting widgets (switcher, menu,
  consent) in `src/components/`.

**Routes & Slugs:**
- Locale segment: `app/[locale]/…`; locales lowercase `en` | `uk`.
- Legal slugs: **identical across locales, lowercase, English** — `privacy`, `terms`,
  `cookies` (no translated slugs; no `pathnames` map).

**i18n Catalog Keys:**
- One file per locale: `messages/en.json`, `messages/uk.json`.
- Top-level namespace per section/area, **camelCase**, matching the component area:
  `nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`,
  `consent`, `legal`. Nested keys camelCase (`hero.headline`, `cta.comingSoon`).
- `en.json` and `uk.json` must have **identical key trees** (uk falls back to en per
  key; never invent uk-only keys).

**Analytics Events (FR-19) — fixed names + payloads (agents must not rename):**
- `app_store_cta_click` — payload `{ locale, live: boolean }` (`live` = `APP_STORE_LIVE`).
- `locale_switch` — payload `{ from, to }`.
- Event names: **snake_case**; payload keys: **camelCase**; locale values: `en` | `uk`.

### Structure Patterns

- **Tests:** none in v2 (lean gate). If a test is ever added, co-locate as
  `*.test.ts(x)` next to the unit — do not create a separate `__tests__/` tree.
- **i18n wiring:** `src/i18n/routing.ts` (locales/default), `src/i18n/navigation.ts`
  (locale-aware `Link`/`useRouter`/`redirect`), `src/i18n/request.ts` (request config);
  `proxy.ts` at repo root.
- **Constants:** every external URL, origin, and flag lives in `src/lib/site.ts`. No
  inline `https://…` App Store URLs, no inline origin, no duplicated locale lists.
- **Static assets:** brand/OG/favicon assets under `src/app/` (file-convention
  metadata: `icon`, `apple-icon`, `opengraph-image`) and/or `public/` for raw SVG.

### Format Patterns

- **No application JSON/API formats** (static site). The only structured output is
  **JSON-LD**, authored as a typed object and serialized once via a single
  `<script type="application/ld+json">` helper — agents must reuse that helper, not
  hand-roll `<script>` tags per section.
- **Metadata URLs:** always absolute, **derived** from `SITE_ORIGIN` + the locale→URL
  map. Never hardcode an absolute URL in `generateMetadata`.

### Communication Patterns (state, not services)

- **No global store.** State scope rules:
  - Locale → owned by next-intl (read via `useLocale`/`getLocale`); never tracked in
    custom state.
  - Consent → a single `useConsent` hook over the `mealloop_consent` cookie; one
    provider, no duplication.
  - Menu open-state → local `useState` inside `MobileMenu` only.
- **Immutable updates only**; no direct mutation of props/context values.

### Process Patterns

- **RSC-by-default boundary (the most important rule):** components are Server
  Components unless they are one of the four sanctioned client islands —
  `LocaleSwitcher`, `MobileMenu`, `ConsentBanner`, analytics/Speed-Insights providers
  (plus the existing `motion.tsx` animation island). Adding `'use client'` anywhere
  else requires an explicit reason. **Never** read cookies/headers in a page or
  `generateMetadata` body (would break static prerender + CWV) — that logic belongs in
  `proxy.ts`.
- **Translation access:** Server Components use `getTranslations`; Client Components
  use `useTranslations`. Static routes call `setRequestLocale(locale)` before reading
  messages. Never hardcode a user-visible string in a component.
- **Navigation:** always use the locale-aware `Link`/`useRouter` from
  `@/i18n/navigation`; never `next/link`/`next/navigation` directly for internal links,
  and never build `/${locale}/…` strings by hand.
- **Styling:** Tailwind utilities + brand tokens from `globals.css` `@theme` only.
  **Never** hardcode a hex value in a component — reference the token
  (`bg-brand`, `text-muted-foreground`). Merge classes with `cn()` from `@/lib/utils`.
  Don't reintroduce a `tailwind.config.js`.
- **Accessibility contract (codified from EXPERIENCE.md — implement identically every
  time):**
  - Mobile overlay: `role="dialog"` + `aria-modal="true"` + accessible name; focus
    trapped; `Esc`/`✕` close and **return focus to the hamburger**; body scroll locked.
  - Locale switcher: each label an independent **≥44×44px** target; active locale
    marked with `aria-current` **and** a non-color cue (weight/underline) — never hue
    alone.
  - Coming-soon CTA: `role="img"` with a status-inclusive accessible name
    (e.g. "App Store — coming soon"); **not** a `#` link, **not** a disabled focusable
    button; still emits `app_store_cta_click`.
  - One `<h1>` per page; landmarks `<header>`/`<main>`/`<footer>`; visible ≥2px focus
    ring with 2px offset (contrasting halo on brand-green controls).
- **Reduced motion:** every animation honors `prefers-reduced-motion: reduce` by
  rendering a single static frame — no autoplay, no cross-fade/opacity loop. Use one
  shared reduced-motion guard, not ad-hoc checks.
- **Loading/error:** hero text + CTA render first; no blocking spinners. Provide a
  localized `app/[locale]/not-found.tsx`; no per-section error boundaries.

### Enforcement Guidelines

**All AI Agents MUST:**
- Keep components RSC unless adding to the four sanctioned client islands.
- Resolve all copy/metadata from `messages/*` catalogs and all URLs/flags from
  `src/lib/site.ts`.
- Use `@/i18n/navigation` for internal links and reference `globals.css` tokens (never
  raw hex) via `cn()`.
- Emit FR-19 analytics with the exact event names/payloads above.
- Implement the accessibility contract verbatim and honor `prefers-reduced-motion`.

**Pattern Enforcement:** `tsc --noEmit` + ESLint on every build catch type/lint drift;
the patterns above that aren't machine-checkable (RSC boundary, token usage, a11y) are
verified in manual review/QA. Pattern changes are made by editing this document, then
applied forward.

### Pattern Examples

**Good:**
- `import { Link } from '@/i18n/navigation'` → `<Link href="/privacy">…</Link>`
  (locale preserved automatically).
- `track('app_store_cta_click', { locale, live: APP_STORE_LIVE })`.
- `<section className={cn('bg-paper text-ink', className)}>`.

**Anti-patterns (reject in review):**
- `<a href={`/${locale}/privacy`}>` (manual locale string) or `next/link` for internal nav.
- `'use client'` on a section that only renders static content.
- `style={{ color: '#2E7D4F' }}` or `className="bg-[#2E7D4F]"` (hardcoded brand hex).
- Reading `cookies()`/`headers()` inside a page or `generateMetadata`.
- A `#` href or disabled `<button>` for the Coming-soon CTA.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
mealloop-web/
├── proxy.ts                         # NEW  Next.js 16 Proxy: next-intl createMiddleware,
│                                    #      locale negotiation + Accept-Language redirect (FR-1, FR-2)
├── next.config.ts                   # MOD  wrap with createNextIntlPlugin
├── package.json                     # MOD  + next-intl@^4.13, @vercel/analytics@^2,
│                                    #      @vercel/speed-insights@2.0.0
├── tsconfig.json                    #      ('@/*' path alias already set)
├── eslint.config.mjs                #      lint gate
├── postcss.config.mjs               #      Tailwind v4
├── components.json                  #      shadcn/Base UI config
├── AGENTS.md · CLAUDE.md · README.md
├── messages/                        # NEW  i18n catalogs — single source of all copy (FR-4)
│   ├── en.json                      #      default + fallback; identical key tree to uk
│   └── uk.json                      #      AI-translated, Bogdan-reviewed; UX-DR18 voice
├── public/
│   └── brand/                       # NEW  raw vector brand assets adapted from iOS app (FR-12)
│       ├── brand-logo.svg           #      wordmark + mark (light)
│       └── brand-mark.svg           #      mark only
└── src/
    ├── i18n/                        # NEW  next-intl wiring (the spine)
    │   ├── routing.ts               #      locales ['en','uk'], defaultLocale 'en',
    │   │                            #      localePrefix 'always' (FR-1)
    │   ├── navigation.ts            #      locale-aware Link/useRouter/redirect/getPathname (FR-3)
    │   └── request.ts               #      getRequestConfig: load messages + en fallback (FR-4)
    ├── app/
    │   ├── globals.css              # MOD  light --brand/--ring → #2E7D4F (AA fix, B1/B2)
    │   ├── layout.tsx               # MOD  root: Outfit w/ latin+cyrillic subsets, metadataBase
    │   │                            #      from SITE_ORIGIN, <Analytics/>+<SpeedInsights/> (FR-18)
    │   ├── icon.svg                 # NEW  favicon (file-convention) (FR-13)
    │   ├── apple-icon.png           # NEW  Apple touch icon from AppIcon.png (FR-13)
    │   ├── sitemap.ts               # NEW  both locales + legal pages, hreflang annotations (FR-8)
    │   ├── robots.ts                # NEW  allow indexing + sitemap reference (FR-8)
    │   └── [locale]/                # NEW  localized route tree (everything renders here)
    │       ├── layout.tsx           #      setRequestLocale, <html lang> (FR-5),
    │       │                        #      NextIntlClientProvider, JSON-LD inject (FR-9)
    │       ├── page.tsx             #      landing page; generateMetadata per locale (FR-6, FR-7);
    │       │                        #      assembles the section components
    │       ├── not-found.tsx        #      localized 404
    │       ├── opengraph-image.tsx  # NEW  static OG image per locale (FR-10, FR-14)
    │       ├── privacy/page.tsx     # NEW  Privacy Policy (FR-21)
    │       ├── terms/page.tsx       # NEW  Terms (FR-21)
    │       └── cookies/page.tsx     # NEW  Cookie Policy — discloses NEXT_LOCALE cookie (FR-21)
    ├── components/
    │   ├── sections/                # MOD  all RSC; copy now resolved from catalogs (FR-4)
    │   │   ├── nav.tsx              # MOD  brand mark + switcher + mobile-menu trigger + CTA
    │   │   ├── hero.tsx             # MOD  single <h1> (FR-11) + primary App Store CTA
    │   │   ├── how-it-works.tsx     # MOD
    │   │   ├── features.tsx         # MOD
    │   │   ├── loop.tsx             # MOD  uses motion island; reduced-motion → static frame
    │   │   ├── screenshots.tsx      # MOD
    │   │   ├── cta.tsx              # MOD  final App Store CTA
    │   │   └── footer.tsx           # MOD  resolved legal links + locale mirror (FR-22)
    │   ├── locale-switcher.tsx      # NEW  client island — EN · УК, aria-current (FR-3)
    │   ├── mobile-menu.tsx          # NEW  client island — Sheet, focus trap, Esc close (FR-15)
    │   ├── consent-banner.tsx       # NEW  client island — posture-only, non-blocking (FR-20)
    │   ├── analytics.tsx            # NEW  client island — Analytics + SpeedInsights wrapper
    │   ├── app-store-button.tsx     # MOD  live/coming-soon states + track() intent (FR-23/24/19)
    │   ├── logo.tsx                 # MOD  real brand mark, light/dark variants (FR-12)
    │   ├── device-mockup.tsx        #      (unchanged HTML/CSS iPhone frame)
    │   ├── screens.tsx              #      (unchanged Library/Planner/Groceries)
    │   ├── motion.tsx               #      existing animation island
    │   └── ui/                      #      shadcn/Base UI primitives
    │       ├── button.tsx
    │       ├── card.tsx
    │       ├── badge.tsx
    │       └── sheet.tsx            # NEW  for the mobile menu
    ├── hooks/
    │   └── use-consent.ts           # NEW  read/write mealloop_consent cookie (FR-20)
    └── lib/
        ├── site.ts                  # MOD  + SITE_ORIGIN, LOCALES, DEFAULT_LOCALE,
        │                            #      locale→URL map, APP_STORE_LIVE (derived)
        ├── structured-data.ts       # NEW  typed JSON-LD builder: SoftwareApplication + Organization (FR-9)
        ├── analytics.ts             # NEW  typed track() wrappers: trackCtaClick, trackLocaleSwitch (FR-19)
        └── utils.ts                 #      cn() (unchanged)
```

### Architectural Boundaries

**Request-time vs. static boundary (the load-bearing one):**
- `proxy.ts` is the *only* request-time code. It reads `NEXT_LOCALE`/`Accept-Language`
  and redirects the locale-less root. Everything under `app/[locale]/` is **statically
  prerendered** via `generateStaticParams` + `setRequestLocale`. No cookie/header reads
  cross this line into pages or `generateMetadata`.

**Server / Client boundary:**
- Server Components: the entire `app/` tree and all `components/sections/*`.
- Client islands (the only `'use client'` files): `locale-switcher.tsx`,
  `mobile-menu.tsx`, `consent-banner.tsx`, `analytics.tsx`, plus the existing
  `motion.tsx`. The per-locale layout's `NextIntlClientProvider` is the bridge that
  feeds messages to the client islands.

**Content boundary:**
- All visible copy + metadata strings live in `messages/{en,uk}.json`. Components never
  hold literal user-facing text. uk falls back to en per key.

**Configuration boundary:**
- `src/lib/site.ts` is the single source for `SITE_ORIGIN`, `APP_STORE_URL`,
  `APP_STORE_LIVE`, locales, and the locale→URL map. `metadataBase`, canonical/hreflang,
  sitemap, robots, and the CTA all read from here.

**External integration boundary:**
- Vercel Analytics + Speed Insights (beacon only, cookieless) via `analytics.tsx`.
- The App Store (outbound link via `APP_STORE_URL`) — gated by `APP_STORE_LIVE`.
- No other third-party services, no backend, no datastore.

### Requirements to Structure Mapping

| FR group | Primary locations |
|---|---|
| **i18n (FR-1–5)** | `proxy.ts`, `src/i18n/*`, `app/[locale]/layout.tsx`, `messages/*`, `locale-switcher.tsx` |
| **SEO (FR-6–11)** | `app/[locale]/page.tsx` (`generateMetadata`), `app/sitemap.ts`, `app/robots.ts`, `lib/structured-data.ts`, `app/[locale]/opengraph-image.tsx`, `hero.tsx` (`<h1>`) |
| **Brand (FR-12–14)** | `logo.tsx`, `public/brand/*`, `app/icon.svg`, `app/apple-icon.png`, `app/[locale]/opengraph-image.tsx` |
| **Mobile (FR-15–17)** | `mobile-menu.tsx`, `ui/sheet.tsx`, `nav.tsx`, all `sections/*` (responsive QA) |
| **Analytics+consent (FR-18–20)** | `analytics.tsx`, `lib/analytics.ts`, `consent-banner.tsx`, `hooks/use-consent.ts` |
| **Legal (FR-21–22)** | `app/[locale]/{privacy,terms,cookies}/page.tsx`, `footer.tsx`, `messages/*` (`legal` namespace) |
| **Conversion/CTA (FR-23–24)** | `app-store-button.tsx`, `lib/site.ts` (`APP_STORE_URL`/`APP_STORE_LIVE`), `lib/analytics.ts` |

**Cross-cutting concerns:**
- **Accessibility** → enforced in `mobile-menu.tsx`, `locale-switcher.tsx`,
  `app-store-button.tsx`, and the section heading structure (one `<h1>`).
- **Performance/CWV** → the static-render boundary + `analytics.tsx` (Speed Insights);
  Outfit font config in root `layout.tsx`.
- **Single-sourced config** → `src/lib/site.ts`.

### Integration Points

**Internal communication:** props down from RSC pages; `NextIntlClientProvider` supplies
messages/locale to client islands; consent state via the `useConsent` hook over a cookie.
No event bus, no global store.

**External integrations:** Vercel Analytics/Speed Insights beacons (fire-and-forget,
cookieless); the App Store outbound link.

**Data flow:** `proxy.ts` resolves locale → static `app/[locale]` page renders RSC
sections reading `messages/*` → client islands hydrate (switcher, menu, consent,
analytics) → CTA tap calls `track()` → Vercel.

### File Organization Patterns

- **Configuration:** root-level (`proxy.ts`, `next.config.ts`, `tsconfig.json`,
  `eslint.config.mjs`, `postcss.config.mjs`, `components.json`); app config in
  `src/lib/site.ts`; i18n config in `src/i18n/*`.
- **Source:** routes in `src/app/[locale]/`; sections in `src/components/sections/`;
  islands + widgets in `src/components/`; primitives in `src/components/ui/`; logic in
  `src/lib/`; hooks in `src/hooks/`.
- **Tests:** none in v2 (lean gate); co-located `*.test.tsx` if ever added.
- **Assets:** file-convention metadata assets in `src/app/` (`icon`, `apple-icon`,
  `opengraph-image`); raw brand vectors in `public/brand/`; catalogs in `messages/`.

### Development Workflow Integration

- **Dev:** `next dev` (Turbopack); `/` redirects via Proxy to a locale; edit copy in
  `messages/*`, not components.
- **Build:** `next build` statically prerenders `/en`, `/uk`, and legal pages; `tsc` +
  ESLint gate; `metadataBase` must be set or the build errors on relative alternates.
- **Deploy:** Vercel (Pro) auto-deploy on push to `main`; Analytics custom events +
  Speed Insights field data populate post-deploy.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:** The stack is internally consistent and version-verified
(Jun 2026): Next.js 16.2.9 + next-intl 4.13 (App-Router-native, `createMiddleware` in
`proxy.ts`), React 19.2, Tailwind v4 CSS-first, @vercel/analytics 2 + @vercel/speed-insights
2.0.0. No contradictory decisions: the static-prerender model, cookieless analytics, and
posture-only consent reinforce each other rather than conflict.

**Pattern Consistency:** The RSC-by-default rule, the four-island whitelist, catalog-only
copy, single-sourced `site.ts`, and locale-aware navigation all directly serve the
decisions. Naming conventions match the existing v1 codebase (kebab-case files, PascalCase
components), so no second style is introduced.

**Structure Alignment:** Every boundary (Proxy request-time vs. static, server/client,
content, config, external) maps to concrete files. The `app/[locale]` tree enables static
prerender; `proxy.ts` isolates request-time logic; `NextIntlClientProvider` bridges to the
islands. Structure supports the patterns without strain.

### Requirements Coverage Validation ✅

**Functional Requirements Coverage — all 24 mapped:**
- **i18n FR-1–5:** `proxy.ts`, `src/i18n/*`, `app/[locale]/layout.tsx`, `messages/*`,
  `locale-switcher.tsx`. ✅
- **SEO FR-6–11:** `generateMetadata` + `metadataBase`, `sitemap.ts`, `robots.ts`,
  `structured-data.ts`, `opengraph-image.tsx`, `hero.tsx` `<h1>`. ✅
- **Brand FR-12–14:** `logo.tsx`, `public/brand/*`, `icon.svg`, `apple-icon.png`,
  `opengraph-image.tsx`. ✅ (sequenced behind the brand-asset lock — see gaps)
- **Mobile FR-15–17:** `mobile-menu.tsx`, `ui/sheet.tsx`, responsive QA across `sections/*`. ✅
- **Analytics+consent FR-18–20:** `analytics.tsx`, `lib/analytics.ts`, `consent-banner.tsx`,
  `use-consent.ts`. ✅
- **Legal FR-21–22:** `app/[locale]/{privacy,terms,cookies}`, `footer.tsx`. ✅
- **Conversion FR-23–24:** `app-store-button.tsx`, `site.ts` (`APP_STORE_URL`/`APP_STORE_LIVE`). ✅

**Non-Functional Requirements Coverage:**
- **Performance/CWV (§10):** static prerender + isolated islands + Outfit font config;
  measured in the field via Speed Insights. ✅ (no Lighthouse CI by the lean-gate decision —
  CWV is monitored, not blocked in CI)
- **Accessibility (WCAG 2.1 AA):** contract codified in patterns; light-green AA fix
  (`#2E7D4F`) specified. ✅ (pending `globals.css`/iOS token update + on-device verification)
- **Responsive 320px floor, ≥16px body:** QA viewport set defined (320/360/390/768). ✅
- **Maintainability / single-sourcing:** `site.ts` + catalogs. ✅
- **Deployment:** Vercel (Pro) auto-deploy unchanged. ✅
- **Privacy/compliance:** cookieless, no PII, consent posture + Cookie Policy. ✅

### Implementation Readiness Validation ✅

**Decision Completeness:** All critical decisions documented with verified versions and
rationale; the four open product questions (analytics tool, consent posture, legal slugs,
testing) are resolved.

**Structure Completeness:** Concrete tree with NEW/MOD annotations per file; every FR group
mapped to specific locations; boundaries and integration points specified.

**Pattern Completeness:** The nine divergence risks are each addressed with rules + good/anti
examples; the a11y and reduced-motion contracts are explicit.

### Gap Analysis Results

**Critical Gaps:** None — no missing decision blocks the build. The architecture is
fully specified for AI-agent implementation.

**Important (sequenced dependencies — track, don't block the whole build):**
- **Brand-asset lock (PRD Gap B-2; feasibility high):** confirm the iOS `brand-logo.svg`/
  `AppIcon.png` are final before deriving FR-12/13/14; these in turn gate FR-10 (social
  cards) and the FR-9 logo reference. The i18n/SEO-mechanics/mobile/analytics/legal work can
  proceed in parallel without it.
- **OG composition (Open Q2):** a design decision (tagline? mark only?) that gates FR-10/14
  acceptance.
- **Light-green AA fix:** update `globals.css` light `--brand`/`--ring` to `#2E7D4F`, flag the
  iOS token owner to match, and verify on-device before claiming light-mode AA.
- **Vercel Pro plan:** required for FR-19 custom events; decided (upgrade to Pro) — confirm
  the project is on Pro before relying on SM-1/SM-3 data.

**Nice-to-Have:**
- Second native-speaker review of voice-sensitive uk copy (Open Q5).
- Build-time confirmation that next-intl's `createMiddleware` maps cleanly onto `proxy.ts`
  (research indicates yes; verify in the first story).

### Validation Issues Addressed

The highest-severity feasibility risks are resolved at the architecture level: the
Proxy-vs-middleware concern is closed by the next-intl 4.13 / Next 16 `proxy.ts` integration;
the analytics consent-gate ambiguity is resolved to posture-only; `metadataBase` is single-
sourced; the OG-image Satori risk is sidestepped by the static-export decision. The remaining
items are external/content dependencies, sequenced in the implementation order.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — all 16 checklist items satisfied, no critical gaps; the open
items are sequenced external/content dependencies, not missing architecture.

**Key Strengths:**
- The static-prerender discipline (cookie reads confined to `proxy.ts`) directly protects the
  CWV NFR while enabling per-locale SEO.
- Single-sourcing (`site.ts` + catalogs) makes future edits content edits, not surgery.
- The four-island whitelist keeps the RSC surface large and the INP budget protected.
- The accessibility and reduced-motion contracts are codified, not left to per-agent judgment.

**Areas for Future Enhancement:**
- Automated Lighthouse CI / Playwright e2e (deferred by the lean-gate decision).
- OS-driven dark mode wiring/verification (tokens exist).
- Real device screenshots replacing the HTML/CSS mockups.

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented.
- Use the implementation patterns consistently; never hardcode copy, URLs, or brand hex.
- Respect the RSC/client and request-time/static boundaries.
- Refer to this document for all architectural questions.

**First Implementation Priority:** i18n scaffolding — add `next-intl@^4.13`, wrap
`next.config.ts` with `createNextIntlPlugin`, create `src/i18n/{routing,navigation,request}.ts`,
add `proxy.ts`, restructure routes under `app/[locale]/`, and seed `messages/en.json`. Every
other v2 feature renders inside this localized tree.
