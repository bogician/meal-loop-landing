---
baseline_commit: 606114db01e61873ffc7e366b6b1202adb2064ce
---

# Story 3.3: Locale-aware sitemap & robots

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a search engine crawler,
I want a sitemap listing both language versions and a robots file pointing to it,
so that I can discover and index all indexable pages.

## Acceptance Criteria

1. **Locale-aware sitemap** — Given `src/app/sitemap.ts`, when generated, then it enumerates `/en` and `/uk` with `hreflang` annotations (`en`, `uk`, `x-default`) **derived from the same `localeUrl` map used by metadata** — the per-`<url>` alternates are reciprocal and byte-equal to the `alternates.languages` emitted by `generateMetadata` in `page.tsx` (FR-8, AR-5).
2. **Robots references the sitemap** — Given `src/app/robots.ts`, when generated, then it allows crawling of all indexable content (`User-Agent: *`, `Allow: /`, no `Disallow`) and references the sitemap via an **absolute URL derived from `SITE_ORIGIN`** (`${SITE_ORIGIN}/sitemap.xml`) (FR-8).
3. **Scope = locale landing pages only (no forward dependency)** — Given legal pages do not yet exist in this epic, when the sitemap is built, then it covers exactly the two locale landing pages (`/en`, `/uk`); legal-page URLs are added by Epic 5 Story 5.2 when those pages ship — this story creates **no** placeholder/legal entries and **no** forward dependency.
4. **Static + single-sourced URLs** — Given `sitemap.ts` and `robots.ts`, when they execute, then they **read no cookies/headers/dynamic API** (stay statically prerendered / build-cached) and **hardcode no absolute URL** — every URL derives from `SITE_ORIGIN` + `localeUrl` in `src/lib/site.ts` (AR-4, NFR-5).
5. **`SITE_ORIGIN` hardening (routed in from Story 3.2 review)** — Given a misconfigured `NEXT_PUBLIC_SITE_ORIGIN` (trailing slash, e.g. `https://meal-loop.com/`, or empty string `""`), when `SITE_ORIGIN` resolves, then it is normalized so every consumer (`metadataBase`, `localeUrl`, the sitemap, the robots `Sitemap:` line) still emits a well-formed origin-prefixed URL with no double slash and no empty origin. The existing 3.2 canonical/hreflang output for `/en` and `/uk` under the default (no-env) config must remain **byte-identical** (no regression).

## Tasks / Subtasks

- [x] **Task 1 — Harden `SITE_ORIGIN` normalization in `src/lib/site.ts` (AC: #5)**
  - [x] Change the `SITE_ORIGIN` definition so it (a) treats an empty-string env as "unset" and (b) strips any trailing slash(es) exactly once at the source:
    ```ts
    export const SITE_ORIGIN = (
      process.env.NEXT_PUBLIC_SITE_ORIGIN || "https://meal-loop.com"
    ).replace(/\/+$/, "");
    ```
    - `||` (not `??`) is deliberate — `??` keeps an empty-string env (`""`), which would produce an origin-less `/en`; `||` falls back to the production default for both `undefined` **and** `""`.
    - `.replace(/\/+$/, "")` strips one-or-more trailing slashes so `https://meal-loop.com/` → `https://meal-loop.com`, preventing `origin//en` in `localeUrl` and `origin//sitemap.xml` in robots.
  - [x] Normalize at the **constant**, not inside `localeUrl` — `SITE_ORIGIN` is consumed by three places (`layout.tsx` `metadataBase: new URL(SITE_ORIGIN)`, `localeUrl`, and the new `robots.ts`), so a single normalization covers all of them (NFR-5 single-source). Do **not** also add a `.replace` inside `localeUrl` (redundant).
  - [x] Leave `localeUrl` itself unchanged: `export const localeUrl = (locale: string): string => \`${SITE_ORIGIN}/${locale}\`;` is correct once `SITE_ORIGIN` is normalized.
  - [x] Update the `SITE_ORIGIN` comment to note the normalization (empty-env fallback + trailing-slash strip), so the `||`/`replace` intent isn't "cleaned up" later.
  - [x] **Regression guard:** under the default config (env unset, default has no trailing slash) `SITE_ORIGIN` is unchanged → the 3.2 verification (canonical/hreflang on `/en`,`/uk`) must stay byte-identical. Confirm in Task 4.
  - [x] Source obligation: this is **deferred-work.md item from the 3.2 code review** ("`localeUrl` is reused by Story 3.3's sitemap/robots — best place to add a one-time normalization … and/or switch the `SITE_ORIGIN` fallback to `||`"). It is an explicit, in-scope obligation, not optional polish.

- [x] **Task 2 — Create `src/app/sitemap.ts` (AC: #1, #3, #4)**
  - [x] Create a **new** file `src/app/sitemap.ts` (app-dir **root**, NOT under `[locale]` — there is one sitemap for the whole origin, served at `/sitemap.xml`). Default-export a `sitemap` function typed `MetadataRoute.Sitemap`:
    ```ts
    import type { MetadataRoute } from "next";

    import { DEFAULT_LOCALE, LOCALES, localeUrl } from "@/lib/site";

    export default function sitemap(): MetadataRoute.Sitemap {
      // Reciprocal hreflang set, identical on every entry and byte-equal to the
      // alternates.languages emitted by generateMetadata (app/[locale]/page.tsx)
      // — the single hreflang authority. Keep this literal in lockstep with it.
      const languages = {
        en: localeUrl("en"),
        uk: localeUrl("uk"),
        "x-default": localeUrl(DEFAULT_LOCALE),
      };

      return LOCALES.map((locale) => ({
        url: localeUrl(locale),
        alternates: { languages },
      }));
    }
    ```
  - [x] **Parity requirement (AC1):** the `languages` object MUST be byte-identical to `page.tsx`'s `alternates.languages` (`en` → `/en`, `uk` → `/uk`, `x-default` → `/en`). Both derive every URL from `localeUrl` (the "same locale→URL map used by metadata"). Each `<url>` entry carries the full reciprocal set including its own self-reference — this is what Google requires for hreflang in sitemaps.
  - [x] **Do NOT derive the `languages` map via `Object.fromEntries(LOCALES.map(...))`.** Next's `Languages<string>` is a mapped type over specific hreflang keys (`alternative-urls-types.d.ts`); a plain `{ [k: string]: string }` from `Object.fromEntries` does **not** assign to it under `strict`, and would fail `tsc`. Use the explicit literal above. (Iterating `LOCALES` for the `.map(...)` over **entries** is fine — it's only the `languages` key-map that must be a typed literal.)
  - [x] **Do NOT add `lastModified`, `changeFrequency`, or `priority`.** They are optional; `changeFrequency`/`priority` are near-ignored by Google, and a build-time `new Date()` `lastModified` fabricates a freshness signal that churns on every deploy without reflecting real content changes. Keep the entry to `url` + `alternates` only (matches the bundled localized-sitemap example). If a future story ties `lastModified` to real content dates, it can add it then.
  - [x] **Do NOT add a `/` (locale-less root) entry.** `localePrefix: "always"` means `/` only `307`-redirects to a locale — it is not an indexable 200 page. Only `/en` and `/uk` belong in the sitemap; `x-default` already points crawlers at `/en` (a 200).
  - [x] **Do NOT add legal-page URLs** (privacy/terms/cookie). They don't exist yet; Epic 5 Story 5.2 extends the sitemap when they ship (AC3 — no forward dependency).

- [x] **Task 3 — Create `src/app/robots.ts` (AC: #2, #4)**
  - [x] Create a **new** file `src/app/robots.ts` (app-dir **root**, served at `/robots.txt`). Default-export a `robots` function typed `MetadataRoute.Robots`:
    ```ts
    import type { MetadataRoute } from "next";

    import { SITE_ORIGIN } from "@/lib/site";

    export default function robots(): MetadataRoute.Robots {
      return {
        rules: { userAgent: "*", allow: "/" },
        sitemap: `${SITE_ORIGIN}/sitemap.xml`,
      };
    }
    ```
  - [x] Allow everything (`userAgent: "*"`, `allow: "/"`); the whole site is indexable, so emit **no `Disallow`**. (Do not copy the docs' `Disallow: /private/` example — there is no private area.)
  - [x] The `Sitemap:` line MUST be an **absolute** URL from `SITE_ORIGIN` (`${SITE_ORIGIN}/sitemap.xml`). Robots `Sitemap` directives are required by spec to be absolute; do not emit a relative `/sitemap.xml`.
  - [x] **Do NOT** set `host` (non-standard, Yandex-only, and it must omit the scheme — more footgun than value) or `crawlDelay`. Keep the object minimal.

- [x] **Task 4 — Verify (AC: #1, #2, #3, #4, #5)**
  - [x] Run the quality gate: `npm run build` (runs `tsc --noEmit`) + `npm run lint` — both must pass.
  - [x] Confirm the build route table lists `/sitemap.xml` and `/robots.txt` as **static** (`○` Static, not `ƒ` Dynamic) — proves Task 2/3 read no request-time API (AC4).
  - [x] Serve the production build (`npm start`) and inspect the generated output:
    - `curl -s localhost:3000/sitemap.xml` — confirm:
      - the `<urlset>` opens with both `xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"` **and** `xmlns:xhtml="http://www.w3.org/1999/xhtml"` (the xhtml namespace proves the hreflang annotations are present),
      - exactly **two** `<url>` blocks: `<loc>https://meal-loop.com/en</loc>` and `<loc>https://meal-loop.com/uk</loc>`,
      - **each** `<url>` carries **three** `<xhtml:link rel="alternate" hreflang="…"/>` — `en` → `…/en`, `uk` → `…/uk`, `x-default` → `…/en` (reciprocal, identical on both entries) (AC1, AC3),
      - no legal/`/private`/locale-less-root URLs (AC3).
    - `curl -s localhost:3000/robots.txt` — confirm `User-Agent: *`, `Allow: /`, no `Disallow:`, and `Sitemap: https://meal-loop.com/sitemap.xml` (absolute) (AC2).
  - [x] **Parity check (AC1):** diff the sitemap's three hreflang hrefs against the `<link rel="alternate" hreflang>` tags in the prerendered `.next/server/app/en.html` / `uk.html` (the Story 3.2 grep method) — the `en`/`uk`/`x-default` targets must match exactly.
  - [x] **Regression check (AC5):** confirm `/en` and `/uk` still prerender as static (`●`/`○`) and their canonical + hreflang HTML is **byte-identical** to pre-change (the `SITE_ORIGIN` normalization is a no-op under the default config). Optionally sanity-check the hardening by building once with `NEXT_PUBLIC_SITE_ORIGIN="https://meal-loop.com/"` and confirming no `//en` / `//sitemap.xml` appears — then revert the env.
  - [x] **Headless-env honesty (Epic 1 → 3.2 pattern):** live external validation — submitting/validating the sitemap in Google Search Console, an hreflang validator, or a robots.txt tester — is **not** runnable headless. Record it as an outstanding **human follow-up**; the agent claims only the structural verification above (route table + curl'd XML/text + parity diff).

### Review Findings

_Code review 2026-06-23 — three parallel layers (Blind Hunter, Edge Case Hunter, Acceptance Auditor). **Acceptance Auditor: 0 AC violations** — all 5 ACs and every "do NOT do" constraint verified clean. The items below are robustness/scope choices beyond the spec's deliberately-narrow remit._

- [x] [Review][Patch] `SITE_ORIGIN` normalization is narrower than its own comment claims [src/lib/site.ts:27-29] — ✓ **Applied & verified 2026-06-23** (lint + build clean, `/sitemap.xml` & `/robots.txt` still `○ Static`, generated output byte-identical under default config). **Option 1c (full validation):** resolve the env through `new URL().origin`, falling back to the production default on parse error or non-http(s) scheme. Closes whitespace-padded, slash-only-collapse, missing-scheme, protocol-relative, and path/query-bearing cases in one pass; preserves the AC5 regression guarantee (default config → `https://meal-loop.com`, byte-identical). _Original finding:_ the `||` + `.replace(/\/+$/, "")` form handles `""` and trailing slashes per AC5/Task 1, but a slash-only value (`"/"`, `"///"`) is truthy → passes `||` → collapses to `""` after the replace → origin-less `/en` and relative `/sitemap.xml`, the exact failure the comment claims to prevent.
- [x] [Review][Dismiss] `robots.ts` emits unconditional allow-all with no env gating [src/app/robots.ts:7-9] — **Accepted as-is 2026-06-23 → option 2a.** Correct for production per AC2; site is pre-launch and Vercel applies `X-Robots-Tag: noindex` to non-production deploys by default, so preview crawlability is already mitigated. Revisit (gate `Disallow: /` on `VERCEL_ENV !== "production"`) only if preview indexing becomes a concern near launch.
- [x] [Review][Defer] hreflang `languages` map hand-duplicated + hardcoded locale keys [src/app/sitemap.ts:9-13] — deferred, spec-sanctioned. The map is duplicated between `page.tsx` and `sitemap.ts` and hardcodes `en`/`uk` while URLs iterate `LOCALES`; a 3rd locale would silently desync the two literals' alternates. The spec explicitly defers de-duplication to the future locale-addition story and forbids the `Object.fromEntries` fix here (breaks `Languages<string>` typing under `strict`). Extends the open 3.2 deferred item.

## Dev Notes

### What this story is (and is not)

This is a **Next.js Metadata-Files** story: two new app-root convention files — `app/sitemap.ts` (→ `/sitemap.xml`) and `app/robots.ts` (→ `/robots.txt`) — plus a one-line hardening of the shared `SITE_ORIGIN` constant that 3.2's review routed here. It touches framework surface (the `sitemap`/`robots` file conventions), so the `AGENTS.md` mandate applies — the code shapes above were derived from the **bundled** Next 16 docs (read first):
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md` (esp. "Generate a localized Sitemap" + the `Sitemap` return type),
- `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md` (the `Robots` object + `Sitemap:` line).

**Out of scope (separate stories — do NOT touch):**
- **JSON-LD / structured data** → Story 3.4 (`lib/structured-data.ts`).
- **Open Graph / Twitter card metadata** → Story 3.5 (`openGraph`/`twitter` in `generateMetadata`).
- **Legal-page sitemap entries** → Epic 5 Story 5.2 (extends FR-8 once privacy/terms/cookie pages exist). AC3 is explicit: no placeholder legal URLs, no forward dependency.
- **`generateMetadata` in `page.tsx`** → already shipped (3.2). Do **not** refactor its `alternates.languages` literal in this story (see "The languages-map decision" below).
- **`proxy.ts` matcher** → the OG-image `Set-Cookie`/hreflang-header matcher tightening (deferred-work item from 2.3) is a different fix; out of scope here.

### Current state (audited against `baseline_commit` 606114d) — what exists today

- **`src/app/sitemap.ts` / `src/app/robots.ts` do NOT exist.** Both are **new** files. The app dir today holds only: `[locale]/{layout,page,not-found,opengraph-image}.tsx`, `globals.css`, `favicon.ico`, `apple-icon.png`, `icon.svg`. (Confirmed: `find src/app -type f`.)
- **`src/lib/site.ts`** exports `SITE_ORIGIN` (`process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://meal-loop.com"`, line 20–21) and `localeUrl(locale) => \`${SITE_ORIGIN}/${locale}\`` (line 26), plus `LOCALES = ["en","uk"]` and `DEFAULT_LOCALE = "en"`. The `localeUrl` doc-comment already anticipates this story ("…single-sourced for canonical/hreflang (Story 3.2) **and the sitemap/robots (Story 3.3)**"). Task 1 hardens `SITE_ORIGIN`; everything else here only **reads** these exports.
- **`src/app/[locale]/page.tsx`** (shipped in 3.2) emits, per locale, `alternates.canonical = localeUrl(locale)` and `alternates.languages = { en: localeUrl("en"), uk: localeUrl("uk"), "x-default": localeUrl(DEFAULT_LOCALE) }`. **The sitemap's `languages` map must mirror this exactly** (AC1). `page.tsx` also has `export const dynamicParams = false` (3.2 hardening) — sitemap/robots are not dynamic segments, so they need no such config.
- **`src/app/[locale]/layout.tsx`** sets `metadataBase: new URL(SITE_ORIGIN)` (line 17). The Task 1 normalization keeps `SITE_ORIGIN` a valid `new URL(...)` input (it already is) — no layout change needed.
- **`SITE_ORIGIN` consumers** (verified by grep): `layout.tsx:17` (`metadataBase`), `lib/site.ts:26` (`localeUrl`). After this story, `robots.ts` becomes a third consumer. Normalizing once at the constant covers all three.

### How Next serves these files (Next 16, from the bundled docs)

- `sitemap.(ts)` and `robots.(ts)` are **special Route Handlers** that are **cached by default unless they use a request-time API or dynamic config** (bundled docs, "Good to know"). Ours use neither → they are statically generated at build and appear as `○ Static` in the route table. **Keep it that way: do not call `cookies()`/`headers()`/`searchParams` or any dynamic API** (AR-4 static-prerender discipline — the same rule 3.2 followed for `generateMetadata`).
- `sitemap.ts` is served at the origin root `/sitemap.xml`; `robots.ts` at `/robots.txt`. They live at the **root of the app dir** (`src/app/`), not inside `[locale]` — there is one sitemap/robots per origin, enumerating locales internally.
- For a localized sitemap, returning `alternates.languages` makes Next emit `<xhtml:link rel="alternate" hreflang="…" href="…"/>` children under each `<url>` (bundled "Generate a localized Sitemap" example). This is exactly the FR-8 "hreflang annotations" requirement.

### The languages-map decision (why a literal, not a derive)

AC1 requires the sitemap's hreflang set to come "from the same locale→URL map used by metadata." Two design points the dev must respect:

1. **Use `localeUrl` for every URL** (the shared map) — satisfies "same map as metadata." ✅
2. **Keep the `languages` object a typed literal** (`{ en, uk, "x-default" }`), byte-identical to `page.tsx`. Do **not** build it with `Object.fromEntries(LOCALES.map(...))`: Next's `Languages<string>` (`node_modules/next/dist/lib/metadata/types/alternative-urls-types.d.ts`) is `{ [s in HrefLang]?: string }` — a mapped type over specific hreflang keys, **not** an index signature. A `{ [k: string]: string }` from `Object.fromEntries` won't assign to it under `strict: true` and breaks `tsc`.

The 3.2 review flagged (deferred-work) that `page.tsx`'s `en`/`uk` hreflang keys are hardcoded rather than derived from `LOCALES`, and that "Story 3.3's sitemap will face the same locale-enumeration choice; keep them consistent." The consistent, type-safe choice **today** (2 locales) is the literal on both sides. Unifying both into one shared, `LOCALES`-derived, `Languages`-typed helper is a **future-locale** cleanup (when a 3rd locale is added) and is explicitly deferred — do not refactor the already-shipped, reviewed `page.tsx` in this story. If you want zero duplication now, the only safe move is a shared helper that returns a `Languages<string>`-typed **literal**; that still edits `page.tsx`, so leave it for the locale-addition story per the deferred note. **For 3.3: keep the literal in `sitemap.ts`, matching `page.tsx`.**

### Files to touch

- `src/lib/site.ts` — **UPDATE**: harden `SITE_ORIGIN` (empty-env `||` fallback + trailing-slash strip). One line + comment.
- `src/app/sitemap.ts` — **NEW**: localized sitemap (en/uk + reciprocal en/uk/x-default hreflang via `localeUrl`).
- `src/app/robots.ts` — **NEW**: allow-all + absolute `Sitemap:` reference from `SITE_ORIGIN`.

No new dependencies, no new directories (both new files sit at the existing `src/app/` root), no other files changed. **Do not** touch `page.tsx`, `layout.tsx`, `proxy.ts`, `routing.ts`, or the message catalogs.

### Architecture & convention guardrails (must follow)

- **Single-sourced URLs (NFR-5, architecture §Data Architecture / §Architectural Boundaries):** "`src/lib/site.ts` is the single source for `SITE_ORIGIN` … and the locale→URL map. `metadataBase`, canonical/hreflang, **sitemap, robots**, and the CTA all read from here." → import `SITE_ORIGIN`/`localeUrl`/`LOCALES`/`DEFAULT_LOCALE`; never inline an origin or `${SITE_ORIGIN}/${locale}`.
- **Static-prerender discipline (AR-4):** no `cookies()`/`headers()`/`searchParams`/dynamic config in `sitemap.ts`/`robots.ts` — keep them build-cached.
- **Parity with metadata (AR-5, architecture §SEO & Metadata, lines 250–251):** "`app/sitemap.ts` + `app/robots.ts` enumerate both locales … from the same locale→URL map, **with hreflang annotations kept in parity with the metadata alternates**."
- **RSC/server-only:** these are server-evaluated route files — do **not** add `'use client'`.
- **Code style (project-context):** files kebab-case (the convention names them `sitemap.ts`/`robots.ts` — fixed by Next), exports are the default function; double-quoted imports + semicolons in app code (these are hand-written app files, **not** shadcn-generated `ui/*`, so follow the app-code style, matching `page.tsx`).
- **No test runner (AR-13):** verify via build + route table + curl'd output; do **not** add `*.test.tsx` or a test framework.

### Decisive scope boundaries — do NOT do these

- **Do not** add `lastModified`/`changeFrequency`/`priority` to sitemap entries (fabricated/low-value signals; keep lean).
- **Do not** add a `/` root entry or any legal-page URL to the sitemap (AC3; root is a 307 redirect, legal pages are Epic 5).
- **Do not** derive `languages` via `Object.fromEntries` (breaks `Languages<string>` typing under strict).
- **Do not** refactor `page.tsx`'s `alternates.languages` or extract a shared hreflang helper here (deferred to the locale-addition story; avoids touching the reviewed 3.2 file).
- **Do not** add `host`/`crawlDelay`/`Disallow` to robots (site is fully indexable; `host` is non-standard).
- **Do not** add a `.replace()` inside `localeUrl` (normalize once at `SITE_ORIGIN`).
- **Do not** touch `proxy.ts`, `routing.ts`, `layout.tsx`, or the catalogs.
- **Do not** create `structured-data.ts` (3.4) or add `openGraph`/`twitter` (3.5).

### Previous-story intelligence (Epic 1–3)

- **Routed-in obligation (3.2 code review, 2026-06-23):** the `SITE_ORIGIN`/`localeUrl` trailing-slash + empty-env hardening was explicitly deferred to **this story** ("best place to add a one-time normalization (`SITE_ORIGIN.replace(/\/+$/, "")`) and/or switch the `SITE_ORIGIN` fallback to `||`, so the hardening lands where the helper's blast radius widens"). That is Task 1 — an in-scope obligation, not optional. (Source: `deferred-work.md`, "Deferred from: code review of 3-2…".)
- **Single hreflang authority (3.2):** 3.2 disabled next-intl's auto hreflang `Link` HTTP headers (`alternateLinks: false` in `routing.ts`) so `generateMetadata` is the sole hreflang/canonical source, with `x-default` → `/en` (a 200, not a redirect). The sitemap must stay consistent with that single authority — same `en`/`uk`/`x-default` targets, same `SITE_ORIGIN`-derived absolute URLs. Do not re-enable `alternateLinks` or introduce a second source.
- **Metadata-files precedent (Story 2.3 `opengraph-image.tsx`):** that story added a per-locale metadata-route file. `sitemap.ts`/`robots.ts` are origin-level (not per-locale) metadata files — simpler (no `params`, no `await`), but follow the same "convention file exports a default function, typed against `next` types" shape.
- **Headless-env honesty (Epic 1 → 2.x → 3.1/3.2 pattern):** live external validators are recorded as human follow-ups; the agent claims only build + structural (curl'd XML/text, route-table, parity diff) verification. Apply to Task 4.

### Latest technical specifics (Next 16 metadata files + SEO)

- **`MetadataRoute.Sitemap`** (verified `node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:562`): `Array<{ url: string; lastModified?; changeFrequency?; priority?; alternates?: { languages?: Languages<string> }; images?; videos? }>`. We use only `url` + `alternates.languages`.
- **`MetadataRoute.Robots`** (`…:547`): `{ rules: { userAgent?; allow?; disallow?; crawlDelay? } | Array<…>; sitemap?: string | string[]; host? }`. We use a single `rules` object + `sitemap`.
- **`Languages<T>`** (`alternative-urls-types.d.ts:4`) = `{ [s in HrefLang]?: T }` where `HrefLang` = specific `LangCode`s (incl. `en`, `uk`) ∪ `x-default`. The literal `{ en, uk, "x-default" }` type-checks; an `Object.fromEntries` index-signature object does **not** (the typing guardrail in Task 2).
- **Sitemap version note** (bundled `sitemap.md` Version History): `v16.0.0` changed `generateSitemaps`' `id` to a Promise — **not relevant** here (single small sitemap; no `generateSitemaps`, no 50k-URL split).
- **hreflang-in-sitemap best practice (Google):** each `<url>` must list **all** language alternates **including a self-reference** plus `x-default`, and the set must be **reciprocal** across pages. Returning the same `languages` literal on both the `/en` and `/uk` entries (each including its own URL) satisfies this — which is exactly the 3.2 `<head>` configuration mirrored into the sitemap.
- **robots `Sitemap:` must be absolute** (Robots Exclusion Standard) → `${SITE_ORIGIN}/sitemap.xml`, never relative.

### Verification standard (AR-13)

Quality gate = `tsc --noEmit` (via `next build`) + ESLint — **no test runner**; do not add one. Verify by: (1) build route table shows `/sitemap.xml` + `/robots.txt` as `○ Static`; (2) `npm start` + `curl` the two endpoints and assert the structure in Task 4; (3) parity-diff the sitemap hreflang hrefs against the prerendered `.next/server/app/{en,uk}.html` alternates; (4) regression-confirm 3.2's `/en`,`/uk` canonical/hreflang HTML is byte-identical post-`SITE_ORIGIN`-change. Live Search Console / external validator runs are a human follow-up in a headless env.

### Project Structure Notes

`src/app/sitemap.ts` and `src/app/robots.ts` are the Next-mandated locations (app-dir root) and match the architecture's planned structure (architecture.md §Complete Project Directory Structure, lines 475–476: `app/sitemap.ts` "both locales + legal pages, hreflang annotations (FR-8)"; `app/robots.ts` "allow indexing + sitemap reference (FR-8)"). Note the architecture line says "+ legal pages" — that is the **post-Epic-5** end-state; for 3.3 the sitemap is locale-pages-only per AC3 (legal added by Story 5.2). `SITE_ORIGIN`/`localeUrl` stay in `src/lib/site.ts` (single source). No new directories, dependencies, or exports. No structural conflicts.

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.3: Locale-aware sitemap & robots] (lines 441–459) — the three BDD ACs (FR-8): sitemap enumerates en/uk with hreflang from the same locale→URL map; robots allows crawling + references the sitemap; locale-pages-only scope, legal deferred to Epic 5.
- [Source: docs/planning-artifacts/epics.md#Requirements Inventory] (line 33) — FR-8 ("Locale-aware sitemap + robots … `sitemap.xml` enumerating both locale URLs with hreflang annotations; `robots.txt` that allows crawling and references the sitemap").
- [Source: docs/planning-artifacts/epics.md#Story 5.2] (lines 605–623) — confirms legal URLs are added to the sitemap by Epic 5 (no forward dependency in 3.3).
- [Source: docs/planning-artifacts/architecture.md#SEO & Metadata] (lines 243–251) — sitemap/robots enumerate both locales from the same locale→URL map, hreflang in parity with metadata alternates; `metadataBase`/canonical/hreflang/sitemap all derive from `SITE_ORIGIN`.
- [Source: docs/planning-artifacts/architecture.md#Architectural Boundaries] (lines 541–543) — `src/lib/site.ts` is the single source; sitemap + robots read from here.
- [Source: docs/planning-artifacts/architecture.md#Complete Project Directory Structure] (lines 475–476) — planned `app/sitemap.ts` / `app/robots.ts` locations.
- [Source: docs/implementation-artifacts/deferred-work.md] "Deferred from: code review of 3-2…" — the `SITE_ORIGIN`/`localeUrl` normalization explicitly routed to Story 3.3 (Task 1); and the hreflang-key locale-enumeration consistency note (drives the literal-not-derive decision).
- [Source: docs/implementation-artifacts/3-2-per-locale-metadata-canonical-hreflang.md] — the `generateMetadata` `alternates.languages` shape to mirror (lines 71–80); single-hreflang-source rationale; headless-env honesty + prerendered-HTML grep verification method.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/sitemap.md] — `MetadataRoute.Sitemap`, "Generate a localized Sitemap" (`alternates.languages` → `<xhtml:link>`), return type.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/robots.md] — `MetadataRoute.Robots` object, `Sitemap:` line, allow/disallow rules.
- [Source: node_modules/next/dist/lib/metadata/types/metadata-interface.d.ts:547-572] + [alternative-urls-types.d.ts:1-9] — exact `Robots`/`Sitemap`/`Languages<string>` type shapes (the `Object.fromEntries` typing guardrail).
- [Source: docs/project-context.md] — Next 16 framework rules (read bundled docs first; RSC by default), single-sourced config in `src/lib/site.ts`, lean quality gate (`tsc` + ESLint, no tests), kebab-case files.
- Current code: `src/lib/site.ts:20-26` (`SITE_ORIGIN`/`localeUrl` — Task 1 target), `src/app/[locale]/page.tsx:29-36` (`alternates.languages` to mirror), `src/app/[locale]/layout.tsx:17` (`metadataBase` consumer), `src/i18n/routing.ts:18` (`alternateLinks: false` — single hreflang source).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.7)

### Debug Log References

- `npm run build` (default env) — ✓ tsc clean, route table shows `○ /sitemap.xml`, `○ /robots.txt` (Static), `● /[locale]` (/en, /uk SSG).
- `npm run lint` — ✓ no errors.
- `npm start` + `curl /robots.txt` & `/sitemap.xml` — output matches AC#1/#2/#3 (see Completion Notes).
- AC#5 hardening: rebuilt once with `NEXT_PUBLIC_SITE_ORIGIN="https://meal-loop.com/"` — confirmed no `//en` / `//sitemap.xml` double-slash in sitemap or robots; then restored the default build.

### Completion Notes List

- **Task 1 (AC#5):** Hardened `SITE_ORIGIN` in `src/lib/site.ts` — `||` fallback (empty-string env → production default) + `.replace(/\/+$/, "")` trailing-slash strip, normalized once at the constant so all three consumers (`metadataBase`, `localeUrl`, `robots.ts`) inherit it. `localeUrl` left unchanged. Comment updated to lock the `||`/`replace` intent. Under the default config this is a no-op → 3.2 canonical/hreflang output unchanged (regression-verified below).
- **Task 2 (AC#1/#3/#4):** Created `src/app/sitemap.ts` (app-root) — `MetadataRoute.Sitemap` enumerating `/en` and `/uk` via `localeUrl`, each carrying the reciprocal `{ en, uk, "x-default" }` hreflang literal (byte-equal to `page.tsx`'s `alternates.languages`). No `lastModified`/`changeFrequency`/`priority`, no `/` root entry, no legal URLs, no `Object.fromEntries` (kept the typed literal for `Languages<string>`).
- **Task 3 (AC#2/#4):** Created `src/app/robots.ts` (app-root) — allow-all (`userAgent: "*"`, `allow: "/"`, no `Disallow`) with absolute `Sitemap: ${SITE_ORIGIN}/sitemap.xml`. No `host`/`crawlDelay`.
- **Task 4 — verification results:**
  - `/robots.txt` → `User-Agent: *` / `Allow: /` / no `Disallow:` / `Sitemap: https://meal-loop.com/sitemap.xml` (absolute). ✓ AC#2
  - `/sitemap.xml` → `<urlset>` with both `xmlns` (sitemap 0.9) and `xmlns:xhtml`; exactly two `<url>` (`/en`, `/uk`); each with three reciprocal `<xhtml:link rel="alternate" hreflang>` (`en`→`/en`, `uk`→`/uk`, `x-default`→`/en`); no legal/private/root URLs. ✓ AC#1, AC#3
  - **Static (AC#4):** route table lists both as `○ Static` → no request-time API used. URLs all derive from `SITE_ORIGIN`/`localeUrl` (no hardcoded origin).
  - **Parity (AC#1):** sitemap hreflang hrefs are byte-equal to the prerendered `.next/server/app/{en,uk}.html` `<link rel="alternate" hrefLang>` targets (en→`/en`, uk→`/uk`, x-default→`/en`).
  - **Regression (AC#5):** `/en`,`/uk` still SSG; canonical (`/en`→`/en`, `/uk`→`/uk`) + hreflang HTML unchanged (normalization is a no-op under default config).
- **Outstanding human follow-up (headless-env honesty):** live external validation — Google Search Console sitemap submission, an hreflang validator, and a robots.txt tester — is not runnable headless. Only structural verification (route table + curl'd XML/text + parity diff) was performed by the agent.

### File List

- `src/lib/site.ts` — UPDATED: hardened `SITE_ORIGIN` normalization (empty-env `||` fallback + trailing-slash strip) + comment.
- `src/app/sitemap.ts` — NEW: locale-aware sitemap (en/uk + reciprocal en/uk/x-default hreflang via `localeUrl`).
- `src/app/robots.ts` — NEW: allow-all robots with absolute `Sitemap:` from `SITE_ORIGIN`.
- `docs/implementation-artifacts/sprint-status.yaml` — tracking: 3-3 → in-progress → review.

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-06-23 | Story 3.3 created (ready-for-dev) — new `src/app/sitemap.ts` (en/uk + reciprocal en/uk/x-default hreflang via `localeUrl`, parity with 3.2 metadata) and `src/app/robots.ts` (allow-all + absolute `Sitemap:` from `SITE_ORIGIN`); harden `SITE_ORIGIN` normalization (empty-env `||` fallback + trailing-slash strip) per the routed-in 3.2 review item. Locale-pages-only scope; legal URLs deferred to Epic 5.2. |
| 2026-06-23 | Story 3.3 implemented (→ review) — Task 1: `SITE_ORIGIN` hardened (`||` + trailing-slash strip, `localeUrl` unchanged). Task 2: `src/app/sitemap.ts` (typed `Languages` literal, no `lastModified`/`changeFreq`/`priority`, no root/legal entries). Task 3: `src/app/robots.ts` (allow-all, absolute `Sitemap:`). Task 4: build+lint pass, both routes `○ Static`; curl'd output, sitemap↔metadata hreflang parity, and 3.2 regression all verified; trailing-slash env sanity-checked (no double-slash). Live Search Console / validator checks recorded as human follow-up. |
