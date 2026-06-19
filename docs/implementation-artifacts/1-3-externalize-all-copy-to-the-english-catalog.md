---
baseline_commit: 4950838
---

# Story 1.3: Externalize all copy to the English catalog

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the site maintainer (Bogdan),
I want every visible string on the landing page (and the localized 404) to live in `messages/en.json`,
so that future copy edits are catalog edits, not component surgery — and so Story 1.4 has a complete English key tree to translate.

This is a **pure-refactor / no-visible-change** story. The rendered `/en` page must look **byte-for-byte identical** before and after: you are moving hard-coded English strings out of components and into a section-namespaced catalog, then reading them back via next-intl. No new copy, no reworded copy, no layout change, no new sections, no UI controls.

> **The single most important thing to understand before you touch any code:** `messages/en.json` is currently `{}` (empty). Story 1.1 seeded the file and wired `src/i18n/request.ts` (with `en`-fallback deep-merge) and the `NextIntlClientProvider` in the layout — **the plumbing already works end-to-end**. Your job is to fill the catalog and swap literal strings for `t()` lookups. Do **not** rebuild i18n wiring, touch `proxy.ts`/`routing.ts`, or pass a `messages` prop to the provider (it already auto-inherits — see Dev Notes "The provider already feeds the catalog").

## Acceptance Criteria

1. **No hard-coded user-visible string remains in the in-scope components; everything resolves from `messages/en.json`.** _(FR-4, NFR-5)_
   **Given** the landing sections `nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`, the shared `app-store-button`, and the localized `not-found` page,
   **When** `/en` (and the in-locale 404) renders,
   **Then** every visible string — headings, body copy, badges, link/button labels, captions, the App Store badge text, and human-readable `aria-label`s — comes from `messages/en.json`, and grepping the in-scope components finds no literal user-facing English text left behind.

2. **The catalog is section-namespaced, camelCase, and is the single source of all copy.** _(AR-15)_
   **Given** `messages/en.json`,
   **When** it is inspected,
   **Then** keys are grouped under per-section namespaces (`nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`, plus `appStore` and `notFound` for the shared widget/page), all keys are camelCase, the JSON is valid and parses, and no copy string is duplicated in a component or in `src/lib/site.ts`.

3. **Server Components read copy with `getTranslations`; client islands read it with `useTranslations` — and `/en`/`/uk` stay statically prerendered.** _(architecture process pattern; AR-4)_
   **Given** `nav.tsx` and `footer.tsx` (Server Components) and the existing client sections (`hero`, `how-it-works`, `features`, `loop`, `screenshots`, `cta` — all already `"use client"` for Motion),
   **When** they render,
   **Then** Server Components call `getTranslations` (the layout/page already call `setRequestLocale(locale)`), client islands call `useTranslations`, **no `cookies()`/`headers()` read is introduced anywhere**, and `next build` still shows `/[locale]` as static (`●`/`○`, not `ƒ`).

4. **Copy is editable from the catalog alone.** _(FR-4)_
   **Given** any string changed in `messages/en.json`,
   **When** the change is made,
   **Then** the rendered text updates with **no component edit** required.

5. **`SITE.tagline`/`SITE.description` and `NAV_LINKS` labels are migrated, not duplicated.** _(NFR-5)_
   **Given** copy that today lives in `src/lib/site.ts` (`SITE.tagline` → footer, `SITE.description` → hero, and the three `NAV_LINKS` `label`s),
   **When** the migration is done,
   **Then** those strings live only in `messages/en.json`; `SITE.tagline` and `SITE.description` are removed from `site.ts`; `NAV_LINKS` keeps its `href` structure (with a stable lookup `key`) but no longer carries a `label`; and `SITE.name`/`SITE.email`/`SITE_ORIGIN`/`APP_STORE_URL`/locale constants are left untouched.

6. **Copy is migrated verbatim and obeys the voice rules.** _(NFR-8 / UX-DR-18)_
   **Given** each migrated string,
   **When** it lands in the catalog,
   **Then** it is character-for-character identical to the current source (including the typographic apostrophes `’` in the 404 copy and the em-dash `—` in the Features copy) — preserving the established voice (no exclamation marks, no emojis, complete sentences). You are relocating copy, not rewriting it.

7. **`uk.json` is not touched, and no out-of-scope work creeps in.** _(scope guard)_
   **Given** this story,
   **When** it is implemented,
   **Then** `messages/uk.json` stays `{}` (Ukrainian catalog + Cyrillic subset are Story 1.4); the page `<metadata>` in `app/[locale]/layout.tsx` stays as-is (per-locale metadata is Epic 3 / Story 3.2); the device-mockup sample text in `screens.tsx` stays hard-coded (decorative, becomes `aria-hidden` in Story 3.1); and no locale switcher, analytics, consent, or legal-page work is added.

8. **Quality gate + deploy pipeline intact.** _(NFR-6, AR-13)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass, `/en` and `/uk` stay statically prerendered, the `/en` render is visually unchanged vs. baseline, and the GitHub→Vercel auto-deploy on `main` is unaffected.

## Tasks / Subtasks

- [x] **Task 1 — Confirm the i18n plumbing before writing copy (AC: 1,3)**
  - [x] Per `AGENTS.md`/Project Context this is next-intl **4.13** on Next **16** — verify APIs against the installed package, not training data. Read `node_modules/next-intl/dist/types/index.react-server.d.ts` (or the relevant `.d.ts`) for the `getTranslations` / `useTranslations` signatures.
  - [x] Confirm the **provider already auto-inherits messages**: `src/app/[locale]/layout.tsx` renders `<NextIntlClientProvider>{children}</NextIntlClientProvider>` with **no `messages` prop**. In an RSC, `next-intl` resolves this to `NextIntlClientProviderServer`, which calls `getMessages()` when `messages === undefined` (verified in `node_modules/next-intl/dist/esm/production/react-server/NextIntlClientProviderServer.js`). So client islands using `useTranslations` get the full catalog with **no layout change**. Do not add a `messages` prop.
  - [x] Confirm `src/i18n/request.ts` already deep-merges the `en` catalog under the active locale (the FR-4 per-key fallback). You do not edit `request.ts` in this story.

- [x] **Task 2 — Author `messages/en.json` with the full section-namespaced catalog (AC: 1,2,6)**
  - [x] Replace `{}` with the namespaced tree in Dev Notes "Catalog structure & verbatim copy". Use the EXACT strings from the current components (do not reword).
  - [x] camelCase every key; group by section namespace. Preserve `’` (U+2019) and `—` (U+2014) as literal characters in the JSON.
  - [x] Validate the JSON parses (`node -e "JSON.parse(require('fs').readFileSync('messages/en.json','utf8'))"` or rely on the build).

- [x] **Task 3 — Migrate the `site.ts` copy constants (AC: 5)**
  - [x] Restructure `NAV_LINKS` to `{ key, href }` (drop `label`): `{ key: "howItWorks", href: "#how-it-works" }`, `{ key: "features", href: "#features" }`, `{ key: "loop", href: "#loop" }`.
  - [x] Remove `SITE.tagline` and `SITE.description` from `SITE` (their copy now lives in `footer.tagline` / `hero.description`). Keep `SITE.name`, `SITE.email`. Leave `SITE_ORIGIN`, `APP_STORE_URL`, `APP_STORE_LIVE`, `LOCALES`, `DEFAULT_LOCALE` unchanged.

- [x] **Task 4 — Wire the Server Components with `getTranslations` (AC: 1,3)**
  - [x] `nav.tsx`: make it an `async` Server Component; `const t = await getTranslations("nav")`. Map `NAV_LINKS` to `<a href={l.href}>{t(`links.${l.key}`)}</a>`; the CTA button text → `t("getApp")`; the logo link `aria-label` → `t("home")`. Keep it a Server Component (do **not** add `"use client"`).
  - [x] `footer.tsx`: make it `async`; `getTranslations("footer")` for tagline/Privacy/Terms/Contact/copyright; reuse `t("home")` from the `nav` namespace (call `getTranslations("nav")` too, or read `nav.home`) for the logo `aria-label`. Leave the `#` legal hrefs and the `mailto:${SITE.email}` as-is (real legal links are Epic 5).
  - [x] These two becoming `async` requires no change in `page.tsx` (async children are fine).

- [x] **Task 5 — Wire the client sections with `useTranslations` (AC: 1,3)**
  - [x] In each already-`"use client"` section, add `const t = useTranslations("<namespace>")` and replace literals:
    - `hero.tsx` (`"hero"`): badge, headline (`<h1>`), description (was `SITE.description`), "See how it works", availability line.
    - `how-it-works.tsx` (`"howItWorks"`): heading; keep the `STEPS` array but key it (`{ n: "01", key: "library" }`, `plan`, `shop`) and read `t(`steps.${s.key}.title`)` / `.body`. Step numbers `01/02/03` stay in code (decorative structure).
    - `features.tsx` (`"features"`): heading, lead; keep the `FEATURES` array but key it (`{ icon: BookOpen, key: "library" }`, `plan`, `groceries`, `photo`) and read `t(`items.${f.key}.title`)` / `.body`. Icons stay in code.
    - `loop.tsx` (`"loop"`): heading, body; replace `NODES` with keyed labels `t("nodes.cook")` etc. (keep the ordered array of keys for the geometry math).
    - `screenshots.tsx` (`"screenshots"`): heading, lead; the `SHOTS` array keeps `key` + `screen`, caption → `t(`captions.${s.key}`)`.
    - `cta.tsx` (`"cta"`): heading, body, availability line.

- [x] **Task 6 — Wire the shared widget + the 404 (AC: 1)**
  - [x] `app-store-button.tsx`: it has no directive today and is rendered inside client sections (hero, cta). Use `useTranslations("appStore")` for the `aria-label` (`t("label")`) and the two badge text lines (`t("badgePrefix")`, `t("badgeName")`). (Note: this whole button is replaced by Apple-supplied badge artwork in Story 6.2 — keep the change to a minimal string swap.)
  - [x] `not-found.tsx`: it is a Server Component with no `params`. Use `getTranslations("notFound")` (it resolves the locale from the layout's `setRequestLocale`). Externalize title, body (preserve `’`), and "Back home". Leave `"404"` hard-coded (a locale-invariant numeric code). Delete the `// Copy stays hardcoded until Story 1.3` comment.

- [x] **Task 7 — Verify (AC: 1,3,4,7,8)**
  - [x] `npm run build` green (tsc + ESLint); route table shows `/[locale]` static (`●`/`○`), not `ƒ`.
  - [x] Visual parity: `/en` renders byte-for-byte the same copy as before (compare against the baseline commit).
  - [x] Edit-a-key smoke test (AC-4): temporarily change one value in `en.json`, confirm the rendered text changes with no component edit, then revert.
  - [x] `grep` the in-scope components for any leftover literal English (headings, labels, captions, aria-labels) → none.
  - [x] Scope check: `git status` shows no change to `proxy.ts`, `routing.ts`, `request.ts`, `navigation.ts`, `uk.json`, or `layout.tsx` metadata; `screens.tsx` mockup text untouched.

### Review Findings

Code review (2026-06-19, three-layer adversarial: Blind Hunter / Edge Case Hunter / Acceptance Auditor). **Clean — no actionable findings.**

- AC1–AC8 and all scope guards verified SATISFIED. All 52 `t(...)` keys (including dynamic template keys) resolve against `messages/en.json`; copy is verbatim (U+2019 `’` and U+2014 `—` preserved); `uk.json` stays `{}`; no `proxy.ts`/`routing.ts`/`request.ts`/`navigation.ts`/`layout.tsx`/`screens.tsx` changes; no `cookies()`/`headers()` introduced.
- AC8 confirmed by a fresh `next build` (clean `.next`): tsc + ESLint green; route table shows `● /[locale]` with `/en` and `/uk` prerendered static (not `ƒ`).
- 4 Blind Hunter items dismissed as false positives (diff-only blindness, contradicted by the project-aware layers and the real code): (1) footer "lost" Terms/Contact href — footer keeps `mailto:${SITE.email}` and `href="#"`; (2) async Server Component composition risk — Nav/Footer render under async `page.tsx`, not-found is a route segment; (3) app-store-button DOM change — both badge `<span>`s remain siblings in the same wrapper; (4) loop NODES lowercasing — geometry is index-based, `node` is only a React key + catalog lookup, never string-compared.

## Dev Notes

### The provider already feeds the catalog (do not re-plumb)
`src/app/[locale]/layout.tsx` already wraps children in `<NextIntlClientProvider>` with **no `messages` prop**. Verified in the installed package: in an RSC the package root resolves `NextIntlClientProvider` to `react-server/NextIntlClientProviderServer.js`, whose body is `messages: messages === undefined ? await getMessages() : messages`. So the provider pulls the merged catalog from `request.ts` automatically and hands it to every client island. **Consequence:** `useTranslations` works in `hero`/`how-it-works`/`features`/`loop`/`screenshots`/`cta` with zero layout/provider changes. Adding a `messages` prop would be redundant; rebuilding the provider would be a regression. [Source: node_modules/next-intl/dist/esm/production/react-server/NextIntlClientProviderServer.js; index.react-server.js]

### Server vs. client — which API, and why it stays static
- **Server Components** (`nav.tsx`, `footer.tsx`, `not-found.tsx`): use `getTranslations` from `next-intl/server`. It is async, so `nav`/`footer` become `async function`s — fine for RSC, and `page.tsx` needs no change. `getTranslations` reads the locale set by `setRequestLocale` (already called in `layout.tsx` and `page.tsx`) and the messages from `request.ts`; it does **not** read cookies/headers, so `/en`/`/uk` remain statically prerendered (AR-4). The sync `useTranslations` from `next-intl` also works in RSC, but the architecture process pattern prescribes `getTranslations` for Server Components — follow it.
- **Client islands** (the six `"use client"` sections + `app-store-button`): use `useTranslations` from `next-intl`. These are already client components because of Motion — **do not change the RSC/client boundary in this story.** Converting them to RSC is a separate optimization, not part of externalizing copy, and would risk the Motion animations. [Source: docs/planning-artifacts/architecture.md#Process Patterns ("Translation access"); #Frontend Architecture]

### Catalog structure & verbatim copy
Author `messages/en.json` exactly as below (strings are the current literals — copy verbatim, do not reword). Identical strings across sections (e.g. the hero headline equals the footer tagline; the two availability lines match) are intentionally kept as **separate per-section keys** per AR-15's section-namespacing — translators handle each in its own context in Story 1.4.

```json
{
  "nav": {
    "home": "MealLoop home",
    "links": {
      "howItWorks": "How it works",
      "features": "Features",
      "loop": "The loop"
    },
    "getApp": "Get MealLoop"
  },
  "hero": {
    "badge": "For small households",
    "headline": "Plan a week of meals from the dishes you already cook.",
    "description": "A calm weekly meal planner for small households. Build a library of the dishes you actually cook, plan the week, and let the grocery list write itself.",
    "seeHowItWorks": "See how it works",
    "availability": "On iPhone, iOS 17 and later."
  },
  "howItWorks": {
    "heading": "Three steps, then it mostly runs itself.",
    "steps": {
      "library": {
        "title": "Build your library",
        "body": "Add the dishes you already cook, with their ingredients. It grows a little each week."
      },
      "plan": {
        "title": "Plan the week",
        "body": "Assign dishes to days. Reuse last week, or duplicate a week that worked well."
      },
      "shop": {
        "title": "Shop the list",
        "body": "Your groceries arrive grouped by category and ready. Tick items off as you shop."
      }
    }
  },
  "features": {
    "heading": "Everything the weekly shop needs, and nothing it does not.",
    "lead": "MealLoop is built around one quiet loop: the dishes you cook, the week you plan, the list you shop.",
    "items": {
      "library": {
        "title": "Your dish library",
        "body": "Keep every meal you cook in one place, with its ingredients attached. No more starting from a blank page each week."
      },
      "plan": {
        "title": "A simple weekly plan",
        "body": "Drop dishes into a seven-day grid. Breakfast, lunch, dinner — plan as much or as little as you like."
      },
      "groceries": {
        "title": "Groceries that write themselves",
        "body": "Every dish you plan adds its ingredients to one grouped shopping list. Check things off as you shop."
      },
      "photo": {
        "title": "Add a dish from a photo",
        "body": "Photograph a meal and MealLoop drafts the dish and its ingredients. You review and save in seconds."
      }
    }
  },
  "loop": {
    "heading": "A week that comes back around.",
    "body": "Most weeks you cook the same handful of meals. MealLoop remembers them, so planning the next week takes minutes instead of a fresh start. Duplicate a week you liked and adjust from there.",
    "nodes": {
      "cook": "Cook",
      "plan": "Plan",
      "shop": "Shop",
      "repeat": "Repeat"
    }
  },
  "screenshots": {
    "heading": "See it in your hand.",
    "lead": "The same quiet design across every screen, from the library to the list you carry to the shop.",
    "captions": {
      "library": "Your dishes, with ingredients attached.",
      "planner": "A calm, seven-day plan.",
      "groceries": "One grouped list, ready to shop."
    }
  },
  "cta": {
    "heading": "Cook the week with a little less friction.",
    "body": "Build your library once, then let the plan and the grocery list follow from it.",
    "availability": "On iPhone, iOS 17 and later."
  },
  "footer": {
    "tagline": "Plan a week of meals from the dishes you already cook.",
    "privacy": "Privacy",
    "terms": "Terms",
    "contact": "Contact",
    "copyright": "© 2026 MealLoop. All rights reserved."
  },
  "appStore": {
    "label": "Download MealLoop on the App Store",
    "badgePrefix": "Download on the",
    "badgeName": "App Store"
  },
  "notFound": {
    "title": "Page not found",
    "body": "The page you’re looking for doesn’t exist or has moved.",
    "backHome": "Back home"
  }
}
```

### Two new namespaces beyond the AR-15 list — and why
AR-15's canonical namespace set is `nav, hero, howItWorks, features, loop, screenshots, cta, footer, consent, legal`. This story adds **`appStore`** (the shared `app-store-button` widget renders inside both `hero` and `cta`, so its copy can't sit cleanly under one section) and **`notFound`** (the localized 404, which Story 1.1 explicitly punted to 1.3). These are real, locale-mirrored namespaces (Story 1.4 will translate them in `uk.json`) — they are **not** uk-only keys and do not violate the AR-15 "identical key trees / no invented uk-only keys" rule. `consent`/`legal` are intentionally **not** created here (Epics 6/5). [Source: docs/planning-artifacts/architecture.md#Naming Patterns (i18n Catalog Keys); epics.md#AR-15]

### Keyed-array pattern (keep structure in code, copy in catalog)
For sections that map over a local array, keep the **non-copy** structure (icons, step numbers, screen JSX, geometry order) in the component and pull only the text from the catalog by a stable `key`:
```tsx
// features.tsx (client)
const FEATURES = [
  { icon: BookOpen, key: "library" },
  { icon: CalendarDays, key: "plan" },
  { icon: ShoppingBasket, key: "groceries" },
  { icon: Camera, key: "photo" },
] as const;
const t = useTranslations("features");
// ...
<h3>{t(`items.${f.key}.title`)}</h3>
<p>{t(`items.${f.key}.body`)}</p>
```
Same shape for `howItWorks.steps.*`, `loop.nodes.*`, `screenshots.captions.*`. This keeps `key`s as `StaggerItem` React keys too. Avoid `t.raw()` here — keyed `t()` calls are type-checkable and idiomatic.

### Brownfield reality — exact current state of files you will touch
- `messages/en.json` — **`{}`** (empty). `messages/uk.json` — **`{}`** (leave it; Story 1.4).
- `src/i18n/request.ts` — already loads `messages/${locale}.json` and deep-merges `en` underneath for per-key fallback (FR-4). **Do not edit.**
- `src/app/[locale]/layout.tsx` — calls `setRequestLocale`, sets `<html lang>`, renders `<NextIntlClientProvider>` (no messages prop — correct). Its `export const metadata` is hard-coded **and stays that way** (Epic 3 moves it to `generateMetadata`). **Do not edit in 1.3.**
- `src/app/[locale]/page.tsx` — calls `setRequestLocale(locale)`, assembles the sections. No edit needed (async section children are fine).
- `src/components/sections/nav.tsx` — **Server Component** (no directive). Uses `NAV_LINKS` (labels) + literal "Get MealLoop" + `aria-label="MealLoop home"`. The nav uses `Link` from `@/i18n/navigation` only for the logo→home link; the section anchors (`#how-it-works`, …) are plain `<a>` and **stay plain `<a>`** (in-page hash links, not route navigation — switching them to locale-aware `Link` is out of scope).
- `src/components/sections/footer.tsx` — **Server Component**. Uses `SITE.tagline`, literal Privacy/Terms/Contact/copyright, `mailto:${SITE.email}`, `aria-label="MealLoop home"`. Legal `href="#"` are dead anchors today — **leave them** (Epic 5 resolves them).
- `src/components/sections/{hero,how-it-works,features,loop,screenshots,cta}.tsx` — all **`"use client"`** (Motion). `hero` uses `SITE.description`.
- `src/components/app-store-button.tsx` — no directive, but only ever rendered inside client sections; `useTranslations` is correct here.
- `src/components/{logo,device-mockup,screens}.tsx` — **not in scope.** `logo.tsx` hard-codes the "MealLoop" wordmark — that is the **brand name**, leave it. `screens.tsx` mockup text ("Your Dishes", dish names, grocery items, emojis) is **decorative sample data**, not marketing copy; it becomes `aria-hidden` in Story 3.1 and is slated for real screenshots post-v2 — **leave it hard-coded.**
- `src/lib/site.ts` — restructure `NAV_LINKS` (drop `label`, add `key`); remove `SITE.tagline`/`SITE.description`; keep everything else. [Source: file reads at baseline 4950838]

### Static-prerender discipline (AR-4 — do not break it)
`getTranslations`/`useTranslations`/`setRequestLocale` read the request locale and messages; none of them read `cookies()`/`headers()`. The current grep for `next/headers`/`cookies()`/`headers()` across `src/app` + `src/components` returns nothing — keep it that way. After your change, `next build` must still show `/[locale]` static (`●` with `/en`,`/uk` prerendered), not `ƒ`. A page flipping to `ƒ` means a stray request-time read leaked in. [Source: docs/planning-artifacts/architecture.md#Static-prerender discipline; 1-2 story Completion Notes]

### Voice / verbatim rule (NFR-8 / UX-DR-18)
The English source already complies with the voice rules (no exclamation marks, no emojis, complete sentences, calm). This story **must not** edit tone or wording — it relocates strings. Preserve the typographic apostrophe `’` (U+2019) in the 404 body and the em-dash `—` (U+2014) in `features.items.plan.body`. If you find yourself "improving" a sentence, stop — that is out of scope.

### Scope boundaries — do NOT do these in 1.3 (they belong to later stories)
- **Ukrainian catalog / Cyrillic font subset** → Story 1.4. (`uk.json` stays `{}`.)
- **Per-locale metadata / `generateMetadata` / title+description in the catalog** → Epic 3 (Story 3.2). The hard-coded `metadata` in `layout.tsx` stays.
- **Locale switcher UI** → Story 1.5. **`locale_switch` analytics** → Epic 6.3. **Consent banner / `consent` namespace** → Epic 6.4. **Legal pages / `legal` namespace / resolving footer `#` links** → Epic 5.
- **Replacing the App Store button with Apple badge artwork + Coming-soon state** → Story 6.2. (1.3 only externalizes the existing button text.)
- **Converting client sections to RSC** → not in scope; preserve the Motion client boundary.
- **Externalizing `screens.tsx` mockup text or the "MealLoop" wordmark** → out of scope (decorative / brand).

### Project Structure Notes
- Change set: rewrite `messages/en.json`; edit `nav`, `hero`, `how-it-works`, `features`, `loop`, `screenshots`, `cta`, `footer`, `app-store-button`, `not-found`; restructure `site.ts`. **No new files, no new dependencies, no routing/proxy changes.**
- If you find yourself creating a component, a route, a hook, or editing `proxy.ts`/`routing.ts`/`request.ts`/`navigation.ts`, you have drifted out of scope.

### References
- [Source: docs/planning-artifacts/epics.md#Story 1.3: Externalize all copy to the English catalog] — the four BDD ACs (FR-4, NFR-5, AR-15).
- [Source: docs/planning-artifacts/epics.md#FR-4] — externalized, translated content; per-string `en` fallback.
- [Source: docs/planning-artifacts/epics.md#AR-15] — catalog key discipline: identical camelCase key trees namespaced by section; never invent uk-only keys.
- [Source: docs/planning-artifacts/epics.md#NFR-5] — maintainability / single-sourcing: all copy in catalogs; constants in `site.ts`.
- [Source: docs/planning-artifacts/epics.md#UX-DR-18 / NFR-8] — microcopy voice rules (no exclamation marks, no emojis, complete sentences).
- [Source: docs/planning-artifacts/architecture.md#Frontend Architecture; #Process Patterns ("Translation access", RSC boundary); #Naming Patterns (i18n Catalog Keys); #Static-prerender discipline (AR-4)] — getTranslations vs useTranslations, section-namespaced camelCase keys, no cookie/header reads in pages.
- [Source: docs/implementation-artifacts/1-1-i18n-scaffolding-localized-route-shell.md] — seeded empty `messages/en.json`, wired `request.ts` `en`-fallback + `NextIntlClientProvider`; deferred the 404 copy and full `en` catalog to 1.3.
- [Source: docs/implementation-artifacts/1-2-first-visit-detection-persisted-preference.md] — locale negotiation/cookie work (no overlap; 1.3 adds no proxy/routing change).
- [Source: docs/project-context.md] — Next 16 conventions, read bundled docs first, no test runner (gate = tsc + ESLint via build), 320/360/390/768 manual QA.
- [Source: node_modules/next-intl/dist/esm/production/react-server/NextIntlClientProviderServer.js] — provider auto-inherits `messages` via `getMessages()` when no prop is passed (de-risks client-island translation).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, bmad-dev-story workflow)

### Debug Log References

- `npm run build` — green (tsc + ESLint), route table shows `● /[locale]` with `/en` and `/uk` prerendered (not `ƒ`).
- Edit-a-key smoke test (AC-4): temporarily set `cta.heading` to `SMOKE_TEST_CTA_HEADING`, rebuilt → sentinel appeared in `.next/server/app/en.html` and the original heading was gone with no component edit; reverted and rebuilt clean.
- `grep -E` of in-scope components for leftover literal English → only false positives (component/icon/function/key names: `PlannerScreen`, `ShoppingBasket`, `Features()`, `planner`).
- `grep "next/headers|cookies()|headers()"` across `src/app` + `src/components` → none (static-prerender discipline intact, AR-4).

### Completion Notes List

- Confirmed next-intl **4.13.0** on Next **16.2.9**: `getTranslations(namespace?)` returns a Promise translator, `useTranslations(namespace?)` a sync translator. Provider in `layout.tsx` auto-inherits the merged catalog (no `messages` prop added); `request.ts` `en`-fallback deep-merge left untouched.
- `messages/en.json` authored from `{}` with the full section-namespaced, camelCase catalog (10 namespaces: `nav, hero, howItWorks, features, loop, screenshots, cta, footer, appStore, notFound`). Verbatim copy; preserved `’` (U+2019) in `notFound.body` and `—` (U+2014) in `features.items.plan.body`. JSON validated.
- `site.ts`: removed `SITE.tagline`/`SITE.description`; restructured `NAV_LINKS` to `{ key, href }` (dropped `label`); kept `SITE.name`/`email`, `SITE_ORIGIN`, `APP_STORE_URL`, `APP_STORE_LIVE`, `LOCALES`, `DEFAULT_LOCALE`.
- Server Components `nav.tsx`/`footer.tsx` became `async` and read via `getTranslations`; footer reuses `nav.home` for the logo `aria-label`. No `"use client"` added; hash anchors stayed plain `<a>`; legal `#` hrefs and `mailto:` left as-is.
- Client sections (`hero`, `how-it-works`, `features`, `loop`, `screenshots`, `cta`) read via `useTranslations`; keyed arrays kept structure (icons, step numbers, geometry order, screen JSX) in code, copy in catalog. `app-store-button.tsx` reads `appStore.*`. `not-found.tsx` reads `notFound.*`, kept literal `"404"`, removed the deferral comment.
- Visual parity confirmed against prerendered `/en` HTML; `uk.json` untouched (`{}`); no changes to `proxy.ts`/`routing.ts`/`request.ts`/`navigation.ts`/`layout.tsx`/`screens.tsx`.
- Note: `.claude/settings.local.json` shows as modified but is a pre-existing local change, not part of this story.

### File List

- messages/en.json (rewritten: `{}` → full English catalog)
- src/lib/site.ts (removed `SITE.tagline`/`description`; `NAV_LINKS` → `{ key, href }`)
- src/components/sections/nav.tsx (async Server Component; `getTranslations("nav")`)
- src/components/sections/footer.tsx (async Server Component; `getTranslations("footer"|"nav")`)
- src/components/sections/hero.tsx (`useTranslations("hero")`)
- src/components/sections/how-it-works.tsx (`useTranslations("howItWorks")`; keyed `STEPS`)
- src/components/sections/features.tsx (`useTranslations("features")`; keyed `FEATURES`)
- src/components/sections/loop.tsx (`useTranslations("loop")`; keyed `NODES`)
- src/components/sections/screenshots.tsx (`useTranslations("screenshots")`; keyed `SHOTS`)
- src/components/sections/cta.tsx (`useTranslations("cta")`)
- src/components/app-store-button.tsx (`useTranslations("appStore")`)
- src/app/[locale]/not-found.tsx (async; `getTranslations("notFound")`; removed deferral comment)
- docs/implementation-artifacts/sprint-status.yaml (story status → in-progress → review)

## Change Log

- 2026-06-19 — Story 1.3 implemented: externalized all landing + 404 copy into `messages/en.json` (section-namespaced, camelCase), wired Server Components via `getTranslations` and client islands via `useTranslations`, migrated `site.ts` copy constants. Quality gate green (tsc + ESLint); `/en`/`/uk` stay statically prerendered; visual parity verified. Status → review.
