---
baseline_commit: 05b0b549429feb3f985381bf2b2d74db4e775579
---

# Story 1.1: i18n scaffolding & localized route shell

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor (and the site maintainer),
I want the site served under a language-scoped URL with the correct document language,
so that every page has a stable, shareable, language-specific address that the rest of v2 can build inside.

This is the **spine story** of v2. Everything else (SEO metadata, brand, mobile menu, analytics, legal pages) renders inside the `app/[locale]` tree this story creates. It is deliberately the heaviest story in the plan (per AR-2 / readiness report §"Story 1.1 is the heaviest") — it bundles i18n scaffolding, the route restructure, `proxy.ts`, `SITE_ORIGIN`/`metadataBase`, and the `#2E7D4F` AA token fix. Do not split unless it proves unwieldy (see Project Structure Notes for the sanctioned split point).

## Acceptance Criteria

1. **Dependencies + plugin + i18n config.** The v2 deps are installed (`next-intl@^4.13`, `@vercel/analytics@^2`, `@vercel/speed-insights@2.0.0`); `next.config.ts` is wrapped with `createNextIntlPlugin` (preserving the existing `turbopack.root` pin); `src/i18n/{routing,navigation,request}.ts` exist and define locales `['en','uk']`, `defaultLocale 'en'`, `localePrefix 'always'`. _(AR-2, AR-6)_
2. **Proxy initializes next-intl, verified against Next 16 convention.** `proxy.ts` initializes next-intl's `createMiddleware`, and the location/export shape is **verified against this fork's Proxy convention** (the file is `proxy.ts`, the function is the default export). A real build picks it up — `/` actually redirects, it is not silently ignored. _(AR-2, AR-3 — highest build-time risk)_
3. **Route tree under `app/[locale]/`, statically prerendered.** Routes are restructured under `app/[locale]/`; visiting `/en` and `/uk` each renders the full landing page, statically prerendered via `generateStaticParams` over the locales + `setRequestLocale`, with the correct `<html lang>` (`/en`→`lang="en"`, `/uk`→`lang="uk"`). _(FR-1, FR-5, AR-4)_
4. **Locale-less root resolves, no 404.** A request to `/` is handled by `proxy.ts` and resolves to a locale subpath rather than returning a 404. _(FR-1)_
   _Scope note:_ Story 1.1 only needs `/` to **not 404** and to land on a locale (default `en` is acceptable here). The full `Accept-Language` + persisted-cookie negotiation logic is **Story 1.2** — do not build it here.
5. **Locale-aware navigation wired.** Any internal **route** link uses the locale-aware `Link`/`useRouter` from `@/i18n/navigation`; no hand-built `/${locale}/…` strings exist. _(FR-1)_ See Dev Notes "AC-5 nuance" — in 1.1 most existing links are same-page fragment anchors or the external App Store URL; the deliverable is wiring the helper and routing the logo "home" link through it, not converting fragment/external links.
6. **`metadataBase` from single-sourced `SITE_ORIGIN`.** `SITE_ORIGIN` is added to `src/lib/site.ts`; the layout sets `metadataBase` from it; the build does not error on relative alternates. _(AR-5)_
7. **Light brand-green AA fix.** In `globals.css`, light `--brand` and `--ring` resolve to `#2E7D4F`; no component hardcodes `#3D8A5A`. _(UX-DR-1)_ See Dev Notes "AC-7" — the same `#3d8a5a` value is also bound to `--primary`/`--chart-1`/`--sidebar-primary`/`--sidebar-ring`; update those together so the primary button and focus rings are not left at the non-AA green.
8. **Deploy pipeline intact.** The existing GitHub→Vercel auto-deploy on `main` still builds and deploys (`tsc --noEmit` + ESLint gate pass via `next build`). _(NFR-6, AR-13)_

## Tasks / Subtasks

- [x] **Task 1 — Install v2 dependencies (AC: 1)**
  - [x] `npm install next-intl@^4.13 @vercel/analytics@^2 @vercel/speed-insights@2.0.0`
  - [x] Confirm `package-lock.json` updates and the dev server still boots.
  - [x] **Do NOT mount `<Analytics/>`/`<SpeedInsights/>` in this story** — installing is in-scope (AR-6); wiring the analytics island is Story 6.1. Installing now just unblocks the lockfile/build.
- [x] **Task 2 — Read the installed next-intl 4.13 docs before writing i18n code (AC: 1,2,3)**
  - [x] `AGENTS.md` mandate + Project Context: this is Next.js 16 with the **Proxy** rename. Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` and `node_modules/next-intl/**` (README / dist docs) for the **App Router with i18n routing** setup. The v4 API names below are a strong starting point but **verify each against the installed package** before relying on them.
- [x] **Task 3 — Create the i18n wiring in `src/i18n/` (AC: 1,5)**
  - [x] `src/i18n/routing.ts` — `defineRouting({ locales: ['en','uk'], defaultLocale: 'en', localePrefix: 'always' })`.
  - [x] `src/i18n/navigation.ts` — `createNavigation(routing)` exporting locale-aware `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname`.
  - [x] `src/i18n/request.ts` — `getRequestConfig` that resolves the active locale (validate with `hasLocale`, fall back to `defaultLocale`) and loads `messages/${locale}.json` with an **`en` fallback merged in** (FR-4 fallback infra; full uk catalog is Story 1.4).
  - [x] Re-export `LOCALES`/`DEFAULT_LOCALE` from `src/lib/site.ts` or keep them in `routing.ts` as the single source — **do not duplicate the locale list** (single-source rule). _(Locales single-sourced in `src/lib/site.ts`; `routing.ts` consumes them.)_
- [x] **Task 4 — Add `proxy.ts` at the verified location (AC: 2,4)**
  - [x] Initialize `createMiddleware(routing)` and export it as the default export of `proxy.ts`.
  - [x] Set `config.matcher` to next-intl's recommended pattern adapted for this site (skip `api`, `_next`, `_vercel`, files with a dot). Keep `matcher` a static literal (Next requires build-time-analyzable matchers).
  - [x] **Resolve the location ambiguity (build-time risk):** the Next 16 doc says `proxy.ts` goes "in the project root, or inside `src` … at the same level as `pages` or `app`." This project's app is at `src/app`. Architecture says repo root. **Build and confirm `/` actually 302s to a locale** — a proxy in the wrong place is silently ignored and `/` will 404. Use whichever location the build proves works; note the resolved location in the Completion Notes. _(Resolved: `src/proxy.ts` — same level as `src/app`. Build shows `ƒ Proxy (Middleware)`; `GET /` returns 307 → `/en`.)_
- [x] **Task 5 — Wrap `next.config.ts` with the plugin (AC: 1)**
  - [x] `const withNextIntl = createNextIntlPlugin()` (point it at `./src/i18n/request.ts` if the default path differs); wrap `export default withNextIntl(nextConfig)`. _(Passed `"./src/i18n/request.ts"` explicitly.)_
  - [x] **Preserve** the existing `turbopack.root = __dirname` pin — Project Context says removing it lets a stray home-dir lockfile mis-infer the workspace root. _(Pin kept; plugin's `getNextConfig` spreads `...nextConfig.turbopack`, so the pin survives the wrap. Build ran on Turbopack with no root-inference warning.)_
- [x] **Task 6 — Restructure routes under `app/[locale]/` (AC: 3,5)**
  - [x] Move `src/app/page.tsx` → `src/app/[locale]/page.tsx`. _(via `git mv` to preserve history.)_
  - [x] Decide the layout split (see Dev Notes "Root vs `[locale]` layout — get this right"): the element carrying per-locale `<html lang={locale}>` must live where `setRequestLocale` runs. Follow next-intl's documented App-Router-with-i18n-routing layout structure **exactly**. _(Resolved: `src/app/[locale]/layout.tsx` is the sole html-bearing root layout; old `src/app/layout.tsx` removed. See Completion Notes.)_
  - [x] `[locale]/layout.tsx` (or page): `export function generateStaticParams()` returning `routing.locales.map(locale => ({ locale }))`; `await params`, validate with `hasLocale` (else `notFound()`), call `setRequestLocale(locale)`. _(In the layout. `setRequestLocale` ALSO called in `page.tsx` — required per next-intl for static rendering since page/layout render in parallel; without it `/[locale]` built as `ƒ` dynamic.)_
  - [x] Wrap children in `NextIntlClientProvider` (bridges messages to the later client islands; harmless now). _(v4 inherits messages/locale from server context — no props needed.)_
  - [x] Add `src/app/[locale]/not-found.tsx` (localized 404; minimal is fine — AR-16).
  - [x] Route the logo "home" link in `nav.tsx`/`footer.tsx` through `@/i18n/navigation` `Link` to `"/"` (was `#top`). Leave same-page section anchors (`#how-it-works`, `#features`, `#loop`) and the external App Store URL as plain `<a>` — see AC-5 nuance. _(Verified: logo href renders `/en` under /en and `/uk` under /uk. Section anchors + App Store CTA left as plain `<a>`.)_
- [x] **Task 7 — Seed `messages/en.json` (AC: 3)**
  - [x] Create `messages/` at repo root with `en.json`. A minimal seed (e.g. `{}` or one namespace) is sufficient — **full copy externalization is Story 1.3**; this only needs to exist so `request.ts` loads without error. _(Seeded as `{}`.)_
  - [x] Do **not** create `uk.json` here (Story 1.4) unless `request.ts` requires a file to exist; if it does, create `uk.json` with the same (minimal) tree. _(Created `uk.json` as `{}` — `request.ts` dynamically imports `messages/uk.json` and AC-3 requires `/uk` to render, so the file must exist.)_
- [x] **Task 8 — Single-source `SITE_ORIGIN` + wire `metadataBase` (AC: 6)**
  - [x] Add `SITE_ORIGIN` to `src/lib/site.ts` (may read a Vercel env with a constant fallback, per architecture §Infrastructure). Add `LOCALES`/`DEFAULT_LOCALE` + the locale→URL map here if you keep config centralized. _(`SITE_ORIGIN` = `process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://meal-loop.com"`. `LOCALES`/`DEFAULT_LOCALE` added here too. Locale→URL map deferred to Epic 3 — not needed by any 1.1 AC.)_
  - [x] In the layout `metadata`/`generateMetadata`, set `metadataBase: new URL(SITE_ORIGIN)`. **Do not read cookies/headers** in any page/layout/`generateMetadata` body (AR-4). _(Static `metadata` export with `metadataBase`; no cookie/header reads — pages stayed static.)_
- [x] **Task 9 — Light brand-green AA fix in `globals.css` (AC: 7)**
  - [x] In the light `:root` block, change `--brand` and `--ring` from `#3d8a5a` to `#2E7D4F`.
  - [x] Also update the sibling light-mode `#3d8a5a` bindings — `--primary`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring` — to `#2E7D4F` so the primary button background and all focus rings meet AA together (see Dev Notes "AC-7"). Leave the **dark** block (`#4faa70`) untouched. _(All 6 light bindings updated; dark `#4faa70` untouched.)_
  - [x] Grep the whole `src/` tree for `#3d8a5a`/`#3D8A5A` to confirm no component hardcodes it. _(Zero remaining occurrences in `src/`.)_
- [x] **Task 10 — Verify the quality gate + render both locales (AC: 3,4,8)**
  - [x] `npm run build` passes (`tsc --noEmit` + ESLint via `next build`); the build log shows `/en` and `/uk` as **statically prerendered** (○/●), not dynamic (ƒ). _(Build green; route table shows `● /[locale]` with `/en` and `/uk` as SSG. `npm run lint` also exits 0.)_
  - [x] `npm run dev`: `/` redirects to a locale; `/en` and `/uk` both render the full landing page; view-source shows correct `<html lang>` per locale. _(Verified against `next start` prod server: `GET /` → 307 `/en`; `/en`→`<html lang="en">`, `/uk`→`<html lang="uk">`; both render the full landing — `/uk` shows English seed copy, expected until Story 1.3.)_
  - [x] Manual responsive sanity at 320/360/390/768px is **not required by this story** (no UI added) but confirm nothing regressed visually. _(No layout/UI markup changed beyond logo-link wrapper + minimal not-found; landing structure unchanged.)_

### Review Findings

_Code review 2026-06-19 (bmad-code-review). Diff: uncommitted working tree vs baseline `05b0b54`. Layers: Blind Hunter + Edge Case Hunter + Acceptance Auditor. Load-bearing claims verified against a real `next build` + `next start` runtime probe (`/`→307→`/en`; `/en`,`/uk`→200 with correct `<html lang>`; `/en/does-not-exist`→404; `/foo.bar`→404). 14 findings dismissed as noise/false-positive/spec-sanctioned scope; notably the two "missing root layout → crash" High findings were disproven (Next auto-generates a working `/_not-found`)._

**Resolved (decision → patch applied 2026-06-19):**

- [x] [Review][Patch] Deep-merge message fallback so per-key FR-4 fallback survives namespaced catalogs [`src/i18n/request.ts`]. Replaced the shallow `{ ...fallbackMessages, ...localeMessages }` spread with a recursive `deepMerge` (partial locale namespaces now fill in over the English base instead of replacing it). Verified `next build` + `npm run lint` green; `/en`+`/uk` still SSG. (Decision: harden now.)

**Resolved (decision → dismissed 2026-06-19):**

- `SITE_ORIGIN` production origin — confirmed `https://meal-loop.com` is the correct production domain. No change; finding dismissed.

**Deferred:**

- [x] [Review][Defer] Dotted unmatched paths render Next's bare default 404, not the branded localized one [`src/app/[locale]/not-found.tsx` / no root `app/not-found.tsx`] — deferred, out of 1.1 scope. Verified: `/foo.bar`→404 via Next's auto `/_not-found` (unstyled), because the proxy matcher excludes dot-containing paths by design. All in-locale navigation 404s correctly render the branded localized page (`/en/does-not-exist`→404; `/totally-unknown`→307→`/en/…`→404), so AR-16 is satisfied. Optional future polish: add a styled root `app/not-found.tsx`.

## Dev Notes

### Established stack (do not re-derive, do not introduce a second style)
- **Next.js 16.2.9** App Router + RSC + Turbopack. **Breaking vs. your training data:** middleware is renamed to **`proxy.ts`**. `AGENTS.md`/Project Context mandate reading `node_modules/next/dist/docs/` before writing framework code. [Source: docs/project-context.md#Technology Stack; AGENTS.md]
- **React 19.2.4**, **TypeScript 5** (`strict`, `noEmit`, path alias `@/*` → `src/*`).
- **Tailwind v4 CSS-first** — theme in `src/app/globals.css` under `@theme inline`; **no `tailwind.config.js`** (`components.json` sets `tailwind.config: ""`). [Source: docs/project-context.md#Styling & Tokens]
- **Files kebab-case; exports PascalCase; hooks/functions camelCase.** Sections in `src/components/sections/`; i18n config in `src/i18n/*`; constants in `src/lib/site.ts`. [Source: docs/planning-artifacts/architecture.md#Naming Patterns]
- **Style detail:** app code uses double-quoted imports + semicolons; leave shadcn-generated `ui/*` and `utils.ts` as the generator produced them (no semicolons). [Source: docs/project-context.md#Code Organization]
- **No test framework** — quality gate is `tsc --noEmit` + ESLint on `next build` only. Don't add Jest/Vitest. [Source: docs/project-context.md#Quality Gate; architecture.md#AR-13]

### Brownfield reality — current state of the files you will touch
This is **not a fresh scaffold** (AR-1). v1 is live on Vercel. Current state of the UPDATE/MOVE targets (read before editing):
- `next.config.ts` — only a `turbopack.root = __dirname` pin. **Wrap, don't replace; keep the pin.**
- `src/app/layout.tsx` — root layout with hardcoded `<html lang="en">`, Outfit `subsets: ["latin"]` only, **inline `metadata` (no `metadataBase`)**, `openGraph` block. This is what moves/splits to carry per-locale `lang` + `metadataBase`.
- `src/app/page.tsx` — assembles `Nav, Hero, HowItWorks, Features, Loop, Screenshots, CTA, Footer`. Move under `[locale]/`. Sections keep their **hardcoded English copy** for now (externalization = Story 1.3).
- `src/lib/site.ts` — has `APP_STORE_URL`, `APP_STORE_LIVE`, `SITE`, `NAV_LINKS`. **Add** `SITE_ORIGIN` (+ locales/URL map). Don't disturb the existing exports.
- `src/components/sections/nav.tsx` — logo wraps `<a href="#top">`; nav links are `#how-it-works` etc.; CTA is `<a href={APP_STORE_URL}>`.
- `src/components/sections/footer.tsx` — legal links are dead `<a href="#">` (resolved in Epic 5, **not here**); contact is a `mailto:`.
- `src/components/app-store-button.tsx` — `<a href={APP_STORE_URL}>` (external; Coming-soon state is Story 6.2, not here).
- `src/components/sections/hero.tsx` — `"use client"` (uses `motion` directly). It stays a client component; that's fine — it reads no translations in 1.1.

### Root vs `[locale]` layout — get this right (most common failure point)
There can be exactly **one** `<html>` element, and it must carry the **per-locale** `lang`. The Next 16 bundled i18n doc shows `app/[lang]/layout.tsx` itself rendering `<html lang={(await params).lang}>` with `generateStaticParams` [Source: node_modules/next/dist/docs/01-app/02-guides/internationalization.md#Static Rendering]. next-intl's App-Router-with-i18n-routing setup follows the same shape. **Follow next-intl's documented structure verbatim** — it dictates whether a root `app/layout.tsx` is kept as a pass-through or removed in favor of `app/[locale]/layout.tsx` as the html-bearing layout. The architecture's file table lists *both* a root `layout.tsx` and a `[locale]/layout.tsx`; treat that as illustrative — the **binding constraint** is: one `<html>`, per-locale `lang`, and `setRequestLocale(locale)` called in the same server layout/page before any message read. Metadata files that live outside `[locale]` (`sitemap.ts`, `robots.ts`, `icon.svg`) are metadata routes, not pages — they don't need a layout and are added by later epics. [Source: architecture.md#Frontend Architecture, #Project Structure]

### Proxy / next-intl integration (AR-3 — the highest build-time risk)
- The next-intl docs you find will say **"middleware"**; in Next 16 the file is **`proxy.ts`** and the function is the **default export**. The bundled Next 16 doc confirms `proxy.ts` accepts a single default-exported function and an optional `config` with `matcher` [Source: proxy.md#Exports]. So `export default createMiddleware(routing)` in `proxy.ts` is the adaptation.
- A codemod exists (`npx @next/codemod@canary middleware-to-proxy .`) but you're authoring fresh — just place it correctly.
- **Verify by behavior, not by file presence:** after build/dev, hitting `/` must 302 to a locale. If `/` 404s, the proxy isn't being picked up (wrong location/name) — that's the AR-3 failure mode. [Source: architecture.md#AR-3, #Technical Constraints]
- `matcher` must be a static literal. A reasonable next-intl-style matcher: `['/((?!api|_next|_vercel|.*\\..*).*)']` — but confirm against the installed package's recommendation. [Source: proxy.md#Matcher]

### Static-prerender discipline (protects CWV — AR-4)
- `/en` and `/uk` MUST stay statically prerendered. That requires `generateStaticParams` + `setRequestLocale(locale)` and **zero cookie/header reads** in pages, layouts, or `generateMetadata`. All request-time logic (locale negotiation in 1.2) lives only in `proxy.ts`. The build log must show `/en`,`/uk` as static, not dynamic. [Source: architecture.md#AR-4, #Architectural Boundaries]
- next-intl v4 exposes `setRequestLocale` from `next-intl/server` (older versions called it `unstable_setRequestLocale`) — **verify the exact import in the installed 4.13**.

### AC-5 nuance — what "locale-aware navigation" actually means in 1.1
FR-1 says "internal links and the App Store CTA preserve the active locale." In this story:
- **Internal route links:** the only real one today is the logo → home. Route it through `@/i18n/navigation` `Link` to `"/"`. The helper preserves the active locale automatically.
- **Same-page fragment anchors** (`#how-it-works`, `#features`, `#loop`, `#top`): these are scroll targets, not route navigation — leave them as plain `<a href="#...">`. Do not wrap them in locale-aware `Link`.
- **App Store CTA:** `APP_STORE_URL` is external (and currently `"#"`). It is **not** an internal link — keep it a plain `<a>`. "Preserve the active locale" for the CTA is satisfied later via the analytics event payload `{ locale }` (Story 6.1/6.2), not via the URL.
- The hard rule that matters now: **never build `/${locale}/…` strings by hand**, and never import `next/link`/`next/navigation` for internal route nav. [Source: architecture.md#Process Patterns, #Pattern Examples (anti-patterns)]

### AC-7 — the AA token fix, applied consistently
`globals.css` binds the light forest-green `#3d8a5a` to **six** custom properties: `--brand` (87), `--ring` (78), `--primary` (67), `--chart-1` (79), `--sidebar-primary` (96), `--sidebar-ring` (101). UX-DR-1 names `--brand` and `--ring`; the AC requires those. **But** Project Context states "`--brand` and `--primary` are the same forest green," and the primary button renders white text on `--primary` — leaving `--primary` at `#3d8a5a` would ship a half-applied fix (button + some rings still below AA). Update all six light-mode bindings to `#2E7D4F` together. Leave the **dark** block (`#4faa70`) alone — UX-DR-1 is a light-mode contrast fix only. Flag the iOS `DESIGN.md` token owner to adopt `#2E7D4F` too (don't fork the value) — that's a human coordination note, not a code change. [Source: docs/planning-artifacts/epics.md#UX-DR-1; docs/project-context.md#Styling & Tokens]

### Scope boundaries — do NOT do these in 1.1 (they belong to later stories)
- **Accept-Language / persisted-cookie negotiation** → Story 1.2. (1.1: `/` just resolves to a locale, default `en` is fine.)
- **Externalizing section copy to catalogs** → Story 1.3. (1.1: seed `en.json` only; sections keep hardcoded copy.)
- **Ukrainian catalog + Outfit `cyrillic` subset (UX-DR-3)** → Story 1.4. The architecture annotates the layout with "latin+cyrillic," but the Cyrillic subset is **not** a 1.1 AC and `/uk` shows English seed content until 1.4. Don't add it now (scope discipline); if you touch the Outfit config anyway, leave it `["latin"]` and let 1.4 own the subset.
- **Locale switcher UI** → Story 1.5. **Mobile menu** → Epic 4. **Analytics island / events** → Epic 6. **Brand mark / favicons / OG** → Epic 2. **SEO `generateMetadata`/sitemap/robots/JSON-LD** → Epic 3. **Legal pages + resolved footer links** → Epic 5.
- Wiring `metadataBase` (1.1) is the only SEO-adjacent task here; full per-locale metadata is Epic 3.

### Accessibility / motion contracts (no new UI here, but honor when editing)
No new interactive UI ships in 1.1, so the focus-ring/touch-target/dialog contracts don't yet apply. Keep `hero.tsx`'s existing motion as-is (reduced-motion handling is Epic 4). One `<h1>` per page already holds (hero). [Source: architecture.md#Process Patterns]

### Project Structure Notes
- New files this story creates: `proxy.ts` (location TBD-by-build), `src/i18n/{routing,navigation,request}.ts`, `messages/en.json`, `src/app/[locale]/{layout.tsx,page.tsx,not-found.tsx}`. Modified: `next.config.ts`, `src/lib/site.ts`, `src/app/globals.css`, `src/app/layout.tsx` (split/move), `nav.tsx` + `footer.tsx` (logo Link). [Source: architecture.md#Complete Project Directory Structure]
- **Sanctioned split point** (only if 1.1 proves unwieldy in practice): the AA token fix (Task 9) and the `SITE_ORIGIN`/`metadataBase` wiring (Task 8) may be peeled into a small companion setup story; the i18n scaffolding core must stay together. [Source: implementation-readiness-report-2026-06-19.md §Notes]
- **Variance from the architecture file table:** it lists both a root `app/layout.tsx` (MOD) and `app/[locale]/layout.tsx`; the actual root-vs-locale layout split is decided by next-intl's documented setup (see "Root vs `[locale]` layout"). Record the resolved structure in Completion Notes so Stories 1.2–1.5 build on the real shape.

### References
- [Source: docs/planning-artifacts/epics.md#Story 1.1: i18n scaffolding & localized route shell] — ACs (BDD form).
- [Source: docs/planning-artifacts/epics.md#Epic 1: Bilingual Foundation] — epic objective + AR/FR coverage.
- [Source: docs/planning-artifacts/epics.md] — AR-1,2,3,4,5,6,12,15,16; UX-DR-1.
- [Source: docs/planning-artifacts/architecture.md#Internationalization & Routing (the spine)] — next-intl 4.13, `createMiddleware` in `proxy.ts`, `localePrefix: 'always'`.
- [Source: docs/planning-artifacts/architecture.md#Frontend Architecture] — RSC-default, static prerender, client-island whitelist.
- [Source: docs/planning-artifacts/architecture.md#Structure Patterns / #Naming Patterns] — `src/i18n/*` files, catalog key discipline, kebab/Pascal naming.
- [Source: docs/planning-artifacts/architecture.md#Complete Project Directory Structure] — NEW/MOD file map.
- [Source: docs/planning-artifacts/architecture.md#Decision Impact Analysis] — implementation sequence (i18n is step 1).
- [Source: docs/planning-artifacts/implementation-readiness-report-2026-06-19.md] — Story 1.1 is the heaviest; optional split is advisory.
- [Source: docs/project-context.md] — stack versions, styling/token rules, known v1→v2 gaps.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md] — Next 16 Proxy convention (file location, default export, matcher, `middleware`→`proxy` migration).
- [Source: node_modules/next/dist/docs/01-app/02-guides/internationalization.md] — App Router i18n + `generateStaticParams` + per-locale `<html lang>`.
- [Source: AGENTS.md] — read bundled Next docs before writing framework code.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, dev-story workflow)

### Debug Log References

**API verification against installed next-intl 4.13 (Task 2):**
- `defineRouting` ← `next-intl/routing`; `createNavigation` ← `next-intl/navigation`.
- `getRequestConfig` + `setRequestLocale` (stable export, NOT `unstable_setRequestLocale`) ← `next-intl/server` (`server/react-server/index.d.ts` shows `setCachedRequestLocale as setRequestLocale`).
- `hasLocale` ← `next-intl` main entry (re-exported from `use-intl/core`).
- `createMiddleware` (default export) ← `next-intl/middleware`; `createNextIntlPlugin` (default export) ← `next-intl/plugin`.
- Plugin `getNextConfig` spreads `...nextConfig.turbopack` into its own turbopack config before `Object.assign`, so wrapping **preserves `turbopack.root`**. Plugin auto-resolves `./src/i18n/request.ts` (checked `resolveI18nPath`), but path is passed explicitly for clarity.
- Next 16 `proxy.md`: file at project root OR `src/` (same level as `app`); single default export accepted; `config.matcher` must be a static literal.
- Bundled Next i18n guide (`internationalization.md#Static Rendering`) shows `app/[locale]/layout.tsx` itself rendering `<html lang={(await params).locale}>` with `generateStaticParams` — i.e. the `[locale]` layout is the html-bearing root layout; no separate `app/layout.tsx`.

### Completion Notes List

**Resolved structural decisions (for Stories 1.2–1.5 to build on):**
- **Proxy location:** `src/proxy.ts` (same level as `src/app`, per `proxy.md`). Confirmed live — build reports `ƒ Proxy (Middleware)` and `GET /` returns `307 → /en`. The repo-root alternative was not needed.
- **Layout structure:** single html-bearing root layout at `src/app/[locale]/layout.tsx`; the old `src/app/layout.tsx` was **removed** (not kept as a pass-through). This matches the bundled Next 16 i18n guide, which renders `<html lang>` directly in `app/[locale]/layout.tsx`. There is exactly one `<html>`, carrying the per-locale `lang`. `globals.css` remains at `src/app/globals.css` and is imported via `../globals.css`.
- **Static rendering gotcha:** `setRequestLocale(locale)` must be called in **both** `[locale]/layout.tsx` **and** `[locale]/page.tsx`. With it only in the layout, the build emitted `ƒ /[locale]` (dynamic); adding it to the page flipped it to `● /[locale]` with `/en` + `/uk` prerendered as static HTML.
- **NextIntlClientProvider:** rendered with no props — next-intl v4 inherits messages/locale from the server request context.

**Locale single-sourcing:** `LOCALES` + `DEFAULT_LOCALE` live in `src/lib/site.ts`; `src/i18n/routing.ts` consumes them via `defineRouting`. No duplicate locale list anywhere.

**Messages:** `messages/en.json` and `messages/uk.json` both seeded as `{}`. `uk.json` was required (not optional) because `request.ts` dynamically imports `messages/${locale}.json` and AC-3 needs `/uk` to render. `request.ts` merges the default-locale catalog underneath the active locale (`{...en, ...locale}`) as FR-4 fallback infra. Full catalogs: en in Story 1.3, uk in Story 1.4.

**metadataBase:** wired from `SITE_ORIGIN` (`process.env.NEXT_PUBLIC_SITE_ORIGIN ?? "https://meal-loop.com"`, derived from the contact-email domain). Static `metadata` export — no cookie/header reads, so AR-4 static discipline holds. Full per-locale metadata/hreflang is Epic 3; `metadataBase` only needed to be set without build error here.

**AA token fix:** all 6 light-mode `#3d8a5a` bindings (`--brand`, `--ring`, `--primary`, `--chart-1`, `--sidebar-primary`, `--sidebar-ring`) → `#2E7D4F`. Dark `#4faa70` left untouched. **Human coordination note (not code):** the iOS `DESIGN.md` token owner should adopt `#2E7D4F` for the light brand green too, so the value isn't forked across platforms.

**Verification (quality gate — no test runner per project rules):** `npm run build` green (Turbopack, `turbopack.root` pin preserved), `npm run lint` exit 0, route table shows `/en`+`/uk` as SSG, `GET /`→307→`/en`, `<html lang>` correct per locale, locale-aware logo link renders `/en` under /en and `/uk` under /uk.

**Out of scope (confirmed not done):** Accept-Language/cookie negotiation (1.2), copy externalization (1.3), uk catalog + Outfit cyrillic subset (1.4), locale switcher (1.5), analytics island (Epic 6), mobile menu (Epic 4), SEO metadata/sitemap/robots/JSON-LD (Epic 3), legal pages + footer legal links (Epic 5). Footer legal links remain dead `<a href="#">` by design.

### File List

**New:**
- `src/i18n/routing.ts`
- `src/i18n/navigation.ts`
- `src/i18n/request.ts`
- `src/proxy.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/[locale]/not-found.tsx`
- `messages/en.json`
- `messages/uk.json`

**Moved (and modified):**
- `src/app/page.tsx` → `src/app/[locale]/page.tsx` (added `params` + `setRequestLocale`)

**Modified:**
- `next.config.ts` (wrapped with `createNextIntlPlugin`, pin preserved)
- `package.json` (+ `next-intl`, `@vercel/analytics`, `@vercel/speed-insights`)
- `package-lock.json`
- `src/lib/site.ts` (+ `LOCALES`, `DEFAULT_LOCALE`, `SITE_ORIGIN`)
- `src/app/globals.css` (AA brand-green fix, light block)
- `src/components/sections/nav.tsx` (logo → locale-aware `Link`)
- `src/components/sections/footer.tsx` (logo → locale-aware `Link`)

**Deleted:**
- `src/app/layout.tsx` (superseded by `src/app/[locale]/layout.tsx`)

## Change Log

- 2026-06-19 — Implemented Story 1.1 (i18n scaffolding & localized route shell). Installed next-intl 4.13 + Vercel analytics/speed-insights (not mounted); added `src/i18n/{routing,navigation,request}.ts`; created `src/proxy.ts` (verified `/`→307→`/en`); wrapped `next.config.ts` with `createNextIntlPlugin` (turbopack pin preserved); restructured routes under `src/app/[locale]/` with `generateStaticParams` + `setRequestLocale` (both layout and page) for static prerender of `/en`+`/uk`; seeded `messages/{en,uk}.json`; added `SITE_ORIGIN` + `metadataBase`; applied the light brand-green AA fix (`#3d8a5a`→`#2E7D4F`, 6 light tokens); routed nav/footer logo through the locale-aware `Link`. Build + lint green. Status → review.
