---
baseline_commit: b9635c0
---

# Story 2.1: Real brand mark in nav & footer

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a prospective user,
I want to see the real MealLoop brand mark instead of a placeholder,
so that the product reads as a real, trustworthy app.

This is the **first story of Epic 2 (Brand Identity & Assets)** and the start of the brand-asset critical path. It does three concrete things and nothing else:

1. **Produce the web brand-asset set** under `public/brand/` — a vector wordmark+mark and a mark-only vector, **adapted (not redrawn)** from the locked iOS source `brand-logo.svg`.
2. **Rewrite `src/components/logo.tsx`** so the `Logo` (nav + footer) and the placeholder `LoopMark` render the **real** brand mark/wordmark from the vector source, at nav and footer sizes, with no rasterization, resolving the correct color per light/dark appearance via tokens.
3. **Remove every instance of the placeholder `LoopMark`** site-wide — it lives in three files, not two (see the callout below).

> **✅ ASSET LOCK RESOLVED — source located (AR-8, the critical path).** The locked iOS source assets live in the sibling Swift project, **not** in this repo:
> - **Mark vector:** `/Users/bogdanbakhmetyev/Projects/SideProjects/MealLoop/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg`
> - **App icon (Story 2.2 only):** `/Users/bogdanbakhmetyev/Projects/SideProjects/MealLoop/MealLoop/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png`
>
> **Critical fact about the source: `brand-logo.svg` is the MARK ONLY — there is no "MealLoop" wordmark text in it.** It is a single-color, **tintable** traced vector (one `<g fill="#000000">` with two `<path>`s; the imageset is `template-rendering-intent: "template"`, i.e. meant to be recolored). So **adapt the mark** from this file (do not redraw it), and render the **wordmark as live text** beside it (see Dev Notes → "Wordmark = live Manrope text"). `AppIcon.png` is **not needed for this story** — it feeds Story 2.2 (favicon/apple-icon) and 2.3 (OG image).

> **⚠️ `LoopMark` is in THREE files, not two.** A naive reading replaces it only in nav + footer (both via `<Logo/>`). But `LoopMark` is **also** imported and rendered standalone as the spinning centre of the loop diagram in `src/components/sections/loop.tsx:6,29` (`<LoopMark className="h-12 w-12" />`). AC requires that **no instance of the placeholder remains** — so the loop-diagram centre must get the real brand mark too, or the build will still ship the placeholder. Removing the `LoopMark` export without fixing `loop.tsx` will break the build (broken import). See Dev Notes → "LoopMark usage map".

## Acceptance Criteria

1. **The web brand-asset set is produced under `public/brand/`, adapted (not redrawn) from the locked iOS `brand-logo.svg`.** _(FR-12, AR-8)_
   **Given** the locked iOS source `brand-logo.svg` (mark-only, tintable) at `…/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg`,
   **When** the web brand-asset set is produced,
   **Then** `public/brand/brand-mark.svg` exists — the mark **adapted** from the iOS source (same geometry, not a new drawing), web-cleaned (no XML prolog/DOCTYPE/editor cruft, no embedded rasters), single-color via `currentColor`, and committed. (A combined `brand-logo.svg` = mark+wordmark is optional, since the on-page wordmark is live text; the architecture's two-file split assumed an outlined wordmark that the source does not contain.)

2. **`Logo` renders the real brand mark/wordmark from the vector source at nav and footer sizes with no rasterization.** _(FR-12)_
   **Given** `src/components/logo.tsx`,
   **When** `Logo` renders inside `nav.tsx` and `footer.tsx`,
   **Then** it displays the **real** brand mark + wordmark sourced from the SVG vector (inline `<svg>` or the `public/brand/` vector — never a `<img>` to a PNG, never a rasterized export), it stays crisp at every zoom level, and it sits at the existing nav/footer sizes without layout shift (the nav stays `h-16`; the footer block keeps its current rhythm).

3. **The mark resolves to the correct light/dark token variant per appearance — driven by tokens, never hardcoded hex.** _(FR-12, NFR-9)_
   **Given** light and dark appearance,
   **When** the mark renders,
   **Then** its colors come from brand tokens (`text-brand`/`currentColor` → `--brand` = `#2E7D4F` light / `#4faa70` dark; wordmark on `text-foreground`) so applying the `.dark` class recolors the mark automatically with **no** hardcoded hex in the SVG or the component. **Do not** wire `prefers-color-scheme` and **do not** add a dark-only asset — dark mode is token-driven and currently dormant (nothing toggles `.dark` yet); verify the variant by temporarily adding `class="dark"` to `<html>` in devtools, not by shipping new dark wiring.

4. **No instance of the placeholder `LoopMark` remains anywhere in the shipped site.** _(FR-12)_
   **Given** the shipped site,
   **When** the codebase is grepped for `LoopMark` and the running site is inspected,
   **Then** there are zero references to the placeholder mark — including the standalone usage in `src/components/sections/loop.tsx` (the loop-diagram centre gets the real brand mark instead), and the old placeholder `LoopMark` SVG paths are gone from `logo.tsx`. `grep -rn LoopMark src` returns nothing.

5. **Quality gate, static prerender, and deploy pipeline stay intact.** _(NFR-6, AR-4, AR-13)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass, `/en` and `/uk` remain statically prerendered (`●`/`○`, not `ƒ`), `logo.tsx` stays a Server Component (no `'use client'` added), and the GitHub→Vercel auto-deploy on `main` is unaffected.

6. **Scope is held — only the brand assets, the logo component, and the LoopMark call sites change.** _(scope guard)_
   **Given** this story,
   **When** it is implemented,
   **Then** `git status` shows changes to **only**: `public/brand/*` (new vector assets), `src/components/logo.tsx`, `src/components/sections/loop.tsx` (swap the loop-centre mark), plus this story file + `sprint-status.yaml`. **No** favicon/`icon.svg`/`apple-icon.png` (Story 2.2), **no** `opengraph-image` (Story 2.3), **no** copy/catalog changes, **no** token edits in `globals.css`, **no** changes to `nav.tsx`/`footer.tsx` markup beyond what's strictly required (they already consume `<Logo/>` — ideally they need no edits at all).

## Tasks / Subtasks

- [x] **Task 0 — Adapt the iOS mark into `public/brand/brand-mark.svg` (AC: #1)**
  - [x] Copy the source mark from `…/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg` into `public/brand/brand-mark.svg`. **Do not redraw it** — adapt the existing paths.
  - [x] Clean it for web: drop the XML prolog + `<!DOCTYPE …>`, set `xmlns` + a clean `viewBox` (`0 0 2048 2048`), and **replace `fill="#000000"` on the `<g>` with `fill="currentColor"`** so the mark tints from `text-brand`. Keep the existing `transform="translate(0,2048) scale(0.1,-0.1)"` and both `<path>`s exactly (it's a potrace-style flipped-Y trace — preserving the transform preserves the glyph). No hardcoded brand hex anywhere (architecture forbids it).
  - [x] (Optional) Add `public/brand/brand-logo.svg` (mark + wordmark) only if a static combined asset is useful for OG/2.3 reuse — otherwise skip; the on-page wordmark is live text (Task 2), so `brand-mark.svg` is the only required asset.
- [x] **Task 1 — _(folded into Task 0)_ — `brand-mark.svg` is the single required vector asset (AC: #1)**
  - [x] Confirm it's a clean, single-`currentColor` SVG with no embedded rasters and no editor cruft.
- [x] **Task 2 — Rewrite `src/components/logo.tsx` (AC: #2, #3)**
  - [x] Replace the placeholder `LoopMark` SVG paths with the real mark (inline `<svg>` adapted from `brand-mark.svg`, or reference the vector). Keep the `LoopMark`→`Logo` shape or rename cleanly — but **remove the placeholder geometry** (the circular-arrow `d="M4.5 12a7.5..."` paths).
  - [x] `Logo` renders mark + wordmark at nav/footer size; mark colored via `text-brand`, wordmark via `text-foreground` (preserve the current two-tone treatment so light/dark both work via tokens).
  - [x] Keep `logo.tsx` a Server Component (no `'use client'`); keep the `cn()`/`className` prop API so call sites don't change.
- [x] **Task 3 — Replace the standalone `LoopMark` in the loop diagram (AC: #4)**
  - [x] In `src/components/sections/loop.tsx:29`, swap `<LoopMark className="h-12 w-12" />` for the real brand mark (the mark-only variant) inside the mint centre circle, preserving the `h-12 w-12` sizing and the `bg-mint` circle.
  - [x] Update the import on line 6 accordingly. `loop.tsx` is already a client island (`'use client'` + `motion`) — do not change its server/client status.
- [x] **Task 4 — Prove the placeholder is gone (AC: #4)**
  - [x] `grep -rn "LoopMark" src` returns nothing (or only an intentional, renamed real-mark export with no placeholder geometry). No dangling imports.
- [x] **Task 5 — Quality gate (AC: #5)**
  - [x] `npm run build` (or `next build`) passes: `tsc --noEmit` + ESLint clean; route table shows `/[locale]` still static; `logo.tsx` has no `'use client'`.
- [x] **Task 6 — Manual visual verification (AC: #2, #3) — headless-env caveat**
  - [x] In a browser: mark + wordmark render crisply in nav and footer on `/en` and `/uk`; no layout shift; loop-diagram centre shows the real mark.
  - [x] Toggle `class="dark"` on `<html>` in devtools → mark recolors to the dark brand token (`#4faa70`) with no broken/baked color.
  - [x] Check 320/360/390/768px that the nav logo + switcher + CTA still fit (carry-forward from Epic 1: nav fit at 320px on `/uk` is an open responsive item). If you cannot run a browser, state this explicitly and leave the visual ACs for human verification rather than claiming them passed.

## Dev Notes

### The asset source (AR-8 — resolved)
The whole story is downstream of **AR-8: brand-asset lock is the critical path.** Favicons (2.2/FR-13), OG image (2.3/FR-14), and the JSON-LD logo (Epic 3/FR-9) **all** derive from the same iOS source. That source is the sibling Swift app, not this repo:
- `…/MealLoop/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg` — the **mark** (single-color, tintable, traced vector).
- `…/MealLoop/MealLoop/Resources/Assets.xcassets/AppIcon.appiconset/AppIcon.png` — the app icon (Story 2.2/2.3, not this story).

**Adapt, do not redraw** (AR-8). Copy the mark vector, clean it, and tint it via tokens. The source `<g>` is `fill="#000000"`; swap to `fill="currentColor"`.

### LoopMark usage map — exact current state (grep `LoopMark` / `Logo`)
- `src/components/logo.tsx:4` — **defines** `LoopMark` (placeholder: a circular-arrow "weekly meal loop" motif, `text-brand`, `aria-hidden`).
- `src/components/logo.tsx:29` — `Logo` wraps `<LoopMark/>` + the live text `MealLoop` (`text-foreground`, `font-semibold`).
- `src/components/sections/nav.tsx:13` — renders `<Logo/>` inside a locale-aware `<Link href="/">`. **No edit expected** (consumes `Logo`).
- `src/components/sections/footer.tsx:14` — renders `<Logo/>` inside a `<Link href="/">`. **No edit expected** (consumes `Logo`).
- `src/components/sections/loop.tsx:6,29` — **imports and renders `LoopMark` standalone** as the diagram centre (`h-12 w-12` inside a `bg-mint` circle). **Must be fixed** or the placeholder ships / the build breaks.

So: editing `logo.tsx` covers nav + footer for free (they only consume `Logo`). The trap is `loop.tsx` — it's the third, easy-to-miss site.

### Light/dark is token-driven, not new wiring (AC #3)
The existing `LoopMark` already does this correctly: `className="... text-brand"` + `stroke="currentColor"`. Preserve that pattern. Brand tokens live in `src/app/globals.css`: `--brand` = `#2E7D4F` (light) / `#4faa70` (`.dark`); `--brand-foreground`, `--foreground`, `--mint` all flip under `.dark`. The mark must inherit color from tokens so the `.dark` variant is automatic.
- **Forbidden:** hardcoded hex anywhere (`fill="#2E7D4F"`, `style={{color:'#2E7D4F'}}`, `bg-[#2E7D4F]`) — architecture explicitly lists these as anti-patterns. Use `text-brand`/`text-foreground`/`currentColor`.
- **Dark mode is dormant.** Nothing toggles `.dark` today and it is **not** wired to `prefers-color-scheme` (project-context confirms; DESIGN/architecture call it "OS-driven" but that wiring does not exist). Do **not** add that wiring here — out of scope. AC-3 is satisfied purely by token-driven fills; verify with a manual `.dark` class toggle.

### No rasterization (AC #2)
Wordmark + mark must be **vector** end-to-end: inline `<svg>` in the component, or an SVG under `public/brand/`. Never `<img src="...png">`, never a rasterized export. `AppIcon.png` (a raster) belongs to Story 2.2, not here.

### Wordmark = live Manrope text (resolved — the source has no wordmark)
The iOS `brand-logo.svg` is **mark-only**; there is no outlined wordmark to adapt. So keep the wordmark as **live text** beside the real vector mark, exactly as `Logo` does today (`<span>MealLoop</span>`). It renders in the site font, which is now **Manrope** (`src/app/[locale]/layout.tsx`: `Manrope({ variable: "--font-sans", subsets: ["latin","cyrillic"] })`), swapped site-wide in Story 1.4.
- **The planning docs are stale and will mislead you.** DESIGN.md, architecture.md, epics.md, prd.md, and project-context.md still name **Outfit** and assume a Cyrillic subset on Outfit. That reconciliation (retro action **CP-1**) has **not** landed. **Trust the code, not the docs:** the live brand font is Manrope. Do **not** "restore Outfit."
- Use `SITE.name` (`"MealLoop"`) from `src/lib/site.ts` for the wordmark text (identical in both locales — it is brand identity, not catalog copy). The current hardcoded `"MealLoop"` string can stay or switch to `SITE.name`; either is fine, no catalog key.
- "No rasterization" (AC #2) is satisfied because the **mark** is vector and the **wordmark** is live font text — neither is a raster export.

### Static-prerender / RSC discipline (AC #5)
`logo.tsx`, `nav.tsx`, `footer.tsx` are Server Components. `logo.tsx` must **stay** server-rendered — an inline `<svg>` needs no client JS. The only client island you touch is `loop.tsx` (already `'use client'` for `motion`); do not change its boundary. No cookie/header reads anywhere here. If `next build` flips `/[locale]` to `ƒ` (dynamic), something out-of-scope leaked in — back it out.

### `public/brand/` structure (per architecture source tree)
```
public/
└── brand/                 # NEW — raw vector brand assets adapted from iOS app (FR-12)
    ├── brand-logo.svg      #      wordmark + mark
    └── brand-mark.svg      #      mark only
```
File naming follows repo convention (kebab-case). These are raw vectors; the file-convention metadata assets (`app/icon.svg`, `app/apple-icon.png`, `opengraph-image`) are explicitly **later stories**.

### Scope boundaries — do NOT do these in 2.1 (they belong to later stories)
- **Favicon / Apple touch icon** (`app/icon.svg`, `app/apple-icon.png`, the head `icons` API) → **Story 2.2** (FR-13). Needs `AppIcon.png`, which 2.1 does not touch.
- **OG / social image** (`opengraph-image.tsx`, localized tagline composition) → **Story 2.3** (FR-14, UX-DR-20). Renders the tagline in **Manrope**.
- **JSON-LD logo reference** → **Epic 3** (FR-9).
- **Token edits in `globals.css`** — the `#2E7D4F` AA fix already landed in Epic 1; do not re-touch tokens.
- **No copy/catalog changes**, no analytics, no mobile menu.

### Project Structure Notes
- Files kebab-case, exports PascalCase (`Logo`), `cn()` from `@/lib/utils` for class merge — `logo.tsx` already follows this; keep it.
- shadcn-generated `ui/*` and `utils.ts` are untouched (not relevant here).
- New asset dir `public/brand/` is net-new and matches the architecture's planned tree.

### Previous-story / Epic-1 retro intelligence
- **CP-1 (docs → Manrope) is still open.** The retro flagged it as "must land before Epic 2 references the design docs." It hasn't. For 2.1 this only bites if you render a live-text wordmark and then "correct" it to Outfit per the stale docs — don't. (Surfaced as a question below so Bogdan can decide whether to land CP-1 now.)
- **Headless env cannot close visual/responsive ACs.** Epic 1 established this as a structural limit. AC-6's visual checks (crispness, light/dark recolor, 320px nav fit) may need human/browser verification — state that honestly rather than claiming them.
- **Outstanding 320px nav-fit item** from Story 1.5 (`/uk`): adding/altering the logo affects nav width — keep the logo compact so the nav still fits Logo + switcher + CTA at 320px.

### References
- [Source: docs/planning-artifacts/epics.md#Story 2.1: Real brand mark in nav & footer] — the four BDD ACs.
- [Source: docs/planning-artifacts/epics.md#Functional Requirements] — FR-12 (real brand mark, light/dark, from vector).
- [Source: docs/planning-artifacts/epics.md#Additional Requirements] — AR-8 (brand-asset lock = critical path; adapted, not redrawn).
- [Source: docs/planning-artifacts/epics.md#NonFunctional Requirements] — NFR-9 (visual brand, light-first + dark tokens), NFR-6 (deploy), AR-4/AR-13 (static prerender, lean gate).
- [Source: docs/planning-artifacts/architecture.md#Proposed Source Tree] (lines 457–460, 500, 554) — `public/brand/{brand-logo,brand-mark}.svg`, `logo.tsx` MOD, brand→structure mapping.
- [Source: docs/planning-artifacts/architecture.md] (line 434) — hardcoded brand hex is an explicit anti-pattern.
- [Source: docs/project-context.md] — Tailwind v4 tokens, `.dark` dormant + not OS-wired, no JS config, RSC-by-default, kebab/PascalCase rules.
- [Source: docs/implementation-artifacts/epic-1-retro-2026-06-22.md#Next Epic Preview / Significant Discovery Flag] — iOS asset-lock dependency; Manrope-not-Outfit carry-forward; CP-1 unreconciled.
- [Source: src/components/logo.tsx, src/components/sections/{nav,footer,loop}.tsx] — current `LoopMark`/`Logo` state and the three call sites.
- [Source: src/app/[locale]/layout.tsx] — site font is Manrope (latin+cyrillic).
- [Source: ../MealLoop/MealLoop/Resources/Assets.xcassets/brand-logo.imageset/brand-logo.svg + Contents.json] — locked iOS mark (mark-only, single-color, `template-rendering-intent: template`); `AppIcon.appiconset/AppIcon.png` for Story 2.2.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story workflow)

### Debug Log References

- `next build` → ✓ compiled, TypeScript ✓, `/[locale]` (`/en`, `/uk`) prerendered as `●` (SSG) — still static, not `ƒ`.
- `npm run lint` (eslint) → clean, no output.
- `grep -rn "LoopMark" src` → no matches (exit 1). Placeholder geometry `M4.5 12a7.5` → no matches.
- Path-data integrity: extracted both `d=""` attrs from `public/brand/brand-mark.svg` and `src/components/logo.tsx` — byte-identical (no transcription drift).
- Headless SSR inspection via `next start` + curl on `/en` and `/uk` (identical results): 3 inline `<svg viewBox="0 0 2048 2048">` per page (nav + footer + loop-diagram centre), 0 brand `<img>`/PNG rasters, 2 live `>MealLoop<` wordmark text nodes, 0 placeholder geometry.

### Completion Notes List

- **AC #1 (asset):** `public/brand/brand-mark.svg` adapted (not redrawn) from the locked iOS `brand-logo.svg` — copied byte-for-byte, then cleaned: dropped XML prolog + DOCTYPE, set clean `viewBox="0 0 2048 2048"`, replaced `fill="#000000"` on the `<g>` with `fill="currentColor"`, preserved the `translate(0,2048) scale(0.1,-0.1)` flip-transform and both `<path>`s exactly. No prolog, no embedded raster, no hardcoded hex. The optional combined `brand-logo.svg` was intentionally skipped (the on-page wordmark is live text), per AC #1's note.
- **AC #2 (no rasterization):** `LoopMark` renamed to `BrandMark` and the placeholder circular-arrow paths replaced with the real mark, inlined as `<svg>` (vector end-to-end). Wordmark is live Manrope text (`SITE.name`). `Logo` keeps the `cn()`/`className` API, so `nav.tsx`/`footer.tsx` needed no edits and nav stays `h-16` — no layout-shift risk (mark size unchanged at `h-7 w-7`).
- **AC #3 (token-driven light/dark):** mark colors via `text-brand` → `currentColor`; wordmark via `text-foreground`. No hardcoded hex anywhere. `.dark` token `--brand: #4faa70` already exists in `globals.css`, so applying `.dark` recolors the mark automatically. No `prefers-color-scheme` wiring and no dark-only asset added (dark mode stays dormant, as required).
- **AC #4 (placeholder gone):** `grep -rn "LoopMark" src` returns nothing; `loop.tsx` now renders `<BrandMark className="h-12 w-12" />` inside its `bg-mint` circle (sizing + boundary preserved; `loop.tsx` stays the existing `'use client'` island).
- **AC #5 (gate/prerender/RSC):** build + lint pass; `/en`/`/uk` stay SSG; `logo.tsx` stays a Server Component (no `'use client'`); no config/deploy changes.
- **AC #6 (scope):** only `public/brand/*`, `logo.tsx`, `loop.tsx` changed (+ this story file & `sprint-status.yaml`). No favicon/OG/copy/token edits; `nav.tsx`/`footer.tsx` markup unchanged.
- **Manrope, not Outfit (CP-1 carry-forward):** wordmark left as live site-font text; did NOT "restore Outfit" per stale docs — trusted the code (Manrope is the live brand font).
- **Headless-env caveat (Task 6 / AC #2, #3, #6 visual residue):** crispness perception, the actual `.dark` recolor render, and the 320px nav-fit on `/uk` need a human browser — these are **structurally** verified here (vector inline SVG, token-driven `currentColor`, unchanged logo footprint) but NOT visually confirmed in a real browser. Per the story's explicit instruction, these visual/responsive checks are flagged for human verification rather than claimed as pixel-confirmed.

### File List

- `public/brand/brand-mark.svg` (new) — web-cleaned, single-`currentColor` brand mark adapted from the iOS source.
- `src/components/logo.tsx` (modified) — `LoopMark`→`BrandMark` with the real inline vector mark; `Logo` wordmark now sources `SITE.name`.
- `src/components/sections/loop.tsx` (modified) — loop-diagram centre swapped from `LoopMark` to `BrandMark`.

## Change Log

| Date       | Version | Description                          | Author |
|------------|---------|--------------------------------------|--------|
| 2026-06-22 | 0.1     | Story drafted (ready-for-dev)        | Bob (SM) |
| 2026-06-22 | 1.0     | Implemented real brand mark in nav/footer/loop; placeholder removed; build+lint green; status → review | Amelia (Dev) |
| 2026-06-22 | 1.1     | Code review (3-layer adversarial): code clean, 6/6 ACs pass on verifiable parts, 0 patches. AC-6 scope → exclude 2 files at commit; SVG single-source → deferred to 2.2/2.3. Status → done | Code Review |

## Review Findings

_Adversarial code review (Blind Hunter + Edge Case Hunter + Acceptance Auditor), 2026-06-22. Code is functionally clean — build-safe, accessible, all 6 ACs pass on their verifiable portions. No code patches required. 2 decisions + 1 deferred item below; 10 Blind-Hunter items dismissed as false positives (disproved by the project-access layers: `SITE.name` exists, no dangling `LoopMark`, logo link named via `aria-label`, contrast ~4:1)._

- [x] [Review][Decision · RESOLVED 2026-06-22] AC-6 scope guard — two files outside the story's declared scope — `git status` shows `.claude/settings.local.json` (M, ~47 auto-added permission-allowlist entries from the dev session) and the untracked `docs/implementation-artifacts/epic-1-retro-2026-06-22.md`, neither of which is in AC-6's "only" list. Neither ships in the build. **Resolution (Bogdan): exclude both from the Story 2.1 commit.** ⚠️ ACTION AT COMMIT TIME — stage only the in-scope files (`public/brand/brand-mark.svg`, `src/components/logo.tsx`, `src/components/sections/loop.tsx`, this story file, `sprint-status.yaml`); commit `epic-1-retro-2026-06-22.md` separately as its own Epic-1 artifact and leave `.claude/settings.local.json` out of the story commit.
- [x] [Review][Defer · RESOLVED 2026-06-22] Duplicated mark path data — `src/components/logo.tsx` inline `<svg>` vs `public/brand/brand-mark.svg` — the two `<path d>` blocks are byte-identical, and `brand-mark.svg` is not referenced by any app code yet (foundational asset for Stories 2.2/2.3). Both copies are spec-required (AC-1 mandates the file; AC-2 forbids `<img>`), so the duplication is by design; only future silent divergence is a risk. Clean single-sourcing needs SVGR tooling (new dep + Turbopack loader + `*.svg` type decl) because `BrandMark` must stay isomorphic for the `loop.tsx` client island — a build-time `fs` read would break that boundary. **Resolution (Bogdan): defer to Stories 2.2/2.3**, when the favicon/OG work brings in SVG tooling anyway so the dependency earns its keep. Logged in `deferred-work.md`.
- [x] [Review][Defer] Visual & responsive verification pending — headless env cannot close [src/components/logo.tsx, src/components/sections/loop.tsx] — deferred, needs a human browser — confirm: (a) the filled mark's optical weight at 28px (`h-7 w-7`) in nav/footer reads well vs. the old stroked placeholder; (b) the `.dark` token recolor renders (`--brand` → `#4faa70`); (c) the 320px nav fit on `/uk` (Logo + switcher + CTA — carry-forward from Story 1.5); (d) the mark's interior cutouts render as holes (default nonzero winding, no `fill-rule` set — expected correct for a potrace trace, but eyeball it). Structurally verified here (inline vector, token-driven `currentColor`, unchanged logo footprint); pixel confirmation is human-only, consistent with the Dev Agent Record's headless caveat.
