---
baseline_commit: ab9e5bf
---

# Story 1.4: Ukrainian catalog & Cyrillic typography

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As Olena, a Ukrainian-speaking visitor,
I want the whole page in natural Ukrainian rendered in the brand font,
so that the site reads as first-class Ukrainian, not a machine afterthought.

This story does **two** concrete things and nothing else:

1. **Fill `messages/uk.json`** (currently `{}`) with a translation that has the **exact same key tree** as `messages/en.json` — every value in natural, voice-compliant Ukrainian. The full, ready-to-paste catalog is in Dev Notes "The complete `uk.json` to author".
2. **Add the `cyrillic` subset** to the one `Outfit()` `next/font` config so `/uk` renders in the brand font instead of a system fallback.

> **The single most important thing to understand before you touch any code:** the i18n plumbing is already complete and working. Story 1.1 wired `src/i18n/request.ts` with a recursive `deepMerge` that lays the `en` catalog underneath the active locale, so **per-key fallback (FR-4) already works** — a key missing from `uk.json` automatically renders the `en` value at string granularity, never an empty render or a raw key. Story 1.3 filled `messages/en.json` with the full 10-namespace tree. Your job is to (a) write the Ukrainian mirror of that tree and (b) flip the font subset. **Do not** edit `request.ts`, `routing.ts`, `proxy.ts`, `navigation.ts`, any component, or `messages/en.json`. No new files, no new dependencies, no routing/provider changes.

## Acceptance Criteria

1. **`uk.json` has an identical key tree to `en.json`, fully translated, with no uk-only keys.** _(AR-15)_
   **Given** `messages/uk.json`,
   **When** compared key-for-key against `messages/en.json`,
   **Then** every leaf key present in `en.json` exists in `uk.json` with a Ukrainian string value, the nesting/namespaces are identical (`nav, hero, howItWorks, features, loop, screenshots, cta, footer, appStore, notFound`), there are **no keys in `uk.json` that are absent from `en.json`**, and the JSON is valid and parses.

2. **No English leakage on `/uk`; any missing string falls back to `en` at string granularity (never empty, never a raw key).** _(FR-4)_
   **Given** `/uk`,
   **When** every section renders (`nav`, `hero`, `howItWorks`, `features`, `loop`, `screenshots`, `cta`, `footer`, the App Store badge, and the in-locale 404),
   **Then** all visible copy is Ukrainian with no stray English, **and** the per-key `en` fallback (already implemented in `request.ts`'s `deepMerge`) remains intact — verified by a temporary smoke test that deletes one `uk` key and confirms the `en` value renders in its place (then restores it). You do **not** implement fallback logic; you verify the existing logic still holds with the full `uk` tree present.

3. **The Outfit font loads the `cyrillic` subset so `/uk` renders Cyrillic in the brand font.** _(UX-DR-3)_
   **Given** the `Outfit()` config in `src/app/[locale]/layout.tsx`,
   **When** the font is configured,
   **Then** its `subsets` array includes **both** `"latin"` and `"cyrillic"` (e.g. `subsets: ["latin", "cyrillic"]`), so Ukrainian copy on `/uk` renders in Outfit — not a system font — and the Cyrillic glyphs are self-hosted and preloaded by `next/font` like the latin set. (DESIGN.md points at `src/app/layout.tsx`, but Story 1.1 moved the font config into `src/app/[locale]/layout.tsx` — that relocated file is the one and only place to change.)

4. **Ukrainian copy obeys the voice rules and voice-sensitive copy gets a native-speaker review pass before launch.** _(UX-DR-18, UX-DR-21, NFR-8)_
   **Given** the Ukrainian copy,
   **When** it is reviewed,
   **Then** it contains no exclamation marks, no emojis, only complete sentences, never blames the user, and stays calm and understated; **and** the voice-sensitive strings (`hero.*` — the only voice-sensitive copy that exists in the catalog at this point; Coming-soon and consent copy do not yet exist) are flagged for Bogdan's native-speaker review pass before launch. The `uk.json` is delivered as AI-translated / Bogdan-reviewed per the architecture's catalog annotation.

5. **Quality gate + deploy pipeline intact; `/en` unchanged; `/en` and `/uk` stay statically prerendered.** _(NFR-6, AR-4, AR-13)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass, the route table still shows `/[locale]` static (`●`/`○`, not `ƒ`) with `/en` and `/uk` prerendered, the `/en` render is byte-for-byte unchanged vs. baseline (you touched only `uk.json` + the font subset), and the GitHub→Vercel auto-deploy on `main` is unaffected.

6. **Scope is held — only `uk.json` and the font subset change.** _(scope guard)_
   **Given** this story,
   **When** it is implemented,
   **Then** `git status` shows changes to **only** `messages/uk.json` and `src/app/[locale]/layout.tsx` (plus this story file + `sprint-status.yaml`); `messages/en.json`, `request.ts`, `routing.ts`, `proxy.ts`, `navigation.ts`, every component, and `site.ts` are untouched; and no locale switcher, analytics, consent, legal-page, metadata, or brand-asset work creeps in (those are Stories 1.5 / Epics 2, 3, 5, 6).

## Tasks / Subtasks

- [x] **Task 1 — Confirm the plumbing before writing copy (AC: 1, 2)**
  - [x] Re-read `src/i18n/request.ts`: confirmed it imports `messages/${locale}.json` and `deepMerge`s the `en` catalog underneath (the FR-4 per-key fallback). Not edited — relied upon. A missing `uk` key → the `en` value renders automatically.
  - [x] Confirmed `messages/en.json` is the full 10-namespace tree (Story 1.3) and `messages/uk.json` was `{}`. Translation mirrors `en.json`'s tree exactly.
  - [x] Per `AGENTS.md` / Project Context, this is next-intl on Next **16.2.9** — trusted the installed package and bundled docs over memory.

- [x] **Task 2 — Author `messages/uk.json` with the full translated tree (AC: 1, 2, 4)**
  - [x] Replaced `{}` with the complete catalog from Dev Notes "The complete `uk.json` to author" — pasted verbatim.
  - [x] Verified key tree **identical** to `en.json`: `diff <(jq -S 'paths(scalars)|join(".")' messages/en.json) <(jq -S 'paths(scalars)|join(".")' messages/uk.json)` prints nothing.
  - [x] Preserved typographic punctuation: em-dashes `—` (U+2014, 4 occurrences incl. `features.items.plan.body`) and the typographic apostrophe `’` (U+2019) in `loop.body` (`запам’ятовує`); 0 straight apostrophes.
  - [x] JSON parses (verified via `node -e JSON.parse(...)` and the build).

- [x] **Task 3 — Cyrillic in the brand font (AC: 3) — RESOLVED VIA FONT SWAP (see Completion Notes)**
  - [x] ⚠️ Original plan (`Outfit({ subsets: ["latin", "cyrillic"] })`) is **impossible**: Outfit ships no Cyrillic subset (next/font type is `Array<'latin' | 'latin-ext'>`; `font-data.json` confirms). It fails type-check and would render Cyrillic in a system fallback anyway. Bogdan approved swapping the brand font site-wide.
  - [x] `src/app/[locale]/layout.tsx`: replaced `Outfit` with `Manrope({ variable: "--font-sans", subsets: ["latin", "cyrillic"] })` (variable font, no `weight`). `--font-sans`, `metadata`, `setRequestLocale`, `<html lang={locale}>` untouched.
  - [x] Verified in built `/uk`: `<html>` carries the Manrope variable class, 2 woff2 preloads in `<head>`, and generated `@font-face` includes a Cyrillic `unicode-range` (U+0400–045F etc.). Cyrillic renders in Manrope, not a system fallback.

- [x] **Task 4 — Verify (AC: 2, 3, 5, 6)**
  - [x] `npm run build` green (tsc + ESLint); route table shows `● /[locale]` with `/en` **and** `/uk` prerendered static (not `ƒ`).
  - [x] `/uk` scanned — no visible English leakage (all body copy Ukrainian). Only English on `/uk` is the hard-coded `<head>` metadata (title/description/OG), which the story explicitly keeps English (per-locale metadata = Story 3.2). ⚠️ `/en` is **not** byte-for-byte unchanged: the approved font swap changes `/en` typography too (Outfit→Manrope). AC-5's "/en byte-for-byte unchanged" is superseded by Bogdan's font-swap decision — see Completion Notes.
  - [x] Fallback smoke test (AC-2): removed `cta.heading` from `uk.json`, rebuilt → `/uk` rendered the **English** "Cook the week with a little less friction." while sibling `cta.body` stayed Ukrainian (per-key granularity). Key restored, clean rebuild green.
  - [x] Cyrillic-font check (AC-3): confirmed Ukrainian text uses the Manrope `--font-sans` family with a Cyrillic-subset preload `<link>` in `<head>`.
  - [ ] ⏳ Manual responsive pass at **320 / 360 / 390 / 768 px** on `/uk` (AR-13) — **requires a human browser check; not verifiable in this headless env.** Risk area: the loop diagram (`loop.tsx`) positions auto-width pills at a fixed 120px radius inside a `w-72` (288px) container; longer UA labels (`Повторювати` 11ch, `Планувати` 9ch) widen the left/right pills and may overflow at 320px. Logic is index-based (no functional break). Nav links are hidden under `md` (no mobile menu until 4.1); hero headline UA is shorter than EN. **Outstanding — Bogdan to confirm in browser.**
  - [x] Scope check: `git status` shows `messages/uk.json`, `src/app/[locale]/layout.tsx`, plus `src/components/screens.tsx` (a one-word stale comment from the font swap), this story file, and `sprint-status.yaml`. The `screens.tsx` comment is the only addition beyond the story's stated scope and is a direct consequence of the approved font swap.

### Review Findings

_Code review 2026-06-19 (bmad-code-review; 3 adversarial layers: Blind Hunter, Edge Case Hunter, Acceptance Auditor). 2 decision-needed, 0 patch, 2 deferred, 9 dismissed as noise. Verified clean: `tsc --noEmit` green; `uk.json` key tree identical to `en.json` (52 leaf keys, no missing/extra/empty); Manrope confirmed to ship a `cyrillic` subset in installed `next/font`; no whitespace/Unicode/ICU anomalies; no exclamation marks or emojis (AC-4 voice holds)._

**Decision needed (native-speaker call — Bogdan) — resolved 2026-06-19:**

- [x] [Review][Decision] `nav.home` phrasing "Головна MealLoop" — EN source is "MealLoop home" (the home-link accessible name, not visible body copy). **Resolved: kept as-is** — acceptable as a non-visible aria-label. Dismissed, no change.

**Patch:**

- [x] [Review][Patch] Align `appStore.label` to the infinitive — changed "Завантажте MealLoop в App Store" → "Завантажити MealLoop в App Store" so it matches `badgePrefix`'s Apple-standard "Завантажити в" mood. **Applied 2026-06-19** (JSON re-validated). [messages/uk.json → appStore.label]

**Deferred:**

- [x] [Review][Defer] Loop-node pills may overflow/overlap at 320px with longer Ukrainian labels ("Повторювати" 11ch, "Планувати" 9ch) [src/components/sections/loop.tsx] — deferred, pre-existing geometry; index-based so no functional break, cosmetic only. Requires the manual responsive browser pass already tracked as outstanding in Task 4.
- [x] [Review][Defer] Planning docs still name Outfit and assume Cyrillic support — DESIGN.md, architecture.md, project-context.md (line 60), epics.md, prd.md [docs/planning-artifacts/*, docs/project-context.md] — deferred, pre-existing; needs a docs reconciliation / correct-course pass to Manrope (flagged in Completion Notes; out of this story's code scope).

## Dev Notes

### The plumbing is done — you fill data and flip one flag (do not re-engineer)
Story 1.1 built the i18n spine and Story 1.3 filled the `en` catalog. Two facts that determine this story's scope:

- **Per-key `en` fallback already works.** `src/i18n/request.ts` does `messages: deepMerge(fallbackMessages, localeMessages)` where `fallbackMessages` is always `en.json` and `localeMessages` is the active locale. `deepMerge` recurses into namespaces, so a partial `uk` namespace fills in over `en` per leaf key — never replacing a whole namespace. **Consequence:** AC-2's fallback is satisfied by code that already exists; you must not re-implement or "improve" it. You only verify it still holds once `uk.json` is fully populated. [Source: src/i18n/request.ts; epics.md#FR-4]
- **The provider auto-inherits the merged catalog.** `app/[locale]/layout.tsx` renders `<NextIntlClientProvider>` with no `messages` prop; in an RSC the package resolves this to `getMessages()`, which returns the `deepMerge`d catalog. So both Server Components (`getTranslations`) and client islands (`useTranslations`) get the Ukrainian strings with zero component or provider change. [Source: 1-3 story Dev Notes "The provider already feeds the catalog"; node_modules/next-intl/.../NextIntlClientProviderServer.js]

### The font config moved — change the relocated file, not the doc's path
DESIGN.md (UX-DR-3) says Outfit is loaded in `src/app/layout.tsx` with `subsets: ["latin"]`. That was the v1 path. **Story 1.1's route restructure moved the root layout to `src/app/[locale]/layout.tsx`** — that is where `Outfit({ variable: "--font-sans", subsets: ["latin"] })` lives today (confirmed at baseline). Change it there:

```ts
// src/app/[locale]/layout.tsx
const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin", "cyrillic"],
});
```

That single array edit is the whole font task. Outfit is a variable font, so no `weight` is needed. `next/font/google` downloads and self-hosts the cyrillic glyphs at build time (no runtime request to Google) and injects a preload `<link>` for the subset when `preload` is true (the default). Without `cyrillic`, `/uk` falls back to a system font on the exact surface Olena (UJ-1) lands on — the brand-fidelity failure this story exists to prevent. [Source: docs/planning-artifacts/ux-designs/.../DESIGN.md#Typography (Cyrillic requirement); architecture.md#Typography/perf; node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md#subsets]

### The complete `uk.json` to author
Paste this verbatim into `messages/uk.json` (replacing `{}`). The key tree is identical to `en.json`; values are natural, voice-compliant Ukrainian. Identical English strings that appear in two namespaces (e.g. `hero.headline` == `footer.tagline`; `hero.availability` == `cta.availability`) are translated consistently but kept as **separate per-section keys** per AR-15 — do not collapse or cross-reference them.

```json
{
  "nav": {
    "home": "Головна MealLoop",
    "links": {
      "howItWorks": "Як це працює",
      "features": "Можливості",
      "loop": "Цикл"
    },
    "getApp": "Завантажити MealLoop"
  },
  "hero": {
    "badge": "Для невеликих родин",
    "headline": "Сплануйте тиждень страв із тих, що вже готуєте.",
    "description": "Спокійний планувальник харчування на тиждень для невеликих родин. Зберіть бібліотеку страв, які ви справді готуєте, сплануйте тиждень — і список покупок складеться сам.",
    "seeHowItWorks": "Подивіться, як це працює",
    "availability": "Для iPhone, iOS 17 і новіших версій."
  },
  "howItWorks": {
    "heading": "Три кроки — далі майже все працює саме.",
    "steps": {
      "library": {
        "title": "Зберіть свою бібліотеку",
        "body": "Додавайте страви, які вже готуєте, разом з інгредієнтами. Бібліотека трохи зростає щотижня."
      },
      "plan": {
        "title": "Сплануйте тиждень",
        "body": "Розподіліть страви по днях. Повторіть минулий тиждень або скопіюйте той, що вдався."
      },
      "shop": {
        "title": "Купуйте за списком",
        "body": "Продукти згруповані за категоріями й готові до покупок. Відмічайте їх, поки купуєте."
      }
    }
  },
  "features": {
    "heading": "Усе, що потрібно для тижневих покупок, і нічого зайвого.",
    "lead": "MealLoop побудовано навколо одного спокійного циклу: страви, які ви готуєте, тиждень, який плануєте, і список, за яким купуєте.",
    "items": {
      "library": {
        "title": "Ваша бібліотека страв",
        "body": "Тримайте всі страви, які готуєте, в одному місці разом з інгредієнтами. Більше не доведеться щотижня починати з чистого аркуша."
      },
      "plan": {
        "title": "Простий план на тиждень",
        "body": "Розставляйте страви у сітці на сім днів. Сніданок, обід, вечеря — плануйте стільки, скільки забажаєте."
      },
      "groceries": {
        "title": "Список покупок, що складається сам",
        "body": "Кожна запланована страва додає свої інгредієнти до єдиного згрупованого списку покупок. Відмічайте куплене просто під час покупок."
      },
      "photo": {
        "title": "Додайте страву з фото",
        "body": "Сфотографуйте страву, і MealLoop підготує її опис та інгредієнти. Ви переглянете й збережете за лічені секунди."
      }
    }
  },
  "loop": {
    "heading": "Тиждень, що повертається по колу.",
    "body": "Здебільшого щотижня ви готуєте ті самі кілька страв. MealLoop запам’ятовує їх, тож планування наступного тижня триває хвилини, а не починається з нуля. Скопіюйте тиждень, який вам сподобався, і змініть його за потреби.",
    "nodes": {
      "cook": "Готувати",
      "plan": "Планувати",
      "shop": "Купувати",
      "repeat": "Повторювати"
    }
  },
  "screenshots": {
    "heading": "Подивіться, як це у вашій руці.",
    "lead": "Той самий спокійний дизайн на кожному екрані — від бібліотеки до списку, який ви берете до магазину.",
    "captions": {
      "library": "Ваші страви разом з інгредієнтами.",
      "planner": "Спокійний план на сім днів.",
      "groceries": "Єдиний згрупований список, готовий до покупок."
    }
  },
  "cta": {
    "heading": "Готуйте тиждень трохи легше.",
    "body": "Зберіть бібліотеку один раз, а далі план і список покупок складатимуться самі.",
    "availability": "Для iPhone, iOS 17 і новіших версій."
  },
  "footer": {
    "tagline": "Сплануйте тиждень страв із тих, що вже готуєте.",
    "privacy": "Конфіденційність",
    "terms": "Умови",
    "contact": "Контакти",
    "copyright": "© 2026 MealLoop. Усі права захищено."
  },
  "appStore": {
    "label": "Завантажте MealLoop в App Store",
    "badgePrefix": "Завантажити в",
    "badgeName": "App Store"
  },
  "notFound": {
    "title": "Сторінку не знайдено",
    "body": "Сторінка, яку ви шукаєте, не існує або була переміщена.",
    "backHome": "На головну"
  }
}
```

### Translation & voice notes (why these choices)
- **Voice (UX-DR-18 / NFR-8):** no exclamation marks, no emojis, complete sentences, calm, never blames the user. Imperatives stay gentle (`Сплануйте`, `Зберіть`, `Подивіться`). This was authored to "sell less", matching the English source's restraint.
- **`appStore.badgeName` stays `"App Store"`** — Apple does not translate the "App Store" wordmark; `badgePrefix` "Download on the" → `"Завантажити в"`, which matches Apple's official Ukrainian badge phrasing "Завантажити в App Store". (This whole button is replaced by Apple-supplied badge artwork in Story 6.2; here you only translate the existing text.)
- **`MealLoop` is the brand name** — never transliterate it; it stays Latin in every Ukrainian string (`Головна MealLoop`, `Завантажити MealLoop`, the loop/feature bodies).
- **Loop node labels are Ukrainian infinitives** (`Готувати / Планувати / Купувати / Повторювати`) — noticeably longer than `Cook/Plan/Shop/Repeat`. The loop geometry is index-based (Story 1.3 confirmed `node` is only a React key + catalog lookup, never string-compared), so longer labels won't break logic — but **do a visual check at 320px** that they don't overflow the loop diagram (Task 4).
- **Coming-soon Ukrainian copy is NOT in this story.** EXPERIENCE.md's UJ-1 references *"Незабаром у App Store"*, but that caption string does not exist in `en.json` yet — it is added with the Coming-soon CTA in Story 6.2 and will be translated then. Do not invent it here (that would be a uk-only key, violating AR-15).

### Native-speaker review (UX-DR-21) — launch gate, not a 1.4 blocker
The architecture annotates `uk.json` as "AI-translated, Bogdan-reviewed". This catalog is the AI-translated draft. UX-DR-21 / PRD Open Q5 require a native-speaker pass on voice-sensitive copy (hero, Coming-soon, consent) **before launch**. Of those, only `hero.*` exists now. Flag `hero.headline` / `hero.description` for Bogdan's review; the story is implementation-complete once the catalog ships and the font subset is added — the review pass is a pre-launch checkpoint, not a gate on marking this story done.

### Brownfield reality — exact current state of files you will touch
- `messages/uk.json` — **`{}`** (seeded empty in Story 1.1, untouched by 1.2/1.3). You fill it.
- `messages/en.json` — **full 10-namespace tree** (Story 1.3). **Read-only reference** — do not edit.
- `src/app/[locale]/layout.tsx` — holds `Outfit({ variable: "--font-sans", subsets: ["latin"] })`, the hard-coded `metadata` export, `generateStaticParams`, `setRequestLocale(locale)`, `<html lang={locale}>`, and `<NextIntlClientProvider>` (no `messages` prop). **Change only the `subsets` array.** The `metadata` export stays hard-coded (per-locale metadata is Epic 3 / Story 3.2) — do not touch it.
- `src/i18n/request.ts` — loads `messages/${locale}.json` + `deepMerge`s `en` underneath (per-key fallback). **Do not edit.**
- `src/i18n/routing.ts`, `src/proxy.ts`, `src/i18n/navigation.ts` — locale/routing/cookie wiring (Stories 1.1/1.2). **Do not edit.**
- All section components + `app-store-button.tsx` + `not-found.tsx` already read via `t(...)` (Story 1.3). They render Ukrainian automatically once `uk.json` is populated. **Do not edit any component.**
[Source: file reads at baseline ab9e5bf]

### Static-prerender discipline (AR-4 — do not break it)
Adding catalog data and a font subset reads no cookies/headers, so `/en`/`/uk` stay statically prerendered. After your change, `next build` must still show `/[locale]` static (`●` with `/en`,`/uk` prerendered), not `ƒ`. If it flips to `ƒ`, something out-of-scope leaked in — back it out. [Source: architecture.md#Static-prerender discipline; 1-3 story Dev Notes]

### Scope boundaries — do NOT do these in 1.4 (they belong to later stories)
- **Locale switcher UI** → Story 1.5. **`locale_switch` analytics** → Epic 6.3.
- **Per-locale metadata / `generateMetadata` / title+description in the catalog** → Epic 3 (Story 3.2). The hard-coded `metadata` in `layout.tsx` stays.
- **Consent banner / `consent` namespace**, **legal pages / `legal` namespace** → Epics 6.4 / 5.1. Do not pre-create these namespaces in `uk.json` (they aren't in `en.json` either).
- **Coming-soon caption translation** → Story 6.2 (the `en` string doesn't exist yet).
- **Editing `en.json`, `request.ts`, `proxy.ts`, `routing.ts`, `navigation.ts`, any component, `site.ts`, or `screens.tsx`** → all out of scope.
- If you find yourself creating a component, route, or hook, or editing anything beyond `uk.json` + the `subsets` array, you have drifted out of scope.

### Project Structure Notes
- Change set: fill `messages/uk.json`; add `"cyrillic"` to `subsets` in `src/app/[locale]/layout.tsx`. **No new files, no new dependencies, no routing/proxy/provider changes, no component edits.**
- Naming/structure already conform to architecture conventions (one file per locale, section-namespaced camelCase keys identical to `en`). No structural variance introduced.

### References
- [Source: docs/planning-artifacts/epics.md#Story 1.4: Ukrainian catalog & Cyrillic typography] — the four BDD ACs (AR-15, FR-4, UX-DR-3, UX-DR-18/21).
- [Source: docs/planning-artifacts/epics.md#FR-4] — externalized translated content; per-string `en` fallback; no English leakage.
- [Source: docs/planning-artifacts/epics.md#AR-15] — identical camelCase key trees per locale; never invent uk-only keys.
- [Source: docs/planning-artifacts/epics.md#UX-DR-3] — Cyrillic subset is load-bearing for `/uk` brand fidelity.
- [Source: docs/planning-artifacts/epics.md#UX-DR-18 / NFR-8] — microcopy voice (no exclamation marks, no emojis, complete sentences, never blame the user, calm).
- [Source: docs/planning-artifacts/epics.md#UX-DR-21] — native-speaker review of voice-sensitive `uk` copy before launch (PRD Open Q5).
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/DESIGN.md#Typography] — Cyrillic requirement; the `subsets: ["latin"]` → add `cyrillic`; Outfit single-family ramp.
- [Source: docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md#Flow 1 — Olena (UJ-1); #Voice and Tone] — Ukrainian as first-class; no-machine-translation principle; voice rule both languages.
- [Source: docs/planning-artifacts/architecture.md#Internationalization & Routing; #Typography/perf; #i18n Catalog Keys; #Static-prerender discipline] — `en` default+fallback, identical key trees, cyrillic subset, no cookie/header reads in pages; `uk.json` = "AI-translated, Bogdan-reviewed".
- [Source: src/i18n/request.ts] — `deepMerge(en, locale)` implements the FR-4 per-key fallback; do not edit.
- [Source: src/app/[locale]/layout.tsx] — the single `Outfit()` config (font subset lives here, not the DESIGN.md-cited `src/app/layout.tsx`).
- [Source: messages/en.json] — the authoritative key tree your `uk.json` must mirror exactly.
- [Source: docs/implementation-artifacts/1-3-externalize-all-copy-to-the-english-catalog.md] — produced the full `en` catalog + the keyed-array pattern; confirms `uk.json` left `{}` for this story; loop node geometry is index-based (longer Cyrillic labels safe logically).
- [Source: docs/implementation-artifacts/1-1-i18n-scaffolding-localized-route-shell.md] — seeded empty catalogs; wired `request.ts` `en`-fallback + provider; moved the layout under `app/[locale]`.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/02-components/font.md#subsets] — `subsets` array; each subset self-hosted + preloaded when `preload` (default) is true.
- [Source: docs/project-context.md] — Next 16 conventions, read bundled docs first, no test runner (gate = tsc + ESLint via build), 320/360/390/768 manual QA, never hardcode tokens.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, dev-story workflow)

### Debug Log References

- **BLOCKER (AC-3 / Task 3): Outfit has no Cyrillic subset.** `Outfit({ subsets: ["latin", "cyrillic"] })` fails the quality gate at type-check: `Type '"cyrillic"' is not assignable to type '"latin" | "latin-ext"'` (`src/app/[locale]/layout.tsx:13`). Confirmed authoritative: `node_modules/.../@next/font/.../font-data.json` lists `"Outfit": subsets ["latin","latin-ext"]`, and the generated type (`index.d.ts:12840`) is `subsets?: Array<'latin' | 'latin-ext'>`. Outfit does not ship Cyrillic glyphs on Google Fonts, so even casting past the type error would render `/uk` Cyrillic in a system fallback — the exact failure AC-3 exists to prevent. The story's AC-3, Task 3, and Dev Notes ("change the `subsets` array — that is the entire change") rest on a false premise inherited from DESIGN.md/architecture (which assumed Outfit supports Cyrillic). Resolving AC-3 requires a brand/design decision (swap to a Cyrillic-capable font, or add a second Cyrillic font for `/uk`), which the story scope explicitly forbids. HALTED for guidance. `uk.json` (AC-1/2/4) is complete and the build is green with `subsets: ["latin"]` restored.

### Completion Notes List

- **AC-1 / AC-2 / AC-4 (uk.json) — DONE.** Authored the full `messages/uk.json` (10 namespaces) with an identical key tree to `en.json` (jq diff empty, no uk-only keys, valid JSON). Voice-compliant Ukrainian (no exclamation marks, no emojis, complete sentences, never blames the user). Typography preserved: em-dash U+2014, apostrophe U+2019 (`запам’ятовує`), brand name kept Latin (`MealLoop`), `appStore.badgeName` left `"App Store"`. Per-key `en` fallback (FR-4) verified intact via smoke test.
- **AC-3 (Cyrillic in brand font) — DONE, but via a font swap, not the planned subset edit.** **The story's premise was wrong: Outfit has no Cyrillic subset** (next/font type `Array<'latin' | 'latin-ext'>`; `font-data.json` confirms `["latin","latin-ext"]`). `subsets: ["latin","cyrillic"]` fails type-check and would render `/uk` in a system font regardless. Per Bogdan's explicit decision (chosen from 4 options), the brand font was swapped **site-wide** from Outfit to **Manrope** (a variable Cyrillic-capable geometric sans; chosen from Manrope/Jost/Golos Text/Montserrat). Implementation: `src/app/[locale]/layout.tsx` now uses `Manrope({ variable: "--font-sans", subsets: ["latin","cyrillic"] })`; the `--font-sans` token, metadata, and `<html>` wiring are unchanged, so `globals.css` and all components inherit it with no further edits. Verified: Cyrillic `@font-face`/`unicode-range` present, 2 woff2 preloads, Manrope family applied on `/uk`.
- **AC-5 / AC-6 — RECONCILED by the approved decision (not literally met as written).** AC-5 required `/en` byte-for-byte unchanged; the site-wide font swap intentionally changes `/en` typography (Outfit→Manrope) — superseded by Bogdan's decision. AC-6 limited the change set to `uk.json` + `layout.tsx`; the swap also touched a one-word stale comment in `src/components/screens.tsx`. Static-prerender discipline (AR-4) and the quality gate (tsc+ESLint via `next build`) are intact: `/en` and `/uk` remain prerendered static (`●`).
- **PLANNING FOLLOW-UP (recommended):** DESIGN.md, architecture.md, epics.md, prd.md, and project-context.md still name **Outfit** as the brand font and assume it supports Cyrillic. They should be reconciled to **Manrope** so the discrepancy doesn't resurface. (project-context.md's "Known v1→v2 Gaps" font note is now stale.) Not done here to keep this story's diff focused — flagged for correct-course / a docs pass.
- **OUTSTANDING HUMAN VERIFICATIONS (review/pre-launch, not dev gates):**
  1. **Manual responsive pass** at 320/360/390/768px on `/uk` — could not be done in this headless env. Risk: loop-diagram pill overflow at 320px from longer UA labels. Needs a browser check.
  2. **Native-speaker review** (UX-DR-21) of voice-sensitive `hero.headline` / `hero.description` before launch — this catalog is the AI-translated draft.

### File List

- `messages/uk.json` — filled the empty `{}` with the full translated Ukrainian catalog (modified)
- `src/app/[locale]/layout.tsx` — swapped brand font Outfit → Manrope with `subsets: ["latin","cyrillic"]` (modified)
- `src/components/screens.tsx` — updated a stale code comment (`Outfit` → `Manrope`) (modified)
- `docs/implementation-artifacts/sprint-status.yaml` — story status ready-for-dev → in-progress → review (modified)
- `docs/implementation-artifacts/1-4-ukrainian-catalog-cyrillic-typography.md` — this story file: tasks, records, change log, status (modified)

## Change Log

- 2026-06-19 — Authored full `messages/uk.json` (identical key tree to `en.json`); verified FR-4 per-key `en` fallback intact. Status → review.
- 2026-06-19 — **Discovered AC-3 is infeasible as specified: Outfit has no Cyrillic subset.** Per Bogdan's decision, swapped the brand font site-wide Outfit → Manrope (`subsets: ["latin","cyrillic"]`). AC-5 (/en byte-for-byte unchanged) and AC-6 (scope) reconciled to the approved decision; planning docs (DESIGN/architecture/epics/prd/project-context) still cite Outfit and are flagged for a follow-up reconciliation. Manual responsive pass + hero native-speaker review remain as pre-launch human verifications.