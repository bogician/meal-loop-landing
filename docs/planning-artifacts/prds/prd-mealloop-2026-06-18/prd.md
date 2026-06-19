---
title: MealLoop Marketing Site — v2 PRD
status: final
created: 2026-06-18
updated: 2026-06-19
---

# PRD: MealLoop Marketing Site — v2
*Working title — confirm.*

## 0. Document Purpose

This PRD is for the builder (Bogdan) acting as PM and engineer, plus any future collaborator or downstream BMad workflow (UX, architecture, epics/stories) that picks up the v2 marketing-site work. It defines *what* v2 must achieve and *why*, not *how* to implement it — tech-how, rejected alternatives, and mechanism choices live in `addendum.md` alongside this file. It builds on the seed `docs/v2-scope-brief.md` and the iOS app's locked brand/voice sources (`../MealLoop/.../DESIGN.md` and `../MealLoop/docs/microcopy-voice.md`); it references those rather than duplicating them. Vocabulary is anchored in the Glossary (§3); features are grouped with globally numbered FRs nested under them; inferred decisions carry inline `[ASSUMPTION]` tags and are indexed in §9.

## 1. Vision

MealLoop is a calm iOS weekly meal planner for small households — plan a week from the dishes you already cook, and the grocery list writes itself. Its marketing site is the front door: the place a curious person lands from a search result or a shared link, understands the product in one calm scroll, and taps through to the App Store. Today that front door is a single-pass landing page (v1) — live on Vercel, real visuals, the right brand — but built as a one-shot artifact: English-only, thin on SEO, no analytics, no mobile menu, a placeholder logo, and legal links that go nowhere.

v2 turns that one-shot page into a maintainable, discoverable, bilingual marketing site without changing what it *is* — still one focused landing page, still one CTA (the App Store badge). The work is five pillars: real **SEO** so the page is findable; **English + Ukrainian** content so it speaks to both audiences the app serves; a **real brand mark** sourced from the iOS app instead of a placeholder; a **mobile experience** that holds up under QA on real phones; and **privacy-respecting analytics with consent** so the team can see whether the front door converts — backed by the **legal pages** that analytics, consent, and App Store submission all require.

The product's character is restraint. The voice is calm and understated — it "sells less." The visual brand is the iOS app's, pixel-aligned. v2 must scale the site up in capability while scaling *down* in noise: faster, quieter, more trustworthy, in two languages, and measurable.

## 2. Target User

### 2.1 Jobs To Be Done

- **Decide quickly whether MealLoop is for me.** A home cook in a small household feels recurring friction around "what are we eating this week" and the grocery list that follows; they want to grasp the product and judge fit in under a minute, usually on a phone.
- **Read in my language.** A Ukrainian-speaking visitor wants the page in Ukrainian, not a machine-switch afterthought — the app is bilingual, so the front door should be too. `[ASSUMPTION: the Ukrainian audience spans diaspora + Ukraine and matters enough to warrant first-class uk content, mirroring the iOS app's bilingual support.]`
- **Trust it with the basics.** A privacy-conscious visitor wants to see that the site respects them — no cookie wall, no tracking ambush, real privacy/terms pages — before they consider downloading.
- **(Builder) Ship and maintain without re-pasting strings.** Bogdan wants copy in catalogs, constants in one place, and SEO/i18n that don't rot — so future edits are content edits, not surgery.

### 2.2 Non-Users (v1/v2)

- Existing MealLoop app users seeking support or account features — this is acquisition, not a help center.
- Press/partners needing a media kit or press page — out of scope for v2.
- Speakers of languages beyond English and Ukrainian — no other locales in v2.

### 2.3 Key User Journeys

- **UJ-1. Olena finds MealLoop in Ukrainian, on her phone, from a search.**
  - **Persona + context:** Olena, cooking for a household of three, tired of re-deciding dinners every week. Ukrainian-speaking, browsing on an iPhone during a commute.
  - **Entry state:** unauthenticated, no prior visit. Arrives from an organic search result whose title/description rendered in Ukrainian.
  - **Path:** lands on `/uk` (or is redirected there from `/` by her `Accept-Language`), skims the hero, scrolls how-it-works and the loop animation, reaches the CTA.
  - **Climax:** she understands "plan from dishes you already cook, list writes itself" and taps the App Store badge.
  - **Resolution:** because the app is not yet on the store, she sees a calm Coming-soon state instead of a broken link; her Locale preference is remembered for next visit. Realizes the i18n, mobile, and CTA-state requirements.
  - **Edge case:** if her browser prefers English, the first-visit redirect still respects an explicit `/uk` link shared by a friend and does not bounce her back to `/en`.

- **UJ-2. Mark opens a shared link and decides in 40 seconds.**
  - **Persona + context:** Mark, English-speaking, sent the link by a friend who uses the app. Skeptical of "another planning app."
  - **Entry state:** unauthenticated, taps a link on mobile data; performance matters.
  - **Path:** page paints fast, hero communicates the promise, screenshots make it concrete, the loop section closes the argument.
  - **Climax:** he taps the badge to check the App Store.
  - **Resolution:** sees the Coming-soon state; the App Store CTA click is recorded as intent. Realizes the SEO/performance, mobile, analytics, and CTA requirements.

## 3. Glossary

- **Locale** — a supported language+region the site serves content in. v2 supports exactly two: `en` (English) and `uk` (Ukrainian).
- **Default locale** — the locale served when none is otherwise determined. `en`. `[ASSUMPTION: English is the default; uk is offered via routing/detection but is not the fallback.]`
- **Locale subpath** — the URL prefix that scopes a page to a Locale: `/en/...`, `/uk/...`.
- **Message catalog** — the externalized set of translatable strings for one Locale; all visible copy and metadata resolve from a catalog, never from hard-coded text.
- **Locale switcher** — the nav control that lets a visitor change Locale and persists the choice.
- **App Store CTA** — the primary (and only) call to action: the App Store badge, wired to the single `APP_STORE_URL` constant.
- **Coming-soon state** — the App Store CTA's behavior while the listing is not live (`APP_STORE_URL` is the placeholder): a calm, non-broken affordance rather than a dead link.
- **Brand mark** — the MealLoop logo symbol, sourced from the iOS app (`brand-logo.svg`); distinct from the **Wordmark** (the "MealLoop" name set in Outfit).
- **OG image** — the Open Graph / social-share preview image referenced by metadata; one of the brand assets v2 must produce.
- **Structured data** — JSON-LD markup describing the product to search engines (Organization / SoftwareApplication / MobileApplication).
- **hreflang** — the metadata signaling each page's Locale alternates (plus `x-default`) to search engines.
- **Canonical URL** — the single authoritative URL for a page, declared per Locale to prevent duplicate-content dilution.
- **Consent banner** — the UI that gathers consent before any non-essential cookie or tracking runs.
- **Non-essential cookies/tracking** — anything not strictly required to serve the site (analytics, marketing); gated behind consent.
- **Core Web Vitals (CWV)** — Google's LCP / CLS / INP performance signals, treated here as both UX quality and an SEO input.

## 4. Features

### 4.1 Internationalization (English + Ukrainian)

**Description:** The site serves all content in two Locales via Locale subpaths, with first-visit language detection, a persisted preference, and a Locale switcher in the nav. All visible copy and metadata move out of components into Message catalogs; Ukrainian is produced by AI-assisted translation of the English source against the UX-DR18 voice rules and reviewed by Bogdan. Correct `<html lang>` is emitted per Locale. Realizes UJ-1.

**Functional Requirements:**

#### FR-1: Locale-subpath routing
The site serves every page under a Locale subpath (`/en`, `/uk`), using next-intl on the App Router.

**Consequences (testable):**
- `/en` and `/uk` each render the full landing page in the correct language.
- A request to a Locale-less path (`/`) resolves to a Locale rather than 404.
- Internal links and the App Store CTA preserve the active Locale.

#### FR-2: First-visit detection + persisted preference
On a visitor's first arrival at the Locale-less root, the system selects a Locale from the `Accept-Language` header (defaulting to `en` when no supported match), redirects to that subpath, and persists the choice for subsequent visits.

**Consequences (testable):**
- A browser preferring Ukrainian landing on `/` is redirected to `/uk`; one preferring English (or anything unsupported) goes to `/en`.
- A returning visitor is served their persisted Locale regardless of `Accept-Language`.
- An explicit `/uk` or `/en` link is always honored and updates the persisted preference (realizes UJ-1 edge case).

#### FR-3: Locale switcher
A control in the nav lets the visitor switch Locale at any time; switching updates the URL subpath, persists the new preference, and stays on the equivalent page.

**Consequences (testable):**
- Switching from `/en` to `/uk` (and back) re-renders the same section in the other language without a full re-navigation to home.
- The switcher indicates the active Locale.
- The switcher meets the touch-target and accessibility requirements in §10.

#### FR-4: Externalized, translated content
All visible copy and metadata resolve from Message catalogs; no user-visible string is hard-coded in a component. Ukrainian catalogs are complete and voice-compliant.

**Consequences (testable):**
- Every section (`nav`, `hero`, `how-it-works`, `features`, `loop`, `screenshots`, `cta`, `footer`) renders with no English leakage on `/uk`.
- Adding or editing copy is a catalog edit, not a component edit.
- A missing `uk` string falls back to the `en` value (never an empty render or the raw key), defining the fallback behavior at string granularity.
- Ukrainian copy obeys UX-DR18: no exclamation marks, no emojis, complete sentences, never blames the user (see §11).

#### FR-5: Correct per-Locale language attributes
The document `<html lang>` matches the active Locale on every page.

**Consequences (testable):**
- `/uk` emits `lang="uk"`; `/en` emits `lang="en"`.

**Out of Scope:** locales beyond `en`/`uk`; region variants (e.g. `en-GB`); right-to-left layouts.

### 4.2 SEO & Discoverability

**Description:** v2 makes the page findable and correctly represented in search and social. Per-Locale metadata, Canonical URLs with hreflang alternates, a Locale-aware sitemap and robots, JSON-LD Structured data, semantic headings, and social cards (OG/Twitter) backed by a real OG image. CWV is treated as an SEO input and is specified in §10. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-6: Per-Locale metadata
Each Locale's page exposes its own title and description via the App Router Metadata API, resolved from the Message catalog.

**Consequences (testable):**
- `/en` and `/uk` return distinct, language-correct `<title>` and `<meta description>`.

#### FR-7: Canonical + hreflang alternates
Each page declares a self-referential Canonical URL and `hreflang` alternates for `en` and `uk` plus `x-default`.

**Consequences (testable):**
- `/uk` lists `en`, `uk`, and `x-default` alternates pointing at the correct absolute URLs.
- No page omits its own canonical.

#### FR-8: Locale-aware sitemap + robots
The site serves `sitemap.xml` enumerating both Locale URLs and a `robots.txt` that allows crawling and points to the sitemap.

**Consequences (testable):**
- `sitemap.xml` includes `/en` and `/uk` (and any legal pages) with hreflang annotations.
- `robots.txt` references the sitemap and does not block indexable content.

#### FR-9: Structured data (JSON-LD)
The home page emits JSON-LD describing the product and publisher (Organization and an application type — see addendum for the SoftwareApplication/MobileApplication choice).

**Consequences (testable):**
- JSON-LD validates against schema.org with no errors in a structured-data test.
- The application entity references the (eventual) App Store listing once `APP_STORE_URL` is live.

#### FR-10: Social cards + OG image
Each Locale page exposes Open Graph and Twitter card metadata backed by a real OG image (produced in §4.3).

**Consequences (testable):**
- Sharing `/en` or `/uk` renders a correct title, description, and image preview in a card validator.
- The OG image reflects the real Brand mark, not the placeholder.

#### FR-11: Semantic heading structure
Each page uses a single `<h1>` and a logical heading hierarchy across sections.

**Consequences (testable):**
- One `<h1>` per page; no skipped heading levels flagged by an accessibility/SEO audit.

### 4.3 Brand Identity & Assets

**Description:** v2 replaces the placeholder `LoopMark` with the real MealLoop brand, sourced from the iOS app rather than designed fresh. The existing `brand-logo.svg` and `AppIcon.png` (`../MealLoop/MealLoop/Resources/Assets.xcassets/`) are adapted into a web asset set: Wordmark + Brand mark with light/dark variants, a full favicon and Apple-touch-icon set, and the OG image that SEO and social cards depend on. Realizes the trust JTBD; unblocks FR-10.

**Functional Requirements:**

#### FR-12: Real Brand mark in nav + footer
The placeholder `LoopMark` is replaced site-wide by the real Brand mark / Wordmark, with correct light/dark rendering.

**Consequences (testable):**
- No instance of the placeholder mark remains in the shipped site.
- The mark renders from a vector source (SVG) at nav and footer sizes with no rasterization, and resolves to the correct light/dark token variant per appearance.

#### FR-13: Favicon + app icon set
A complete favicon set and Apple touch icons are generated from the brand assets and wired into the document head.

**Consequences (testable):**
- Browser tab, bookmark, and iOS "add to home screen" all show the MealLoop icon, not the Next.js/placeholder default.

#### FR-14: OG / social image
A real OG image is produced from the brand assets and referenced by FR-10 metadata.

**Consequences (testable):**
- The OG image exists at the documented dimensions and renders in card validators for both Locales.

**Notes:** `[NOTE FOR PM]` The brand assets are this feature's critical path: confirm the iOS app's `brand-logo.svg` is final/locked **before** deriving anything, because FR-13 (favicons), FR-14 (OG image), and FR-9 (JSON-LD logo reference) all derive from it, and FR-14 in turn unblocks FR-10 (social cards). A late change to the source mark forces regenerating the whole set. Build order: lock assets → FR-12/FR-13/FR-14 → FR-9/FR-10.

### 4.4 Mobile Experience & Responsive QA

**Description:** v2 makes the site hold up on real phones. The headline gap is the nav: links are hidden under `md` with no menu — v2 adds a mobile menu. Plus responsive QA across all sections, ≥44px touch targets, no horizontal overflow, a legible mobile type scale, and mobile-tuned image/font loading (overlaps §10 CWV). Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-15: Mobile navigation menu
Below the `md` breakpoint, the nav exposes the navigation links (and the Locale switcher) through a hamburger/sheet menu.

**Consequences (testable):**
- All `NAV_LINKS` and the Locale switcher are reachable on a small viewport.
- The menu opens/closes accessibly (focus management, escape/overlay dismiss) and meets touch-target rules.

#### FR-16: Responsive integrity across sections
Hero, device mockups, the rotating loop, the screenshot grid, and the CTA render without breakage across the supported breakpoint set (§10).

**Consequences (testable):**
- No horizontal scroll or element overflow at any width in the supported breakpoint set (§10), verified at the 320px floor.
- Animated/interactive sections remain fully readable and operable on small viewports and contribute no layout shift beyond the §10 CLS budget.

#### FR-17: Touch targets + mobile type scale
Interactive elements meet a ≥44px touch target; body and heading type remain legible on mobile.

**Consequences (testable):**
- All buttons/links/switcher controls satisfy the ≥44px minimum.
- Body text renders at ≥16px on mobile (the §10 baseline), so no section triggers iOS tap-to-zoom or sub-legible copy.

### 4.5 Privacy Analytics & Consent

**Description:** v2 adds privacy-respecting measurement so the team can judge whether the front door converts. Vercel Analytics (already integrated, cookieless) tracks pageviews plus the two custom events that matter — App Store CTA clicks and Locale switches. A Consent banner gates any Non-essential cookies/tracking, satisfying GDPR for the EU + Ukrainian audience. Feeds all Success Metrics (§7). Realizes UJ-2.

**Functional Requirements:**

#### FR-18: Privacy-friendly analytics
The site uses Vercel Analytics to measure traffic without setting tracking cookies.

**Consequences (testable):**
- Pageviews are recorded per Locale.
- No tracking cookie is set in the absence of consent (see FR-20).

#### FR-19: Conversion + locale event tracking
The App Store CTA click and the Locale switch are tracked as custom events.

**Consequences (testable):**
- Tapping the App Store CTA (including in the Coming-soon state) emits a distinct, countable event.
- Switching Locale emits a distinct event capturing from→to.

#### FR-20: Consent gating
A Consent banner gathers consent before any cookie-setting or PII tracking runs; the choice is remembered and revocable. Because the chosen analytics (Vercel Analytics) is cookieless and stores no PII, baseline pageviews and the FR-19 intent events are not gated by consent — so measurement of SM-1/SM-3 is not suppressed for visitors who decline.

**Consequences (testable):**
- No cookie-setting or PII tracking runs before consent is given.
- Cookieless, non-PII analytics (pageviews + FR-19 events) record regardless of the consent choice, so declining does not zero out the conversion/locale metrics.
- The banner does not block content, meets touch-target/accessibility rules, and offers a clear accept/decline.
- A returning visitor is not re-prompted unless they revoke.

**Notes:** `[NOTE FOR PM]` This adopts the defensible reading that cookieless, non-PII analytics may run under legitimate interest without prior consent. If legal review later requires gating analytics itself, FR-19 events would be lost for non-consenters and SM-1/SM-3 would undercount — revisit the metric definitions then.

### 4.6 Legal Pages

**Description:** v2 ships real Privacy, Terms, and Cookie pages — required by the Consent banner, by analytics, and by App Store submission. Drafted from a template tailored to this site (Vercel Analytics, App Store, GDPR) and reviewed by Bogdan. Footer links currently point to `#` and must resolve. Realizes the trust JTBD; unblocks FR-20 and (downstream) App Store submission.

**Functional Requirements:**

#### FR-21: Privacy, Terms, Cookie pages
The site serves Privacy Policy, Terms, and Cookie Policy pages, per Locale, with content resolved from catalogs.

**Consequences (testable):**
- Each page exists at a stable URL for both Locales and renders translated content.
- Pages describe the actual data practices (Vercel Analytics, consent, no email capture).

#### FR-22: Footer legal links resolve
Footer links to the legal pages point to the real pages, not `#`.

**Consequences (testable):**
- No footer legal link is a dead `#` anchor.
- The Privacy Policy URL is available for reuse in the App Store listing.

### 4.7 Conversion & CTA

**Description:** The App Store CTA is the site's single conversion point and the north-star (§7). Because the app is not yet submitted, `APP_STORE_URL` remains a placeholder and the CTA renders a Coming-soon state instead of a dead link — but still records intent. When the listing goes live, flipping the single constant lights up every CTA. Realizes UJ-1, UJ-2.

**Functional Requirements:**

#### FR-23: Single-source App Store CTA
Every App Store CTA derives from the single `APP_STORE_URL` constant (and the derived `APP_STORE_LIVE` flag).

**Consequences (testable):**
- Changing `APP_STORE_URL` to a live listing updates every CTA instance with no other edit.

#### FR-24: Coming-soon state
While `APP_STORE_LIVE` is false, the CTA renders a calm Coming-soon affordance (not a broken link) and still emits the FR-19 click event as intent.

**Consequences (testable):**
- With the placeholder URL, tapping the CTA does not 404 or open `#`; it shows the Coming-soon state.
- The Coming-soon interaction is counted as a conversion-intent event.
- Copy for the state obeys UX-DR18 voice (§11).

**Out of Scope:** `[NON-GOAL for MVP]` email/waitlist capture on the Coming-soon state — the CTA stays the App Store badge; no email collection.

## 5. Non-Goals (Explicit)

- **No blog, CMS, or multi-page expansion** beyond the landing page and the legal pages.
- **No waitlist / email capture** — the primary CTA stays the App Store badge.
- **No user-facing dark-mode toggle** — dark tokens exist; treat an automatic/OS-driven appearance as an optional stretch, not a v2 commitment.
- **No locales beyond English and Ukrainian.**
- **No support/help/account surfaces** — this is an acquisition site, not a product console.
- **No net-new logo design** — v2 reuses and adapts the iOS app's existing brand assets.

## 6. MVP Scope

### 6.1 In Scope (single v2 release)
- i18n: `/en` + `/uk` subpaths, detection + persistence, switcher, fully translated catalogs (FR-1–FR-5).
- SEO: per-Locale metadata, canonical+hreflang, sitemap/robots, JSON-LD, semantic headings, social cards (FR-6–FR-11).
- Brand: real mark site-wide, favicon/app-icon set, OG image (FR-12–FR-14).
- Mobile: mobile menu, responsive QA, touch targets + type scale (FR-15–FR-17).
- Analytics + consent: cookieless analytics, CTA + locale events, consent banner (FR-18–FR-20).
- Legal: Privacy/Terms/Cookie pages, resolved footer links (FR-21–FR-22).
- Conversion: single-source CTA + Coming-soon state (FR-23–FR-24).

### 6.2 Out of Scope for MVP
- Real device screenshots replacing the HTML/CSS mockups — `[NOTE FOR PM]` the mockups are "ready to swap"; swapping is a content task that can follow v2 if listing assets aren't ready.
- Automatic OS-driven dark appearance — deferred stretch; tokens already exist.
- Additional structured-data types (FAQ, Breadcrumb) beyond the core product/publisher entities.
- Performance instrumentation beyond CWV (e.g. RUM dashboards).

## 7. Success Metrics

**Primary**
- **SM-1: App Store CTA click-through rate** — App Store CTA clicks ÷ unique visitors (FR-19 event ÷ FR-18 unique visitors). North-star (per decision). **Interim form (pre-listing):** the same ratio measured against Coming-soon CTA interactions — fully measurable now, read as a conversion-intent trend rather than against an absolute target. **Live form:** `[ASSUMPTION: target ≥10% once the listing is live.]` Validates FR-23, FR-24, FR-19.

**Secondary**
- **SM-2: Organic discoverability** — organic sessions and count of indexed pages for both Locales. `[ASSUMPTION: target is positive growth across the first 90 days post-launch, with both `/en` and `/uk` indexed.]` Validates FR-6–FR-11.
- **SM-3: Bilingual reach** — share of sessions on `/uk` vs `/en`, confirming the Ukrainian audience is real and served. Validates FR-1–FR-4, FR-19 (locale events).
- **SM-4: Mobile quality** — Core Web Vitals pass rate (LCP/CLS/INP within §10 targets) on mobile, and zero horizontal-overflow defects in QA. Validates FR-15–FR-17, §10.

**Counter-metrics (do not optimize)**
- **SM-C1: Time-on-page / scroll depth** — do *not* optimize upward; a visitor who converts to the store in 30 seconds is a success, not a failure. Counterbalances any temptation to inflate engagement at SM-1's expense.
- **SM-C2: Consent-prompt friction** — do *not* let consent UX suppress measurable engagement or feel like a cookie wall; a high decline rate is acceptable, a tanked experience is not. Counterbalances FR-20.
- **SM-C3: Keyword density** — do *not* keyword-stuff copy for SM-2; the calm UX-DR18 voice (§11) outranks SEO phrasing. Counterbalances SM-2.

## 8. Open Questions

1. **App Store listing date.** When the iOS listing goes live, `APP_STORE_URL` flips and SM-1 becomes a hard target; until then SM-1 is intent-only. Owner: Bogdan. Revisit: at app submission.
2. **OG image composition.** Beyond "uses the real mark," what does the social card actually show (tagline? device mockup?) — a small design decision dependent on the locked brand assets.
3. **Persisted-preference mechanism.** Cookie vs. `localStorage` for the Locale preference, and whether that choice itself is "essential" (affects whether it sits behind the Consent banner). Detailed in addendum; confirm during build.
4. **Legal-page jurisdiction scope.** Which jurisdictions the AI-drafted Privacy/Terms must name (EU/GDPR + Ukraine assumed); revisit if distribution targets change.
5. **uk translation review loop.** Bogdan reviews AI-translated Ukrainian — is a second native reviewer wanted before launch for the voice-sensitive hero copy?

## 9. Assumptions Index

- §2.1 / §3 — The Ukrainian audience (diaspora + Ukraine) warrants first-class `uk` content mirroring the app's bilingual support.
- §3 — `en` is the Default locale and fallback; `uk` is offered but not the fallback.
- §4.1 (FR-2) — First-visit detection uses `Accept-Language` with `en` as the no-match default, plus a persisted preference.
- §7 (SM-1) — Target click-through ≥10% once live; intent-tracking only until the listing exists.
- §7 (SM-2) — Success window for organic growth is the first 90 days post-launch, both Locales indexed.
- §6.2 — Real screenshots can follow v2; HTML/CSS mockups ship as-is in v2.
- §4.5 (FR-20) — Cookieless, non-PII analytics may run under legitimate interest without prior consent; the banner gates any cookie-setting/PII tracking and provides transparency. Revisit if legal review requires gating analytics itself.
- §10 — Standard "good" CWV thresholds (LCP ≤2.5s / CLS ≤0.1 / INP ≤200ms) adopted as the mobile performance targets.

## 10. Cross-Cutting NFRs

- **Performance / CWV:** mobile LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on a representative mid-tier device/connection. `[ASSUMPTION: standard "good" CWV thresholds adopted as targets.]` Image sizing and font loading tuned for mobile. Measured via Vercel Speed Insights and/or Lighthouse mobile in CI; CWV is an SEO input (FR-6–FR-11) and a mobile-quality metric (SM-4).
- **Responsive baseline:** supported breakpoint set follows Tailwind defaults — base/`sm`/`md`/`lg`/`xl` — with a **320px minimum width floor** and no upper-bound breakage; body text ≥16px on mobile. FR-16/FR-17 verify against this set.
- **Accessibility:** WCAG 2.1 AA intent — semantic landmarks, keyboard-operable nav/menu/switcher, visible focus, ≥44px touch targets, sufficient contrast in light and dark tokens.
- **Architecture constraints:** Next.js 16 App Router + RSC; keep client components minimal (animations already isolated in `motion.tsx`); Tailwind v4 CSS-first `@theme` (extend existing tokens, no JS config reintroduced); next-intl for i18n.
- **Maintainability:** all copy in Message catalogs; site constants single-sourced in `src/lib/site.ts`; CTA single-sourced via `APP_STORE_URL`.
- **Deployment:** Vercel via GitHub auto-deploy on push to `main` (repo `github.com/bogician/meal-loop-landing`); v2 must not break the existing deploy pipeline.
- **SEO hygiene:** one `<h1>` per page, valid structured data, no duplicate-content signals across Locales (canonical + hreflang correct).

## 11. Aesthetic, Tone & Brand Constraints

- **Voice (both languages), per `../MealLoop/docs/microcopy-voice.md` UX-DR18:** no exclamation marks; no emojis in copy; complete sentences; never blame the user; calm and understated — "sells less." This governs English source copy, Ukrainian translation, the Coming-soon state, and the consent/legal copy.
- **Visual brand, per the iOS app `DESIGN.md` (already reflected in `globals.css`):** forest-green `#3D8A5A`, terracotta `#D89575`, mint `#C8F0D8`, paper `#F5F4F1`; Outfit type scale; light-first with dark tokens defined. v2 extends, never diverges from, this system.

## 12. Constraints & Guardrails — Privacy & Compliance

- **Privacy posture:** cookieless analytics by default; no PII capture (no email/waitlist); Non-essential tracking gated by the Consent banner.
- **GDPR / ePrivacy:** EU + Ukrainian audience; consent obtained before any non-essential cookie/tracking; clear accept/decline; revocable; documented in the Cookie Policy.
- **App Store dependency:** a public Privacy Policy URL is required for App Store submission — FR-21/FR-22 deliver it, making the legal pages a launch dependency for *both* the site and the app listing.
