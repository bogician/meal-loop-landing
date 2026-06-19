---
title: Technical-Feasibility Review — MealLoop Marketing Site v2 PRD
type: review
review-lens: technical-feasibility
reviewed: 2026-06-18
reviewer: technical-feasibility pass
target: prd.md + addendum.md
stack: Next.js 16 (App Router, RSC, Turbopack) · React 19 · TS · Tailwind v4 · shadcn/ui · Motion v12 · next-intl · Vercel Analytics · Vercel deploy
---

# Technical-Feasibility Review — MealLoop v2 PRD

**Verdict:** Feasible on the declared stack — every FR maps to a supported App-Router primitive (next-intl subpath routing, Metadata API `alternates`, `app/sitemap.ts` / `app/robots.ts`, `@vercel/analytics` `track()`, static or `next/og` OG image). The notable risks are not "can it be built" but (a) a stock-vs-fork API drift around the locale-redirect mechanism, (b) a small but real cross-feature dependency chain anchored on the brand asset lock and OG image, and (c) several FRs phrased as outcomes without a testable threshold.

Severity key: **high** = likely to block or rework if unaddressed before build; **med** = real risk / hidden dependency worth pinning now; **low** = clarity/testability polish.

---

## Findings

### Sequencing & dependencies

- **[high] Brand-asset lock is the critical-path gate for FR-13, FR-14, FR-10, and FR-9.** The OG image (FR-14) feeds social cards (FR-10); the favicon/icon set (FR-13) and OG image both derive from `brand-logo.svg` / `AppIcon.png`; FR-9 JSON-LD references the publisher mark. The PRD's own `[NOTE FOR PM]` (§4.3) flags "confirm `brand-logo.svg` is final/locked before deriving the favicon + OG set." Make this an explicit ordering constraint: **assets locked → FR-12/13/14 → FR-10 → SEO sign-off**, or accept rework. *Fix: add a "blocked-by: brand asset lock + OQ-2 (OG composition)" note to FR-10/13/14.*

- **[med] FR-10 (social cards) is blocked by Open Question 2 (OG composition), not just by FR-14.** FR-14's "documented dimensions" and FR-10's "correct image preview" can't be verified until OQ-2 ("tagline? device mockup?") is answered. *Fix: resolve OQ-2 before scheduling FR-10/14; treat OQ-2 as a build-blocker, not a parallel question.*

- **[med] FR-20 (consent) depends on the unresolved persisted-preference classification (OQ-3) and on FR-21 (Cookie Policy).** The Cookie Policy (FR-21) must describe the locale-preference cookie, but whether that cookie is "essential" (and thus outside the banner) is still open (OQ-3 / addendum). Legal copy and consent scope can't both be finalized until OQ-3 lands. *Fix: decide OQ-3 (cookie vs localStorage, essential vs non-essential) before drafting FR-21 cookie copy and wiring FR-20.*

- **[low] FR-19/FR-24 ordering is fine but coupled.** The Coming-soon CTA (FR-24) must emit the FR-19 intent event; FR-19 in turn must not fire before FR-20 consent if analytics is gated. *Fix: confirm FR-19 events are allowed to fire under the cookieless/no-consent path (see analytics finding below) so FR-24's intent count isn't silently suppressed.*

### Feasibility risk / unstated dependencies

- **[high] "next-intl middleware" terminology collides with this fork. The `middleware` convention is deprecated and renamed to `proxy` (`proxy.ts`) in this Next.js 16 build.** The addendum (§i18n) and PRD FR-2 describe the `Accept-Language` redirect "via next-intl middleware." next-intl's own middleware still ships as `middleware.ts` upstream; on this fork the locale-redirect/root-resolution layer is the **Proxy** file convention, and the bundled i18n guide shows the `Accept-Language` redirect implemented in `proxy.js` against an `app/[lang]` segment — not next-intl's middleware. *Flag for downstream architecture: verify next-intl's middleware integrates with this fork's `proxy.ts` (or that the redirect is hand-rolled in `proxy.ts`); this is the single most likely source of build-time surprise. Affects FR-1, FR-2.*

- **[med] FR-7 canonical/hreflang requires `metadataBase` to be set or the build fails.** The Metadata API resolves relative `alternates.canonical` / `alternates.languages` URLs against `metadataBase`; a relative URL-based metadata field **without** `metadataBase` is a documented build error. FR-7 demands "absolute URLs" for alternates — achievable, but only if `metadataBase` is configured (root layout) and the production origin is single-sourced. *Fix: add an NFR/constant for the canonical site origin (e.g. in `src/lib/site.ts`) and set `metadataBase`; FR-7 silently depends on it.*

- **[med] FR-2 redirect + persistence interacts with RSC caching / static prerender. The locale-less root redirect runs in Proxy (per-request), which is correct, but reading the persisted-preference cookie pulls the resolution into request-time territory.** The bundled i18n guide statically prerenders `app/[lang]` via `generateStaticParams`; a cookie read in metadata or page bodies would opt those segments out of static rendering. *Flag: keep cookie reads in Proxy (CDN-deployable) and out of the page/metadata path so `/en` and `/uk` stay statically prerendered for CWV (§10). Affects FR-2, FR-6, §10.*

- **[med] FR-14 "OG image via `next/og` ImageResponse" carries Satori constraints that fight the "reuse the iOS asset" intent.** `ImageResponse` (Satori) supports **flexbox only (no grid)**, a CSS subset, fonts must be `ttf/otf/woff`, and the whole route bundle is capped at **500KB** (incl. fonts/images). Compositing `AppIcon.png` is fine (nested images supported), but rendering the existing `brand-logo.svg` is not guaranteed (Satori's SVG support is partial). *Fix: prefer the addendum's other option — a static `opengraph-image.(png|jpg)` exported once from the locked assets — which sidesteps every Satori limit and is the lower-risk path for a brand image that rarely changes. Affects FR-14.*

- **[med] FR-18/FR-20 "no tracking cookie without consent" is trivially true for Vercel Analytics (it is cookieless), which makes the consent *gate* partly decorative — but FR-20 still asserts gating "before any non-essential tracking runs."** If the team takes the stricter reading (gate the analytics *script load* behind consent, per addendum), then FR-19 CTA/locale events will not fire for users who decline or haven't chosen — directly capping SM-1's intent signal (FR-24) and SM-3 locale share. *Fix: state explicitly whether analytics loads unconditionally (cookieless, banner is posture-only) or is consent-gated; the two readings give materially different SM-1/SM-3 data. Affects FR-18, FR-19, FR-20, SM-1, SM-3.*

- **[low] FR-8 sitemap hreflang is supported but easy to get half-right.** `app/sitemap.ts` supports per-URL `alternates.languages`, and FR-8 asks for "hreflang annotations." The Metadata `alternates` (FR-7) and sitemap `alternates` are two separate surfaces that must agree, and neither emits `x-default` automatically in the sitemap. *Fix: single-source the locale→URL map and assert FR-7 ↔ FR-8 parity (incl. legal pages) in QA. Affects FR-7, FR-8, FR-21.*

- **[low] FR-9 references the live App Store listing that does not yet exist (FR-23 placeholder).** FR-9's second consequence ("references the App Store listing once `APP_STORE_URL` is live") and the addendum's rating/price entities are explicitly post-launch. *Fix: scope FR-9 v2 acceptance to a valid JSON-LD `SoftwareApplication` + `Organization` *without* `installUrl`/rating until the listing flips, so the FR isn't blocked on OQ-1. Affects FR-9, FR-23, OQ-1.*

### Untestable / vague from an engineering standpoint

- **[med] FR-16 "render without breakage across the supported breakpoint range" has no defined range.** "Supported breakpoint range" and "common mobile widths" are undefined; "degrade gracefully" is not a pass/fail. *Fix: enumerate the QA viewport set (e.g. 320 / 360 / 390 / 768 px) and define "breakage" = horizontal overflow or clipped/illegible content. Affects FR-16, SM-4.*

- **[med] §10 CWV targets are stated but FR-16/FR-17/SM-4 don't define the measurement harness.** "Representative mid-tier device/connection" is unspecified (Lighthouse mobile preset? CrUX? which throttling?), so LCP ≤2.5s / INP ≤200ms are not independently verifiable. INP in particular depends on the Motion v12 loop animation and the mobile menu interaction. *Fix: name the tool + profile (e.g. Lighthouse mobile, simulated 4G) and lab-vs-field expectation. Affects §10, SM-4, FR-15, FR-16.*

- **[low] FR-4 "no English leakage on `/uk`" and "voice-compliant" are partly automatable, partly not.** Missing-key/fallback leakage is testable (next-intl can throw on missing messages); UX-DR18 voice compliance (no exclamation marks, never blames user) is human review, not CI. *Fix: split FR-4 acceptance into a mechanical check (no untranslated keys, no fallback-to-en at runtime) and a manual voice review gate. Affects FR-4, OQ-5.*

- **[low] FR-12 "renders crisply … and respects the dark token set" lacks a trigger definition given dark mode is a non-goal.** §5 says no dark-mode toggle and OS-driven dark is a deferred stretch; FR-12 still requires "correct light/dark rendering." If dark mode never activates in v2, the dark-variant requirement is untestable in the shipped site. *Fix: clarify whether dark variants must be wired/verifiable in v2 or are asset-only deliverables pending the stretch. Affects FR-12, §5.*

- **[low] FR-20 "does not feel like a cookie wall" / SM-C2 is a subjective acceptance criterion.** No measurable boundary distinguishes acceptable friction from a wall. *Fix: convert to concrete rules already implied — non-blocking (content reachable without choosing), dismissible, single-prompt — and drop the subjective phrasing from acceptance. Affects FR-20, SM-C2.*

### Stack makes harder than implied

- **[low] FR-3 "stays on the equivalent page" across locale switch is straightforward for one landing page but needs the next-intl pathname-aware navigation, not a naive `/en`↔`/uk` string swap, once legal pages (FR-21) exist with localized slugs.** If legal-page slugs are translated (e.g. `/uk/konfidentsiynist`), a string-replace switcher breaks. *Fix: use next-intl's locale-aware navigation/pathnames or keep legal slugs identical across locales. Affects FR-3, FR-21.*

- **[low] FR-15 mobile menu + FR-3 switcher are the only meaningfully interactive client components, which is fine, but they add to the INP budget (§10) and must be `'use client'` islands kept off the RSC default.** The architecture NFR already says "keep client components minimal." *Flag: confirm the sheet/menu (likely shadcn/ui `Sheet`, a client component) and switcher are isolated islands so the rest of the page stays RSC-static. Affects FR-15, FR-3, §10.*

---

## Summary table

| Severity | Findings (FR IDs) |
|---|---|
| **high** | Brand-lock critical path (FR-10/13/14/9); Proxy-vs-middleware fork drift (FR-1/2) |
| **med** | OG composition OQ-2 blocks FR-10/14; consent↔OQ-3↔FR-21; `metadataBase` for FR-7; FR-2 cookie vs static prerender; Satori limits on FR-14; analytics consent-gate ambiguity (FR-18/19/20); FR-16 breakpoint range; §10 CWV harness |
| **low** | sitemap↔metadata hreflang parity (FR-7/8); FR-9 pre-listing scope; FR-4 voice vs leakage split; FR-12 dark-mode trigger; FR-20 subjective wall; FR-3 localized-slug switcher; FR-15 INP island |
