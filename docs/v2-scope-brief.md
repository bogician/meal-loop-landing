# MealLoop Marketing Site — v2 Scope Brief

> Seed input for the BMad PRD workflow (`bmad-prd`). Not a formal BMad artifact —
> raw context so the PRD's coached discovery starts grounded. Created 2026-06-18.

## Context

- **Product:** MealLoop — a calm iOS weekly meal planner for small households (plan a
  week from the dishes you already cook; the grocery list writes itself). The iOS app
  is built with BMad in the sibling repo `../MealLoop`.
- **This repo (`mealloop-web`):** the marketing site. **v1 is live** — a single-page
  Next.js landing page built in one pass. It is deployed on Vercel; custom domain
  `meal-loop.com` connection is in progress.
- **v2 goal:** turn the one-shot landing page into a maintainable marketing site with
  real SEO, English + Ukrainian content, a proper brand/logo, solid mobile UX, and
  privacy-respecting analytics.

## v1 current state (what already exists)

- **Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind v4
  (CSS-first `@theme`) · shadcn/ui (nova/Radix) · Motion (Framer Motion v12) · lucide-react.
- **Sections** (`src/components/sections/`): `nav`, `hero`, `how-it-works`, `features`,
  `loop`, `screenshots`, `cta`, `footer`.
- **Visuals:** HTML/CSS iPhone mockups (`device-mockup.tsx` + `screens.tsx`) reproduce
  the Library/Planner/Groceries UI; ready to swap for real screenshots.
- **Brand:** palette + Outfit font mirror the iOS app exactly (forest-green `#3D8A5A`,
  terracotta `#D89575`, mint `#C8F0D8`, paper `#F5F4F1`); light-first, dark tokens defined.
- **CTA:** App Store badge wired to a single `APP_STORE_URL` constant in `src/lib/site.ts`
  (placeholder `#` until the listing is live).
- **Placeholder logo:** `logo.tsx` `LoopMark` is a stand-in, not a real brand mark.

## Source of truth for brand & voice

- **Visual brand:** `../MealLoop/docs/planning-artifacts/ux-designs/.../DESIGN.md` (locked palette,
  Outfit type scale, light/dark tokens). Already reflected in `src/app/globals.css`.
- **Voice (applies to BOTH languages):** `../MealLoop/docs/microcopy-voice.md` UX-DR18 rules —
  no exclamation marks, no emojis in copy, complete sentences, never blame the user, calm and
  understated ("sells less").

## Scope — five pillars for v2

### 1. SEO
- Per-locale metadata (title/description) via the Next.js App Router Metadata API.
- Canonical URLs + `hreflang` alternates for `en`/`uk`.
- Open Graph + Twitter cards backed by a real OG image (depends on pillar 3).
- `sitemap.xml` + `robots.txt` (locale-aware).
- JSON-LD structured data (Organization / SoftwareApplication / MobileApplication).
- Semantic heading structure; Core Web Vitals treated as an SEO input (overlaps mobile perf).

### 2. Internationalization — English + Ukrainian
- Locale-routed URLs (decision: subpath `/en`, `/uk` vs. detection-only — recommend subpath
  with `Accept-Language` redirect on first visit and a persisted preference).
- Library: **next-intl** is the modern App-Router-native choice (vs. next-i18next/pages).
- Locale switcher in the nav; correct `<html lang>` per locale.
- All section copy + metadata externalized to message catalogs and translated to Ukrainian.
- Default locale + fallback behavior defined.

### 3. Brand / real logo
- Replace the placeholder `LoopMark` with a real logo: wordmark + mark, light/dark variants.
- Full favicon set + Apple touch icons + the OG/social image.
- Likely designed in Figma (the Figma MCP is available) or commissioned; export SVG + PNG.

### 4. Mobile-friendliness
- Responsive QA across breakpoints — hero, device mockups, the rotating loop, screenshot grid.
- **Mobile nav:** currently the nav links are hidden under `md` with no menu — needs a
  hamburger/sheet.
- Touch targets ≥44px, no horizontal overflow, legible mobile type scale.
- Mobile performance (image sizing, font loading) — overlaps SEO/CWV.

### 5. Analytics + consent
- Privacy-friendly analytics — Vercel Analytics (integrated) or Plausible (EU/cookieless).
- GDPR/cookie-consent banner gating any non-essential cookies/analytics.
- Track App Store CTA clicks and locale switches.
- Requires real Privacy / Cookie policy pages (footer links are currently `#`).

## Tech & deployment constraints

- App Router + RSC; keep client components minimal (animations already isolated in `motion.tsx`).
- Tailwind v4 CSS-first theming — extend the existing `@theme`, don't reintroduce a JS config.
- Deployed on Vercel via GitHub integration (auto-deploy on push to `main`).
- Repo: `github.com/bogician/meal-loop-landing`.

## Out of scope for v2 (note, don't plan)

- Blog / CMS / multi-page expansion beyond the landing page.
- Waitlist / email capture (primary CTA stays the App Store badge).
- A user-facing dark-mode toggle (tokens exist; treat as optional stretch).

## Open questions for the PRD to resolve

1. i18n routing strategy (subpath vs. detection) and default locale.
2. Ukrainian copy authorship — you, a professional translator, or an AI-assisted draft you review.
3. Logo: design fresh in Figma now, or ship a refined interim wordmark and design the mark later.
4. Analytics tool: Vercel Analytics vs. Plausible.
5. Legal pages (Privacy/Terms/Cookie) — needed for consent and App Store submission anyway; who drafts them.
