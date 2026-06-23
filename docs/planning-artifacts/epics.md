---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/prd.md
  - docs/planning-artifacts/architecture.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/DESIGN.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/addendum.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/review-accessibility.md
project_name: 'MealLoop Marketing Site — v2'
---

# MealLoop Marketing Site — v2 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for MealLoop Marketing Site — v2, decomposing the requirements from the PRD, UX Design (DESIGN.md + EXPERIENCE.md + accessibility review), and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

**i18n — English + Ukrainian (FR-1–5)**
- **FR-1: Locale-subpath routing** — every page served under `/en` and `/uk` via next-intl on the App Router; locale-less `/` resolves to a locale (no 404); internal links and the App Store CTA preserve the active locale.
- **FR-2: First-visit detection + persisted preference** — on first arrival at `/`, select locale from `Accept-Language` (default `en` on no match), redirect, and persist; returning visitors get their persisted locale; an explicit `/uk`/`/en` link always wins and updates the preference.
- **FR-3: Locale switcher** — nav control switches locale on the current surface, updates the URL subpath, persists the choice, indicates the active locale, and meets touch-target/a11y rules.
- **FR-4: Externalized, translated content** — all visible copy and metadata resolve from message catalogs (no hard-coded strings); `uk` catalogs complete and voice-compliant; missing `uk` keys fall back to `en` at string granularity.
- **FR-5: Correct per-Locale language attributes** — `<html lang>` matches the active locale on every page (`/uk` → `lang="uk"`, `/en` → `lang="en"`).

**SEO & Discoverability (FR-6–11)**
- **FR-6: Per-Locale metadata** — distinct, language-correct `<title>`/`<meta description>` per locale via the App Router Metadata API, resolved from catalogs.
- **FR-7: Canonical + hreflang alternates** — self-referential canonical per page plus `hreflang` alternates for `en`, `uk`, and `x-default` pointing at correct absolute URLs.
- **FR-8: Locale-aware sitemap + robots** — `sitemap.xml` enumerating both locale URLs (and legal pages) with hreflang annotations; `robots.txt` that allows crawling and references the sitemap.
- **FR-9: Structured data (JSON-LD)** — home page emits valid JSON-LD (Organization + SoftwareApplication); application entity references the App Store listing once `APP_STORE_URL` is live.
- **FR-10: Social cards + OG image** — Open Graph + Twitter card metadata per locale, backed by a real OG image reflecting the real brand mark.
- **FR-11: Semantic heading structure** — single `<h1>` per page and a logical heading hierarchy with no skipped levels.

**Brand Identity & Assets (FR-12–14)**
- **FR-12: Real Brand mark in nav + footer** — placeholder `LoopMark` replaced site-wide by the real brand mark/wordmark from vector source, rendering correct light/dark variants.
- **FR-13: Favicon + app icon set** — complete favicon set and Apple touch icons generated from brand assets and wired into the document head (tab, bookmark, iOS add-to-home-screen).
- **FR-14: OG / social image** — a real OG image produced from brand assets at documented dimensions, referenced by FR-10 and rendering in card validators for both locales.

**Mobile Experience & Responsive QA (FR-15–17)**
- **FR-15: Mobile navigation menu** — below `md`, a hamburger/sheet menu exposes all nav links and the locale switcher; opens/closes accessibly (focus management, Esc/overlay dismiss) and meets touch-target rules.
- **FR-16: Responsive integrity across sections** — hero, device mockups, the loop, screenshot grid, and CTA render without overflow across the supported breakpoint set, verified at the 320px floor, within the §10 CLS budget.
- **FR-17: Touch targets + mobile type scale** — interactive elements meet ≥44px; body text ≥16px on mobile (no iOS tap-to-zoom).

**Privacy Analytics & Consent (FR-18–20)**
- **FR-18: Privacy-friendly analytics** — Vercel Analytics records pageviews per locale without setting tracking cookies.
- **FR-19: Conversion + locale event tracking** — App Store CTA click (incl. Coming-soon state) and locale switch tracked as distinct custom events (`app_store_cta_click {locale, live}`, `locale_switch {from, to}`).
- **FR-20: Consent gating** — consent banner gathers consent before any cookie-setting/PII tracking, remembered and revocable; cookieless non-PII analytics (pageviews + FR-19 events) run regardless of consent; banner never blocks content.

**Legal Pages (FR-21–22)**
- **FR-21: Privacy, Terms, Cookie pages** — per-locale Privacy Policy, Terms, and Cookie Policy at stable URLs, content from catalogs, describing actual data practices (Vercel Analytics, consent, no email capture).
- **FR-22: Footer legal links resolve** — footer legal links point to the real pages (no `#` dead anchors); the Privacy Policy URL is reusable for App Store submission.

**Conversion & CTA (FR-23–24)**
- **FR-23: Single-source App Store CTA** — every App Store CTA derives from the single `APP_STORE_URL` constant (and derived `APP_STORE_LIVE` flag); flipping the URL updates every instance.
- **FR-24: Coming-soon state** — while `APP_STORE_LIVE` is false, the CTA renders a calm Coming-soon affordance (not a broken link), still emits the FR-19 intent event, and obeys voice rules.

### NonFunctional Requirements

- **NFR-1: Performance / CWV** — mobile LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on a representative mid-tier device/connection; image sizing and font loading tuned for mobile; measured via Vercel Speed Insights and/or Lighthouse mobile. CWV is both an SEO input (FR-6–11) and a mobile-quality metric (SM-4).
- **NFR-2: Responsive baseline** — supported breakpoints follow Tailwind defaults (base/`sm`/`md`/`lg`/`xl`) with a hard **320px minimum width floor** and no upper-bound breakage; body text ≥16px on mobile.
- **NFR-3: Accessibility (WCAG 2.1 AA)** — semantic landmarks, keyboard-operable nav/menu/switcher, visible focus, ≥44px touch targets, sufficient contrast in light and dark token sets.
- **NFR-4: Architecture constraints** — Next.js 16 App Router + RSC; client components kept minimal (animations isolated in `motion.tsx`); Tailwind v4 CSS-first `@theme` (extend existing tokens, no JS config); next-intl for i18n.
- **NFR-5: Maintainability / single-sourcing** — all copy in message catalogs; site constants single-sourced in `src/lib/site.ts`; CTA single-sourced via `APP_STORE_URL`.
- **NFR-6: Deployment** — Vercel via GitHub auto-deploy on push to `main` (`github.com/bogician/meal-loop-landing`); v2 must not break the existing deploy pipeline.
- **NFR-7: SEO hygiene** — one `<h1>` per page, valid structured data, no duplicate-content signals across locales (canonical + hreflang correct).
- **NFR-8: Voice & tone (both languages)** — per the locked microcopy-voice rules the PRD references as **UX-DR18**: no exclamation marks; no emojis; complete sentences; never blame the user; calm and understated. Governs English source, Ukrainian translation, Coming-soon, and consent/legal copy. (See UX-DR-18.)
- **NFR-9: Visual brand** — forest-green (light `#2E7D4F` after AA fix), terracotta `#D89575`, mint `#C8F0D8`, paper `#F5F4F1`; Manrope type scale (replaced Outfit in Story 1.4 for Cyrillic coverage); light-first with OS-driven dark tokens. v2 extends, never diverges from, the locked system in `globals.css`.
- **NFR-10: Privacy & compliance** — cookieless analytics by default; no PII capture (no email/waitlist); GDPR/ePrivacy posture for the EU + Ukrainian audience; consent clear, revocable, documented in the Cookie Policy.

### Additional Requirements

_Technical requirements from the Architecture document that shape epic/story scope and sequencing._

- **AR-1: No new starter — extend the existing v1 repository (brownfield).** v1 is live on Vercel; brand tokens, section components, device mockups, and `src/lib/site.ts` already exist. **Epic 1 Story 1 is NOT a fresh scaffold** — it adds i18n to the existing repo.
- **AR-2: i18n scaffolding is the first implementation story.** Add `next-intl@^4.13`, wrap `next.config.ts` with `createNextIntlPlugin`, create `src/i18n/{routing,navigation,request}.ts`, add `proxy.ts`, restructure routes under `app/[locale]/`, seed `messages/en.json`. Everything else renders inside this localized tree.
- **AR-3: Next.js 16 "Proxy" convention** — middleware is renamed to `proxy.ts` at repo root; next-intl's `createMiddleware` must be verified against this fork's Proxy convention (highest build-time risk).
- **AR-4: Static-prerender discipline** — `/en`/`/uk`/legal pages are statically prerendered via `generateStaticParams` + `setRequestLocale`; **cookie/header reads are confined to `proxy.ts`** and forbidden in page or `generateMetadata` bodies (protects CWV).
- **AR-5: `metadataBase` single-sourced from `SITE_ORIGIN`** in `src/lib/site.ts` — a hard build dependency for canonical/hreflang absolute URLs.
- **AR-6: Net-new dependencies** — `next-intl@^4.13`, `@vercel/analytics@^2`, `@vercel/speed-insights@2.0.0`.
- **AR-7: Vercel Pro plan required** for FR-19 custom events; confirm the project is on Pro before relying on SM-1/SM-3 data (Plausible is the documented fallback if it stays on Hobby).
- **AR-8: Brand-asset lock is the critical path** — favicons (FR-13), OG image (FR-14), and the JSON-LD logo (FR-9) all derive from the iOS `brand-logo.svg`/`AppIcon.png`; lock the source assets before deriving anything.
- **AR-9: Static `opengraph-image` preferred over `next/og`** (Satori is flexbox-only, ~500KB cap, partial SVG support).
- **AR-10: Consent = posture-only** — cookieless analytics and FR-19 events load unconditionally; the banner is GDPR transparency and gates only future non-essential cookies/PII.
- **AR-11: Legal slugs identical across locales** — `privacy`, `terms`, `cookies` (lowercase, English, no translated slugs, no `pathnames` map).
- **AR-12: Cookie classification** — next-intl's built-in `NEXT_LOCALE` cookie and the `mealloop_consent` cookie are both essential/functional, exempt from the consent banner, and disclosed in the Cookie Policy.
- **AR-13: Lean quality gate** — `tsc --noEmit` + ESLint on build, plus manual responsive/a11y QA across the **320 / 360 / 390 / 768 px** viewport set and on-device AA verification. No automated Lighthouse CI / Playwright e2e in v2.
- **AR-14: Fixed analytics event contract** — `app_store_cta_click` payload `{ locale, live: boolean }`; `locale_switch` payload `{ from, to }`. Event names snake_case, payload keys camelCase, locale values `en`|`uk`. Agents must not rename.
- **AR-15: Catalog key discipline** — `messages/en.json` and `messages/uk.json` have identical camelCase key trees, namespaced by section (`nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`, `consent`, `legal`); never invent uk-only keys.
- **AR-16: Localized `not-found.tsx`** per locale; no per-section error boundaries; hero text + CTA render first (no blocking spinners).

### UX Design Requirements

_Actionable design/behavioral work items from DESIGN.md, EXPERIENCE.md, and review-accessibility.md. Each is specific enough to drive a story with testable acceptance criteria._

**Design tokens & typography**
- **UX-DR-1: Light brand-green AA fix** — update `globals.css` light `--brand` and `--ring` from `#3D8A5A` to `#2E7D4F` (white-on-green ~5.1:1, green-on-paper/card ~4.6:1) and flag the iOS `DESIGN.md` token owner to adopt the same value (do not fork). Resolves accessibility blockers B1 + B2.
- **UX-DR-2: Marketing type ramp** — implement the Manrope type-scale roles with the specified fluid sizes: `display` (hero h1, clamp 36→56px), `heading` (h2, 28→40px), `subheading` (20px), `lead` (18→22px), `body` (16px floor mobile, 1.6 lh), `label` (15px/500), `caption` (14px in muted-foreground). _(Brand font is Manrope, not the originally-spec'd Outfit — see UX-DR-3 / Story 1.4.)_
- **UX-DR-3: Cyrillic font subset (load-bearing; resolved in Story 1.4)** — the brand font is **Manrope**, loaded with `subsets: ["latin", "cyrillic"]`; Manrope's variable font covers Ukrainian Cyrillic, so `/uk` renders in-brand. _The original spec named Outfit, which ships no Cyrillic subset (`next/font` rejects `"cyrillic"` for Outfit); this halted Story 1.4 and was resolved by swapping site-wide to Manrope per Bogdan's approval._
- **UX-DR-4: Section rhythm tokens** — `section-y-mobile` 64px / `section-y` 96px (md+), `gutter` 20px (mobile) → centered container at md+, `content-max` 1152px, `prose-max` 672px for legal/reading copy.

**Component specs**
- **UX-DR-5: App Store CTA component** — Apple-supplied badge artwork, never restyled; two states driven by `APP_STORE_LIVE` (live → links to `APP_STORE_URL`; coming-soon → non-interactive badge + caption line in muted-foreground: "Coming soon to the App Store", localized).
- **UX-DR-6: Locale switcher** — inline `EN · УК` with a thin border separator; each label an independent **≥44×44px** target with internal padding and a real gap so adjacent hit areas don't merge (verify at 320px); active locale = `#2E7D4F` **plus** a non-color cue (underline/weight) and `aria-current`; inactive in muted-foreground. Resolves SF1.
- **UX-DR-7: Mobile-menu overlay** — full-viewport **opaque** paper panel (not a translucent scrim), large stacked links in `subheading`, the App Store CTA, and the locale switcher, with a `✕` close affordance top-right.
- **UX-DR-8: Device mockup** — HTML/CSS iPhone frame (ink frame, card screen, `rounded-2xl`) reproducing Library / Planner / Groceries; real screenshots may replace post-v2.
- **UX-DR-9: Feature card** — card background on a border hairline, `rounded-xl`, icon backed by a mint chip; static (no hover-only content, touch-first).
- **UX-DR-10: Consent banner** — bottom-anchored card panel, `rounded-lg`, one soft shadow, content-non-blocking (never full-screen); equal-weight Accept/Decline, inline Cookie Policy link, revocable later via a footer link.

**Behavior & states**
- **UX-DR-11: Locale negotiation at `/`** — resolve locale server-side before paint (persisted preference → `Accept-Language` → `en`); no flash of the wrong language; explicit `/uk`/`/en` path is authoritative over the header.
- **UX-DR-12: Locale switch on current surface + focus handling** — switching routes to the sibling locale path keeping the same section/scroll position where feasible, sets the new `<html lang>`, and places focus sensibly (retained on the switcher or moved to the page `<h1>`) so AT perceives the language/content change. Closes the cross-doc `aria-live`/focus gap.
- **UX-DR-13: Coming-soon CTA semantics** — render as static, non-focusable content **removed from the tab order**: `role="img"` with a status-inclusive accessible name (e.g. "App Store — coming soon"); **not** a `#` dead link, **not** a focusable disabled button; the visible caption reinforces sighted users; still records the intent event. Resolves blocker B3.
- **UX-DR-14: Mobile overlay accessibility** — `role="dialog"` + `aria-modal="true"` + accessible name; focus moves into the panel and is trapped; `Esc` and `✕` close and **return focus to the hamburger**; body scroll locked while open; tapping a link closes the overlay then scrolls.
- **UX-DR-15: Focus indicator** — visible ≥2px ring with a 2px offset on every focusable element; where the focused element is itself brand-green (primary button), use a contrasting offset/halo so the ring never sits green-on-green. Resolves SF2.
- **UX-DR-16: No meaning by color alone (1.4.1)** — active locale and emphasized links carry a non-color cue (underline / weight / `aria-current`) in addition to any color. Resolves SF4.
- **UX-DR-17: Reduced motion** — under `prefers-reduced-motion: reduce`, the loop and any animation render as a single static frame: no autoplaying movement, no autoplaying cross-fade/opacity loop, no parallax/scroll-triggered motion; any transition must be user-initiated. Use one shared reduced-motion guard. Resolves SF5.
- **UX-DR-18: Microcopy voice (both languages)** — no exclamation marks, no emojis, complete sentences, never blame the user, calm and understated ("sells less"). Governs English source copy, Ukrainian translation, the Coming-soon state, and consent/legal copy. (This is the rule the PRD references as "UX-DR18", sourced from the iOS `microcopy-voice.md`; mirrored as NFR-8.)
- **UX-DR-19: Device mockups hidden from AT only if copy stands alone** — mockups may be `aria-hidden` **only because** the surrounding section heading + body convey the product value independently; post-v2 real screenshots require descriptive `alt` text or a visually-hidden caption per screen. Resolves SF3.
- **UX-DR-20: OG image composition** — real brand mark + wordmark on paper with the localized tagline; no device mockup in the card (keep it legible at small sizes). Resolves PRD Open Q2; gates FR-10/FR-14 acceptance.
- **UX-DR-21: Native-speaker review of voice-sensitive `uk` copy** — hero, Coming-soon, and consent strings get a native-speaker review pass before launch (PRD Open Q5).

### FR Coverage Map

- **FR-1:** Epic 1 — Locale-subpath routing (`/en`, `/uk`) via next-intl.
- **FR-2:** Epic 1 — First-visit `Accept-Language` detection + persisted preference.
- **FR-3:** Epic 1 — Nav locale switcher.
- **FR-4:** Epic 1 — Externalized, translated `en`/`uk` catalogs with per-string fallback.
- **FR-5:** Epic 1 — Per-locale `<html lang>`.
- **FR-6:** Epic 3 — Per-locale metadata via `generateMetadata`.
- **FR-7:** Epic 3 — Self-referential canonical + hreflang alternates.
- **FR-8:** Epic 3 — Locale-aware sitemap + robots.
- **FR-9:** Epic 3 — JSON-LD (Organization + SoftwareApplication).
- **FR-10:** Epic 3 — Social cards (OG/Twitter) backed by the real OG image (asset from Epic 2).
- **FR-11:** Epic 3 — Single `<h1>` + semantic heading structure.
- **FR-12:** Epic 2 — Real brand mark in nav + footer (light/dark).
- **FR-13:** Epic 2 — Favicon + Apple touch-icon set.
- **FR-14:** Epic 2 — Real OG / social image (consumed by FR-10).
- **FR-15:** Epic 4 — Mobile navigation menu (hamburger/sheet + switcher).
- **FR-16:** Epic 4 — Responsive integrity across sections to the 320px floor.
- **FR-17:** Epic 4 — ≥44px touch targets + ≥16px mobile type scale.
- **FR-18:** Epic 6 — Cookieless Vercel Analytics pageviews.
- **FR-19:** Epic 6 — CTA-click + locale-switch custom events.
- **FR-20:** Epic 6 — Posture-only consent banner.
- **FR-21:** Epic 5 — Per-locale Privacy/Terms/Cookie pages.
- **FR-22:** Epic 5 — Resolved footer legal links.
- **FR-23:** Epic 6 — Single-source App Store CTA (`APP_STORE_URL`/`APP_STORE_LIVE`).
- **FR-24:** Epic 6 — Coming-soon CTA state that still records intent.

## Epic List

### Epic 1: Bilingual Foundation
A visitor lands on the site and reads it in their language — Ukrainian or English — chosen automatically on first visit from `Accept-Language`, remembered on return, and switchable at any time, with every word served from translation catalogs. This establishes the localized `app/[locale]` route tree and `proxy.ts` that every other v2 capability renders inside (architecturally the spine — must be first), and folds in the cross-cutting setup it depends on: the net-new dependencies, single-sourced `SITE_ORIGIN`/`metadataBase`, the `#2E7D4F` light brand-green AA fix, and the brand-font Cyrillic subset (Manrope's `latin+cyrillic` — swapped from the originally-spec'd Outfit in Story 1.4).
**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5

### Epic 2: Brand Identity & Assets
The site wears the real MealLoop brand everywhere — the actual mark in nav and footer with correct light/dark rendering, a complete favicon and Apple touch-icon set, and a real social-share image — replacing every placeholder so the product reads as credible and trustworthy. This is the critical path: the iOS source assets (`brand-logo.svg`/`AppIcon.png`) must be locked first, because the OG image and JSON-LD logo that Epic 3 depends on are derived from them.
**FRs covered:** FR-12, FR-13, FR-14

### Epic 3: SEO & Discoverability
The page is findable in search and renders correctly when shared — per-locale titles and descriptions, self-referential canonical URLs with `en`/`uk`/`x-default` hreflang alternates, a locale-aware sitemap and robots, valid product/publisher JSON-LD, social cards backed by the real OG image, and a clean single-`<h1>` semantic heading structure. Builds on Epic 1 (locale routing + `metadataBase`) and Epic 2 (OG image + brand logo).
**FRs covered:** FR-6, FR-7, FR-8, FR-9, FR-10, FR-11

### Epic 4: Mobile Experience & Responsive QA
The site holds up on real phones — a hamburger/sheet menu exposes the navigation links and the locale switcher below the `md` breakpoint with full focus management, every section renders without horizontal overflow down to a 320px floor, and all interactive targets and body type meet the mobile minimums (≥44px, ≥16px). Builds on Epic 1 (the locale switcher is mirrored inside the mobile overlay).
**FRs covered:** FR-15, FR-16, FR-17

### Epic 5: Legal Pages & Trust
The site serves real Privacy Policy, Terms, and Cookie Policy pages per locale with resolved footer links (no dead `#` anchors) — satisfying the trust job-to-be-done, providing the Cookie Policy that the Epic 6 consent banner links to, and delivering the public Privacy Policy URL that App Store submission requires. Ordered before Epic 6 so the legal pages exist before the consent banner references them.
**FRs covered:** FR-21, FR-22

### Epic 6: Conversion, Analytics & Consent
The single conversion point works honestly and is measured in a privacy-respecting way — the App Store CTA derives from one `APP_STORE_URL` constant with a calm Coming-soon state, cookieless Vercel Analytics records pageviews and the two custom events that matter (App Store CTA click and locale switch), and a posture-only consent banner provides GDPR transparency without ever walling content. Grouped because the CTA, its conversion-intent event, and the analytics/consent infrastructure are one coherent surface (PRD §4.5 + §4.7; north-star SM-1).
**FRs covered:** FR-18, FR-19, FR-20, FR-23, FR-24

## Epic 1: Bilingual Foundation

A visitor reads the site in their language — Ukrainian or English — chosen automatically on first visit, remembered on return, and switchable at any time, with every word served from translation catalogs. This epic establishes the localized `app/[locale]` route tree and `proxy.ts` that every other v2 capability renders inside, plus the cross-cutting setup it depends on. (FR-1–5; AR-1,2,3,4,5,6,12,15,16; NFR-4,5,6,8,9; UX-DR-1,3,6,12,16,18,21)

### Story 1.1: i18n scaffolding & localized route shell

As a visitor (and the site maintainer),
I want the site served under a language-scoped URL with the correct document language,
So that every page has a stable, shareable, language-specific address that the rest of v2 can build inside.

**Acceptance Criteria:**

**Given** the v2 dependencies are installed (`next-intl@^4.13`, `@vercel/analytics@^2`, `@vercel/speed-insights@2.0.0`),
**When** the project builds,
**Then** `next.config.ts` is wrapped with `createNextIntlPlugin` and `src/i18n/{routing,navigation,request}.ts` define locales `['en','uk']`, `defaultLocale 'en'`, and `localePrefix 'always'`.
**And** `proxy.ts` at the repo root initializes next-intl's `createMiddleware`, verified against the Next.js 16 Proxy convention (AR-2, AR-3, AR-6).

**Given** the route tree is restructured under `app/[locale]/`,
**When** I visit `/en` and `/uk`,
**Then** each renders the full landing page, statically prerendered via `generateStaticParams` + `setRequestLocale`,
**And** the document emits the correct `<html lang>` (`/en`→`lang="en"`, `/uk`→`lang="uk"`) (FR-1, FR-5).

**Given** a request to the locale-less root `/`,
**When** it is handled by `proxy.ts`,
**Then** it resolves to a locale subpath rather than returning a 404 (FR-1).

**Given** any internal link or the App Store CTA,
**When** it is rendered,
**Then** it uses `@/i18n/navigation` and preserves the active locale (no hand-built `/${locale}/…` strings).

**Given** `SITE_ORIGIN` is single-sourced in `src/lib/site.ts`,
**When** the root layout renders,
**Then** `metadataBase` is set from it and the build does not error on relative alternates (AR-5).

**Given** the light brand token,
**When** `globals.css` is built,
**Then** `--brand` and `--ring` resolve to `#2E7D4F` (AA fix) and no component hardcodes `#3D8A5A` (UX-DR-1).

**Given** v1 is live on Vercel,
**When** v2 is deployed,
**Then** the existing GitHub→Vercel auto-deploy pipeline still builds and deploys (NFR-6).

### Story 1.2: First-visit detection & persisted preference

As a first-time visitor,
I want the site to open in my language automatically and remember my choice,
So that I'm not forced to pick a language on every visit.

**Acceptance Criteria:**

**Given** a first visit to `/` with no stored preference,
**When** `proxy.ts` resolves the locale,
**Then** a browser preferring Ukrainian is redirected to `/uk`, and one preferring English or any unsupported language is redirected to `/en` (default) (FR-2).

**Given** a returning visitor with a persisted `NEXT_LOCALE` cookie,
**When** they request `/`,
**Then** they are served their persisted locale regardless of `Accept-Language` (FR-2).

**Given** an explicit `/uk` or `/en` link,
**When** it is opened even though the browser prefers the other language,
**Then** the path is honored and the persisted preference is updated (UJ-1 edge case).

**Given** locale negotiation runs,
**When** it reads cookies/headers,
**Then** those reads occur only in `proxy.ts` — none in page or `generateMetadata` bodies — so `/en` and `/uk` stay statically prerendered (AR-4).

**Given** the `NEXT_LOCALE` cookie,
**When** it is set,
**Then** it is a first-party functional cookie classified essential and exempt from consent gating (AR-12).

### Story 1.3: Externalize all copy to the English catalog

As the site maintainer (Bogdan),
I want every visible string and metadata value to live in a translation catalog,
So that future copy edits are catalog edits, not component surgery.

**Acceptance Criteria:**

**Given** every landing section (`nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`),
**When** rendered on `/en`,
**Then** all visible copy resolves from `messages/en.json` and no user-visible string is hard-coded in a component (FR-4, NFR-5).

**Given** the English catalog,
**When** it is organized,
**Then** keys are namespaced per section in camelCase matching the component area, and the file is the single source of all copy (AR-15).

**Given** a Server Component reading copy,
**When** it renders,
**Then** it uses `getTranslations` after `setRequestLocale(locale)` and stays static; client islands use `useTranslations`.

**Given** a copy change in `messages/en.json`,
**When** it is made,
**Then** the rendered text updates with no component edit.

### Story 1.4: Ukrainian catalog & Cyrillic typography

As Olena, a Ukrainian-speaking visitor,
I want the whole page in natural Ukrainian rendered in the brand font,
So that the site reads as first-class Ukrainian, not a machine afterthought.

**Acceptance Criteria:**

**Given** `messages/uk.json`,
**When** compared to `messages/en.json`,
**Then** it has an identical key tree with complete Ukrainian copy and no uk-only keys (AR-15).

**Given** `/uk`,
**When** any section renders,
**Then** there is no English leakage; a missing `uk` string falls back to the `en` value at string granularity — never an empty render or a raw key (FR-4).

**Given** the brand font (**Manrope** — swapped from Outfit during this story; Outfit ships no Cyrillic subset),
**When** it is loaded,
**Then** the `cyrillic` subset is included (`subsets: ["latin", "cyrillic"]`), so `/uk` renders Cyrillic in the brand font (UX-DR-3).

**Given** Ukrainian copy,
**When** it is reviewed,
**Then** it obeys the voice rules — no exclamation marks, no emojis, complete sentences, never blames the user — and voice-sensitive copy (hero, Coming-soon, consent) receives a native-speaker review pass before launch (UX-DR-18, UX-DR-21).

### Story 1.5: Locale switcher

As a visitor,
I want a control to switch between English and Ukrainian at any point,
So that I can read the page in my preferred language without losing my place.

**Acceptance Criteria:**

**Given** the `EN · УК` switcher in the nav,
**When** I switch from `/en` to `/uk` (and back),
**Then** the same section re-renders in the other language on the current surface (not a full re-navigation to home), the URL subpath updates, and the preference persists (FR-3).

**Given** a locale switch completes,
**When** the new surface renders,
**Then** the new `<html lang>` is set and focus is placed sensibly (retained on the switcher or moved to the page `<h1>`) so assistive tech perceives the language/content change (UX-DR-12).

**Given** the switcher,
**When** it is rendered,
**Then** the active locale is marked with `aria-current` AND a non-color cue (underline/weight) — never hue alone — in the AA-compliant `#2E7D4F` (UX-DR-6, UX-DR-16).

**Given** each locale label,
**When** measured,
**Then** it is an independent ≥44×44px target with internal padding and a real gap between adjacent hit areas, verified at the 320px floor (UX-DR-6).

## Epic 2: Brand Identity & Assets

The site wears the real MealLoop brand everywhere — the actual mark in nav and footer (light/dark), a complete favicon and Apple touch-icon set, and a real social-share image — replacing every placeholder so the product reads as credible. The iOS source assets must be locked first; the OG image and JSON-LD logo that Epic 3 depends on are derived from them. (FR-12–14; AR-8,9; NFR-9; UX-DR-20)

### Story 2.1: Real brand mark in nav & footer

As a prospective user,
I want to see the real MealLoop brand mark instead of a placeholder,
So that the product reads as a real, trustworthy app.

**Acceptance Criteria:**

**Given** the iOS source assets (`brand-logo.svg`, `AppIcon.png`) are confirmed final/locked,
**When** the web brand asset set is produced under `public/brand/`,
**Then** it includes a vector wordmark + mark adapted (not redrawn) from the iOS source (AR-8).

**Given** `logo.tsx`,
**When** it renders in the nav and footer,
**Then** it shows the real brand mark/wordmark from the SVG vector source at nav and footer sizes with no rasterization (FR-12).

**Given** light and dark appearance,
**When** the mark renders,
**Then** it resolves to the correct light/dark token variant per appearance (FR-12, NFR-9).

**Given** the shipped site,
**When** inspected,
**Then** no instance of the placeholder `LoopMark` remains (FR-12).

### Story 2.2: Favicon & app-icon set

As a visitor,
I want the browser tab, bookmark, and home-screen icon to show the MealLoop icon,
So that the site is recognizable wherever it's pinned or saved.

**Acceptance Criteria:**

**Given** the locked brand assets,
**When** the favicon set and Apple touch icons are generated,
**Then** they are wired into the document head via the Next.js Metadata `icons` API / file conventions (`app/icon.svg`, `app/apple-icon.png`) (FR-13).

**Given** a browser tab and bookmark,
**When** the site loads,
**Then** the MealLoop icon shows, not the Next.js/placeholder default (FR-13).

**Given** iOS "add to home screen",
**When** invoked,
**Then** the MealLoop Apple touch icon (derived from `AppIcon.png`) shows (FR-13).

### Story 2.3: OG / social-share image

As a person who receives a shared link,
I want the link preview to show a real branded image,
So that the shared MealLoop link looks credible before I tap it.

**Acceptance Criteria:**

**Given** the locked brand assets,
**When** the OG image is produced,
**Then** it is a static `opengraph-image` per locale (preferred over `next/og`) at the documented dimensions (AR-9, FR-14).

**Given** the OG composition,
**When** designed,
**Then** it shows the real brand mark + wordmark on paper with the localized tagline and no device mockup, legible at small sizes (UX-DR-20).

**Given** `/en` and `/uk`,
**When** the OG image renders in card validators,
**Then** it reflects the real brand mark, not the placeholder, for both locales (FR-14).

## Epic 3: SEO & Discoverability

The page is findable in search and renders correctly when shared — per-locale metadata, canonical + hreflang, a locale-aware sitemap/robots, valid JSON-LD, social cards backed by the real OG image, and a clean single-`<h1>` structure. Builds on Epic 1 (locale routing + `metadataBase`) and Epic 2 (OG image + brand logo). (FR-6–11; AR-4,5,9,11; NFR-7; UX-DR-20)

### Story 3.1: Semantic heading structure & landmarks

As a search engine and an assistive-tech user,
I want one clear page heading and a logical structure,
So that the page is correctly indexed and navigable.

**Acceptance Criteria:**

**Given** any landing page (`/en`, `/uk`),
**When** rendered,
**Then** it has exactly one `<h1>` (the hero promise) and a logical heading hierarchy with no skipped levels (FR-11, NFR-7).

**Given** the page,
**When** inspected,
**Then** the landmarks `<header>`/nav, `<main>`, and `<footer>` are present (NFR-3).

**Given** an accessibility/SEO audit,
**When** run,
**Then** no skipped-heading-level or missing-landmark issue is flagged (FR-11).

**Given** the device mockups and the loop animation,
**When** the section renders,
**Then** they are `aria-hidden` from the accessibility tree only because the surrounding section heading + body convey the product value independently; any post-v2 real screenshot will require descriptive `alt` text or a visually-hidden caption per screen (UX-DR-19).

### Story 3.2: Per-locale metadata, canonical & hreflang

As a search engine,
I want each locale page to declare its own metadata and language alternates,
So that the right language version is indexed without duplicate-content dilution.

**Acceptance Criteria:**

**Given** `/en` and `/uk`,
**When** metadata is generated via `generateMetadata`,
**Then** each returns a distinct, language-correct `<title>` and `<meta description>` resolved from the catalog (FR-6).

**Given** any page,
**When** it renders metadata,
**Then** it declares a self-referential canonical URL and `hreflang` alternates for `en`, `uk`, and `x-default` pointing at correct absolute URLs derived from `SITE_ORIGIN` (FR-7, AR-5).

**Given** any page,
**When** checked,
**Then** it never omits its own canonical (FR-7, NFR-7).

**Given** `generateMetadata`,
**When** it executes,
**Then** it reads no cookies/headers (stays static) and hardcodes no absolute URL — it derives from `SITE_ORIGIN` + the locale→URL map (AR-4).

### Story 3.3: Locale-aware sitemap & robots

As a search engine crawler,
I want a sitemap listing both language versions and a robots file pointing to it,
So that I can discover and index all indexable pages.

**Acceptance Criteria:**

**Given** `app/sitemap.ts`,
**When** generated,
**Then** it enumerates `/en` and `/uk` with hreflang annotations from the same locale→URL map used by metadata (FR-8).

**Given** `app/robots.ts`,
**When** generated,
**Then** it allows crawling of indexable content and references the sitemap (FR-8).

**Given** legal pages do not yet exist in this epic,
**When** the sitemap is built,
**Then** it covers the locale landing pages; legal-page URLs are added by Epic 5 when those pages ship (no forward dependency).

### Story 3.4: Structured data (JSON-LD)

As a search engine,
I want machine-readable structured data describing the product and publisher,
So that MealLoop can appear as a rich, correctly-typed result.

**Acceptance Criteria:**

**Given** the home page,
**When** it renders,
**Then** it emits JSON-LD via a single typed `structured-data.ts` builder (one `<script type="application/ld+json">` helper) describing `SoftwareApplication` (`applicationCategory: LifestyleApplication`, `operatingSystem: iOS`) + an `Organization` publisher (FR-9).

**Given** the JSON-LD,
**When** validated,
**Then** it passes a schema.org structured-data test with no errors (FR-9).

**Given** the publisher logo,
**When** referenced,
**Then** it points at the real brand mark (Epic 2); `installUrl`/rating are added only once `APP_STORE_LIVE` is true (FR-9, scoped pre-listing).

### Story 3.5: Social cards / OG metadata

As a person who receives a shared link,
I want the preview card to show a correct title, description, and image,
So that the shared link is compelling and accurate in both languages.

**Acceptance Criteria:**

**Given** `/en` and `/uk`,
**When** metadata renders,
**Then** each exposes Open Graph and Twitter card metadata referencing the real OG image (Epic 2, FR-14) (FR-10).

**Given** a shared `/en` or `/uk` link,
**When** validated in a card validator,
**Then** it renders a correct localized title, description, and image preview (FR-10).

**Given** the OG image,
**When** shown,
**Then** it reflects the real brand mark, not the placeholder (FR-10, UX-DR-20).

## Epic 4: Mobile Experience & Responsive QA

The site holds up on real phones — a hamburger/sheet menu exposes the nav links and locale switcher below `md` with full focus management, every section renders without overflow down to a 320px floor, and all targets and body type meet the mobile minimums. Builds on Epic 1 (the switcher is mirrored inside the overlay). (FR-15–17; NFR-1,2,3; UX-DR-2,4,7,14,15,17)

### Story 4.1: Mobile navigation menu

As a visitor on a phone,
I want a menu that exposes the nav links and language switcher,
So that I can navigate the page and switch language on a small screen.

**Acceptance Criteria:**

**Given** a viewport below the `md` breakpoint,
**When** I tap the hamburger,
**Then** a full-viewport opaque paper overlay opens exposing all `NAV_LINKS`, the locale switcher, and the App Store CTA (FR-15, UX-DR-7).

**Given** the overlay is open,
**When** it is announced by assistive tech,
**Then** it exposes `role="dialog"` + `aria-modal="true"` + an accessible name, focus moves into the panel and is trapped, and body scroll is locked (UX-DR-14).

**Given** the overlay is open,
**When** I press `Esc` or tap the `✕`,
**Then** it closes and focus returns to the hamburger trigger (UX-DR-14).

**Given** the overlay is open,
**When** I tap a nav link,
**Then** the overlay closes and then scrolls to the section (UX-DR-14).

**Given** the menu controls,
**When** measured,
**Then** they meet the ≥44px touch-target rule (FR-15, FR-17).

### Story 4.2: Responsive integrity & motion safety to the 320px floor

As a visitor on a small or mid-size phone,
I want every section to render cleanly without breakage,
So that the page never looks broken regardless of my device.

**Acceptance Criteria:**

**Given** the supported breakpoint set (320 / 360 / 390 / 768px),
**When** each section (hero, device mockups, the loop, screenshot grid, CTA) renders,
**Then** there is no horizontal scroll or element overflow, verified at the 320px floor (FR-16, NFR-2, AR-13).

**Given** the device-mockup row at the smallest viewports,
**When** it renders,
**Then** it stacks or scrolls horizontally rather than shrinking below legibility (NFR-2, UX-DR-4).

**Given** animated/interactive sections,
**When** they render on small viewports,
**Then** they remain readable and operable and contribute no layout shift beyond the CLS budget (FR-16, NFR-1).

**Given** `prefers-reduced-motion: reduce`,
**When** the loop or any animation renders,
**Then** it shows a single static frame with no autoplaying movement, cross-fade/opacity loop, or parallax/scroll-triggered motion, via one shared reduced-motion guard (UX-DR-17).

### Story 4.3: Touch targets, mobile type scale & focus indicators

As a visitor using touch or keyboard,
I want comfortably-sized targets, legible text, and visible focus,
So that I can operate and read the page without strain or mis-taps.

**Acceptance Criteria:**

**Given** every interactive element (nav links, each locale label, hamburger, CTA, consent buttons),
**When** measured,
**Then** it meets the ≥44px touch-target minimum (FR-17).

**Given** body and heading text on mobile,
**When** rendered,
**Then** body text is ≥16px (no iOS tap-to-zoom) and the Manrope type-ramp roles (display/heading/subheading/lead/body/label/caption) are applied at the specified sizes (FR-17, UX-DR-2).

**Given** any focusable element,
**When** focused,
**Then** it shows a visible ≥2px focus ring with a 2px offset; where the element is itself brand-green, the ring uses a contrasting offset/halo so it never sits green-on-green (UX-DR-15, NFR-3).

## Epic 5: Legal Pages & Trust

The site serves real Privacy/Terms/Cookie pages per locale with resolved footer links — satisfying the trust JTBD, providing the Cookie Policy the Epic 6 consent banner links to, and delivering the public Privacy URL App Store submission requires. Ordered before Epic 6 so the legal pages exist before the consent banner references them. (FR-21,22; AR-11; NFR-8,10; UX-DR-4; extends FR-8)

### Story 5.1: Privacy, Terms & Cookie pages per locale

As a privacy-conscious visitor,
I want real Privacy, Terms, and Cookie pages in my language,
So that I can trust the site respects me before I download.

**Acceptance Criteria:**

**Given** the routes `app/[locale]/{privacy,terms,cookies}`,
**When** visited,
**Then** each exists at a stable URL for both locales with identical English slugs (no translated slugs, no `pathnames` map) and renders translated content from the `legal` catalog namespace (FR-21, AR-11).

**Given** the legal content,
**When** rendered,
**Then** it lays out within the `prose-max` (672px) reading width (UX-DR-4).

**Given** the pages,
**When** read,
**Then** they describe the actual data practices: Vercel Analytics (cookieless), the consent posture, the essential `NEXT_LOCALE` and `mealloop_consent` cookies, and no email/PII capture (FR-21, NFR-10).

**Given** the copy,
**When** reviewed,
**Then** it obeys the voice rules in both languages (NFR-8).

### Story 5.2: Resolved footer legal links & sitemap entries

As a visitor,
I want the footer legal links to actually open the legal pages,
So that I can reach the policies and the site has no dead links.

**Acceptance Criteria:**

**Given** the footer,
**When** rendered,
**Then** every legal link points to the real per-locale page (no `#` dead anchors) and is locale-mirrored (FR-22).

**Given** the Privacy Policy,
**When** published,
**Then** its URL is available for reuse in the App Store listing (FR-22).

**Given** the legal pages now exist,
**When** the sitemap is regenerated,
**Then** it includes the legal URLs for both locales with hreflang annotations (extends FR-8 from Story 3.3).

## Epic 6: Conversion, Analytics & Consent

The single conversion point works honestly and is measured privacy-respectingly — the App Store CTA derives from one constant with a calm Coming-soon state, cookieless analytics records pageviews and the two custom events that matter, and a posture-only consent banner provides GDPR transparency without walling content. (FR-18,19,20,23,24; AR-6,7,10,12,14; NFR-1,10; UX-DR-5,10,13)

### Story 6.1: Cookieless analytics & Speed Insights

As the site maintainer (Bogdan),
I want privacy-friendly analytics and field performance data,
So that I can see traffic and Core Web Vitals without tracking visitors.

**Acceptance Criteria:**

**Given** the `analytics.tsx` client island,
**When** the app loads,
**Then** it mounts `<Analytics/>` + `<SpeedInsights/>` and records pageviews per locale without setting a tracking cookie (FR-18).

**Given** `lib/analytics.ts`,
**When** implemented,
**Then** it exposes typed wrappers (`trackCtaClick`, `trackLocaleSwitch`) emitting the fixed event contract — `app_store_cta_click {locale, live}` and `locale_switch {from, to}`, snake_case event names, camelCase payload keys (AR-14).

**Given** custom events are relied upon for SM-1/SM-3,
**When** the deployment is checked,
**Then** the project is confirmed on a Vercel Pro plan (AR-7).

**Given** Speed Insights,
**When** deployed,
**Then** field CWV (LCP/CLS/INP) is collected for SM-4 (NFR-1).

### Story 6.2: Single-source App Store CTA & Coming-soon state

As a visitor ready to act,
I want the App Store call-to-action to behave honestly whether or not the app is live,
So that I'm never dumped into a broken link and my intent is still captured.

**Acceptance Criteria:**

**Given** every App Store CTA,
**When** rendered,
**Then** it derives from the single `APP_STORE_URL` constant (and derived `APP_STORE_LIVE` flag) in `src/lib/site.ts`; changing the URL to a live listing updates every CTA with no other edit (FR-23).

**Given** `APP_STORE_LIVE` is false,
**When** the CTA renders,
**Then** it shows a calm Coming-soon affordance — Apple badge artwork, not restyled — with a caption line in muted-foreground ("Coming soon to the App Store", localized, voice-compliant); it is not a `#` dead link and does not 404 (FR-24, UX-DR-5).

**Given** the Coming-soon state,
**When** encountered by assistive tech,
**Then** it is static, non-focusable content removed from the tab order, with `role="img"` and a status-inclusive accessible name (e.g. "App Store — coming soon"); it is not a focusable disabled button (UX-DR-13).

**Given** a tap on the CTA (including in the Coming-soon state),
**When** it fires,
**Then** it emits a distinct `app_store_cta_click {locale, live}` intent event via the wrapper from Story 6.1 (FR-19, FR-24).

### Story 6.3: Locale-switch event tracking

As the site maintainer (Bogdan),
I want each language switch recorded,
So that I can measure bilingual reach (SM-3).

**Acceptance Criteria:**

**Given** the locale switcher (Story 1.5) and its mobile-overlay mirror,
**When** a visitor switches locale,
**Then** a distinct `locale_switch {from, to}` event is emitted via the wrapper from Story 6.1 (FR-19).

**Given** the event,
**When** recorded,
**Then** it captures the from→to locale values (`en`|`uk`) (FR-19, AR-14).

### Story 6.4: Posture-only consent banner

As a privacy-conscious visitor,
I want a clear, non-intrusive consent choice,
So that I can see the site respects me without being walled out.

**Acceptance Criteria:**

**Given** a first visit,
**When** the page loads,
**Then** a bottom-anchored consent banner appears that does not block content or scroll and is never a full-screen wall (FR-20, UX-DR-10).

**Given** the banner,
**When** shown,
**Then** it offers equal-weight Accept and Decline, an inline link to the Cookie Policy (Epic 5), and meets touch-target/accessibility rules (UX-DR-10).

**Given** the cookieless, non-PII analytics (pageviews + FR-19 events),
**When** a visitor declines or ignores the banner,
**Then** those still record (posture-only), so SM-1/SM-3 are not suppressed (AR-10).

**Given** any future non-essential cookie or PII tracking,
**When** it would run,
**Then** it does not run before consent is given (FR-20, NFR-10).

**Given** a returning visitor whose choice is stored in the essential `mealloop_consent` cookie,
**When** they return,
**Then** they are not re-prompted unless they revoke via the footer link (FR-20, AR-12).
