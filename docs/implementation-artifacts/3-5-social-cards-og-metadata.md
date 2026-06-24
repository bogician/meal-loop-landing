---
baseline_commit: 26e6a4a95fc64754dde1b0ae49f15f2a1ac9d2f7
---

# Story 3.5: Social cards / OG metadata

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a person who receives a shared link,
I want the preview card to show a correct title, description, and image,
so that the shared link is compelling and accurate in both languages.

This is the **final story of Epic 3 (SEO & Discoverability)** and the consumer half of the OG seam Story 2.3 opened. Story 2.3 shipped the **image asset** (the two committed 1200×630 PNGs + the `opengraph-image.tsx` route that auto-emits `og:image`/`:width`/`:height`/`:type` and, framework-driven, `twitter:card`/`twitter:image`). Story 3.2 shipped per-locale `<title>`/`<meta description>` + canonical/hreflang in `generateMetadata`. **This story (FR-10) layers the richer per-locale Open Graph + Twitter card metadata** — `og:title`/`og:description`/`og:type`/`og:url` and `twitter:card`/`twitter:title`/`twitter:description` — **onto the home route's `generateMetadata`, so each locale's share card carries language-correct copy backed by that locale's real OG image.**

## Acceptance Criteria

1. **Per-locale Open Graph + Twitter card metadata via `generateMetadata`** — Given `/en` and `/uk`, when metadata renders, then `generateMetadata` in `src/app/[locale]/page.tsx` returns an `openGraph` block (`type: "website"`, per-locale `title` + `description` from the catalog, `url` = `localeUrl(locale)`) **and** a `twitter` block (`card: "summary_large_image"`, per-locale `title` + `description`). Title/description are resolved from the existing `metadata` catalog namespace (en ≠ uk), not hardcoded (FR-10, FR-4).

2. **Cards reference the real per-locale OG image — auto-wired, not hand-set** — Given the built `<head>` of `/en` and `/uk`, when inspected, then each emits `og:image` **and** `twitter:image` pointing at that locale's `opengraph-image` route (`…/en/opengraph-image` on `/en`, `…/uk/opengraph-image` on `/uk`) at an **absolute** URL (resolved via `metadataBase` = `SITE_ORIGIN`), with `og:image:width=1200`/`:height=630`/`:type=image/png`. The `images` are supplied by the **Story 2.3 file-convention route**, not by hand-written `images` in `generateMetadata` (FR-10, FR-14, UX-DR-20).

3. **Correct, distinct, single-source signals** — Given `/en` and `/uk`, when crawled, then `og:title`/`og:description`/`twitter:title`/`twitter:description` are **language-correct and differ between locales**; each tag appears **exactly once** (the page's `openGraph` replaces the layout's static fallback block on the home route — no duplicates); and the OG image reflects the **real brand mark, not the placeholder** (FR-10, NFR-7).

4. **Static + derived, no new deps/catalog keys** — Given the home route, when it renders metadata, then `generateMetadata` **reads no cookies/headers/dynamic API** (route stays statically prerendered — `●`, not `ƒ`), every URL **derives from `SITE_ORIGIN`/`localeUrl`** (no hardcoded absolute URL), **no new dependency** is added (AR-6), and **no `messages/*.json` keys are added** — `og`/`twitter` copy reuses the existing `metadata.{title,description}` (en/uk key trees stay identical, AR-15) (AR-4, AR-5, NFR-5).

## Tasks / Subtasks

- [x] **Task 1 — Add `openGraph` + `twitter` to the home route's `generateMetadata` (AC: #1, #2, #3, #4)**
  - [x] In `src/app/[locale]/page.tsx`, extend the **existing** `generateMetadata` return (it already returns `title`/`description`/`alternates` from Story 3.2 and already resolves `t = getTranslations({ locale, namespace: "metadata" })` after `setRequestLocale(locale)` — reuse that same `t`, do **not** add a second `getTranslations` call). Add two sibling keys:
    ```ts
    return {
      title: t("title"),
      description: t("description"),
      alternates: { /* …unchanged Story 3.2 canonical + hreflang… */ },
      openGraph: {
        type: "website",
        siteName: SITE.name,
        url: localeUrl(locale),
        title: t("title"),
        description: t("description"),
        // NO `images` key — see Task 2 / Dev Notes. The Story 2.3
        // opengraph-image route supplies the per-locale og:image.
      },
      twitter: {
        card: "summary_large_image",
        title: t("title"),
        description: t("description"),
        // NO `images` key — same reason; the route supplies twitter:image.
      },
    };
    ```
  - [x] Add `SITE` to the existing `@/lib/site` import (currently `import { DEFAULT_LOCALE, localeUrl } from "@/lib/site";` → add `SITE`). `og:site_name` = `SITE.name` ("MealLoop") is a single-sourced brand constant. Do **not** inline the string.
  - [x] `og:url`/`twitter` copy reuse the **same** `localeUrl(locale)` and `metadata.{title,description}` already used by canonical (3.2) and JSON-LD (3.4) — one URL source, one copy source. Do **not** introduce a `structuredData`/`og`/`social` catalog namespace.
  - [x] Keep `generateMetadata` free of `cookies()`/`headers()`/`searchParams` (AR-4) — you are only adding static object literals + catalog reads, so the route stays `●` SSG (verified in Task 3).

- [x] **Task 2 — Do NOT set `images` in either block; rely on the file-convention route (AC: #2)**
  - [x] **Omit `openGraph.images` and `twitter.images` entirely.** This is the load-bearing decision (verified — see Dev Notes "The merge behavior"): Next's `mergeStaticMetadata` injects the Story 2.3 `opengraph-image` route's image into `target.openGraph.images`/`target.twitter.images` **only when the page's own `openGraph`/`twitter` does not declare `images`** (`source.openGraph.hasOwnProperty('images')` must be false). Because the route is enumerated per locale (`/en/opengraph-image`, `/uk/opengraph-image`), omitting `images` is exactly what gives **each locale its own correct image automatically**.
  - [x] **Do NOT hand-write an `og:image`/`twitter:image` URL** to "be explicit." Setting `openGraph.images: [`${localeUrl(locale)}/opengraph-image`]` would (a) suppress the clean file-convention merge, (b) hardcode the route path (an absolute-URL/single-sourcing violation, AR-5), and (c) double-emit the image. The omit-images path is both cleaner and the only one that keeps URLs single-sourced.
  - [x] **Do NOT add a `twitter-image.tsx` route or a `twitter-image` PNG.** When no `twitter-image` exists, Next derives `twitter:image` from `opengraph-image` (confirmed in the built HTML). A separate Twitter image is out of scope and would duplicate the asset.
  - [x] **Accept the brand-level English `og:image:alt`/`twitter:image:alt`.** Both come from the route's `alt` export ("MealLoop — a calm weekly meal planner") and are **not** per-locale today. Localizing the image alt would require either `generateImageMetadata` in the route or setting `openGraph.images` with a per-locale `alt` here — the latter re-triggers the suppression in the previous bullet. Leave the alt as-is; per-locale image alt is **out of scope** (log only if you think it matters — it is a minor a11y nicety on a crawler-facing image, not an AC).

- [x] **Task 3 — Leave `layout.tsx`, the OG route, and the catalogs unchanged (AC: #3, #4)**
  - [x] **Do not touch `src/app/[locale]/layout.tsx`.** Its static `metadata.openGraph` (`title: "MealLoop"`, `description`, `type: "website"`) stays as the **fallback** for pages without their own `openGraph` (today: `not-found.tsx`). On the home route, the page's `openGraph` (Task 1) **shallowly replaces** the layout's — Next merges `openGraph` by replacement, not deep-merge — so there is no duplication and no need to edit the layout. `metadataBase` (also in the layout) is what resolves the route image to an absolute URL — leave it.
  - [x] **Do not touch `src/app/[locale]/opengraph-image.tsx`** or the two `public/og/og-{en,uk}.png` — the image asset + route are done (Story 2.3). This story only consumes them.
  - [x] **Do not edit `messages/en.json`/`messages/uk.json`.** OG/Twitter copy reuses `metadata.{title,description}`; no new keys (AR-15). This story ships **zero catalog changes** (same as Story 3.4).

- [x] **Task 4 — Verify per-locale OG/Twitter tags on both locales (AC: #1, #2, #3, #4)**
  - [x] Quality gate: `npm run build` (runs `tsc --noEmit`) + `npm run lint` — both must pass.
  - [x] **Static (AC4):** the build route table still shows `● /[locale]` (`/en`, `/uk`) prerendered SSG (not `ƒ`) — proves no request-time API was introduced.
  - [x] Inspect the prerendered HTML (`.next/server/app/en.html`, `.next/server/app/uk.html` — the Story 3.1/3.2/3.3/3.4 grep method) and confirm on **each** locale:
    - `og:title` + `og:description` are the **language-correct** catalog values (en ≠ uk), `og:type=website`, `og:url` = `…/{locale}`, `og:site_name=MealLoop` (AC1, AC3).
    - `og:image` = `…/{locale}/opengraph-image` (absolute, that locale's route), plus `og:image:width=1200`, `:height=630`, `:type=image/png` (AC2).
    - `twitter:card=summary_large_image`, `twitter:title`/`twitter:description` language-correct (en ≠ uk), `twitter:image` = `…/{locale}/opengraph-image` (AC1, AC2).
    - **Exactly one** of each `og:title`/`og:description`/`og:image`/`twitter:title`/`twitter:image` per page — no duplicate from the layout's fallback block (AC3).
    - `/en` image URL ≠ `/uk` image URL (per-locale image) (AC2, AC3).
  - [x] **Headless-env honesty (Epic 1 → 2.3/3.1/3.2/3.3/3.4 pattern):** live card validators (Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector, iMessage/Slack/Telegram preview) **cannot run headless**. Record the live card-render check as an **outstanding human follow-up after deploy**; the agent claims only the structural verification above (tags present, absolute, distinct per locale, single-source, static route). This closes Story 2.3 Task 7's deferred live-validator check too — note it.

## Dev Notes

### What this story is (and is not)

This is the **metadata** half of FR-10: per-locale `openGraph` + `twitter` objects added to the **existing** `generateMetadata` in `src/app/[locale]/page.tsx`. It touches framework surface (Next 16 Metadata API merge behavior), so the `AGENTS.md` mandate applies — the merge facts below are derived from the **bundled** docs (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` §Merging; `…/03-file-conventions/01-metadata/opengraph-image.md`) and **verified empirically against the installed resolver** (`node_modules/next/dist/lib/metadata/resolve-metadata.js` `mergeStaticMetadata`).

**The change is one file: `page.tsx`.** No catalog edits, no layout edits, no OG-route edits, no new deps. (Same tight shape as Story 3.4.)

**Out of scope (do NOT touch):**
- **The OG image asset + route** → done in Story 2.3 (`opengraph-image.tsx`, `public/og/og-{en,uk}.png`). Consume, don't modify.
- **`<title>`/`description`/canonical/hreflang** → done in Story 3.2. You reuse the same `metadata` catalog keys and `localeUrl`; do not alter the `alternates` block.
- **JSON-LD** → done in Story 3.4 (`lib/structured-data.ts` + the `<script>` in `page.tsx`). Leave the `<script>` and builder alone.
- **A `twitter-image` route/asset, `generateImageMetadata`, per-locale image alt** → not needed (see Task 2). The OG route already feeds `twitter:image`.
- **The proxy's `Set-Cookie`/hreflang-header-on-OG-image matter** (deferred-work item from 2.3) → shared-proxy change, **out of scope**.

### Current state (audited against `baseline_commit` 26e6a4a) — what exists today

- **`src/app/[locale]/page.tsx`** has `generateMetadata` returning `title`/`description`/`alternates` (Story 3.2) and a `Home` default export injecting JSON-LD (Story 3.4). `setRequestLocale(locale)` + `getTranslations({ locale, namespace: "metadata" })` are already wired in **both** functions. `export const dynamicParams = false` is set. **Task 1 adds `openGraph` + `twitter` to the `generateMetadata` return — nothing else changes here.** It currently imports `{ DEFAULT_LOCALE, localeUrl } from "@/lib/site"` (add `SITE`).
- **`src/app/[locale]/layout.tsx`** holds a **static, English-only** `metadata.openGraph` (`title: "MealLoop"`, a description, `type: "website"`) plus `metadataBase: new URL(SITE_ORIGIN)`. This was deliberately left by Stories 3.2/2.3 as the fallback for OG localization. It stays untouched (Task 3): the page's `openGraph` replaces it on the home route; it remains the default for `not-found.tsx`.
- **`src/app/[locale]/opengraph-image.tsx`** (Story 2.3) is a static-bytes route with `generateStaticParams` over `LOCALES`, exporting `size = {1200,630}`, `contentType = "image/png"`, `alt = "MealLoop — a calm weekly meal planner"`, and returning `public/og/og-${locale}.png`. It prerenders `/en/opengraph-image` + `/uk/opengraph-image` as `●` SSG and **auto-emits** `og:image*` (and, framework-driven, `twitter:card`/`twitter:image*`).
- **`src/lib/site.ts`** exports everything needed — `SITE` (`{ name: "MealLoop", email }`), `SITE_ORIGIN`, `localeUrl(locale)`, `DEFAULT_LOCALE`, `LOCALES`. **No change required.**
- **`messages/{en,uk}.json`** both have `metadata.{title,description}` (Story 3.2), language-correct, identical key trees. Reuse for OG/Twitter copy — **no edit.**

### The merge behavior — why "omit images" is correct (verified, load-bearing)

The one fact that makes or breaks this story: **does the file-convention `opengraph-image` route's image survive when the page's `generateMetadata` declares its own `openGraph` (without `images`)?** Reading the bundled docs alone is ambiguous (they say `openGraph` is **replaced**, not deep-merged, by the leaf segment — `generate-metadata.md` §Merging, lines 1326–1358). The decisive logic is in the installed resolver:

```js
// node_modules/next/dist/lib/metadata/resolve-metadata.js  (mergeStaticMetadata)
// file based metadata is specified and current level metadata openGraph.images is not specified
if (openGraph && !(source?.openGraph?.hasOwnProperty('images'))) {
    target.openGraph = resolveOpenGraph({ ...target.openGraph, images: openGraph /* the route image */ }, …);
}
// …identical guard for twitter.images…
```

`source` is the **leaf page's own metadata** (the `generateMetadata` return — call site at line 311 passes `metadata` as `source`). So: if the page's `openGraph` **omits `images`**, the route's per-locale image is merged back in **after** the page replaces the layout's `openGraph`; if the page **sets `images`**, the file-convention merge is **skipped**.

**Verified empirically** (probe build during story authoring: added `openGraph`/`twitter` without `images` to `generateMetadata`, built, grepped, reverted). Result on both locales:
- `/en` → `og:image` & `twitter:image` = `https://meal-loop.com/en/opengraph-image?<hash>`; `/uk` → `…/uk/opengraph-image?<hash>` (per-locale, absolute).
- `og:title`/`description` and `twitter:title`/`description` language-correct (en ≠ uk); `twitter:card=summary_large_image`; `og:image:width/height/type` present; **one** of each tag (page `openGraph` replaced the layout's, no dupes); `● /[locale]` stayed SSG.

→ **Omit `images` in both blocks** (Task 2). It is cleaner, single-sources every URL, and is the *only* path that yields the correct localized image without hardcoding a route URL.

### Architecture & convention guardrails (must follow)

- **Static-prerender discipline (AR-4):** no `cookies()`/`headers()`/`searchParams` in `generateMetadata`. Adding object literals + catalog reads keeps it static — confirm `●` SSG in the route table (Task 4). The probe build confirmed the route stays SSG with these blocks present.
- **Absolute URLs derived from `SITE_ORIGIN` (AR-5, architecture §Format Patterns):** `og:url` uses `localeUrl(locale)`; the image URL is resolved by Next against `metadataBase` (the layout's `SITE_ORIGIN`). **Never** hardcode `https://meal-loop.com…` or the `/opengraph-image` path.
- **Single-sourced copy + constants (NFR-5, AR-15):** OG/Twitter title+description reuse `metadata.{title,description}`; `og:site_name` = `SITE.name`. No new catalog keys; en/uk trees stay identical.
- **RSC/server-only (§Process Patterns):** `page.tsx` is a Server Component; `generateMetadata` is server-only. Do **not** add `'use client'`.
- **No new deps (AR-6):** `openGraph`/`twitter` are plain `Metadata` fields — `import type { Metadata }` is already present. Do **not** add `schema-dts`, an OG library, or a `twitter-image` toolchain.
- **Code style (project-context):** double-quoted imports + semicolons in app code (match the existing `page.tsx`). This is hand-written app code, not shadcn `ui/*`.
- **No test runner (AR-13):** verify via build + route table + prerendered-HTML grep. Do **not** add `*.test.tsx`.

### Decisive scope boundaries — do NOT do these

- **Do not** set `openGraph.images` or `twitter.images` (suppresses the per-locale file-convention image and forces a hardcoded URL).
- **Do not** add a `twitter-image.tsx` / `twitter-image` PNG — `twitter:image` is derived from `opengraph-image`.
- **Do not** edit `layout.tsx` (keep its static `openGraph` as the `not-found` fallback; keep `metadataBase`).
- **Do not** edit `opengraph-image.tsx`, `public/og/*`, `structured-data.ts`, the JSON-LD `<script>`, `sitemap.ts`, `robots.ts`, `routing.ts`, `proxy.ts`, or the `alternates` block.
- **Do not** add catalog keys (reuse `metadata.{title,description}`; AR-15 trees stay identical).
- **Do not** localize `og:image:alt` here (would require setting `images`, re-triggering the suppression) — accept the brand-level English alt from the route.
- **Do not** add `'use client'` or any dependency.

### Previous-story intelligence (Epic 1–3)

- **Story 2.3 opened this exact seam:** *"FR-10 (Story 3.5, Epic 3) = the richer per-locale Open Graph + Twitter card metadata … layered on top via `generateMetadata`."* It also accepted (Bogdan, 2026-06-22) that the OG route already ships `twitter:card`/`twitter:image*` framework-driven, *"Story 3.5 will override rather than introduce these tags."* This story is that override — and it **closes 2.3's deferred live-card-validator follow-up** (record it in Task 4).
- **Story 3.2 reserved OG explicitly:** *"Do not add `openGraph`/`twitter` here — Open Graph + Twitter card metadata is Story 3.5"*, and *"layout statics remain the fallback default for pages without their own metadata"* — exactly the fallback this story preserves.
- **Story 3.4 set the no-catalog-edit precedent:** reused `metadata.description` for JSON-LD rather than minting a namespace; this story applies the identical reuse to OG/Twitter copy (zero `messages/*.json` changes, en/uk trees identical).
- **Static + prerendered-HTML-grep verification (3.2/3.3/3.4):** every prior SEO story verified static via the route table and parity via `.next/server/app/{en,uk}.html` grep — apply the identical method (Task 4).
- **Headless-env honesty (Epic 1 → 2.x → 3.x):** live external validators are human follow-ups; the agent claims only build + structural verification.
- **Manrope, not Outfit / baked-asset hex:** irrelevant to this metadata-only story (the image was baked in 2.3) but consistent with prior corrections — do not regenerate or re-touch the OG PNGs.

### Latest technical specifics (Next 16 Metadata API)

- **`openGraph` is replaced, not deep-merged**, by the leaf segment (`generate-metadata.md` §Merging). The page's `openGraph` fully supersedes the layout's on the home route — include every field you want (`type`, `siteName`, `url`, `title`, `description`); inherited fields from the layout do **not** carry over once the page sets `openGraph`.
- **File-convention image merges back via `mergeStaticMetadata`** iff the page's `openGraph`/`twitter` omit `images` (verified above). This is the mechanism that lets per-locale title/description coexist with the per-locale route image.
- **`og:type: "website"`** is the correct type for a marketing landing page; `twitter:card: "summary_large_image"` pairs with the 1200×630 image (the large-image card). Both are valid `Metadata` fields — no cast needed.
- **`og:locale` deliberately omitted:** Open Graph's `og:locale` wants `language_TERRITORY` (e.g. `en_US`, `uk_UA`). The project standardized on **language-only** codes for hreflang (Story 3.2, no region) and avoids fabricating a territory. Omit `og:locale` (it is optional); do not invent `en_US`/`uk_UA`.
- **`params` is async in Next 16** — already `await`ed in the existing `generateMetadata`; you are not changing the signature.

### Project Structure Notes

Single file changed: `src/app/[locale]/page.tsx` (extend the existing `generateMetadata` return + one import addition). No new files, directories, dependencies, exports, or catalog keys. No structural variance. The change sits entirely within the architecture's planned SEO location (`app/[locale]/page.tsx` `generateMetadata`, architecture §SEO & Metadata, §Requirements-to-Structure map FR-6–11).

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.5: Social cards / OG metadata] (lines 481–499) — the three BDD ACs (FR-10): per-locale OG + Twitter metadata referencing the real OG image; card-validator render of correct localized title/description/image; image reflects the real brand mark.
- [Source: docs/planning-artifacts/epics.md#Requirements Inventory] (line 35) — FR-10 ("Open Graph + Twitter card metadata per locale, backed by a real OG image reflecting the real brand mark"); (line 41) FR-14 (the image, Story 2.3).
- [Source: docs/planning-artifacts/epics.md#UX Design Requirements] — UX-DR-20 (OG composition: real mark + wordmark + localized tagline, no device mockup — realized in the 2.3 asset this story references).
- [Source: docs/planning-artifacts/architecture.md#SEO & Metadata] (lines 244–257) and #Format Patterns (lines 353–360) — `generateMetadata` per locale; metadata URLs always absolute and derived from `SITE_ORIGIN`; static `opengraph-image` per locale.
- [Source: docs/planning-artifacts/architecture.md#Process Patterns] (lines 372–383) — never read cookies/headers in `generateMetadata`; RSC boundary; catalog-resolved copy.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md] — `openGraph`/`twitter` field shapes; §Merging (openGraph replaced, not deep-merged, by the leaf segment); the `previousImages = (await parent).openGraph?.images` pattern (not needed here — we rely on `mergeStaticMetadata` instead).
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/opengraph-image.md] — the route auto-emits `og:image*`/`twitter:image*`; `twitter:image` derives from `opengraph-image` when no `twitter-image` exists.
- [Source: node_modules/next/dist/lib/metadata/resolve-metadata.js:126–163,311] — `mergeStaticMetadata` injects the route image into `target.openGraph.images`/`target.twitter.images` only when the page's metadata omits `images` (the verified basis for Task 2's "omit images").
- [Source: docs/implementation-artifacts/2-3-og-social-share-image.md] — the OG image asset + route (consumed here); the 2.3→3.5 scope seam; the accepted framework-driven `twitter:*` tags 3.5 overrides; the deferred live-card-validator follow-up this story closes.
- [Source: docs/implementation-artifacts/3-2-per-locale-metadata-canonical-hreflang.md] — `generateMetadata` shape, `localeUrl`, the `metadata` catalog namespace (reused here), the layout-as-fallback decision, prerendered-HTML grep + headless-env honesty.
- [Source: docs/implementation-artifacts/3-4-structured-data-json-ld.md] — the no-catalog-edit / reuse-`metadata.description` precedent; static-route + grep verification; headless-env honesty.
- Current code: `src/app/[locale]/page.tsx:19-39` (`generateMetadata` — extend), `:4` (site import — add `SITE`); `src/app/[locale]/layout.tsx:16-27` (static `openGraph` fallback + `metadataBase` — leave); `src/app/[locale]/opengraph-image.tsx` (the per-locale image route — consume); `src/lib/site.ts:46,53-56` (`localeUrl`, `SITE`); `messages/{en,uk}.json` → `metadata.{title,description}` (reuse).

## Dev Agent Record

### Agent Model Used

Claude Opus 4.7 (`claude-opus-4-8`) — BMAD `dev-story` workflow.

### Debug Log References

- `npm run build` → ✓ compiled, ✓ TypeScript, route table shows `● /[locale]` (`/en`, `/uk`) SSG (not `ƒ`) — static-prerender discipline intact (AC4).
- `npm run lint` → clean (no errors/warnings).
- Prerendered-HTML grep (`.next/server/app/{en,uk}.html`): extracted all `og:*`/`twitter:*` `<meta>` tags and counted occurrences.
- Per-tag `<meta>`-element count = **exactly 1** for each of `og:title`/`og:description`/`og:url`/`og:image`/`og:type`/`og:site_name`/`twitter:card`/`twitter:title`/`twitter:description`/`twitter:image` on both locales (the raw substring count of 2 for some tags is the RSC flight-data payload echo, not a duplicate `<head>` tag — confirmed by counting `<meta …>` element forms).
- `git diff --stat`: only `src/app/[locale]/page.tsx` (+ sprint-status tracking) changed — no layout/catalog/OG-route/`public/og` edits.

### Completion Notes List

- **Single-file change (`src/app/[locale]/page.tsx`):** added `openGraph` (`type: "website"`, `siteName: SITE.name`, `url: localeUrl(locale)`, per-locale `title`/`description`) and `twitter` (`card: "summary_large_image"`, per-locale `title`/`description`) to the existing `generateMetadata`; reused the already-resolved `t` (`metadata` namespace) — no second `getTranslations` call. Added `SITE` to the existing `@/lib/site` import.
- **Images omitted by design (Task 2):** neither block sets `images`. Verified the Story 2.3 `opengraph-image` route's per-locale image merges back via `mergeStaticMetadata` — `/en` → `…/en/opengraph-image?<hash>`, `/uk` → `…/uk/opengraph-image?<hash>` (absolute, distinct, with `og:image:width=1200`/`:height=630`/`:type=image/png`); `twitter:image` derived from the same route (no `twitter-image` asset added).
- **AC verification (build + grep, both locales):** `og:title`/`og:description`/`twitter:title`/`twitter:description` are the language-correct catalog values (en ≠ uk); `og:type=website`; `og:url`=`…/{locale}`; `og:site_name=MealLoop`; `twitter:card=summary_large_image`; exactly one of each tag (page `openGraph` replaced the layout fallback — no duplicates); `/en` image URL ≠ `/uk` image URL.
- **Zero out-of-scope changes (Task 3):** `layout.tsx` (static `openGraph` fallback + `metadataBase`), `opengraph-image.tsx`, `public/og/*`, `messages/{en,uk}.json` untouched. No new deps, no new catalog keys (en/uk trees identical). No `'use client'`.
- **`og:locale` deliberately omitted** (project standardized on language-only codes; no fabricated `en_US`/`uk_UA`) — consistent with Dev Notes.
- **`og:image:alt`/`twitter:image:alt`** are the brand-level English string from the route's `alt` export ("MealLoop — a calm weekly meal planner"), not per-locale — accepted per Task 2 (per-locale image alt out of scope; minor a11y nicety on a crawler-facing image, not an AC).
- **Outstanding human follow-up (post-deploy):** live card-render validation — Facebook Sharing Debugger, X Card Validator, LinkedIn Post Inspector, and iMessage/Slack/Telegram previews — **cannot run headless**; the agent claims only structural verification (tags present, absolute, distinct per locale, single-source, route static). This also closes Story 2.3 Task 7's deferred live-validator check.

### File List

- `src/app/[locale]/page.tsx` (modified) — added `openGraph` + `twitter` blocks to `generateMetadata`; added `SITE` to the `@/lib/site` import.

## Change Log

| Date       | Version | Description                                                                 | Author |
| ---------- | ------- | --------------------------------------------------------------------------- | ------ |
| 2026-06-23 | 1.0     | Implemented Story 3.5 — per-locale Open Graph + Twitter card metadata (FR-10) on the home route's `generateMetadata`; images auto-wired from the Story 2.3 OG route. Status → review. | Bogdan |
| 2026-06-23 | 1.1     | Adversarial code review (Blind Hunter + Edge Case Hunter + Acceptance Auditor): clean — 0 actionable findings, 8 dismissed. Status → done. | Bogdan |

## Review Findings

Adversarial code review (3 parallel layers) — **clean review, 0 actionable findings**.

- **Edge Case Hunter** confirmed the load-bearing merge premise against the installed Next resolver (`node_modules/next/dist/lib/metadata/resolve-metadata.js:149`): the file-convention `opengraph-image` route's per-locale image is injected into `og:image`/`twitter:image` precisely because both blocks omit `images` (`!source.openGraph.hasOwnProperty('images')`). Also verified `SITE.name = "MealLoop"`, `localeUrl` yields a clean absolute URL, the page's `openGraph` shallow-replaces the layout fallback with no loss, and both OG PNGs + the route exist.
- **Acceptance Auditor**: zero AC violations, zero constraint breaches. AC1 / AC3-mechanism / AC4 verified from source.
- **Blind Hunter**: 7 diff-only suspicions raised; all dismissed — disproven by the Edge Case Hunter's project reading (og:url absolute, merge premise, `SITE.name`) or intentional per spec (`og:locale` omitted, comment convention, spec-mandated `twitter.title/description`).

**Outstanding (not a defect):** AC2 emission (tags absolute, per-locale, `width=1200`/`height=630`/`type=image/png`) and AC3 "exactly once" are runtime/build properties — covered by the dev's documented build + grep and corroborated by the resolver reading. Live card-render validation (Facebook/X/LinkedIn/iMessage/Slack/Telegram) remains a post-deploy human follow-up (also closes Story 2.3 Task 7's deferred live-validator check).
