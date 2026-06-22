---
baseline_commit: 548165d
---

# Story 2.3: OG / social-share image

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a person who receives a shared link,
I want the link preview to show a real branded image,
so that the shared MealLoop link looks credible before I tap it.

This is the **third and final story of Epic 2 (Brand Identity & Assets)** and the last derivation off the locked iOS brand assets (AR-8). Story 2.1 put the real brand **mark + wordmark** in the nav/footer/loop; Story 2.2 generated the **favicon/app-icon set**. This story produces the **social-share (Open Graph) image** — the branded card that renders in iMessage / Slack / Facebook / X / LinkedIn previews when someone shares a `/en` or `/uk` link.

It does one thing and nothing else: **produce a real, per-locale static OG image and wire it via the Next.js `opengraph-image` file convention so the correct localized card auto-emits its `og:image` tags on `/en` and `/uk`.**

> **🚦 SCOPE SEAM — 2.3 ships the IMAGE; Epic 3 Story 3.5 ships the rest of the metadata.** FR-14 (this story) = *produce the real OG image asset and have it render per-locale in card validators*. FR-10 (Story 3.5, Epic 3) = the richer per-locale Open Graph **+ Twitter card** metadata (`twitter:card`, `twitter:image`, per-locale OG title/description, locale alternates) layered on top via `generateMetadata`. 2.3 delivers the `opengraph-image` route + its auto-emitted `og:image`/`og:image:width`/`:height`/`:type` tags. **Do NOT** add a `twitter-image`, a `generateMetadata`, or hand-written `<meta>` tags here — that is 3.5.

> **✅ ASSET LOCK (AR-8) — sources confirmed, same locked assets used by 2.1/2.2.** Both sources are already in this repo (no need to re-touch the sibling Swift project for this story):
> - **Brand mark (vector):** `public/brand/brand-mark.svg` — mark-only, single `currentColor`, `viewBox="0 0 2048 2048"`, flip-transform + two `<path>`s. Produced by Story 2.1. **`src/app/icon.svg` (Story 2.2) is the exact precedent** for compositing this mark on a paper background with a literal green fill — reuse that pattern.
> - **Wordmark:** there is **no `brand-wordmark.svg`**. The "wordmark" is the literal text **"MealLoop"** rendered in the brand font (see the Manrope callout below) — exactly how `src/components/logo.tsx` renders it (`<BrandMark/>` + a `<span>MealLoop</span>` in `font-semibold tracking-tight`).
> - **Localized tagline (copy):** from the message catalogs — `hero.headline`. EN: *"Plan a week of meals from the dishes you already cook."* UK: *"Сплануйте тиждень страв із тих, що вже готуєте."* (See the single-sourcing note in Dev Notes — this string is **baked** into the static asset at generation time; the catalog stays the source of truth.)

> **🔤 FONT IS MANROPE, NOT OUTFIT — and it is load-bearing here.** The planning docs (DESIGN.md, architecture.md, epics UX-DR-2/3, `project-context.md`) all say *Outfit*. **The shipped site uses *Manrope*** — Story 1.4 swapped the brand font site-wide per Bogdan's approval (`src/app/[locale]/layout.tsx:2,11` → `Manrope({ subsets: ["latin","cyrillic"] })`). This is the unresolved CP-1 docs-reconciliation item (see `deferred-work.md`). Unlike the 2.2 icons (pure mark, **no text**), **this OG image renders text** ("MealLoop" + the tagline), so the font choice is real: render the text in **Manrope** to match the live site. Ukrainian needs the Cyrillic glyphs — Manrope's variable font covers Cyrillic, and the font is installed locally (see Tooling).

> **⚠️ The OG PNG MUST embed literal hex — this is NOT the "no hardcoded hex" anti-pattern.** Same reasoning as Story 2.2's icons: the project rule "never hardcode hex; use tokens" governs **components and `globals.css`**. A rasterized OG PNG renders **inside a social-card crawler, outside the DOM** — it cannot read a CSS custom property, and `currentColor` resolves to the UA default (black). So bake the **literal LIGHT** brand colors: paper `#f5f4f1` background, brand green `#2E7D4F` mark, ink `#1a1918` text (optionally muted `#6d6c6a` for a secondary line). **Never** the dark tokens (`#4faa70` / `#1a1816`) — OG cards do not theme-switch, and the locked iOS composition is the light-on-paper one.

## Acceptance Criteria

1. **The OG image is a static `opengraph-image` per locale, produced without `next/og`/Satori (preferred per AR-9).** _(FR-14, AR-9)_
   **Given** the locked brand assets,
   **When** the OG image is produced and wired,
   **Then** the repo contains `src/app/[locale]/opengraph-image.tsx` whose default export **returns a pre-rendered, committed PNG selected by `params.locale`** (a `Response`/`Blob` of the static bytes) — it does **not** import `ImageResponse` from `next/og`, does **not** rasterize at runtime, and exports `size = { width: 1200, height: 630 }`, `contentType = "image/png"`, and an `alt`. Two committed PNGs exist (one per locale), each **1200×630**.

2. **Composition follows UX-DR-20 and is legible at small sizes.** _(UX-DR-20, FR-14, NFR-9)_
   **Given** the OG composition,
   **When** designed,
   **Then** each card shows the **real brand mark** (`#2E7D4F`, from `public/brand/brand-mark.svg`) **+ the "MealLoop" wordmark** (Manrope) **+ the localized tagline** (Manrope, from `hero.headline`) on a **paper `#f5f4f1`** field, with **no device mockup**, generous margins, and type large enough to read in a small messaging-app thumbnail.

3. **`/en` and `/uk` each render the correct localized card with the real mark — auto-wired and absolute.** _(FR-14)_
   **Given** the built site,
   **When** the `<head>` of `/en` and `/uk` is inspected (and the URL is fed to a card validator),
   **Then** each emits `og:image` (+ `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/png`) pointing at an **absolute** URL (via the existing `metadataBase` = `SITE_ORIGIN`), the **two locales resolve to different images** (EN tagline vs. UK tagline), and both reflect the **real brand mark, not the placeholder**.

4. **Quality gate, static prerender, and the deploy pipeline stay intact; no new dependencies.** _(NFR-6, AR-4, AR-13, AR-6)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass; `/[locale]` stays statically prerendered (`●`/`○`, not `ƒ`); the `opengraph-image` route prerenders for **both** locales (static, not `ƒ`); **no `'use client'`** is introduced; **no package is added** (`package.json`/lockfile unchanged); **no SVGR / Turbopack `*.svg` loader** is added; and the GitHub→Vercel auto-deploy on `main` is unaffected.

5. **Scope is held — only the OG route + its PNGs change.** _(scope guard)_
   **Given** this story,
   **When** it is implemented,
   **Then** `git status` shows changes to **only**: `src/app/[locale]/opengraph-image.tsx` (new), the two committed OG PNGs (new), an optional `opengraph-image.alt.txt`/route `alt` export, plus this story file + `sprint-status.yaml`. **No** `twitter-image`, **no** `generateMetadata`/`metadata.openGraph.images` edits, **no** hand-written `<meta>` tags (all → Story 3.5/3.2), **no** `logo.tsx`/`public/brand/*` edits (2.1), **no** `favicon.ico`/`icon.svg`/`apple-icon.png` edits (2.2), **no** copy/catalog changes, **no** `globals.css` token edits.

## Tasks / Subtasks

- [x] **Task 1 — Compose the two source SVGs (en/uk) (AC: #1, #2)**
  - [x] Create a 1200×630 SVG per locale (work files — they do **not** need to ship; the committed deliverable is the rasterized PNG). Composition (UX-DR-20), centered on paper:
    - Background `<rect width="1200" height="630" fill="#f5f4f1"/>`.
    - The **brand mark** from `public/brand/brand-mark.svg`: embed the `<g transform="translate(0,2048) scale(0.1,-0.1)" fill="#2E7D4F">` + both `<path>`s **verbatim** (swap `currentColor`→`#2E7D4F`; keep the flip-transform exactly — it is a potrace trace, altering it breaks the glyph). Wrap in an outer `<g transform>` to scale/position it to ~120–160px tall. **Follow `src/app/icon.svg` exactly** — it already does mark-on-paper + literal green fill + a centering transform.
    - The **wordmark**: `<text>` "MealLoop" in **Manrope**, weight ~600 (`font-weight="600"`), ink `#1a1918`, sized as a heading. Lay it out like the nav `Logo` (mark + wordmark on one row) scaled up, or stack mark-over-wordmark — designer's call, keep it centered and balanced.
    - The **tagline**: `<text>`/`<tspan>` lines of `hero.headline` for that locale, in Manrope (~400–500 weight), ink `#1a1918` or muted `#6d6c6a`, in a contained width (~`prose-max`-ish). **SVG `<text>` does not auto-wrap** — hand-split into 1–2 `<tspan>` lines so it fits with comfortable margins and stays legible at thumbnail size. **No device mockup.**
  - [x] Keep the literal hex (see callout): paper `#f5f4f1`, mark `#2E7D4F`, text `#1a1918`/`#6d6c6a`. Never the dark tokens.

- [x] **Task 2 — Rasterize to two 1200×630 PNGs with faithful Manrope text (AC: #1, #2)**
  - [x] Rasterize each SVG at exactly 1200×630. Primary tool — `rsvg-convert` (uses fontconfig → picks up the **installed** Manrope):
    ```sh
    rsvg-convert -w 1200 -h 630 og-en.svg -o opengraph-image-en.png
    rsvg-convert -w 1200 -h 630 og-uk.svg -o opengraph-image-uk.png
    ```
  - [x] **Verify the rendered font weight.** Manrope is a **variable** font (`~/Library/Fonts/Manrope-VariableFont_wght.ttf`); librsvg's fontconfig matching may ignore `font-weight` and render a single default weight. If the wordmark weight looks wrong, either (a) rasterize with ImageMagick + Pango pointing at the ttf, or (b) convert the two text runs to vector paths once (so no font dependency at raster time). Do **not** ship a wrong-weight wordmark. _(Verified: librsvg DOES honor the wght axis — wordmark ink (8742 black-px) matched the weight-600 reference (8771), far above the ExtraLight-200 default (4140). No fallback (a)/(b) needed.)_
  - [x] Confirm each PNG: `file opengraph-image-en.png` → `1200 x 630`, 8-bit; well under the 8MB OG cap (strip metadata, e.g. `-strip`; flatten to opaque on paper — no alpha needed). Eyeball the Cyrillic on `/uk` renders in Manrope (not a tofu/fallback box). _(Both PNGs: 1200×630, 8-bit RGB opaque, 41KB/37KB. Cyrillic confirmed rendering in Manrope by viewing the raster.)_

- [x] **Task 3 — Wire via a Satori-free `opengraph-image.tsx` route (AC: #1, #3)**
  - [x] Commit the two PNGs (recommended: `public/og/og-en.png`, `public/og/og-uk.png` — clean paths, also directly fetchable for debugging).
  - [x] Create `src/app/[locale]/opengraph-image.tsx` that:
    - Exports `const size = { width: 1200, height: 630 }`, `const contentType = "image/png"`, and `const alt` (brand-level alt is fine, e.g. "MealLoop — a calm weekly meal planner"; per-locale alt is optional and can defer to 3.5).
    - Default-exports an `async function` taking `{ params }: { params: Promise<{ locale: string }> }`, awaits `locale`, reads the matching committed PNG via Node fs (`readFile(join(process.cwd(), "public", "og", \`og-${locale}.png\`))`), and returns `new Response(bytes, { headers: { "Content-Type": "image/png" } })`. **No `ImageResponse`, no `next/og` import.**
  - [x] Do **not** add `generateImageMetadata` unless you need per-locale `alt` — a plain default export keyed on `params.locale` is sufficient. _(CORRECTION to the inheritance assumption: in Next 16 the metadata route does **not** inherit the parent layout's `generateStaticParams` — without its own, it rendered once as `ƒ` `/-/opengraph-image`. Added a route-local `generateStaticParams()` over `LOCALES`; it now prerenders `/en/opengraph-image` + `/uk/opengraph-image` as `●` SSG. Also added a `LOCALES` allowlist guard before the param reaches the fs path — traversal safety.)_

- [x] **Task 4 — Verify the auto-emitted, per-locale, absolute `og:image` tags (AC: #1, #3)**
  - [x] `next build` then `next start`; `curl -s http://localhost:3000/en | grep -i 'og:image'` and `/uk`. Confirm each emits `og:image` (+ width=1200, height=630, type=image/png), the URLs are **absolute** (begin with `SITE_ORIGIN`), and `/en` vs `/uk` point at **different** image URLs. _(Confirmed: both emit og:image + width=1200/height=630/type=image/png/alt; URLs absolute under `https://meal-loop.com`; `/en/opengraph-image` ≠ `/uk/opengraph-image`.)_
  - [x] Fetch each `og:image` URL → 200, correct PNG, correct localized tagline. (True social-card preview rendering is a human/validator check — see Task 7.) _(Both → HTTP 200 image/png 1200×630; fetched bytes differ per locale and match the committed PNGs exactly.)_

- [x] **Task 5 — Quality gate (AC: #4)**
  - [x] `npm run build` passes: `tsc --noEmit` + ESLint clean; route table shows `/[locale]` still static (`●`/`○`) and the `opengraph-image` route static (not `ƒ`); no `'use client'` added. _(Build clean; `/[locale]` `●`; OG route `●` SSG for both locales; no `'use client'`.)_
  - [x] `git diff --stat package.json package-lock.json` → empty (no new deps). No SVGR/Turbopack-SVG tooling added. _(Both empty; no SVGR.)_

- [x] **Task 6 — Scope check (AC: #5)**
  - [x] `git status --porcelain` lists only: `src/app/[locale]/opengraph-image.tsx`, the two `public/og/og-*.png`, an optional alt file, this story file, and `sprint-status.yaml`. Nothing else (no twitter-image, no `generateMetadata`, no logo/brand/icon/catalog/token edits). _(Confirmed. `.claude/settings.local.json` also shows modified — auto-managed Bash allowlist, not a deliverable, already dirty at session start.)_

- [x] **Task 7 — Manual visual verification (AC: #2, #3) — headless-env caveat — HUMAN VERIFICATION REQUIRED**
  - [x] Run the deployed `/en` and `/uk` URLs through real card validators (e.g. Facebook Sharing Debugger, X Card Validator, or paste into iMessage/Slack) — confirm the branded card renders, EN vs UK taglines differ, and the mark is the real one. _(Headless env can confirm the tags + bytes structurally; the actual third-party card render is a human check — Epic-1 AI-1 limit.)_ **→ HUMAN FOLLOW-UP after deploy:** structural verification done (tags emitted, absolute, distinct per locale, bytes valid); live third-party card-validator render on the deployed URL still needs a human.
  - [x] **Small-size legibility** — confirm the wordmark + tagline read clearly at a small messaging-app thumbnail (UX-DR-20). The brand mark is thin line-art (AR-8) — verify it still reads; do not redraw a simplified mark. _(Rendered both cards and inspected the raster directly: real mark reads, wordmark Manrope-600, balanced 2-line taglines, EN/UK differ. Final small-thumbnail judgment in a real messaging app remains a human check.)_

### Review Findings

_Code review 2026-06-22 (bmad-code-review — 3 adversarial layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor). Result: 1 decision-needed, 1 patch, 3 deferred, 7 dismissed as noise. Build verified static (`●` SSG) for both OG routes; LOCALES === routing.locales; absolute per-locale `og:image*` tags confirmed distinct._

**Decision needed**

- [x] [Review][Decision] Next 16 auto-emits `twitter:card` + `twitter:image*` tags from the OG route — AC #5 / scope-seam reserves Twitter metadata for Story 3.5 — **RESOLVED 2026-06-22 (Bogdan): accepted / dismissed.** Framework-mandated (not author code); Story 3.5 will override rather than introduce these tags. No code change in 2.3. — Adding `opengraph-image.tsx` makes Next 16's metadata resolver (`node_modules/next/dist/lib/metadata/resolve-metadata.js` `mergeStaticMetadata`) populate `twitter.images` from the route whenever no explicit twitter config exists. Built `/en` + `/uk` HTML now ship `twitter:card=summary_large_image` + `twitter:image*` though no twitter code was written. Framework-mandated, not author code (PASS on the letter of AC #5), but the effect ships Twitter metadata 2.3 explicitly defers to 3.5. Decide: accept (3.5 will override, recommended) vs. suppress.

**Patch**

- [x] [Review][Patch] `notFound()` guard comment overstates runtime traversal protection [src/app/[locale]/opengraph-image.tsx:30-31] — **FIXED 2026-06-22:** comment reworded to describe the guard as a build-time/type narrowing + defense-in-depth (unknown locales handled upstream by the proxy). — Route is statically prerendered and `generateStaticParams` only yields valid locales; unknown-locale requests are intercepted by `src/proxy.ts` (307→404) and never reach this guard, so its stated runtime-traversal purpose never fires. The guard is harmless defense-in-depth + type-narrowing — only the comment is inaccurate. Reword to reflect it's a build-time/type guard.

**Deferred**

- [x] [Review][Defer] next-intl proxy injects `Set-Cookie: NEXT_LOCALE` + hreflang `link` headers onto the OG image response [src/proxy.ts:15] — deferred, out of 2.3 scope (tightening the proxy matcher affects all routes; harmless — crawlers ignore the cookie)
- [x] [Review][Defer] No `try/catch` around `readFile` — a future `LOCALES` entry without a committed PNG fails the build prerender [src/app/[locale]/opengraph-image.tsx:36] — deferred, fail-fast-at-build is acceptable; both current PNGs present
- [x] [Review][Defer] `x-default` hreflang alternate resolves to bare `/opengraph-image` → 307 → `/en` (redirect hop) — deferred, Epic 3 hreflang territory; per-locale `og:image` tags are direct (no redirect)

## Dev Notes

### The asset source & composition (AR-8 / UX-DR-20)
This is the third derivation off the locked iOS brand. Sources are already in-repo: the **mark vector** `public/brand/brand-mark.svg` (from 2.1) and the **"MealLoop" text wordmark** (from `logo.tsx`). UX-DR-20 fixes the composition: real mark **+** wordmark **+** localized tagline on paper, **no device mockup** (kept out deliberately so the card stays legible at small sizes). EXPERIENCE.md:69 and epics UX-DR-20 are the authority; this resolves PRD Open Q2 and gates FR-10/14. [Source: docs/planning-artifacts/epics.md#UX Design Requirements (UX-DR-20); docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md:69]

### The font is MANROPE — and here it matters (re-read the callout)
2.2 could ignore the Outfit/Manrope discrepancy because icons render no text. **This story renders text, so it cannot.** Render "MealLoop" + the tagline in **Manrope** to match the shipped site (`src/app/[locale]/layout.tsx:11`). Manrope's variable font covers Cyrillic (the site loads `subsets: ["latin","cyrillic"]`), so `/uk` renders in-brand. Do not chase the stale "Outfit + add cyrillic subset" guidance in the planning docs — it is the known CP-1 reconciliation debt. [Source: src/app/[locale]/layout.tsx:2,11; docs/implementation-artifacts/deferred-work.md → "Planning docs still name Outfit"]

### The "wordmark" is TEXT, not a vector
There is no `brand-wordmark.svg`. `logo.tsx` composes the brand lockup as `<BrandMark/>` (the SVG) + `<span>MealLoop</span>` in `font-semibold tracking-tight text-foreground`. Reproduce that in the OG card: the mark SVG + the literal text "MealLoop" in Manrope ~600. [Source: src/components/logo.tsx]

### Per-locale REQUIRES a code route — the dynamic-segment gotcha (load-bearing)
`[locale]` is a **single** dynamic segment, so a plain static `src/app/[locale]/opengraph-image.png` would serve **one image to both `/en` and `/uk`** — the file convention does not fork a static file per dynamic param value. UX-DR-20 + AC-2/AC-3 require a **localized** tagline → two distinct images → you **must** use a code route (`opengraph-image.tsx`) that reads `params.locale`. This does **not** mean Satori: the route just returns pre-rendered committed PNG bytes (a `Response`), keeping it static-by-bytes per AR-9. [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md — `params` prop + "default export should return a Blob | … | Response"; Next 16: `params` is a promise.]

### Keeping it static-not-Satori (AR-9) — the chosen approach
Architecture locked this: *"the OG-image Satori risk is sidestepped by the static-export decision"* and *"static `opengraph-image.(png|jpg)` per locale"* (architecture.md:253,686; AR-9). Satori (`next/og`) is flexbox-only, ~500KB cap, partial SVG support — overkill and risky for this. **Approach:** pre-render the two PNGs **offline** (Task 1–2, `rsvg-convert` + installed Manrope) and have the `opengraph-image.tsx` route **read + return the committed bytes** by locale. This mirrors the 2.2 pattern exactly: one-time local tooling, committed binaries, **no new deps, no runtime/build-time rasterization**.
- **Documented alternative (deprioritized by AR-9):** `opengraph-image.tsx` using `ImageResponse` from `next/og`, loading the Manrope ttf, composing mark + text at build (statically optimized). `next/og` ships **with** Next (not a new npm dep), handles Manrope weights + text wrapping more robustly, and our composition (paper + mark + 2 lines) is well within Satori's limits. AR-9 still prefers the static asset, so the static approach above is the spec — but if offline text rendering proves fiddly (variable-font weight, manual wrapping), this is the sanctioned fallback. **See the open question at the end of this story; confirm before building.**

### Single-sourcing tension — the tagline is baked (note, not a bug)
NFR-5/AR-15 make the catalog the source of truth for copy. A **static** OG asset bakes the tagline into the pixels at generation time, so a future `hero.headline` copy change requires **regenerating** the PNG. This is inherent to static OG images (the alternative — reading the catalog at request time — forces dynamic/Satori, which AR-9 rejects). Acceptable; just copy the catalog string **verbatim** at generation and leave the catalog authoritative. (Same spirit as 2.2 baking literal hex into icons.)

### No new deps, no SVGR (the 2.1 deferral stays deferred)
2.1 deferred single-sourcing the brand-mark path data to 2.2/2.3 *"only if the favicon/OG work brings SVG tooling into the repo anyway."* It does **not**: the mark SVG is consumed by `rsvg-convert` **at generation time**, never `import`ed into the bundle, so no `@svgr/webpack`, no Turbopack `*.svg` loader, no `*.svg` type decl. Adding any would violate AC-4/AC-5. Leave the deferral logged. [Source: docs/implementation-artifacts/deferred-work.md → "Deferred from: code review of 2-1"; concurred by 2.2's resolution.]

### Static-prerender / RSC discipline (AC #4)
The `opengraph-image.tsx` route must stay **statically optimized**: it reads a committed file via `fs` at **build** time (not a request-time API) and uses only `params` (the route's own dynamic param). No cookies/headers, no uncached fetch, no `'use client'`. Verify both `/en` and `/uk` OG routes prerender in the route table; if either flips to `ƒ`, a request-time API leaked in — back it out. The parent `app/[locale]/layout.tsx` already exports `generateStaticParams`, which covers the OG route's params. [Source: opengraph-image.md "statically optimized unless they use Request-time APIs"; src/app/[locale]/layout.tsx:29-31]

### Documented dimensions = 1200×630
The OG/Twitter standard and the Next doc's canonical example are **1200×630** (1.91:1). "Documented dimensions" (AC-1/FR-14) resolves to this. Under both the 8MB OG and 5MB Twitter caps trivially. [Source: opengraph-image.md size example (1200×630).]

### Literal hex in baked assets (the recurring gotcha)
Same as 2.2: the PNG renders outside the DOM (in a card crawler) and cannot read tokens. Use **light** literals — paper `#f5f4f1` (`--background`/`--paper`), brand `#2E7D4F` (light `--brand`/`--primary`), ink `#1a1918` (`--foreground`), optional muted `#6d6c6a` (`--muted-foreground`). **Never** dark tokens (`#4faa70`, `#1a1816`). [Source: src/app/globals.css:61,67,87(brand),92(paper),65(muted-fg); dark block ~130 (do not use).]

### Tooling availability (confirmed on this machine)
- `rsvg-convert` (`/opt/homebrew/bin/rsvg-convert`) — SVG→PNG via fontconfig; **preferred** (picks up installed fonts).
- `magick`/`convert` (`/opt/homebrew/bin/`) — SVG→PNG, plus Pango text + explicit `-font <ttf>` for reliable variable-font weight; the weight-fallback path.
- **Manrope is installed:** `/Users/bogdanbakhmetyev/Library/Fonts/Manrope-VariableFont_wght.ttf` (covers latin **and** cyrillic) — so faithful Manrope text rasterizes offline with no text-to-path step required (only as a fallback if weight selection misbehaves).
- `next/og` (`ImageResponse`) is present in `node_modules/next` (bundled — not a new dep) — for the fallback approach only.
Generation commands are one-time and are **not** added to `package.json` scripts or the build; the committed PNGs are the deliverable.

### Project Structure Notes
- Route file: `src/app/[locale]/opengraph-image.tsx` — exactly the architecture's planned slot (architecture.md:481), but realized as a **static-bytes-returning route**, not a Satori generator (per AR-9 / architecture.md:686).
- Committed PNGs: `public/og/og-{en,uk}.png` (recommended). Alternative is colocating beside the route under `src/app/[locale]/`, but `public/og/` gives bracket-free fs paths and direct fetchability.
- File naming: `opengraph-image` is a Next reserved metadata filename — do not rename/number-suffix unless intentionally using `generateImageMetadata`.
- No conflict with 2.1 (`logo.tsx`/`public/brand/*`) or 2.2 (`favicon.ico`/`icon.svg`/`apple-icon.png`) — this story only **reads** `public/brand/brand-mark.svg` and writes the new route + PNGs.

### Previous-story / Epic intelligence
- **Story 2.1 (done)** established `public/brand/brand-mark.svg` (mark-only, `currentColor`, flip-transform, two paths). Reuse verbatim; only swap `currentColor`→`#2E7D4F` and add the paper background — **`src/app/icon.svg` is the exact precedent**. [Source: public/brand/brand-mark.svg; src/app/icon.svg]
- **Story 2.2 (done)** proved the house pattern: generate committed static binaries with one-time local tooling, no new deps, no runtime generation, wired by Next file convention. This story is the same pattern for OG. It also documented the literal-hex rule and the headless visual-AC limit — both apply here.
- **Headless env cannot close visual ACs.** Card-validator rendering + small-size legibility (AC-2/AC-3, Task 7) need a human/third-party validator (Epic-1 AI-1). Verify structurally (PNG dims/format, og:image tags emitted, absolute + distinct per locale) and flag the visual portion for human verification rather than claiming it.
- **Brand mark is thin line-art** — at OG scale it's fine, but confirm small-thumbnail legibility; do not redraw (AR-8: adapt, don't redraw).

### Scope boundaries — do NOT do these in 2.3 (they belong elsewhere)
- **Twitter card + per-locale OG title/description + locale alternates** (`twitter-image`, `generateMetadata`, `openGraph.images`) → **Story 3.5 / 3.2** (FR-10). 2.3 = the image asset + auto-emitted `og:image*` only.
- **JSON-LD logo reference** → **Epic 3** (FR-9).
- **Logo component / `public/brand/*`** → **Story 2.1** (done) — read-only here.
- **Favicon / icon.svg / apple-icon** → **Story 2.2** (done) — do not touch.
- **SVGR / Turbopack SVG-import tooling** → not needed (see note); leave the 2.1 deferral as-is.
- **`globals.css` token edits, copy/catalog changes, analytics, mobile menu** → other epics.

### References
- [Source: docs/planning-artifacts/epics.md#Story 2.3: OG / social-share image] — the three BDD ACs (static per-locale opengraph-image; mark+wordmark+localized tagline, no mockup; both locales render the real mark in validators).
- [Source: docs/planning-artifacts/epics.md#Functional Requirements] — FR-14 (real OG image from brand assets at documented dimensions, consumed by FR-10); FR-10 (the consuming metadata — Epic 3, out of scope here).
- [Source: docs/planning-artifacts/epics.md#Additional Requirements] — AR-8 (brand-asset lock = critical path; adapt, not redraw), **AR-9 (static `opengraph-image` preferred over `next/og`)**, AR-4 (static prerender), AR-13 (lean gate), AR-6 (no net-new deps).
- [Source: docs/planning-artifacts/epics.md#UX Design Requirements] — **UX-DR-20** (OG composition: mark + wordmark + localized tagline on paper, no device mockup, legible at small sizes; gates FR-10/14).
- [Source: docs/planning-artifacts/architecture.md:253,349,481,686] — static `opengraph-image.(png|jpg)` per locale; OG asset under `src/app/` file-convention; the route slot; Satori risk sidestepped by static-export.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md] — Next 16 convention: static image files auto-emit `og:image*`; code route default export returns `Blob|Response`; `params` prop (now a promise in v16); `size`/`alt`/`contentType` config exports; statically optimized unless request-time APIs used; 8MB OG / 5MB Twitter caps.
- [Source: src/app/[locale]/layout.tsx:2,11,16-27,29-31] — **Manrope** font (latin+cyrillic); existing `metadata`/`metadataBase`/`openGraph` (leave the `openGraph.images` wiring to 3.5); `generateStaticParams`.
- [Source: src/components/logo.tsx] — brand lockup = `<BrandMark/>` SVG + "MealLoop" text in Manrope `font-semibold`; the OG wordmark mirrors this.
- [Source: public/brand/brand-mark.svg + src/app/icon.svg] — mark vector + the exact mark-on-paper-with-green-fill precedent to reuse.
- [Source: messages/en.json + messages/uk.json → hero.headline] — the localized taglines to bake.
- [Source: src/lib/site.ts:20-21,28-31] — `SITE_ORIGIN` (drives absolute og:image URLs via metadataBase); `SITE.name` = "MealLoop".
- [Source: src/app/globals.css:61,65,67,87,92] — exact light hex: paper `#f5f4f1`, ink `#1a1918`, muted-fg `#6d6c6a`, brand `#2E7D4F`.
- [Source: docs/implementation-artifacts/deferred-work.md] — Outfit→Manrope reconciliation (CP-1); 2.1 SVGR single-sourcing deferral (do not action here).
- [Source: docs/implementation-artifacts/2-2-favicon-app-icon-set.md] — the house pattern (committed static binaries, file-convention wiring, literal hex, headless visual-AC limit).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.7)

### Debug Log References

- **Variable-font weight (the story's flagged risk):** fontconfig reports Manrope's default named instance as *ExtraLight* (200), so librsvg could have rasterized the wordmark at the wrong weight. Empirically confirmed it does NOT: rendering "MealLoop" at weights 200/400/600/800 gave monotonically increasing ink (4140 / 6586 / 8771 / 10817 black-px), and the committed wordmark's native ink (8742 black-px) matched the 600 reference. librsvg honors the `wght` axis → no text-to-path or ImageMagick/Pango fallback needed.
- **OG route prerendered as `ƒ` `/-/opengraph-image`** on the first build — the Dev Note's assumption (metadata route inherits the parent layout's `generateStaticParams`) is false in Next 16. Fixed by adding a route-local `generateStaticParams()` over `LOCALES`; rebuild shows `●` SSG with `/en/opengraph-image` + `/uk/opengraph-image`.

### Completion Notes List

- **Approach = AR-9 static-bytes (NOT `next/og`/Satori).** Resolved the story's "confirm before building" open question in favor of the spec'd static approach: the empirical weight test (above) showed offline text rendering is *not* fiddly, so the sanctioned `next/og` fallback (which would also violate AC-1's "no `ImageResponse`") was unnecessary. The route returns committed PNG bytes selected by `params.locale`.
- **Generation pipeline (one-time, offline, no repo deps):** a throwaway Python generator (`/tmp/og-build/gen.py`) reads `public/brand/brand-mark.svg`, lifts the flip-transform `<g>` + both `<path>`s **verbatim**, swaps `currentColor`→`#2E7D4F`, and composes each 1200×630 card (paper `#f5f4f1`, mark ~140px, "MealLoop" Manrope-600 `#1a1918`, hand-wrapped 2-line tagline Manrope-450 `#6d6c6a`). `rsvg-convert` rasterizes; `magick … -alpha off -strip PNG24` flattens to opaque. Neither tool is added to `package.json`/build.
- **Wired** via `src/app/[locale]/opengraph-image.tsx`: exports `size`/`contentType`/`alt` + `generateStaticParams`, default async export awaits `params.locale`, allowlists it against `LOCALES` (traversal guard) then `readFile`s `public/og/og-${locale}.png` and returns a `Response`. No `next/og`, no `'use client'`, no new deps, no SVGR.
- **Structural verification (all green):** build passes tsc+ESLint; `/[locale]` and the OG route both static (`●`); `/en` & `/uk` emit `og:image`(+`:width=1200`/`:height=630`/`:type=image/png`/`:alt`) at **absolute** `SITE_ORIGIN` URLs that **differ per locale**; each URL → HTTP 200 PNG whose bytes match the committed file.
- **Visual ACs (AC-2 / AC-3 small-size legibility, Task 7):** rendered cards inspected directly in-session (mark reads, weights correct, Cyrillic renders in Manrope, taglines differ). The **live third-party card-validator render on the deployed URL remains a human follow-up** (Epic-1 AI-1 headless limit) — not claimed as machine-verified.
- **Single-sourcing note:** taglines are baked into the pixels at generation time (inherent to static OG per AR-9). A future `hero.headline` copy change requires regenerating the two PNGs; the catalog stays authoritative.

### File List

- `src/app/[locale]/opengraph-image.tsx` (new) — Satori-free per-locale OG route (static bytes).
- `public/og/og-en.png` (new) — committed EN OG card, 1200×630.
- `public/og/og-uk.png` (new) — committed UK OG card, 1200×630.
- `docs/implementation-artifacts/2-3-og-social-share-image.md` (modified) — this story file.
- `docs/implementation-artifacts/sprint-status.yaml` (modified) — 2-3 status transitions.

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-06-22 | Story 2.3 created (ready-for-dev) — per-locale static OG image via a Satori-free `opengraph-image.tsx` route over pre-rendered Manrope-text PNGs. |
| 2026-06-22 | Implemented 2.3: generated two 1200×630 Manrope-text OG PNGs (mark + wordmark + localized tagline on paper) and wired `src/app/[locale]/opengraph-image.tsx` (static bytes, route-local `generateStaticParams`, `LOCALES` traversal guard). Build clean; OG route prerenders `●` per locale; `og:image*` tags absolute + distinct per locale. Status → review. |
