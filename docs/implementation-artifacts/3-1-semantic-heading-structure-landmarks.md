---
baseline_commit: ded23c59839db6b68a5a69f42e29373cb884beb0
---

# Story 3.1: Semantic heading structure & landmarks

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a search engine and an assistive-tech user,
I want one clear page heading and a logical structure,
so that the page is correctly indexed and navigable.

## Acceptance Criteria

1. **Single `<h1>` + clean hierarchy** — Given any landing page (`/en`, `/uk`), when rendered, then it has exactly one `<h1>` (the hero promise) and a logical heading hierarchy with **no skipped levels** (FR-11, NFR-7).
2. **Landmarks present** — Given the page, when inspected, then the landmarks `<header>`/nav, `<main>`, and `<footer>` are present (NFR-3).
3. **Audit clean** — Given an accessibility/SEO audit, when run, then **no skipped-heading-level or missing-landmark issue is flagged** (FR-11). This includes the two `<nav>` landmarks being **uniquely named** so they are distinguishable.
4. **Decorative mockups + loop are `aria-hidden`** — Given the device mockups and the loop animation, when the section renders, then they are `aria-hidden` from the accessibility tree **only because** the surrounding section heading + body convey the product value independently; any post-v2 real screenshot will require descriptive `alt` text or a visually-hidden caption per screen (UX-DR-19).

## Tasks / Subtasks

- [x] **Task 1 — Demote decorative mockup screen titles from `<h3>` to a non-heading element (AC: #1, #3)**
  - [x] In `src/components/screens.tsx`, change the `<h3>` in `ScreenHeader` (line 33) to a `<p>` (or `<span>`), keeping the exact same classes (`font-heading text-[1.6rem] font-bold leading-none tracking-tight text-foreground`). The screen titles ("Your Dishes" / "This Week" / "Groceries") are decorative device chrome, **not** document headings.
  - [x] Confirm no other heading tags exist inside the mockup subtree (only `ScreenHeader` carries one).
  - [x] Rationale: as `<h3>`, the hero's planner mockup title renders an `<h3>` immediately after the hero `<h1>` with no intervening `<h2>` → a skipped level. Demoting also keeps the **raw-HTML heading outline** clean for SEO/heading-map tools, which ignore `aria-hidden` (see Dev Notes → "Why both fixes").

- [x] **Task 2 — `aria-hidden` the decorative device mockups (AC: #4)**
  - [x] In `src/components/device-mockup.tsx`, add `aria-hidden` to the root wrapper `<div>` (line 14). This single change covers **both** consumers — the hero mockup and all three Screenshots mockups.
  - [x] Verify the captions in `src/components/sections/screenshots.tsx` (the `<p>` at line 33) stay **outside** `DeviceMockup` so they remain in the accessibility tree (they do — captions are siblings of the mockup, not children).
  - [x] Verify nothing focusable lives inside the mockups (they are divs/spans/SVGs only — no links/buttons), so `aria-hidden` will not orphan a focusable control.

- [x] **Task 3 — `aria-hidden` the loop animation diagram (AC: #4)**
  - [x] In `src/components/sections/loop.tsx`, add `aria-hidden` to the decorative diagram container — the `<div className="relative mx-auto flex h-72 w-72 ...">` (line 22) that holds the rotating dashed ring, the centered `BrandMark`, and the four `cook/plan/shop/repeat` node pills. Do **not** aria-hide the whole section — the `<h2>` + body must stay in the tree.
  - [x] Confirm `loop.body` conveys the cook→plan→shop→repeat cycle independently (it does: "Most weeks you cook the same handful of meals … Duplicate a week you liked …"); the node-pill words are a visual restatement, so hiding them loses no unique information (SF3 / 1.1.1).

- [x] **Task 4 — Label the primary nav landmark (AC: #2, #3) — deferred here from Story 1.5**
  - [x] Add a new key `nav.label` to **both** `messages/en.json` and `messages/uk.json` (AR-15: identical camelCase key trees, no uk-only keys). Suggested values: en `"Main"`, uk `"Основна"` (screen readers announce it as "{label} navigation"). Flag the uk wording for the UX-DR-21 native-speaker pass.
  - [x] In `src/components/sections/nav.tsx`, add `aria-label={t("label")}` to the `<nav>` at line 11 (`t` = `getTranslations("nav")`, already in scope). This uniquely names the primary nav so it is distinguishable from the locale-switcher's `<nav aria-label={t("label")}>` ("Language" / "Мова") in screen-reader landmark lists.

- [x] **Task 5 — Verify heading outline, landmarks & audits (AC: #1, #2, #3)**
  - [x] Run the quality gate: `npm run build` (runs `tsc --noEmit`) + ESLint must pass.
  - [x] Inspect the rendered DOM heading outline on `/en` **and** `/uk`: exactly one `<h1>`; the sequence is `h1` (hero) → `h2` (how-it-works) → `h3`×3 → `h2` (features) → `h3`×4 → `h2` (loop) → `h2` (screenshots) → `h2` (cta), with **no skipped levels** and **no mockup/loop headings** in the outline.
  - [x] Confirm landmarks: one `<header>` with the primary `<nav>`, one `<main>`, one `<footer>`; the two `<nav>` landmarks have distinct accessible names.
  - [x] Run axe DevTools (or Lighthouse a11y + SEO) on a built page and confirm **no** `heading-order`, `page-has-heading-one`, `landmark-unique`, or `landmark-one-main` findings. **Headless-env note:** if a real browser/axe run is not possible in this environment, record it as an outstanding human follow-up (consistent with the Epic 1 AI-limit pattern) — do **not** claim it as machine-verified. → **Recorded as human follow-up** (see Completion Notes); structural outline + landmark uniqueness machine-verified from prerendered HTML instead.

### Review Findings

_Adversarial code review (Blind Hunter + Edge Case Hunter + Acceptance Auditor), 2026-06-23. Outcome: 0 decision-needed, 0 patch, 2 deferred, 11 dismissed as noise / false-positives. No blocking issues; the Acceptance Auditor confirmed all 4 ACs and every "do NOT" guardrail; the Edge Case Hunter found no unhandled paths (no focusable elements inside the `aria-hidden` subtrees, catalogs key-tree-identical)._

- [x] [Review][Defer] uk nav landmark label "Основна" wording — native-speaker review [messages/uk.json:4] — deferred: a bare feminine adjective, announced by screen readers as "Основна навігація"; idiomatic phrasing should be confirmed. Already flagged in the story for the UX-DR-21 native-speaker pass — recorded here so the reviewer concurrence isn't lost. en "Main" is conventional and fine.
- [x] [Review][Defer] Loop ring infinite rotation has no `prefers-reduced-motion` guard [src/components/sections/loop.tsx:29] — deferred, pre-existing: the decorative ring spins `rotate:360`, `repeat:Infinity` (40s linear). The `aria-hidden` added by this story removes it from the a11y tree but does nothing for motion-sensitive users who still see the spin. The animation predates this story (the diff only added `aria-hidden` to the container), so it is out of 3.1's semantic/ARIA scope — belongs with Epic 4 Story 4-2 (motion safety to the 320px floor), which should add a `useReducedMotion()` guard.

## Dev Notes

### What this story is (and is not)

This is a **semantic-HTML / ARIA hygiene** story on the existing landing page — pure JSX changes to heading tags and `aria-hidden`/`aria-label` attributes, plus two catalog keys. There is **no** Next.js framework API surface here (no routing/metadata/middleware), so the `AGENTS.md` "read `node_modules/next/dist/docs/` first" mandate does not bite — but do not introduce framework changes to satisfy it. Per-locale metadata, canonical, hreflang, sitemap, JSON-LD, and OG metadata are **separate stories (3.2–3.5)** — do not touch them here.

### Current state (audited 2026-06-22) — what exists today

**The single `<h1>` already exists** — `src/components/sections/hero.tsx:26` is the only `<h1>` on the home page (`not-found.tsx` is a different page with its own single `<h1>`). So AC1's "exactly one `<h1>`" is **already satisfied**; the work is fixing the *hierarchy around it*.

Home-page composition (`src/app/[locale]/page.tsx`): `<Nav>` → `<main>`( `<Hero>` `<HowItWorks>` `<Features>` `<Loop>` `<Screenshots>` `<CTA>` ) → `<Footer>`.

Heading tags in DOM order **as they render today**:

| # | Tag | Source | Real heading? |
|---|-----|--------|---------------|
| 1 | `h1` | `hero.tsx:26` (headline) | ✅ yes |
| 2 | `h3` | `screens.tsx:33` — "This Week" inside the hero's `PlannerScreen` mockup | ❌ decorative → **causes h1→h3 skip** |
| 3 | `h2` | `how-it-works.tsx:18` | ✅ |
| 4 | `h3`×3 | `how-it-works.tsx:28` (steps) | ✅ |
| 5 | `h2` | `features.tsx:19` | ✅ |
| 6 | `h3`×4 | `features.tsx:31` (cards) | ✅ |
| 7 | `h2` | `loop.tsx:16` | ✅ |
| 8 | `h2` | `screenshots.tsx:24` | ✅ |
| 9 | `h3`×3 | `screens.tsx:33` — "Your Dishes"/"This Week"/"Groceries" inside the three Screenshots mockups | ❌ decorative |
| 10 | `h2` | `cta.tsx:13` | ✅ |

The **only** heading defect is the decorative `<h3>` in `ScreenHeader` (`screens.tsx`), reused by the hero and all three screenshots mockups. Fixing that one component (Task 1) removes rows 2 and 9 from the outline and yields a clean `h1 → h2 → h3` structure.

Landmarks present today: `<header>`+`<nav>` (`nav.tsx:10-11`), `<main>` (`page.tsx:23`), `<footer>` (`footer.tsx:10`). **AC2 is largely satisfied** — the gap is AC3's uniqueness rule: there are **two** `<nav>` landmarks (the primary nav + the locale switcher's `<nav aria-label>`), and the primary one is **unnamed** → axe `landmark-unique`. Task 4 closes this.

### Why both fixes (demote `<h3>` AND `aria-hidden`) — they are not redundant

- `aria-hidden` (Task 2/3) removes the mockup/loop subtree from the **accessibility tree** → satisfies AC4 and clears axe's a11y-tree heading checks.
- Raw-HTML SEO heading-outline tools (Lighthouse SEO, HeadingsMap, crawlers) parse the **DOM source** and **do not honor `aria-hidden`** — they would still see the `<h3>` and flag the h1→h3 skip. So the `<h3>`→`<p>` demotion (Task 1) is independently required for AC1/AC3.

Both are warranted; apply both.

### Files to touch

- `src/components/screens.tsx` — UPDATE: `ScreenHeader` `<h3>` → `<p>` (decorative title). Keep classes identical.
- `src/components/device-mockup.tsx` — UPDATE: add `aria-hidden` to the root `<div>`.
- `src/components/sections/loop.tsx` — UPDATE: add `aria-hidden` to the diagram container `<div>` (line 22).
- `src/components/sections/nav.tsx` — UPDATE: add `aria-label={t("label")}` to the `<nav>`.
- `messages/en.json` — UPDATE: add `nav.label`.
- `messages/uk.json` — UPDATE: add `nav.label` (mirror — AR-15).

### Architecture & convention guardrails (must follow)

- **Accessibility contract (architecture.md §Patterns):** "One `<h1>` per page; landmarks `<header>`/`<main>`/`<footer>`." Implement verbatim; do not invent extra structure.
- **RSC boundary (project-context):** Do **not** add `'use client'`. `device-mockup.tsx` and `screens.tsx` are server-compatible and consumed by both client islands (`hero.tsx`, `screenshots.tsx`, `loop.tsx`) and server components — keep them isomorphic (no hooks, no browser APIs). `nav.tsx` and `footer.tsx` are RSC (`getTranslations`); leave them server-side.
- **Tokens, not hex:** no styling changes needed; if you touch classes, use `globals.css` tokens via existing utilities — never raw hex.
- **shadcn/`ui/*` untouched:** this story does not touch `ui/*` or `utils.ts`.
- **Catalog discipline (AR-15):** `messages/en.json` and `messages/uk.json` must keep identical key trees. Add `nav.label` to **both**; never create a uk-only key. Existing `nav` keys: `home`, `links.{howItWorks,features,loop}`, `getApp`.

### Decisive scope boundaries — do NOT do these

- **Do not** add `aria-labelledby`/`aria-label` to the `<section>` elements to promote them to region landmarks. AC2 requires only header/nav, main, footer; extra regions add screen-reader noise and are not requested.
- **Do not** add a skip-to-content link (2.4.1 Bypass Blocks) — not in these ACs; leave for a future a11y story if raised.
- **Do not** modify `not-found.tsx` — it is a separate page (not a landing page in AC scope) and already has a valid single-`<h1>`+`<main>` structure.
- **Do not** change the visual type ramp or heading sizes (per accessibility-review N3: the ramp is *visual, not structural* — an `<h3>` styled large is fine; an actual level skip is not).
- **Do not** touch metadata/canonical/hreflang/OG/JSON-LD/sitemap — those are Stories 3.2–3.5.

### Previous-story intelligence (Epic 1 & 2)

- **Deferred directly into this story (Story 1.5 code review, 2026-06-19):** *"Outer header `<nav>` (`nav.tsx:11`) is an unlabeled landmark … a screen-reader landmark list now shows two navigation regions with the primary one unnamed. Proper fix = add an `aria-label` to the main nav backed by a new `nav` catalog key — **belongs with Epic 3.1**."* → This is **Task 4**. It is an explicit, in-scope obligation, not optional polish.
- **Catalog editing pattern (Stories 1.3/1.4):** copy is externalized to `messages/*.json`; components read via `useTranslations`/`getTranslations`. The brand font is **Manrope** (with `cyrillic` subset, `layout.tsx:11-14`), not Outfit — ignore stale Outfit references in older planning docs.
- **Headless-env limit (Epic 1 pattern, carried through 2.1/2.3):** live in-browser AT/axe/visual passes are recorded as human follow-ups when the agent runs headless; structural/build verification is what the agent claims. Apply the same honesty here for Task 5's axe/Lighthouse run.

### Accessibility-review backing (review-accessibility.md)

- **SF3** (device mockups): "`aria-hidden` is correct … add an explicit rule: the surrounding section heading + body must convey the product value independently, so the mockups can be safely `aria-hidden`. For the post-v2 real-screenshot swap, require descriptive `alt` text or a visually-hidden caption per screen." → exactly AC4 / UX-DR-19.
- **N3** (heading structure): spec is "correct and complete … One small watch-item: ensure the *visual* size sharing doesn't lead a builder to skip a level." → reinforces the demote-not-restyle approach in Task 1.

### Verification standard (AR-13)

Quality gate is `tsc --noEmit` (via `next build`) + ESLint — **no test runner exists**; do not add Jest/Vitest or write `*.test.tsx`. A11y verification is manual (axe DevTools / Lighthouse) across the rendered `/en` and `/uk` pages; the 320/360/390/768px responsive set is unaffected by this story (no layout change) but the heading/landmark audit applies to both locales.

### Project Structure Notes

All touched files sit in their conventional locations (`src/components/`, `src/components/sections/`, `messages/`). No new files, no new directories, no new dependencies. Files are kebab-case; exports PascalCase — no new exports introduced. No conflicts with the unified structure.

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.1: Semantic heading structure & landmarks] — ACs (FR-11, NFR-3, NFR-7, UX-DR-19).
- [Source: docs/planning-artifacts/architecture.md#Accessibility contract] (lines 389–400) — "One `<h1>` per page; landmarks `<header>`/`<main>`/`<footer>`."
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/review-accessibility.md#SF3] — device-mockup `aria-hidden` + section-copy-stands-alone rule.
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/review-accessibility.md#N3] — heading structure correct; ramp is visual not structural.
- [Source: docs/implementation-artifacts/deferred-work.md#Deferred from: code review of 1-5-locale-switcher] — primary `<nav>` aria-label deferred to Epic 3.1.
- [Source: docs/project-context.md] — Tailwind v4 tokens, RSC boundary, catalog discipline, lean quality gate.
- Current code: `src/components/sections/hero.tsx:26` (`h1`), `src/components/screens.tsx:33` (`ScreenHeader` `h3`), `src/components/device-mockup.tsx:14`, `src/components/sections/loop.tsx:22`, `src/components/sections/nav.tsx:11`, `src/components/locale-switcher.tsx:35`, `src/app/[locale]/page.tsx:23`, `src/components/sections/footer.tsx:10`, `messages/en.json` + `messages/uk.json` (`nav` namespace).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.7)

### Debug Log References

- `npm run lint` → clean (no output, no errors/warnings).
- `npm run build` → compiled successfully; TypeScript passed; `/en` + `/uk` prerendered as static HTML.
- Heading outline (grep over prerendered `.next/server/app/{en,uk}.html`, document order):
  `h1 h2 h3 h3 h3 h2 h3 h3 h3 h3 h2 h2 h2` on **both** locales — exactly one `<h1>`, no skipped levels, no mockup/loop headings.
- Landmarks (both locales): `header`×1, `main`×1, `footer`×1, `nav`×2 with distinct accessible names — en `"Main"`/`"Language"`, uk `"Основна"`/`"Мова"`.
- `aria-hidden="true"` confirmed on the device-mockup wrapper (`max-w-[300px]`) and the loop diagram container (`h-72 w-72`); screenshot captions and the loop `<h2>`+body remain in the tree.

### Completion Notes List

- **AC1 (single `<h1>` + clean hierarchy):** ✅ Machine-verified. The only defect was the decorative `ScreenHeader` `<h3>` (reused by hero + 3 screenshots); demoting it to `<p>` (classes unchanged) yields a clean `h1 → h2 → h3` outline with no skipped levels on `/en` and `/uk`.
- **AC2 (landmarks present):** ✅ `header`/nav, `main`, `footer` all present (one each).
- **AC3 (audit clean / unique nav names):** ✅ Structurally verified — two `<nav>` landmarks now uniquely named (primary `"Main"`/`"Основна"` vs. locale-switcher `"Language"`/`"Мова"`), satisfying `landmark-unique`; `landmark-one-main`, `page-has-heading-one`, and `heading-order` all hold per the prerendered HTML.
- **AC4 (decorative mockups + loop `aria-hidden`):** ✅ `aria-hidden` on the `DeviceMockup` root (covers hero + all 3 screenshots) and the loop diagram container. Captions (siblings) and the loop heading/body stay in the accessibility tree, conveying value independently. No focusable controls inside the hidden subtrees (divs/spans/SVGs only).
- **Both fixes applied** (demote `<h3>` *and* `aria-hidden`) — not redundant: `aria-hidden` clears the a11y-tree checks while the `<h3>`→`<p>` demotion keeps raw-HTML SEO heading tools (which ignore `aria-hidden`) clean.
- **Outstanding human follow-up (headless-env limit, per Epic 1/2.1/2.3 pattern):** live in-browser **axe DevTools / Lighthouse** a11y+SEO pass on `/en` and `/uk` was NOT run in this headless environment. Structural outline + landmark uniqueness were machine-verified from the prerendered HTML as a substitute, but the interactive audit is not claimed as machine-verified.
- **Flag for UX-DR-21 native-speaker pass:** the uk nav label `"Основна"` (announced as "Основна навігація") should be reviewed by a native speaker.

### File List

- `src/components/screens.tsx` — `ScreenHeader` title `<h3>` → `<p>` (classes unchanged).
- `src/components/device-mockup.tsx` — `aria-hidden` on the root wrapper `<div>`.
- `src/components/sections/loop.tsx` — `aria-hidden` on the decorative diagram container `<div>`.
- `src/components/sections/nav.tsx` — `aria-label={t("label")}` on the primary `<nav>`.
- `messages/en.json` — added `nav.label` = `"Main"`.
- `messages/uk.json` — added `nav.label` = `"Основна"`.
- `docs/implementation-artifacts/3-1-semantic-heading-structure-landmarks.md` — story tracking (frontmatter `baseline_commit`, task checkboxes, Dev Agent Record, status).
- `docs/implementation-artifacts/sprint-status.yaml` — story status transitions.

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-06-22 | Story 3.1 created (ready-for-dev) — demote decorative mockup `<h3>`→`<p>`, `aria-hidden` device mockups + loop diagram, label the primary `<nav>` (deferred from Story 1.5 via a new `nav.label` catalog key). |
| 2026-06-23 | Implemented all 5 tasks. Demoted `ScreenHeader` `<h3>`→`<p>`; `aria-hidden` on device mockups + loop diagram; added `nav.label` (en `"Main"`, uk `"Основна"`) and `aria-label` on primary nav. Quality gate (lint + build/tsc) clean; heading outline + landmark uniqueness machine-verified on `/en` and `/uk`. Live axe/Lighthouse pass recorded as human follow-up (headless). Status → review. |
