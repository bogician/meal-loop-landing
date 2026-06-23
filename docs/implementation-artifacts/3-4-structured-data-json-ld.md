---
baseline_commit: 586e427946b5bb9e8ad7562e1ca954aab68499f6
---

# Story 3.4: Structured data (JSON-LD)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a search engine,
I want machine-readable structured data describing the product and publisher,
so that MealLoop can appear as a rich, correctly-typed result.

## Acceptance Criteria

1. **Single typed builder, one script** — Given the home page (`/en`, `/uk`), when it renders, then it emits JSON-LD via **one** `<script type="application/ld+json">` whose payload comes from a **single typed builder** in `src/lib/structured-data.ts`. The payload describes a `SoftwareApplication` (`applicationCategory: "LifestyleApplication"`, `operatingSystem: "iOS"`) **and** an `Organization` publisher. No section hand-rolls its own `<script>` tag (FR-9; architecture §Format Patterns).
2. **Valid schema.org** — Given the JSON-LD, when validated, then it is well-formed JSON and passes a schema.org structured-data test with **no errors** (FR-9).
3. **Real brand logo; pre-listing scope** — Given the publisher logo, when referenced, then it points at the **real brand mark (Epic 2)** via an absolute, crawler-safe URL derived from `SITE_ORIGIN`; **`installUrl`, `offers`, and `aggregateRating` are omitted entirely while `APP_STORE_LIVE` is `false`** and are added only once the listing is live (FR-9, scoped pre-listing).
4. **Static + single-sourced URLs** — Given the home route, when it renders the JSON-LD, then the builder/page **read no cookies/headers/dynamic API** (the route stays statically prerendered — `●`/`○`, not `ƒ`) and **hardcode no absolute URL** — every URL derives from `SITE_ORIGIN` / `localeUrl` in `src/lib/site.ts` (AR-4, AR-5, NFR-5).
5. **Per-locale, no English leakage** — Given `/en` and `/uk`, when each renders, then the `SoftwareApplication.description` is the **language-correct** value resolved from the existing `metadata` catalog namespace (en ≠ uk), and the app `url` is the self-referential `localeUrl(locale)`. No new catalog keys are introduced (AR-15 key trees stay identical) (FR-9, FR-4).
6. **XSS-safe serialization** — Given the JSON-LD is injected via `dangerouslySetInnerHTML`, when serialized, then `<` is escaped to `<` (per the bundled Next JSON-LD guide) so the payload cannot break out of the `<script>` element.

## Tasks / Subtasks

- [x] **Task 1 — Create the typed builder `src/lib/structured-data.ts` (AC: #1, #3, #5)**
  - [x] Create a **new** file `src/lib/structured-data.ts`. Export a single pure builder that returns **one** typed object: a `SoftwareApplication` with a **nested `publisher` Organization**, `@context` at the top. One object → one `<script>` (AC1; architecture §Format Patterns: "serialized once via a single helper, not hand-rolled per section").
  - [x] Signature — pass in the already-resolved per-locale pieces so the builder stays pure and import-light (no `getTranslations` inside `lib/`):
    ```ts
    import { APP_STORE_LIVE, APP_STORE_URL, SITE, SITE_ORIGIN, localeUrl } from "@/lib/site";

    type Organization = {
      "@type": "Organization";
      name: string;
      url: string;
      logo: string;
    };

    type SoftwareApplication = {
      "@context": "https://schema.org";
      "@type": "SoftwareApplication";
      name: string;
      applicationCategory: "LifestyleApplication";
      operatingSystem: "iOS";
      description: string;
      url: string;
      inLanguage: string;
      publisher: Organization;
      // Added only once the App Store listing is live (APP_STORE_LIVE):
      installUrl?: string;
    };

    export function buildStructuredData({
      locale,
      description,
    }: {
      locale: string;
      description: string;
    }): SoftwareApplication {
      const data: SoftwareApplication = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: SITE.name,
        applicationCategory: "LifestyleApplication",
        operatingSystem: "iOS",
        description,
        url: localeUrl(locale),
        inLanguage: locale,
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          url: SITE_ORIGIN,
          logo: `${SITE_ORIGIN}/icon.svg`,
        },
      };

      // Pre-listing scope (AC3): no installUrl / offers / aggregateRating while
      // APP_STORE_URL is "#". When the real listing lands, APP_STORE_LIVE flips and
      // the URL becomes a valid installUrl with zero other edits.
      if (APP_STORE_LIVE) {
        data.installUrl = APP_STORE_URL;
      }

      return data;
    }
    ```
  - [x] **Type it locally — do NOT add `schema-dts`** (or any other dependency). The bundled Next JSON-LD guide mentions `schema-dts` as *optional*; v2's dependency set is fixed (AR-6: only `next-intl`, `@vercel/analytics`, `@vercel/speed-insights` were sanctioned). A hand-written local type (above) satisfies the architecture's "authored as a typed object" requirement with zero new deps.
  - [x] **`logo` = `${SITE_ORIGIN}/icon.svg`** — this is the baked-color brand mark (green `#2E7D4F` on paper, square) committed by Story 2.2 as `src/app/icon.svg`, served at `/icon.svg`. **Do NOT use `public/brand/brand-mark.svg`** for the logo: that asset is `fill="currentColor"` and renders **black** for a crawler (no DOM/CSS context), the exact pitfall the project-context "baked static assets embed literal hex" rule exists to prevent. A crawler-read logo must be a baked-color asset. (Confirm `/icon.svg` actually serves in Task 4; see the open question if it does not.)
  - [x] **Do NOT** add `offers`, `aggregateRating`, `price`, `screenshot`, `softwareVersion`, `datePublished`, or any field beyond the object above. The scope is "publisher + product entity, pre-listing." `installUrl` is gated on `APP_STORE_LIVE` (today `false` → omitted). Extra fabricated fields are out of scope and risk validator warnings.
  - [x] **Do NOT** read cookies/headers/translations inside `lib/structured-data.ts` — keep it a pure function of its arguments (the page resolves the locale + translated description and passes them in). This keeps the builder testable and the route static (AR-4).

- [x] **Task 2 — Inject the JSON-LD on the home route `src/app/[locale]/page.tsx` (AC: #1, #4, #5, #6)**
  - [x] In the `Home` default export (which already `await`s `params` and calls `setRequestLocale(locale)`), resolve the localized description from the **existing** `metadata` namespace and build the payload, then render the `<script>` as the **first child** of the returned fragment:
    ```ts
    import { getTranslations } from "next-intl/server";
    import { buildStructuredData } from "@/lib/structured-data";

    // inside Home, after setRequestLocale(locale):
    const t = await getTranslations({ locale, namespace: "metadata" });
    const jsonLd = buildStructuredData({ locale, description: t("description") });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Nav />
        <main className="flex-1">
          {/* …unchanged sections… */}
        </main>
        <Footer />
      </>
    );
    ```
  - [x] **`.replace(/</g, "\\u003c")` is required** (AC6) — it is the XSS-scrub from the bundled Next JSON-LD guide. Even though our payload is all build-time constants/catalog copy (no user input), keep it: it is the documented house pattern and the architecture's "serialized once via a single helper" implies the safe serialization too.
  - [x] **Reuse `metadata.description`** (added by Story 3.2) for the JSON-LD `description` — do **not** add a new `structuredData`/`jsonLd` catalog namespace. The metadata description is already the single localized product summary; reusing it keeps the en/uk key trees identical (AR-15) and means **no `messages/*.json` edits in this story.**
  - [x] `getTranslations({ locale, namespace: "metadata" })` after `setRequestLocale(locale)` is the established static-render pattern (mirrors `generateMetadata` in the same file). Do **not** call `cookies()`/`headers()`/`searchParams` (AR-4).
  - [x] A native `<script>` tag is correct here — **do not** use `next/script` (the bundled guide's "Good to know": JSON-LD is data, not executable JS). Do not add `'use client'`; `page.tsx` is and stays a Server Component.

- [x] **Task 3 — Verify (AC: #1, #2, #3, #4, #5, #6)**
  - [x] Quality gate: `npm run build` (runs `tsc --noEmit`) + `npm run lint` — both must pass.
  - [x] **Static (AC4):** the build route table still shows `● /[locale]` prerendering `/en` and `/uk` as static (not `ƒ` Dynamic) — proves no request-time API was introduced.
  - [x] **Confirm `/icon.svg` serves (AC3):** `npm start`, then `curl -sI http://localhost:3000/icon.svg` returns `200` with `content-type: image/svg+xml`. If it does **not** serve at the bare path, see the open question (fall back to a stable `public/` asset) before claiming AC3.
  - [x] Inspect the prerendered HTML (`.next/server/app/en.html` and `.next/server/app/uk.html`, the Story 3.1/3.2/3.3 grep method) and confirm on **each** locale:
    - exactly **one** `<script type="application/ld+json">` (AC1) — no duplicate/second script.
    - the payload contains `"@type":"SoftwareApplication"`, `"applicationCategory":"LifestyleApplication"`, `"operatingSystem":"iOS"`, and a nested `"publisher":{"@type":"Organization",…}` with `"logo":"https://meal-loop.com/icon.svg"` (AC1, AC3).
    - **no** `installUrl`, `offers`, `aggregateRating`, or `price` keys anywhere in the payload (AC3 — `APP_STORE_LIVE` is `false`).
    - `description` is the **language-correct** value (en ≠ uk) and `url` is `…/en` on the en page, `…/uk` on the uk page (AC5).
    - any literal `<` inside the serialized string appears as `<` (AC6). (Our payload has none today, but verify the escape is wired.)
  - [x] **JSON validity (AC2):** extract the script's inner text and `node -e "JSON.parse(...)"` (or pipe through `python3 -m json.tool`) — it must parse with no error. This is the structural half of AC2.
  - [x] **Headless-env honesty (Epic 1 → 3.1/3.2/3.3 pattern):** the live **Google Rich Results Test** / **schema.org validator** cannot run headless. Record it as an **outstanding human follow-up**; the agent claims only the structural verification above (single script, correct entities/fields, JSON.parse-valid, static route).

## Dev Notes

### What this story is (and is not)

This is the **JSON-LD** slice of Epic 3 (FR-9): a new typed builder `src/lib/structured-data.ts` (`SoftwareApplication` + nested `Organization` publisher) serialized once into a single `<script type="application/ld+json">` on the home route. It touches framework surface (RSC `<script>` injection), so the `AGENTS.md` mandate applies — the code shape below is derived from the **bundled** Next 16 guide (read first): `node_modules/next/dist/docs/01-app/02-guides/json-ld.md` ("render structured data as a `<script>` tag in your `layout.js` or `page.js`"; `JSON.stringify(...).replace(/</g, "\\u003c")`; native `<script>` not `next/script`; `schema-dts` is *optional*).

**Out of scope (separate stories — do NOT touch):**
- **Open Graph / Twitter card metadata** → Story 3.5 (`openGraph`/`twitter` in `generateMetadata`). The OG **image** route (`opengraph-image.tsx`) already exists — leave it.
- **Sitemap / robots** → already shipped (3.3); do not edit `src/app/sitemap.ts` / `src/app/robots.ts`.
- **`generateMetadata` title/description/canonical/hreflang** → already shipped (3.2); do not modify it (you only **read** the same `metadata` catalog namespace it uses).
- **App Store live behavior** (`offers`/rating/`installUrl` population, Coming-soon CTA) → Epic 6 (Story 6.2). This story only *gates* `installUrl` on the existing `APP_STORE_LIVE` flag; it does not flip it or build the CTA.
- **Catalog edits** — none. Reuse `metadata.description`; do not add a `structuredData` namespace (would touch en+uk and is unnecessary).

### Current state (audited against `baseline_commit` 586e427) — what exists today

- **`src/lib/structured-data.ts` does NOT exist** — it is a **new** file. `src/lib/` currently holds only `site.ts` and `utils.ts` (`grep`/`find` confirmed; architecture §Directory Structure line 516 plans exactly this `structured-data.ts`).
- **`src/app/[locale]/page.tsx`** (the home route) already `await`s `params`, calls `setRequestLocale(locale)`, and has `generateMetadata` reading `getTranslations({ locale, namespace: "metadata" })`. **Task 2 adds the `<script>` to the `Home` default export's returned fragment** — the `setRequestLocale` call and the `metadata` namespace are already in place. `export const dynamicParams = false` is already set (3.2 hardening) — no stray locale can reach this route.
- **`src/lib/site.ts`** exports everything the builder needs and **no change is required**: `SITE` (`{ name: "MealLoop", email }`), `SITE_ORIGIN` (normalized origin), `localeUrl(locale)`, `APP_STORE_URL` (`"#"`), `APP_STORE_LIVE` (`APP_STORE_URL !== "#"` → currently `false`). Import these; never inline an origin or the app-store URL.
- **`messages/en.json` / `messages/uk.json`** both have a `metadata` namespace with `title` + `description` (added in 3.2). The uk `description` is language-correct. Reuse the `description` key — **no catalog edit.**
- **Brand assets:** `src/app/icon.svg` (Story 2.2) is the **baked-color** square mark — green `#2E7D4F` on paper `#f5f4f1`, `viewBox 0 0 2048 2048` — served at `/icon.svg`. `public/brand/brand-mark.svg` exists but is `fill="currentColor"` (renders black for a crawler). `src/components/logo.tsx`'s `BrandMark` also uses `currentColor` (tinted via `text-brand` in the DOM) — that's correct for in-DOM rendering but **not** for a crawler-read JSON-LD `logo`. Use the baked `/icon.svg`.
- **`src/app/[locale]/layout.tsx`** sets `metadataBase` and a static OG block; it is the **shared** shell for the whole `[locale]` tree (today only the home route; Epic 5 adds `privacy`/`terms`/`cookies` under it). This is why the JSON-LD goes in `page.tsx`, **not** here — see the structure decision below.

### The injection-location decision: `page.tsx`, not `layout.tsx`

The architecture's directory comment (line 478–479) annotates `[locale]/layout.tsx` with "JSON-LD inject (FR-9)". **Deliberately diverge from that here and inject in `page.tsx` (the home route).** Rationale:
- **The story scopes it to "the home page"** (AC1 / epic Story 3.4: "Given the home page, when it renders"). `SoftwareApplication` describes the *product*; it belongs on the landing page, not site-wide.
- **`[locale]/layout.tsx` is shared.** Epic 5 (Stories 5.1/5.2) adds `privacy`/`terms`/`cookies` pages **under the same `[locale]/layout.tsx`**. Injecting there would stamp `SoftwareApplication` onto every legal page — wrong entity for those URLs and a duplicate-product signal. Injecting in `page.tsx` confines it to the home route, so Epic 5 inherits nothing it must later strip.
- The bundled Next guide sanctions **either** `layout.js` **or** `page.js`; `page.js` is the correct choice given the scope. Record this as a **Project Structure variance** (below) so it isn't "corrected" back to the layout later.

### The builder shape: one nested object, one script

- **One object, one `<script>`** (architecture §Format Patterns, AC1). Nest `Organization` as the `SoftwareApplication.publisher` — this directly matches the epic wording ("SoftwareApplication … + an Organization **publisher**"), keeps it to a single top-level node, and passes the validator. (A `@graph` array of two top-level nodes cross-referenced by `@id` is an acceptable alternative, but the nested form is simpler and sufficient for two entities — prefer it.)
- **`@context` belongs on the top-level node only** (the `SoftwareApplication`), not repeated on the nested `Organization`.
- **`name`/`applicationCategory`/`operatingSystem`/`logo` are brand constants** (same on both locales). **`description` + `url` + `inLanguage` are per-locale.** `inLanguage` is a small, valid, useful addition (the catalog description is language-specific); keep it.

### Architecture & convention guardrails (must follow)

- **Static-prerender discipline (AR-4):** no `cookies()`/`headers()`/`searchParams`/dynamic API in `page.tsx` or the builder. Use `getTranslations({ locale, namespace })` after `setRequestLocale(locale)` — already the file's pattern.
- **Absolute URLs from `SITE_ORIGIN` (AR-5, §Format Patterns):** the publisher `url`/`logo` and the app `url` derive from `SITE_ORIGIN`/`localeUrl`. Never hardcode `https://meal-loop.com` or the app-store URL — import `SITE_ORIGIN`, `localeUrl`, `APP_STORE_URL`, `APP_STORE_LIVE`, `SITE`.
- **Single helper, no hand-rolled `<script>` per section (§Format Patterns):** all JSON-LD flows through `buildStructuredData` + the one `<script>`. No section component emits its own structured data.
- **RSC/server-only (§Process Patterns):** `page.tsx` is a Server Component and `lib/structured-data.ts` is server-evaluated. Do **not** add `'use client'`.
- **Single-sourced constants (NFR-5):** `APP_STORE_LIVE` is the *only* gate for `installUrl` — do not re-derive `APP_STORE_URL !== "#"` inline.
- **Code style (project-context):** files kebab-case (`structured-data.ts`); double-quoted imports + semicolons in app/lib code (match `site.ts`/`page.tsx` — this is hand-written app code, **not** shadcn `ui/*`). Export is a named `buildStructuredData` (camelCase function, consistent with `localeUrl`).
- **No test runner (AR-13):** verify via build + route table + prerendered-HTML grep + `JSON.parse`. Do **not** add `*.test.tsx` or a test framework.

### Decisive scope boundaries — do NOT do these

- **Do not** inject the JSON-LD in `[locale]/layout.tsx` (would leak `SoftwareApplication` onto Epic 5 legal pages) — inject in `page.tsx`.
- **Do not** add `schema-dts` or any other dependency (AR-6) — type with the local interface.
- **Do not** add `offers`/`aggregateRating`/`price`/`installUrl` while `APP_STORE_LIVE` is `false` (AC3); gate `installUrl` on the flag and omit the rest entirely (Epic 6 territory).
- **Do not** use `public/brand/brand-mark.svg` (currentColor → black) for the `logo` — use the baked `/icon.svg`.
- **Do not** add a `structuredData`/`jsonLd` catalog namespace — reuse `metadata.description` (no catalog edits; AR-15 trees stay identical).
- **Do not** use `next/script` — native `<script>`. Do not add `'use client'`.
- **Do not** edit `generateMetadata`, `sitemap.ts`, `robots.ts`, `layout.tsx`, `routing.ts`, `proxy.ts`, or the catalogs.
- **Do not** add `openGraph`/`twitter` (Story 3.5).
- **Do not** drop the `.replace(/</g, "\\u003c")` scrub (AC6).

### Previous-story intelligence (Epic 1–3)

- **Reuse `localeUrl` + the `metadata` namespace (3.2):** 3.2 added `localeUrl` and the `metadata.{title,description}` keys precisely so later SEO work single-sources URLs and copy. The JSON-LD `url` uses `localeUrl(locale)` and the `description` reuses `metadata.description` — same map, same copy, no duplication.
- **Static + parity discipline (3.2/3.3):** both prior stories kept their routes `●`/`○` Static and derived every URL from `SITE_ORIGIN`. 3.3 explicitly verified static via the route table and parity via prerendered-HTML grep — apply the identical verification method (Task 3).
- **Baked-asset hex rule (Stories 2.2/2.3 + project-context):** crawler-/OS-read assets (favicon, OG PNGs, **and now the JSON-LD logo**) must use baked literal hex, never `currentColor`/CSS tokens. `icon.svg` is the baked square mark; `brand-mark.svg`/`BrandMark` are currentColor (DOM-tinted) and wrong for a crawler logo. This is the single most likely correctness trap in this story.
- **Headless-env honesty (Epic 1 → 2.x → 3.1/3.2/3.3):** live external validators (Rich Results Test, schema.org validator, Search Console) are recorded as human follow-ups; the agent claims only build + structural verification. Apply to Task 3.
- **Manrope, not Outfit:** ignore any planning-doc font reference; irrelevant here but consistent with prior-story corrections.

### Latest technical specifics (Next 16 JSON-LD + schema.org)

- **Injection (bundled `json-ld.md`):** render `<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />` inside `page.js`/`layout.js`. Native `<script>`, **not** `next/script` (JSON-LD is data, not executable JS). `schema-dts` typing is *optional* — we use a local type to avoid a dependency.
- **schema.org `SoftwareApplication`:** `applicationCategory` and `operatingSystem` are recommended; Google's app rich-result eligibility normally wants `offers`/`aggregateRating` — **deliberately omitted pre-listing** (AC3). Expect the validator to pass with **no errors** but possibly **warnings** about missing optional rating/offer fields; warnings are acceptable and expected for the pre-listing scope (do not chase them by fabricating ratings).
- **`Organization.logo`:** Google wants a crawlable image URL (min ~112×112; PNG/SVG accepted). `/icon.svg` (2048×2048 baked square) satisfies this. A `currentColor` SVG would render black — off-brand and the reason `brand-mark.svg` is excluded.
- **No region in `inLanguage`:** use the bare language code (`en`/`uk`) — consistent with the language-only hreflang chosen in 3.2.

### Project Structure Notes

- `src/lib/structured-data.ts` is the architecture-planned location (§Directory Structure line 516: "NEW typed JSON-LD builder: SoftwareApplication + Organization (FR-9)"). The `<script>` is injected in `src/app/[locale]/page.tsx`.
- **Detected variance (with rationale):** the architecture's directory comment annotates the **layout** with "JSON-LD inject"; this story injects in **`page.tsx`** instead, to confine `SoftwareApplication` to the home route and avoid leaking it onto the Epic 5 legal pages that share `[locale]/layout.tsx`. The bundled Next guide permits either; the home-page scope (AC1) makes `page.tsx` correct. No other structural conflict; no new directories, dependencies, or exports beyond `buildStructuredData`.

### References

- [Source: docs/planning-artifacts/epics.md#Story 3.4: Structured data (JSON-LD)] (lines 461–479) — the three BDD ACs (FR-9): single typed `structured-data.ts` builder → one `<script type="application/ld+json">`; `SoftwareApplication` (`LifestyleApplication`/`iOS`) + `Organization` publisher; passes schema.org test; logo = real brand mark; `installUrl`/rating only once `APP_STORE_LIVE`.
- [Source: docs/planning-artifacts/epics.md#Requirements Inventory] (line 34) — FR-9 ("home page emits valid JSON-LD (Organization + SoftwareApplication); application entity references the App Store listing once `APP_STORE_URL` is live").
- [Source: docs/planning-artifacts/architecture.md#SEO & Metadata] (lines 252–254) — `SoftwareApplication` (`applicationCategory: LifestyleApplication`, `operatingSystem: iOS`) + `Organization` publisher; `installUrl`/rating added only once `APP_STORE_LIVE` (scoped pre-listing).
- [Source: docs/planning-artifacts/architecture.md#Format Patterns] (lines 355–358) — "the only structured output is JSON-LD, authored as a typed object and serialized once via a single `<script type="application/ld+json">` helper — agents must reuse that helper, not hand-roll `<script>` tags per section."
- [Source: docs/planning-artifacts/architecture.md#Complete Project Directory Structure] (lines 478–479, 516) — JSON-LD inject location annotation (layout) and the planned `lib/structured-data.ts` builder; the variance to `page.tsx` is documented above.
- [Source: docs/planning-artifacts/architecture.md#Brand-asset critical path] (lines 84, 296) — favicons, OG image, and the JSON-LD **logo** all derive from the locked iOS brand asset (Epic 2).
- [Source: docs/implementation-artifacts/3-2-per-locale-metadata-canonical-hreflang.md] — `localeUrl` + the `metadata` catalog namespace (reused here for `url` + `description`); static-render + prerendered-HTML grep verification; headless-env honesty; `dynamicParams = false` already on `page.tsx`.
- [Source: docs/implementation-artifacts/3-3-locale-aware-sitemap-robots.md] — the `SITE_ORIGIN` normalization (single-sourced origin the logo/url reuse), the route-table static check, and the headless-env follow-up pattern.
- [Source: docs/implementation-artifacts/2-2-favicon-app-icon-set.md] — `icon.svg` is the baked green-on-paper square mark (the JSON-LD logo target); the baked-hex-vs-currentColor distinction.
- [Source: node_modules/next/dist/docs/01-app/02-guides/json-ld.md] — `<script type="application/ld+json">` injection in `page.js`/`layout.js`; `JSON.stringify(...).replace(/</g, "\\u003c")` XSS scrub; native `<script>` over `next/script`; `schema-dts` optional.
- [Source: docs/project-context.md] — Next 16 framework rules (read bundled docs first; RSC by default), single-sourced config in `src/lib/site.ts`, baked-asset literal-hex rule, lean quality gate (`tsc` + ESLint, no tests), kebab-case files.
- Current code: `src/lib/site.ts:41-51` (`SITE_ORIGIN`/`localeUrl`/`APP_STORE_URL`/`APP_STORE_LIVE`/`SITE`), `src/app/[locale]/page.tsx:16,40-62` (`dynamicParams`, `Home` — inject point), `src/app/icon.svg` (baked logo), `messages/en.json`/`messages/uk.json` (`metadata.description`), `src/components/logo.tsx:7-14` (currentColor `BrandMark` — *not* the logo source).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.7) — BMAD dev-story workflow

### Debug Log References

- `npm run lint` → clean (no output).
- `npm run build` → ✓ compiled, TypeScript ✓; route table shows `● /[locale]` (`/en`, `/uk`) as static SSG (not `ƒ`), and `○ /icon.svg` static — AC4 satisfied.
- Prerendered-HTML grep: exactly **one** rendered `<script type="application/ld+json">` per locale. The raw `grep -o 'application/ld+json'` count of 2 is the real DOM tag (1) plus the RSC flight-payload echo in `self.__next_f` (the serialized React tree, `[["$","script",null,{"type":"application/ld+json",…`), which is not a second rendered script — a crawler sees one tag.
- `JSON.parse` of the extracted payload succeeds on both locales (AC2 structural); forbidden-keys scan (`installUrl`/`offers`/`aggregateRating`/`price`/`screenshot`/`softwareVersion`) → none present (AC3).
- `curl -sI http://localhost:3000/icon.svg` → `200 OK`, `content-type: image/svg+xml` (AC3 logo target resolves).
- Escape-mechanism check: `JSON.stringify({name:"x<script>y"}).replace(/</g,"\\u003c")` yields `<`, no raw `<` (AC6 wiring confirmed; today's payload contains no `<`).

### Completion Notes List

- New typed builder `src/lib/structured-data.ts`: pure `buildStructuredData({ locale, description })` → one `SoftwareApplication` (`LifestyleApplication`/`iOS`) with nested `Organization` publisher. `@context` only on the top node. Local hand-written type — **no `schema-dts`** or any new dependency (AR-6).
- `logo` = `${SITE_ORIGIN}/icon.svg` (baked green-on-paper square mark from Story 2.2), confirmed serving 200 `image/svg+xml`. Did **not** use `public/brand/brand-mark.svg` (`currentColor` → black for a crawler).
- `installUrl` gated on `APP_STORE_LIVE` (currently `false` → omitted); `offers`/`aggregateRating`/`price` omitted entirely (pre-listing scope, AC3).
- Injected one native `<script type="application/ld+json">` as the first child of `Home`'s fragment in `src/app/[locale]/page.tsx`, payload from the single builder, serialized with `.replace(/</g, "\\u003c")` (AC6). No `next/script`, no `'use client'` — `page.tsx` stays a Server Component.
- `description` reuses the existing `metadata.description` catalog key (Story 3.2) via `getTranslations({ locale, namespace: "metadata" })` after `setRequestLocale(locale)` — **no `messages/*.json` edits**, en/uk key trees unchanged (AR-15). Verified en ≠ uk and `url` self-referential per locale (AC5).
- **Project Structure variance (intentional):** JSON-LD injected in `page.tsx`, not `[locale]/layout.tsx`, to confine `SoftwareApplication` to the home route and avoid leaking it onto the Epic 5 legal pages that share the layout. Bundled Next guide permits either; home-page scope (AC1) makes `page.tsx` correct.
- **Outstanding human follow-up (headless-env honesty):** the live Google Rich Results Test / schema.org Markup Validator cannot run headless. Agent claims only structural verification (single script, correct entities/fields, `JSON.parse`-valid, static route, logo 200). Run the live validator before considering AC2 fully closed; expect **no errors**, possibly warnings about omitted optional `offers`/`aggregateRating` (acceptable pre-listing — do not fabricate ratings).

### File List

- `src/lib/structured-data.ts` (new) — typed `buildStructuredData` (SoftwareApplication + nested Organization publisher).
- `src/app/[locale]/page.tsx` (modified) — import builder, resolve `metadata.description`, render the single JSON-LD `<script>`.
- `docs/implementation-artifacts/3-4-structured-data-json-ld.md` (modified) — tasks checked, Dev Agent Record, status → review.
- `docs/implementation-artifacts/sprint-status.yaml` (modified) — `3-4-structured-data-json-ld` → in-progress → review.

## Change Log

| Date       | Change                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| 2026-06-23 | Implemented Story 3.4: typed JSON-LD builder (`SoftwareApplication` + `Organization` publisher) + single `<script>` injection on the home route; verified via build, static route table, prerendered-HTML grep, and `JSON.parse`. Status → review. |
| 2026-06-23 | Adversarial code review (Blind Hunter + Edge Case Hunter + Acceptance Auditor): all 6 ACs pass, every "do NOT" boundary respected; 7 findings dismissed as noise (incl. a verified false-positive on the `/icon.svg` logo path — `app/icon.svg` is registered as a literal route, curl 200, the hashed query is only on the `<head>` link). Outstanding human follow-up unchanged: run the live schema.org/Rich Results validator (AC2). Status → done. |
