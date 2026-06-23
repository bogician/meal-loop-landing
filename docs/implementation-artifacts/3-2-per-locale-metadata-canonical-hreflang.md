---
baseline_commit: b6f5d02565c296b29b2c7457785f2d704e465c85
---

# Story 3.2: Per-locale metadata, canonical & hreflang

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a search engine,
I want each locale page to declare its own metadata and language alternates,
so that the right language version is indexed without duplicate-content dilution.

## Acceptance Criteria

1. **Distinct per-locale title + description** — Given `/en` and `/uk`, when metadata is generated via `generateMetadata`, then each returns a **distinct, language-correct** `<title>` and `<meta name="description">` **resolved from the catalog** (not hardcoded) (FR-6).
2. **Self-referential canonical + hreflang alternates** — Given any landing page, when it renders metadata, then it declares a **self-referential** `<link rel="canonical">` and `hreflang` alternates for `en`, `uk`, and `x-default`, all pointing at **correct absolute URLs derived from `SITE_ORIGIN`** + the locale→URL map (FR-7, AR-5).
3. **Canonical never omitted** — Given any landing page, when checked, then it **never omits its own canonical** (FR-7, NFR-7).
4. **Static + derived URLs** — Given `generateMetadata`, when it executes, then it **reads no cookies/headers** (stays statically prerendered) and **hardcodes no absolute URL** — every URL derives from `SITE_ORIGIN` + the locale→URL map (AR-4).
5. **Single hreflang source (no duplicate/conflicting signals)** — Given the deployed pages, when crawled, then hreflang is declared **exactly once** — next-intl's automatic hreflang `Link` **HTTP headers are disabled**, so the only `hreflang`/`canonical` declarations are the `<head>` `<link>` tags from `generateMetadata`; `x-default` resolves to a **200 page** (`/en`), not a redirect (NFR-7; resolves deferred-work item #37).

## Tasks / Subtasks

- [x] **Task 1 — Disable next-intl's automatic hreflang `Link` headers (AC: #5)**
  - [x] In `src/i18n/routing.ts`, add `alternateLinks: false` to the `defineRouting({...})` call. next-intl defaults this to `true`, which makes `createMiddleware` (our `src/proxy.ts`) emit `Link: <...>; rel="alternate"; hreflang="..."` **HTTP response headers** on every matched route — a **second, conflicting** hreflang source whose `x-default` points at the bare locale-less root (a `307` redirect). Setting it in the routing config (the single source consumed by both `proxy.ts` and `navigation.ts`) turns it off everywhere; `generateMetadata` (Task 4) becomes the sole hreflang/canonical authority.
  - [x] Do **not** change the `matcher` in `src/proxy.ts` or any other proxy logic — only the routing flag. (The separate `Set-Cookie`-on-OG-image matcher concern, deferred-work item #35, is a different proxy-matcher fix and is **out of scope** here.)
  - [x] Rationale: hreflang in HTTP headers **and** HTML `<head>` with a **different `x-default` target** (next-intl → redirecting root; ours → `/en`) is a conflicting signal (NFR-7 "no duplicate-content signals"). next-intl's header also uses the **request host** (e.g. a `*.vercel.app` preview URL) rather than `SITE_ORIGIN`, diverging from AR-4/AR-5. One controlled source eliminates both problems.

- [x] **Task 2 — Single-source the locale→URL map in `src/lib/site.ts` (AC: #2, #4)**
  - [x] Add a `localeUrl` helper that derives the absolute per-locale URL from `SITE_ORIGIN`:
    ```ts
    // Absolute per-locale URL, single-sourced for canonical/hreflang (Story 3.2)
    // and the sitemap/robots (Story 3.3). localePrefix is "always", so every
    // locale page lives at /{locale} — never hardcode an absolute URL elsewhere.
    export const localeUrl = (locale: string): string => `${SITE_ORIGIN}/${locale}`;
    ```
  - [x] Keep the parameter typed as `string` (not the `LOCALES` union) so `generateMetadata`'s `string` locale passes without a cast — the value is already validated upstream (layout `hasLocale` guard + `generateStaticParams`).
  - [x] Do **not** introduce a `pathnames`/translated-slug map (AR-11: legal slugs are identical across locales; there are no translated paths). The map is purely `SITE_ORIGIN` + `/{locale}`.

- [x] **Task 3 — Add a `metadata` namespace to both catalogs (AC: #1)**
  - [x] Add a new top-level `metadata` namespace with `title` and `description` keys to **both** `messages/en.json` and `messages/uk.json` (AR-15: identical camelCase key trees; never create a uk-only key).
  - [x] **en** (suggested — for continuity these match the current `layout.tsx` static defaults; the dev may reuse them verbatim):
    - `metadata.title`: `"MealLoop — Plan a week of meals from the dishes you already cook"`
    - `metadata.description`: `"A calm weekly meal planner for small households. Build a library of the dishes you cook, plan the week, and the grocery list writes itself."`
  - [x] **uk** (suggested — language-correct, mirrors `hero` copy; **flag for the UX-DR-21 native-speaker pass**):
    - `metadata.title`: `"MealLoop — плануйте тиждень страв із тих, що вже готуєте"`
    - `metadata.description`: `"Спокійний планувальник харчування на тиждень для невеликих родин. Зберіть бібліотеку страв, сплануйте тиждень — і список покупок складеться сам."`
  - [x] Obey the voice rules (NFR-8 / UX-DR-18): no exclamation marks, no emojis, complete sentences, calm/understated. Keep the title ≤ ~60 chars and the description ≤ ~155 chars so neither is truncated in SERPs.

- [x] **Task 4 — Add per-locale `generateMetadata` to `app/[locale]/page.tsx` (AC: #1, #2, #3, #4)**
  - [x] Add an `export async function generateMetadata` to `src/app/[locale]/page.tsx`:
    ```ts
    import type { Metadata } from "next";
    import { getTranslations, setRequestLocale } from "next-intl/server";
    import { DEFAULT_LOCALE, localeUrl } from "@/lib/site";

    export async function generateMetadata({
      params,
    }: Readonly<{ params: Promise<{ locale: string }> }>): Promise<Metadata> {
      const { locale } = await params;
      // Keep this route statically prerendered (AR-4): no cookies()/headers().
      setRequestLocale(locale);
      const t = await getTranslations({ locale, namespace: "metadata" });

      return {
        title: t("title"),
        description: t("description"),
        alternates: {
          canonical: localeUrl(locale),
          languages: {
            en: localeUrl("en"),
            uk: localeUrl("uk"),
            "x-default": localeUrl(DEFAULT_LOCALE),
          },
        },
      };
    }
    ```
  - [x] `params` is a **Promise** in Next 16 — `await` it (same signature as the existing `Home` default export). Pass `{ locale }` **explicitly** to `getTranslations` (do not rely on ambient request scope), and call `setRequestLocale(locale)` first for static-render parity.
  - [x] Do **not** add `openGraph`/`twitter` here — Open Graph + Twitter card metadata is **Story 3.5**. This story ships only `title`, `description`, `canonical`, and `languages`.
  - [x] Do **not** read `cookies()`/`headers()`/`searchParams` or any dynamic API in this function (would force the route dynamic and break CWV — AR-4).

- [x] **Task 5 — Leave `layout.tsx` as the app-shell fallback; do not touch its OG block (AC: #1)**
  - [x] **Keep** `src/app/[locale]/layout.tsx` unchanged: `metadataBase` (root-level, required for absolute URL resolution) and the existing static `title`/`description`/`openGraph` stay as-is. Next.js **merges** metadata layout→page, so the page-level `generateMetadata` (Task 4) **overrides** `title`/`description` per-locale for the home route; the layout statics remain only as the fallback default for pages without their own metadata (e.g. `not-found.tsx`).
  - [x] Do **not** remove the layout's static `title`/`description`: `not-found.tsx` has no metadata of its own and would lose its `<title>`. Localizing the not-found/fallback default is a **separate, out-of-scope** concern.
  - [x] Do **not** edit the layout's `openGraph` block — Story 3.5 localizes OG/Twitter.

- [x] **Task 6 — Verify metadata, canonical & hreflang on both locales (AC: #1, #2, #3, #4, #5)**
  - [x] Run the quality gate: `npm run build` (runs `tsc --noEmit`) + `npm run lint` — both must pass.
  - [x] Confirm `/en` and `/uk` still prerender as **static** in the build output (`○`/`●`, not `ƒ`) — proves `generateMetadata` read no cookies/headers (AC4).
  - [x] Inspect the prerendered HTML (`.next/server/app/en.html` and `.next/server/app/uk.html`, per the Story 3.1 grep method) and confirm on **each** locale:
    - exactly one `<title>` with the **distinct, language-correct** value (en ≠ uk) (AC1).
    - exactly one `<meta name="description">`, distinct and language-correct (AC1).
    - exactly one `<link rel="canonical" href="https://meal-loop.com/{locale}">`, **self-referential** to that locale (AC2, AC3).
    - three `<link rel="alternate" hreflang="...">` tags — `en` → `…/en`, `uk` → `…/uk`, `x-default` → `…/en` — **identical on both locale pages** (reciprocal) (AC2, AC5).
  - [x] Confirm there is **no** `Link:` response header carrying `rel="alternate"`/`hreflang` from the proxy after Task 1 (e.g. `curl -sI http://localhost:3000/en | grep -i '^link:'` returns nothing hreflang-related). The only hreflang source is the HTML `<head>` (AC5).
  - [x] **Headless-env note (Epic 1 / Stories 2.x / 3.1 pattern):** if a live external validator (Google Rich Results / an hreflang checker / Search Console) cannot be run in this environment, record it as an **outstanding human follow-up** — do **not** claim it as machine-verified. Structural verification from the prerendered HTML + response headers is what the agent claims.

### Review Findings

_Code review 2026-06-23 (bmad-code-review; Blind Hunter + Edge Case Hunter + Acceptance Auditor). All 5 ACs verified PASS by the Acceptance Auditor against the real files (layout/proxy/request unchanged; en↔uk key trees identical; static SSG; single hreflang source). The items below are the surviving non-blocking findings after triage._

- [x] [Review][Decision→Accepted] en `metadata.title` exceeds the ~60-char SERP guideline — `metadata.title` ("MealLoop — Plan a week of meals from the dishes you already cook") is ~64 chars vs the ≤~60 guideline in Task 3; Google may truncate the tail in SERPs. It mirrors the existing `layout.tsx` static title verbatim (spec Task 3 suggested reusing it for continuity), so this is inherited copy, not a regression. **Resolved 2026-06-23 — accepted as-is** (brand continuity with the layout title; trimming only the catalog title would diverge from the layout, and trimming the layout is out of this story's scope). [`messages/en.json`]
- [x] [Review][Decision→Patched] Invalid-locale canonical hardening — `generateMetadata` derives `canonical`/hreflang from the raw `locale` param via `localeUrl(locale)`; an unknown locale would mint a bogus self-canonical. Currently mitigated three ways: next-intl middleware (`proxy.ts`) redirects non-locale paths, `layout.tsx` calls `notFound()` on `!hasLocale`, and `request.ts` falls back to `en` messages — so the path is unreachable in production. But `dynamicParams` defaults to `true` and there is no guard inside `generateMetadata` itself. **Resolved 2026-06-23 — added `export const dynamicParams = false` to `page.tsx`** (verified valid on page-level segment config per the bundled `dynamicParams.md`; Cache Components not enabled). Build + lint pass; `/en` & `/uk` still prerender as `●` SSG. [`src/app/[locale]/page.tsx`]
- [x] [Review][Defer] uk `metadata.description` semantic drift — uk uses "родин" (families), narrower than en "households"; route to the UX-DR-21 native-speaker copy pass (already queued). [`messages/uk.json`] — deferred, pre-existing follow-up queue
- [x] [Review][Defer] `localeUrl` does not normalize a trailing slash on `SITE_ORIGIN` (and `SITE_ORIGIN`'s `??` does not catch an empty-string env) — `${SITE_ORIGIN}/${locale}` would emit `origin//en` under env misconfiguration. Not triggered by today's controlled config; the helper is reused by Story 3.3's sitemap/robots, so best hardened there. [`src/lib/site.ts:26`] — deferred, latent/config-dependent
- [x] [Review][Defer] `alternates.languages` hardcodes `en`/`uk` rather than deriving from `LOCALES` — adding a 3rd locale would silently omit it from the hreflang set (and from the catalog). Matches the spec's literal Task-4 shape and is correct for the current 2-locale set; maintainability watch-point. [`src/app/[locale]/page.tsx`] — deferred, future-locale maintainability

## Dev Notes

### What this story is (and is not)

This is a **Next.js Metadata-API** story: per-locale `<title>`/`<meta description>` via `generateMetadata`, plus a self-referential `canonical` and `en`/`uk`/`x-default` `hreflang` alternates. It **does** touch framework surface (`generateMetadata`, the next-intl routing/middleware config), so the `AGENTS.md` mandate applies — **read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md` first** (the `alternates`/`metadataBase` sections were the basis for the code shape below).

**Out of scope (separate stories — do NOT touch):**
- **Open Graph / Twitter cards** → Story 3.5 (`openGraph`/`twitter` in metadata). The OG **image** route already exists (`opengraph-image.tsx`, Story 2.3) and emits `og:image` via `metadataBase`; leave it.
- **Sitemap / robots** → Story 3.3 (`app/sitemap.ts`, `app/robots.ts`) — but **reuse the `localeUrl` helper** this story adds so the sitemap's hreflang stays in parity with the metadata alternates.
- **JSON-LD** → Story 3.4 (`lib/structured-data.ts`).

### Current state (audited against `baseline_commit`) — what exists today

- **`src/app/[locale]/layout.tsx`** holds a **static, English-only** `metadata` export: `metadataBase: new URL(SITE_ORIGIN)`, a hardcoded `title`/`description`, and an `openGraph` block. There is **no `generateMetadata` anywhere**, so today **both** `/en` and `/uk` render the **same English title/description** — that is the bug AC1 fixes. There is **no `canonical` and no `alternates`** in the HTML head at all today — AC2/AC3 add them.
- **`src/app/[locale]/page.tsx`** is the home route. It calls `setRequestLocale(locale)` in the default export but has **no `generateMetadata`** — this is where Task 4 adds it.
- **`src/proxy.ts`** calls `createMiddleware(routing)` with **no options**, so next-intl's `alternateLinks` defaults to **`true`** → it emits hreflang `Link` **HTTP headers** on every matched response. Verified in the installed next-intl (`alternateLinks: input.alternateLinks ?? true`; the middleware sets the `Link` header only `if (… routing.alternateLinks && locales.length > 1)`). This is the second hreflang source Task 1 disables.
- **`src/lib/site.ts`** already exports `SITE_ORIGIN`, `LOCALES`, `DEFAULT_LOCALE` — but **no locale→URL helper**. Task 2 adds `localeUrl`.
- **`src/i18n/routing.ts`** is `defineRouting({ locales, defaultLocale, localePrefix: "always", localeCookie, localeDetection })` — `localePrefix: "always"` means every page is at `/{locale}` (no unprefixed root), which is why `localeUrl` is simply `${SITE_ORIGIN}/${locale}`.
- **`messages/en.json` / `messages/uk.json`** have no `metadata` namespace yet. Existing namespaces: `nav`, `localeSwitcher`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`, `appStore`, `notFound`.
- **`src/i18n/request.ts`** deep-merges the en catalog **under** the active locale (per-key fallback, FR-4). Because the uk `metadata` keys are provided in Task 3, uk will **not** fall back to English — but the keys must exist in both to satisfy AR-15 regardless.

### The critical decision: one hreflang source, not two

The single most important correctness point in this story (and the reason deferred-work item #37 was routed here): **hreflang must be declared exactly once.** next-intl's middleware emits it as an HTTP `Link` header; `generateMetadata` emits it as `<head>` `<link>` tags. Shipping both creates a conflict because:
- **`x-default` diverges:** next-intl's auto `x-default` targets the **bare root** (`/`), which `307`-redirects via the proxy; ours targets `/en`, a real **200** page. Crawlers that don't follow redirects on alternates would see two different x-defaults.
- **Origin diverges:** next-intl's header uses the **request host** (a `*.vercel.app` preview/deploy URL on previews), while ours uses `SITE_ORIGIN` (AR-4/AR-5). Inconsistent absolute URLs across header vs head.

Resolution: **disable `alternateLinks` in the routing config** (Task 1) and own all hreflang/canonical in `generateMetadata` (Task 4). Canonical is **only** emitted by `generateMetadata` regardless (next-intl never emits a self-referential canonical), so the head is already the authority for AC3 — Task 1 just removes the competing header.

### Files to touch

- `src/i18n/routing.ts` — UPDATE: add `alternateLinks: false` to `defineRouting`.
- `src/lib/site.ts` — UPDATE: add `localeUrl(locale: string)` helper.
- `messages/en.json` — UPDATE: add `metadata.{title,description}` (en).
- `messages/uk.json` — UPDATE: add `metadata.{title,description}` (uk — mirror, AR-15).
- `src/app/[locale]/page.tsx` — UPDATE: add `generateMetadata` (title/description/canonical/languages).
- `src/app/[locale]/layout.tsx` — **NO CHANGE** (intentionally left as the fallback default; documented in Task 5).

No new files, no new directories, no new dependencies.

### Architecture & convention guardrails (must follow)

- **Static-prerender discipline (AR-4):** `generateMetadata` must stay static — **no `cookies()`/`headers()`/`searchParams`**. Use `getTranslations({ locale, namespace })` + `setRequestLocale(locale)`. Cookie/header reads live **only** in `proxy.ts`.
- **Absolute URLs derived from `SITE_ORIGIN` (AR-5, architecture §Format Patterns):** "Metadata URLs: always absolute, **derived** from `SITE_ORIGIN` + the locale→URL map. Never hardcode an absolute URL in `generateMetadata`." → use `localeUrl(...)` for every URL.
- **RSC boundary (project-context):** `page.tsx` and `layout.tsx` are Server Components; `generateMetadata` is server-only. Do **not** add `'use client'`.
- **Catalog discipline (AR-15):** identical camelCase key trees in en/uk; add `metadata.{title,description}` to **both**; never a uk-only key.
- **Single-sourced config (NFR-5):** the locale→URL derivation belongs in `src/lib/site.ts` (`localeUrl`), reused by Story 3.3's sitemap/robots — do not inline `${SITE_ORIGIN}/${locale}` in `page.tsx`.
- **No hardcoded user-facing strings:** title/description resolve from the catalog (the layout's English statics are a deliberate, documented fallback exception per Task 5, not a new violation).

### Decisive scope boundaries — do NOT do these

- **Do not** add `openGraph` or `twitter` to `generateMetadata` — that's Story 3.5.
- **Do not** create `sitemap.ts`/`robots.ts` or `structured-data.ts` — Stories 3.3/3.4.
- **Do not** add a `pathnames`/translated-slug map to routing or `localeUrl` (AR-11: identical slugs, no translated paths).
- **Do not** change the `proxy.ts` matcher or its negotiation/redirect logic — only the `alternateLinks` routing flag. The OG-image `Set-Cookie` matcher concern (deferred-work #35) is a different fix, out of scope.
- **Do not** remove the layout's static `title`/`description` (regresses `not-found.tsx`'s `<title>`).
- **Do not** add `metadataBase` to `page.tsx` — it's already in the layout and inherited.
- **Do not** add a test runner / `*.test.tsx` (AR-13: no test framework in v2).

### Previous-story intelligence (Epic 1–3)

- **Deferred directly into this story (Story 2.3 code review, 2026-06-23):** *"`x-default` hreflang alternate (auto-emitted by next-intl) resolves to the bare `/opengraph-image`, which `307`-redirects … Belongs with Epic 3 hreflang/metadata work, not Story 2.3."* → This is the root reason for **Task 1**; disabling `alternateLinks` removes the auto `x-default` (and the redirect) for **all** routes, including the OG image. It is an explicit, in-scope obligation, not optional polish. (Source: `deferred-work.md` item #37.)
- **Per-locale metadata-route precedent (Story 2.3):** `opengraph-image.tsx` already awaits `params` (Next-16 Promise), narrows the locale, and reads per-locale assets — mirror that `await params` shape in `generateMetadata`. It also documents that "richer per-locale OG/Twitter metadata is Story 3.5," reinforcing this story's scope boundary.
- **Catalog editing pattern (Stories 1.3/1.4/3.1):** copy is externalized to `messages/*.json`; components/metadata read via `getTranslations`. The brand font is **Manrope** (not Outfit) — ignore stale planning-doc references.
- **Headless-env limit (Epic 1 → 2.1/2.3/3.1 pattern):** live external SEO/validator runs are recorded as **human follow-ups** when the agent runs headless; structural/build verification (prerendered HTML + response headers) is what the agent claims. Apply the same honesty to Task 6.
- **uk voice review (Story 3.1 + UX-DR-21):** new uk strings (`metadata.title`/`description`) join the native-speaker review queue.

### Latest technical specifics (Next 16 Metadata API + SEO)

- **Next 16 `generateMetadata` shape** (verified against the bundled `generate-metadata.md`): `alternates: { canonical, languages: { '<hreflang>': '<url>' } }`; `x-default` is a valid `languages` key. The doc's example uses region codes (`en-US`); **language-only `en`/`uk` is valid hreflang** and correct here (we target languages, not regions).
- **`metadataBase` + relative vs absolute:** "If a `metadata` field provides an absolute URL, `metadataBase` will be ignored." We pass **absolute** URLs via `localeUrl` (per AR-5), so `metadataBase` governs only the inherited OG image URL — leave `metadataBase` in the layout.
- **`params` is async in Next 16** — `await params` before use (matches the existing `Home`/`OpengraphImage` signatures).
- **next-intl `alternateLinks`** lives in the **routing config** (`defineRouting`), consumed by `createMiddleware`; default `true`. Setting it `false` is the single switch that stops the `Link` header.
- **SEO length guidance:** title ≤ ~60 chars, description ~150–160 chars, to avoid SERP truncation. Self-referential canonical + reciprocal hreflang (each page lists itself + all alternates + x-default) is the configuration Google requires to avoid duplicate-content dilution (NFR-7).

### Verification standard (AR-13)

Quality gate is `tsc --noEmit` (via `next build`) + ESLint — **no test runner exists**; do not add one. Verify by inspecting the **prerendered** `.next/server/app/{en,uk}.html` (title/description/canonical/hreflang tags, distinct per locale, reciprocal alternates) and the dev-server **response headers** (no hreflang `Link:` header after Task 1). Live external validators are a human follow-up if the environment is headless.

### Project Structure Notes

All touched files sit in their conventional locations (`src/i18n/`, `src/lib/`, `src/app/[locale]/`, `messages/`). `localeUrl` is a camelCase function export from `site.ts` (consistent with existing exports). No new files, directories, dependencies, or exports beyond `localeUrl`. No conflicts with the unified structure.

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.2: Per-locale metadata, canonical & hreflang] (lines 417–439) — the four BDD ACs (FR-6, FR-7, AR-4, AR-5, NFR-7).
- [Source: docs/planning-artifacts/epics.md#Requirements Inventory] — FR-6 (per-locale metadata), FR-7 (canonical + hreflang), AR-4 (static-prerender discipline), AR-5 (`metadataBase`/URLs from `SITE_ORIGIN`), AR-11 (identical legal slugs), AR-15 (catalog key discipline), NFR-7 (SEO hygiene / no duplicate-content), NFR-8 (voice).
- [Source: docs/planning-artifacts/architecture.md#SEO & Metadata] (lines 243–257) and #Format Patterns (lines 353–360) — `generateMetadata` per locale, self-referential canonical + `alternates.languages` for en/uk/x-default, URLs always absolute and derived from `SITE_ORIGIN`.
- [Source: docs/planning-artifacts/architecture.md#Process Patterns] (lines 372–380) — never read cookies/headers in `generateMetadata`.
- [Source: docs/implementation-artifacts/deferred-work.md] item #37 — next-intl auto `x-default` redirect, routed to Epic 3 hreflang/metadata work (drives Task 1); item #35 (OG `Set-Cookie` matcher) explicitly noted as out of scope.
- [Source: docs/implementation-artifacts/3-1-semantic-heading-structure-landmarks.md] — headless-env honesty pattern; prerendered-HTML grep verification method; catalog discipline.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md] — `alternates`/`metadataBase` API shape; async `params`.
- [Source: docs/project-context.md] — Next 16 framework rules, RSC boundary, Tailwind tokens, catalog discipline, lean quality gate.
- Current code: `src/app/[locale]/layout.tsx:16-27` (static metadata + metadataBase), `src/app/[locale]/page.tsx:12-18` (Home; add `generateMetadata`), `src/proxy.ts:9` (`createMiddleware(routing)`), `src/i18n/routing.ts:7-19` (`defineRouting`), `src/lib/site.ts:5-21` (LOCALES/DEFAULT_LOCALE/SITE_ORIGIN), `src/app/[locale]/opengraph-image.tsx` (per-locale metadata-route precedent), `messages/en.json` + `messages/uk.json`.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (BMAD dev-story workflow)

### Debug Log References

- `npm run lint` → clean (no output).
- `npm run build` → `tsc` passed; route table shows `● /[locale]` (SSG) prerendering `/en` and `/uk` as static HTML (proves `generateMetadata` read no cookies/headers — AC4).
- Prerendered HTML head (`.next/server/app/{en,uk}.html`), per-locale counts: title ×1, `meta[name=description]` ×1, `link[rel=canonical]` ×1, `link[rel=alternate][hreflang]` ×3 — on both pages.
  - `/en`: canonical → `https://meal-loop.com/en`; alternates en→/en, uk→/uk, x-default→/en.
  - `/uk`: canonical → `https://meal-loop.com/uk`; alternates identical to /en (reciprocal).
  - (Next serializes the attribute as `hrefLang`; HTML attribute names are case-insensitive, so crawlers read it as `hreflang`.)
- `next start` response headers: `curl -sI /en` and `/uk` carry **no** `Link:`/hreflang header (AC5 — proxy no longer emits the second hreflang source after `alternateLinks: false`). Root `/` still `307`→`/en` (negotiation intact); `x-default` target `/en` returns `200`.

### Completion Notes List

- AC1 ✅ — `/en` and `/uk` return distinct, language-correct `<title>` + `<meta description>`, resolved from the new `metadata` catalog namespace (not hardcoded).
- AC2 ✅ — self-referential `<link rel="canonical">` + `en`/`uk`/`x-default` hreflang alternates, all absolute URLs derived from `SITE_ORIGIN` via `localeUrl`.
- AC3 ✅ — canonical present on every landing page (never omitted).
- AC4 ✅ — `generateMetadata` reads no cookies/headers; both routes stay statically prerendered (`●` SSG in build output).
- AC5 ✅ — single hreflang source: `alternateLinks: false` removed the proxy's `Link` header; only the `<head>` `<link>` tags remain; `x-default`→`/en` is a 200 page (resolves deferred-work #37).
- Layout left unchanged (Task 5): page-level `generateMetadata` overrides title/description per-locale via Next's metadata merge; layout statics remain the fallback for `not-found.tsx`; `openGraph` untouched (Story 3.5).
- **Outstanding human follow-ups (headless env):** (1) live external validation — Google Rich Results / an hreflang checker / Search Console — was **not** run; structural verification (prerendered HTML + response headers) is what is claimed here. (2) New uk strings `metadata.title`/`metadata.description` join the UX-DR-21 native-speaker review queue.

### File List

- `src/i18n/routing.ts` — added `alternateLinks: false` to `defineRouting`.
- `src/lib/site.ts` — added `localeUrl(locale: string)` helper.
- `messages/en.json` — added `metadata.{title,description}` (en).
- `messages/uk.json` — added `metadata.{title,description}` (uk, mirror).
- `src/app/[locale]/page.tsx` — added `generateMetadata` (title/description/canonical/languages); added `export const dynamicParams = false` (code-review hardening, 2026-06-23).
- `docs/implementation-artifacts/sprint-status.yaml` — story 3-2 → in-progress → review → done.

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-06-23 | Story 3.2 created (ready-for-dev) — per-locale `generateMetadata` (title/description from a new `metadata` catalog namespace) + self-referential canonical and en/uk/x-default hreflang derived from `SITE_ORIGIN` via a new `localeUrl` helper; disable next-intl's auto hreflang `Link` headers (`alternateLinks: false`) so `generateMetadata` is the single hreflang source (resolves deferred-work #37). |
| 2026-06-23 | Story 3.2 implemented (→ review) — all 6 tasks complete; build + lint pass; `/en` & `/uk` static (SSG); verified per-locale title/description/canonical and reciprocal en/uk/x-default hreflang in prerendered HTML; confirmed no hreflang `Link:` response header after `alternateLinks: false`. Human follow-ups: live external SEO validation (headless env) and uk native-speaker copy review (UX-DR-21). |
| 2026-06-23 | Code review (bmad-code-review, 3 adversarial layers) → **done**. All 5 ACs PASS. 2 decisions resolved: en title accepted as-is (brand continuity); added `export const dynamicParams = false` to `page.tsx` (invalid-locale hardening) — build + lint pass, `/en` & `/uk` still SSG. 3 items deferred to `deferred-work.md` (uk "households" copy → UX-DR-21; `localeUrl` trailing-slash/empty-origin hardening → Story 3.3; hardcoded hreflang `languages` map → future-locale). 12 findings dismissed as noise/false-positive/spec-sanctioned. |
