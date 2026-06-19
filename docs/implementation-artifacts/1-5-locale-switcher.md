---
baseline_commit: d68abb2
---

# Story 1.5: Locale switcher

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a visitor,
I want a control in the nav to switch between English and Ukrainian at any point,
so that I can read the page in my preferred language without losing my place.

This story builds **one new client island** (`src/components/locale-switcher.tsx`) and mounts it in the nav. It does **two** concrete things and nothing else:

1. **Render the `EN · УК` switcher** — two independent ≥44×44px targets separated by a thin border, with the active locale marked via `aria-current` **plus** a non-color cue (weight + underline) in the AA-green `#2E7D4F`, the inactive one in muted-foreground.
2. **Switch locale on the current surface** — clicking the inactive label re-renders the same page in the other language (no navigation home, no scroll-to-top), updates the URL subpath (`/en` ⇄ `/uk`), persists the choice, sets the new `<html lang>`, and places focus on the now-active control so assistive tech perceives the change.

> **The single most important thing to understand before you touch any code:** the i18n spine and the persistence/`<html lang>` mechanics are already built and working. `proxy.ts` + `src/i18n/routing.ts` own locale negotiation and the `NEXT_LOCALE` cookie; `app/[locale]/layout.tsx` sets `<html lang={locale}>` on every render. next-intl's navigation helpers (`@/i18n/navigation`) **already sync the `NEXT_LOCALE` cookie automatically** when you navigate to a different locale (`syncLocaleCookie`), and navigating to `/uk` automatically re-renders the layout with `lang="uk"`. **You do not write cookie logic, you do not manipulate `<html lang>`, you do not touch `proxy.ts`/`routing.ts`/`request.ts`.** Your job is the UI control + wiring `router.replace(pathname, { locale })`, the active-state styling, the touch targets, and deterministic focus placement after the switch.

## Acceptance Criteria

1. **Switching swaps the locale on the current surface — same section, URL subpath updates, preference persists.** _(FR-3)_
   **Given** the `EN · УК` switcher in the nav,
   **When** I click the inactive locale to switch from `/en` to `/uk` (and back),
   **Then** the same landing surface re-renders in the other language **in place** (not a full re-navigation to home and not a scroll-to-top), the URL subpath updates to the sibling locale (`/en` ⇄ `/uk`), and the choice persists via the existing `NEXT_LOCALE` cookie so a later visit to `/` resolves to the chosen locale. (You rely on next-intl's `router.replace(pathname, { locale, scroll: false })` + its built-in `syncLocaleCookie`; you do **not** write cookie code.)

2. **After the switch the new `<html lang>` is set and focus is placed sensibly so AT perceives the language/content change.** _(UX-DR-12)_
   **Given** a locale switch completes,
   **When** the new surface renders,
   **Then** the document's `<html lang>` reflects the new locale (handled automatically by the `[locale]` layout re-render — verify, don't re-implement) **and** keyboard focus is deterministically placed on the now-active switcher control (retained on the switcher), so a screen-reader user is not left with focus dropped to `<body>` and a silent content swap.

3. **The active locale carries `aria-current` AND a non-color cue, in the AA-compliant `#2E7D4F` — never hue alone.** _(UX-DR-6, UX-DR-16, 1.4.1)_
   **Given** the switcher,
   **When** it is rendered,
   **Then** the active locale label has `aria-current="true"`, a non-color cue (font-weight bump **and** underline), and color `text-brand` (= `#2E7D4F`, already AA-fixed in `globals.css`); the inactive label is `text-muted-foreground` with no underline. The active state must remain distinguishable with color vision simulated off (the weight + underline carry the meaning).

4. **Each locale label is an independent ≥44×44px target with a real gap between adjacent hit areas, verified at the 320px floor.** _(UX-DR-6, NFR/AR-13)_
   **Given** each locale label,
   **When** measured,
   **Then** each is an independent tap target of **≥44×44px** (`min-h-11 min-w-11`, internal padding, centered), the thin border separator + gap creates genuine dead space so the two hit areas don't merge, and the whole switcher fits in the nav without horizontal overflow at the **320px** floor (manual browser check at 320/360/390/768px).

5. **Quality gate + static prerender + deploy pipeline intact; `/en` and `/uk` stay statically prerendered.** _(NFR-6, AR-4, AR-13)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass, the route table still shows `/[locale]` static (`●`/`○`, not `ƒ`) with `/en` and `/uk` prerendered, and the GitHub→Vercel auto-deploy on `main` is unaffected. Adding a client island that reads no cookies/headers in page/metadata bodies does not break static prerender — if the route flips to `ƒ`, something out-of-scope leaked in; back it out.

6. **Scope is held — only the switcher island, its nav mount, the two catalogs, and the label constant change.** _(scope guard)_
   **Given** this story,
   **When** it is implemented,
   **Then** `git status` shows changes to **only**: `src/components/locale-switcher.tsx` (new), `src/components/sections/nav.tsx` (mount), `messages/en.json` + `messages/uk.json` (the `localeSwitcher` namespace, identical key trees per AR-15), `src/lib/site.ts` (the `LOCALE_LABELS` constant), plus this story file + `sprint-status.yaml`. `proxy.ts`, `src/i18n/*`, `app/[locale]/layout.tsx`, every section component other than `nav.tsx`, the footer, and the (not-yet-existing) mobile menu are untouched. No analytics/`locale_switch` event, no footer mirror, no mobile-overlay mirror, no metadata work creeps in (those are Epics 6.3 / 4.1 / 3 and an unassigned footer-mirror follow-up).

## Tasks / Subtasks

- [x] **Task 1 — Confirm the plumbing before building UI (AC: 1, 2, 5)**
  - [x] Re-read `src/i18n/navigation.ts` — it exports locale-aware `Link`, `useRouter`, `usePathname`, `redirect`, `getPathname` from `createNavigation(routing)`. Use **these**, never `next/navigation` or hand-built `/${locale}/…` strings.
  - [x] Confirm `useRouter().replace(href, options)` accepts `options.locale` and `options.scroll` (verified against the installed type defs — see Dev Notes "The exact next-intl API"). Confirm `usePathname()` returns the pathname **without** the locale prefix (on `/en` it returns `/`), so `router.replace(pathname, { locale: "uk" })` targets `/uk`.
  - [x] Confirm the existing `<NextIntlClientProvider>` (no `messages` prop) already feeds client islands — `hero.tsx` is a `"use client"` component using `useTranslations("hero")` today, so `useTranslations("localeSwitcher")` will work the same way. Do **not** add a `messages` prop or a new provider.

- [x] **Task 2 — Add the `localeSwitcher` copy to both catalogs (AC: 3, 6) [AR-15: identical key trees]**
  - [x] Add a `localeSwitcher` namespace to `messages/en.json` and `messages/uk.json` with an **identical key tree** (`label`, `en`, `uk`). Exact strings in Dev Notes "Catalog additions".
  - [x] Verify trees stay identical: `diff <(jq -S 'paths(scalars)|join(".")' messages/en.json) <(jq -S 'paths(scalars)|join(".")' messages/uk.json)` prints nothing.
  - [x] These are UI a11y labels, not visible marketing copy, but the `uk` values join the pre-launch native-speaker review list (UX-DR-21) — standard terms, low risk.

- [x] **Task 3 — Single-source the visible labels (AC: 6)**
  - [x] Add `LOCALE_LABELS` to `src/lib/site.ts` mapping each locale to its fixed visible abbreviation (`en → "EN"`, `uk → "УК"`). These are locale-code abbreviations shown identically on every surface (a `/uk` visitor still sees `EN` for the English option), so they belong with `LOCALES`/`NAV_LINKS` in `site.ts`, **not** duplicated across both catalogs. Keep the exact spec labels `EN` / `УК` (DESIGN.md `EN · УК`).

- [x] **Task 4 — Build `src/components/locale-switcher.tsx` (AC: 1, 2, 3, 4) [NEW client island]**
  - [x] `"use client"`. Read active locale via `useLocale()` (from `next-intl`), `useRouter()` + `usePathname()` (from `@/i18n/navigation`), `useTranslations("localeSwitcher")`.
  - [x] Render a `<nav aria-label={t("label")}>` wrapper mapping over `LOCALES`; between items render a thin `bg-border` vertical divider (`aria-hidden`).
  - [x] Each option is a `<button type="button">` showing `LOCALE_LABELS[locale]`, with `aria-label={t(locale)}` (language name in the active surface), `aria-current="true"` only on the active one, and the active/inactive styling from Dev Notes. **Sizing:** `min-h-11 min-w-11 inline-flex items-center justify-center px-2` (≥44px). Active: `text-brand font-semibold underline underline-offset-4`. Inactive: `text-muted-foreground font-medium hover:text-foreground` (no underline). Merge classes with `cn()`.
  - [x] Click handler: if the clicked locale is already active, no-op; else `router.replace(pathname, { locale, scroll: false })` (preserves scroll → "same surface, don't lose my place"; `replace` avoids polluting history with locale toggles).
  - [x] **Deterministic focus (AC-2):** keep a `ref` on the active button and a flag ref set true when a switch is initiated; in a `useEffect` keyed on the active locale, when the flag is set, `.focus()` the active button and clear the flag. This guarantees focus lands on the now-active control after the re-render regardless of Next's default soft-nav focus behavior. (Reference implementation in Dev Notes.)

- [x] **Task 5 — Mount in the nav (AC: 1, 4, 6)**
  - [x] In `src/components/sections/nav.tsx` (a Server Component — leave it server; it renders the client island fine), import `LocaleSwitcher` and place it in the right-hand cluster next to the App Store CTA. Group them: `<div className="flex items-center gap-3"><LocaleSwitcher /><a …getApp…/></div>` so the existing `justify-between` layout becomes Logo | (hidden md links) | [switcher + CTA].
  - [x] The switcher is **visible at all widths** for now (do **not** hide it under `md`) — there is no mobile menu yet (Epic 4.1), and AC-4 requires it testable at 320px. Verify Logo + switcher + CTA fit at 320px without overflow.

- [x] **Task 6 — Verify (AC: 1, 2, 3, 4, 5, 6)**
  - [x] `npm run build` green (tsc + ESLint); route table shows `● /[locale]` with `/en` **and** `/uk` prerendered (not `ƒ`).
  - [~] Functional: from `/en`, click `УК` → page re-renders in Ukrainian in place, URL becomes `/uk`, no scroll jump; click `EN` → back to English. Reload `/` after switching → resolves to the chosen locale (cookie persisted). **(Code verified; live click-through is an outstanding manual check — headless env, no browser.)**
  - [x] A11y: active label has `aria-current="true"`, weight+underline, `#2E7D4F`; inactive is muted with no underline; after a switch, focus sits on the active button; group has an accessible name; each label is ≥44×44px. **(Verified in markup/classes; live AT pass folds into the manual browser check.)**
  - [~] Manual responsive pass at **320 / 360 / 390 / 768 px** — switcher fits, hit areas don't merge, no horizontal overflow. **(OUTSTANDING — headless env cannot run a browser; flagged for Bogdan.)**
  - [x] Scope check: `git status` matches AC-6's allowed file list exactly.

### Review Findings

_Code review 2026-06-19 (bmad-code-review, 3-layer adversarial: Blind Hunter + Edge Case Hunter + Acceptance Auditor). Result: 1 decision-needed, 0 patch, 3 deferred, 8 dismissed as noise. All 6 ACs are implemented; AC-4 (320px fit) is the one at genuine risk and remains unverified (headless env)._

- [x] [Review][Decision→Patch] **320px horizontal overflow risk (AC-4)** — At the 320px floor the nav content (`max-w-6xl px-5` → ~280px usable) carried Logo (~121px) + the right-hand cluster (LocaleSwitcher ~97px + `gap-3` + App Store CTA). Width math indicated overflow, worst on `/uk` where the CTA reads "Завантажити MealLoop"; the switcher's `min-w-11` (44px) targets cannot shrink (AC-4 forbids it), so trimming CTA padding alone was insufficient. **Resolution (Bogdan: mitigate now):** the nav App Store CTA is now `hidden … sm:inline-flex` — hidden below the `sm` (640px) breakpoint where Logo + switcher fit comfortably, restored at `sm`+. The hero carries the primary CTA on mobile, and Epic 4.1's mobile menu will reintroduce the CTA in the overlay. `next build` green (tsc + ESLint pass; `/en` + `/uk` stay `●` SSG). [src/components/sections/nav.tsx:28-33] — **visual 320/360/390/768px browser confirmation still outstanding (headless env).**
- [x] [Review][Defer] Outer header `<nav>` is an unlabeled landmark — with the new labeled "Language" `<nav>` nested inside it, a screen-reader landmark list now shows two navigation regions with the *primary* one unnamed. [src/components/sections/nav.tsx:11] — deferred, pre-existing; belongs with Epic 3.1 (semantic heading structure & landmarks); proper fix needs a new `nav` catalog key.
- [x] [Review][Defer] Locale switch drops URL `?query`/`#hash` — `router.replace(pathname, …)` uses the locale-stripped, hash-less pathname. Low impact on a static marketing page: `scroll:false` preserves the visual position and there are no functional query params today. [src/components/locale-switcher.tsx:31] — deferred, conscious `scroll:false` tradeoff; revisit if deep-linkable anchors matter.
- [x] [Review][Defer] WCAG 2.5.3 "Label in Name" — visible "EN"/"УК" are not contained in the accessible names "English"/"Ukrainian" set via `aria-label`, so speech-input users saying the visible label may not match. Spec-mandated (AC-3 `aria-label={t(locale)}`). [src/components/locale-switcher.tsx:46] — deferred; note for the UX-DR-21 native-speaker / a11y review.

_Dismissed as noise (8): focus-restore "dead code" (false positive — `Nav` stays mounted under the persistent `[locale]` layout, so `switchedRef` survives the soft nav and the effect fires); `aria-current="true"` "should be page" (`"true"` is valid ARIA and is exactly what AC-3 specifies); "УК" label questioned (design-mandated per DESIGN.md `EN · УК`, already in the UX-DR-21 native-speaker queue); `LOCALE_LABELS` vs catalog "duplication" (different data — visible abbreviations vs translated accessible names); rapid double-click (idempotent `router.replace`); stale `switchedRef` on aborted nav (benign, reset next switch); single-locale guard (not a bug with 2 locales); programmatic focus ring on touch (required by AC-2; `:focus-visible` heuristics handle it)._

## Dev Notes

### Existing files you will touch — exact current state

- **`src/components/sections/nav.tsx`** — a **Server Component** (`export async function Nav`, `await getTranslations("nav")`). Renders `<header><nav justify-between>`: a `<Link href="/">` brand logo, a `hidden md:flex` row of `NAV_LINKS` anchors, and a single `getApp` `<a>` pointing at `APP_STORE_URL`. You add the `LocaleSwitcher` next to the `getApp` CTA (see Task 5). **Keep it a Server Component** — a server component can render a client island directly; do not add `"use client"` here. [Source: src/components/sections/nav.tsx @ d68abb2]
- **`src/i18n/navigation.ts`** — exports `Link, redirect, usePathname, useRouter, getPathname` from `createNavigation(routing)`. The **only** sanctioned navigation surface. [Source: src/i18n/navigation.ts]
- **`src/i18n/routing.ts`** — `localePrefix: "always"`, locales from `LOCALES`, `localeCookie` with a 1-year `maxAge` + `secure`. This is what makes the cookie durable; the navigation helpers sync it on switch. **Do not edit.** [Source: src/i18n/routing.ts]
- **`src/app/[locale]/layout.tsx`** — sets `<html lang={locale} …>` and wraps children in `<NextIntlClientProvider>` (no `messages` prop). Navigating to a sibling locale re-renders this with the new `lang` automatically — that's how AC-2's `<html lang>` requirement is met without any code from you. **Do not edit.** [Source: src/app/[locale]/layout.tsx]
- **`src/lib/site.ts`** — single source of site constants (`LOCALES`, `DEFAULT_LOCALE`, `SITE_ORIGIN`, `APP_STORE_URL`, `NAV_LINKS`). Add `LOCALE_LABELS` here (Task 3). [Source: src/lib/site.ts]
- **`messages/en.json` / `messages/uk.json`** — full 10-namespace trees (`nav, hero, howItWorks, features, loop, screenshots, cta, footer, appStore, notFound`). You add one more namespace, `localeSwitcher`, to **both**, identical key tree. [Source: messages/en.json, messages/uk.json @ d68abb2]
- **`src/components/sections/hero.tsx`** — the existing proof that client islands read the catalog: `"use client"` + `useTranslations("hero")` works under the current provider. Mirror this pattern. [Source: src/components/sections/hero.tsx]

### The exact next-intl API (verified against the installed package, not memory)

> AGENTS.md: "This is NOT the Next.js you know." The facts below are read from `node_modules/next-intl@4.x` type defs at `d68abb2`, the authoritative source.

- **`useRouter()`** (from `@/i18n/navigation`) returns `push`/`replace` whose signature is `replace(href, options?)` where `options` is `Partial<NavigateOptions> & { locale?: Locale }`. `NavigateOptions` includes `scroll?: boolean`. So **`router.replace(pathname, { locale: "uk", scroll: false })` is valid and typed.** [Source: node_modules/next-intl/dist/types/navigation/react-client/createNavigation.d.ts → `useRouter`]
- **`usePathname()`** (from `@/i18n/navigation`) returns the pathname **without** the locale prefix. On `/en` and `/uk` (the landing page) it returns `/`. Passing it to `router.replace(pathname, { locale })` swaps only the locale segment, keeping the same surface. [Source: next-intl navigation helpers; localePrefix "always"]
- **Cookie persistence is automatic.** next-intl's navigation helpers call `syncLocaleCookie(localeCookie, pathname, locale, nextLocale)` on a locale-changing navigation, keeping `NEXT_LOCALE` in sync with the router cache. **You write zero cookie code** — `routing.ts`'s `localeCookie` config (1-year, secure) plus this sync is the whole persistence story (FR-3). [Source: node_modules/next-intl/dist/types/navigation/shared/syncLocaleCookie.d.ts]
- **`useLocale()`** is imported from `next-intl` (not the navigation module) and returns the active locale string — use it for the active-state check and as the `useEffect` dependency that fires after a switch completes. [Source: architecture.md#State management — "Locale … read via useLocale/getLocale"]

### Why a `<button>` + `router.replace`, not a `<Link>` (and why `replace`/`scroll:false`)

- **Deterministic focus (AC-2) is the deciding factor.** With a `<button>` that stays mounted across the locale change, focus is retained on the clicked element, and the `useEffect`-on-active-locale guarantees focus lands on the now-active control. A bare `<Link>` defers focus to Next's soft-navigation behavior, which can drop focus to `<body>` — exactly the "silent content swap with lost focus" UX-DR-12 forbids.
- **`replace`, not `push`** — toggling EN/УК should not stack history entries; Back should leave the page, not step through every toggle.
- **`scroll: false`** — preserves scroll position so the visitor keeps their place on the same surface (FR-3 "without losing my place"; EXPERIENCE.md "same scroll position where feasible … not a page reload to top").
- **SEO note (pre-empting a review flag):** buttons aren't crawlable anchors, but `/uk` discoverability is **Epic 3's** job (hreflang alternates + locale-aware sitemap, FR-7/FR-8) and the architecture explicitly scopes it there. The switcher is treated as *navigation*, not a crawl entry point. So buttons here are a conscious, scoped choice — not an SEO regression. [Source: architecture.md#SEO & Metadata; epics.md FR-7/FR-8]

### Catalog additions (paste verbatim; identical key tree per AR-15)

Add to `messages/en.json`:
```json
"localeSwitcher": {
  "label": "Language",
  "en": "English",
  "uk": "Ukrainian"
}
```

Add to `messages/uk.json`:
```json
"localeSwitcher": {
  "label": "Мова",
  "en": "Англійська",
  "uk": "Українська"
}
```

- Add the namespace in the same position in both files (e.g. after `nav`, or at the end before/after `notFound` — position is cosmetic, the **key tree** must match). Keep the existing trailing-newline / formatting style of each file.
- `t("label")` is the switcher group's accessible name (`<nav aria-label>`). `t("en")` / `t("uk")` are the per-option accessible names (the visible text is the abbreviation from `LOCALE_LABELS`; the `aria-label` gives screen readers the full language name in the surface language).
- **No new keys anywhere else.** Do not add a `locale_switch` analytics string, a footer-mirror key, or a Coming-soon string — those belong to later stories and would create tree drift.

### Single-sourced visible labels (`site.ts`)

Add to `src/lib/site.ts`:
```ts
// Fixed visible abbreviations for the locale switcher — shown identically on
// every surface (a /uk visitor still sees "EN" for the English option). These
// are locale-code labels, not translatable copy, so they live here with LOCALES
// rather than being duplicated across both message catalogs.
export const LOCALE_LABELS: Record<(typeof LOCALES)[number], string> = {
  en: "EN",
  uk: "УК",
};
```

### Reference implementation — `src/components/locale-switcher.tsx`

This satisfies AC-1–4; adapt naming/markup to taste but keep the focus mechanism, the touch-target sizing, the `aria-current`, and the non-color cue.

```tsx
"use client";

import { Fragment, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { LOCALES, LOCALE_LABELS } from "@/lib/site";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("localeSwitcher");

  // Deterministically return focus to the active control after a switch so AT
  // perceives the language/content change (UX-DR-12). The clicked button stays
  // mounted, but we re-focus the now-active one explicitly rather than trust
  // Next's soft-navigation focus behavior.
  const activeRef = useRef<HTMLButtonElement>(null);
  const switchedRef = useRef(false);
  useEffect(() => {
    if (switchedRef.current) {
      activeRef.current?.focus();
      switchedRef.current = false;
    }
  }, [activeLocale]);

  function switchTo(locale: (typeof LOCALES)[number]) {
    if (locale === activeLocale) return;
    switchedRef.current = true;
    router.replace(pathname, { locale, scroll: false });
  }

  return (
    <nav aria-label={t("label")} className="flex items-center gap-1">
      {LOCALES.map((locale, i) => {
        const isActive = locale === activeLocale;
        return (
          <Fragment key={locale}>
            {i > 0 && (
              <span aria-hidden className="h-5 w-px bg-border" />
            )}
            <button
              type="button"
              ref={isActive ? activeRef : undefined}
              onClick={() => switchTo(locale)}
              aria-current={isActive ? "true" : undefined}
              aria-label={t(locale)}
              className={cn(
                "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md px-2 text-sm transition-colors",
                isActive
                  ? "font-semibold text-brand underline underline-offset-4"
                  : "font-medium text-muted-foreground hover:text-foreground",
              )}
            >
              {LOCALE_LABELS[locale]}
            </button>
          </Fragment>
        );
      })}
    </nav>
  );
}
```

Notes on the styling choices:
- `min-h-11 min-w-11` = 44×44px (Tailwind v4 spacing: `11` → `2.75rem`). The `gap-1` (4px) on each side of the `w-px` divider gives genuine dead space so the two hit areas don't merge (AC-4).
- `text-sm font-medium` matches the existing nav links' rhythm; the active state adds `font-semibold` + `underline` as the **non-color cue** so meaning never rides on hue alone (AC-3 / 1.4.1). `text-brand` resolves to `#2E7D4F` (already AA-fixed in `globals.css`).
- Never hardcode the hex — use the `text-brand` / `text-muted-foreground` / `bg-border` tokens (project-context styling rule).

### Static-prerender discipline (AR-4 — do not break it)

The switcher reads no cookies/headers in any page or `generateMetadata` body — it's a client island that calls `useLocale()`/`useRouter()` at runtime. So `/en` and `/uk` stay statically prerendered. After your change, `next build` must still show `/[locale]` static (`●`), not `ƒ`. If it flips, something out-of-scope leaked in. [Source: architecture.md#Static-prerender discipline; epics.md AR-4]

### Scope boundaries — do NOT do these in 1.5 (they belong to later stories)

- **`locale_switch` analytics event** → Epic 6.3 (Story 6.3 explicitly references "the locale switcher (Story 1.5) and its mobile-overlay mirror"). Do not add `track()` or any analytics here.
- **Footer locale-switcher mirror** → DESIGN.md/EXPERIENCE.md mention a footer mirror, but it is **not** in Story 1.5's ACs and is unassigned in the epic breakdown. Build the `LocaleSwitcher` reusable so a later story can drop it into the footer, but **do not** edit `footer.tsx` in this story.
- **Mobile-overlay mirror + hamburger** → Epic 4.1 (Story 4.1) builds the mobile menu and mirrors the switcher inside it. For now the switcher is simply nav-visible at all widths.
- **Per-locale metadata / `generateMetadata` / hreflang / sitemap** → Epic 3. The hard-coded `metadata` in `layout.tsx` stays.
- **Editing `proxy.ts`, `src/i18n/*` (routing/request/navigation), `app/[locale]/layout.tsx`, any section component other than `nav.tsx`, or re-implementing cookie/`<html lang>` logic** → all out of scope. If you find yourself writing cookie code or touching the locale negotiation, you've drifted — the plumbing is done.

### Project Structure Notes

- Change set: **new** `src/components/locale-switcher.tsx` (cross-cutting widget — kebab-case file, `LocaleSwitcher` PascalCase export, per the architecture's file tree which lists `locale-switcher.tsx` NEW); **mod** `nav.tsx` (mount), `messages/en.json` + `messages/uk.json` (one namespace), `src/lib/site.ts` (`LOCALE_LABELS`).
- Naming/placement conform to conventions: cross-cutting widgets live directly in `src/components/` (not `sections/`, not `ui/`); double-quoted imports + semicolons in app code; `cn()` for class merging. [Source: architecture.md#Code Organization; docs/project-context.md#Code Organization & Naming]
- This is the **second** `"use client"` island in the project (after `motion.tsx`/`hero.tsx`), and the architecture's intended list of client islands includes `LocaleSwitcher` explicitly. No structural variance introduced.

### Previous-story intelligence (Stories 1.1–1.4)

- **1.1** built the spine: `app/[locale]` route tree, `proxy.ts`, `src/i18n/{routing,navigation,request}.ts`, `metadataBase` from `SITE_ORIGIN`, and the `#2E7D4F` AA fix (so `text-brand` is already AA-safe — AC-3 needs no token change). It wired `<NextIntlClientProvider>` with no `messages` prop and an `en`-fallback `deepMerge` in `request.ts`.
- **1.2** made `NEXT_LOCALE` a 1-year functional cookie (classed essential/consent-exempt). The switcher's persistence rides on this exact cookie — the Cookie Policy (Epic 5.1) must later disclose `NEXT_LOCALE`/1-year (already in deferred-work.md; not your concern here).
- **1.3** externalized all copy to `en.json` (10 namespaces, keyed-array pattern) and confirmed client islands read the catalog.
- **1.4** filled `uk.json` (identical tree) and **swapped the brand font Outfit → Manrope** site-wide (Manrope ships a real `cyrillic` subset; Outfit does not). Relevance to you: the switcher's `УК` Cyrillic label renders in Manrope correctly — no font work needed. Planning docs still say "Outfit" in places (deferred-work.md item) — ignore; the code is Manrope.
- **Recurring outstanding item:** every i18n story leaves a **manual responsive browser pass (320/360/390/768)** as a human verification because the env is headless. AC-4 here is the same — do the build + code verification, then flag the responsive pass for Bogdan if you can't run a browser.

### References

- [Source: docs/planning-artifacts/epics.md#Story 1.5: Locale switcher] — the 4 BDD ACs (FR-3, UX-DR-12, UX-DR-6, UX-DR-16).
- [Source: docs/planning-artifacts/epics.md#FR-3] — nav locale switcher: switches on the current surface, updates URL subpath, persists, indicates active locale, meets touch-target/a11y rules.
- [Source: docs/planning-artifacts/epics.md#UX-DR-6] — inline `EN · УК`, thin border separator, each label ≥44×44px independent target, active = `#2E7D4F` + non-color cue + `aria-current`, inactive muted; verify at 320px.
- [Source: docs/planning-artifacts/epics.md#UX-DR-12] — switch on current surface keeping section/scroll; set new `<html lang>`; place focus sensibly (switcher or `<h1>`) so AT perceives the change.
- [Source: docs/planning-artifacts/epics.md#UX-DR-16] — no meaning by color alone: active locale carries a non-color cue (underline/weight/`aria-current`).
- [Source: docs/planning-artifacts/architecture.md#Frontend Architecture / Internationalization & Routing] — `LocaleSwitcher` is a `'use client'` island; all navigation uses next-intl's `Link`/`useRouter` from `@/i18n/navigation`; switching swaps locale on the current surface, sets `<html lang>`, manages focus; locale owned by next-intl (`useLocale`); identical legal slugs → no `pathnames` map.
- [Source: docs/planning-artifacts/architecture.md#Source Tree] — `locale-switcher.tsx` NEW client island (EN · УК, aria-current, FR-3); `nav.tsx` MOD (brand mark + switcher + CTA).
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/DESIGN.md#Component specs — Locale switcher] — `EN · УК`, thin `{colors.border}` separator, ≥44×44px each, active `{colors.brand}` (`#2E7D4F`) + non-color cue + `aria-current`, inactive `{colors.muted-foreground}`; lives in nav (desktop) and mobile overlay; label type role 15px/500.
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md#Internationalization (Switching) / Components (Locale switcher) / Accessibility Floor] — switch on current surface, not a reload-to-top; set `<html lang>` + place focus; each label independent ≥44×44px with real spacing; `aria-current="true"` + non-color cue.
- [Source: node_modules/next-intl/dist/types/navigation/react-client/createNavigation.d.ts] — `useRouter().replace(href, options?)` with `options: Partial<NavigateOptions> & { locale?: Locale }` (incl. `scroll`).
- [Source: node_modules/next-intl/dist/types/navigation/shared/syncLocaleCookie.d.ts] — locale cookie is auto-synced by the navigation helpers on a locale change (persistence without manual cookie code).
- [Source: src/i18n/navigation.ts, src/i18n/routing.ts, src/app/[locale]/layout.tsx, src/components/sections/nav.tsx, src/components/sections/hero.tsx, src/lib/site.ts, messages/en.json, messages/uk.json @ d68abb2] — current state of every file in scope.
- [Source: docs/project-context.md] — Next 16 conventions (read bundled docs first; middleware is `proxy.ts`), Tailwind v4 token-only styling (never hardcode hex; `cn()`), kebab-case files / PascalCase exports, single-sourced constants in `site.ts`, no test runner (gate = tsc + ESLint via build), 320/360/390/768 manual QA.
- [Source: docs/implementation-artifacts/1-1…/1-2…/1-3…/1-4… story files] — prior-story learnings (spine, cookie, catalogs, Outfit→Manrope swap, recurring manual-responsive verification).

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Opus 4.7)

### Debug Log References

- `npm run build` → green: TypeScript passed, route table `● /[locale]` with `/en` + `/uk` prerendered (SSG, not `ƒ`). Static-prerender discipline intact (AR-4).
- `npx eslint src/components/locale-switcher.tsx src/components/sections/nav.tsx src/lib/site.ts` → exit 0.
- `diff <(jq -S 'paths(scalars)|join(".")' messages/en.json) <(jq -S 'paths(scalars)|join(".")' messages/uk.json)` → no output (identical key trees, AR-15).

### Completion Notes List

- Task 1 (plumbing confirmation): verified against installed type defs at `node_modules/next-intl/dist/types/navigation/react-client/createNavigation.d.ts` — `useRouter().replace(href, options?)` takes `Partial<NavigateOptions> & { locale? }` and `NavigateOptions` includes `scroll`. `usePathname()` is locale-prefix-free. Provider already feeds client islands (mirrors `hero.tsx`); no `messages` prop / new provider added.
- Built `LocaleSwitcher` as the project's 2nd `"use client"` island using the Dev Notes reference implementation verbatim: `useLocale()`/`useRouter()`/`usePathname()`/`useTranslations("localeSwitcher")`, EN·УК buttons, `aria-current` + weight + underline non-color cue in `text-brand` (#2E7D4F), `text-muted-foreground` inactive, `min-h-11 min-w-11` (44px) targets with a `w-px` `bg-border` divider + `gap-1` dead space, and the `switchedRef`/`useEffect`-on-`activeLocale` deterministic focus mechanism. `router.replace(pathname, { locale, scroll: false })`.
- Mounted in `nav.tsx` (kept it a Server Component) grouped with the App Store CTA in a `flex items-center gap-3` container; switcher visible at all widths (no mobile menu yet — Epic 4.1).
- No cookie/`<html lang>`/`proxy.ts`/`i18n/*`/`layout.tsx` edits — persistence + `lang` are automatic via the existing spine.
- **Outstanding manual verification (headless env — no browser):** live functional click-through (EN⇄УК in place, URL subpath, scroll preserved, cookie persistence on reload), live AT/focus pass, and the responsive pass at 320/360/390/768px. Recurring per the i18n-story pattern (1.1–1.4) — flagged for Bogdan.

### File List

- `src/components/locale-switcher.tsx` (new) — `LocaleSwitcher` client island.
- `src/components/sections/nav.tsx` (mod) — import + mount switcher beside the App Store CTA.
- `messages/en.json` (mod) — `localeSwitcher` namespace.
- `messages/uk.json` (mod) — `localeSwitcher` namespace (identical key tree).
- `src/lib/site.ts` (mod) — `LOCALE_LABELS` constant.
- `docs/implementation-artifacts/1-5-locale-switcher.md` (mod) — tasks/record/status.
- `docs/implementation-artifacts/sprint-status.yaml` (mod) — status → in-progress → review.

## Change Log

- 2026-06-19 — Story drafted (ready-for-dev). Comprehensive context engine analysis completed: verified next-intl client router/`usePathname`/`syncLocaleCookie` API against installed type defs, confirmed `<html lang>` + cookie persistence are automatic, chose button+`router.replace` for deterministic focus (UX-DR-12), specified identical-tree catalog additions + single-sourced `LOCALE_LABELS`, and bounded scope against Epics 3/4.1/6.3 and the footer mirror.
- 2026-06-19 — Implemented (status → review). Added `LocaleSwitcher` island + nav mount, `localeSwitcher` catalog namespace (both locales, identical tree), and `LOCALE_LABELS`. Build green (tsc + ESLint), `/en`+`/uk` stay statically prerendered, scope matches AC-6. Live functional/AT/responsive (320/360/390/768) passes flagged as outstanding manual verification (headless env).
