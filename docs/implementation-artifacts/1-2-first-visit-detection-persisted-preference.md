---
baseline_commit: 0252185
---

# Story 1.2: First-visit detection & persisted preference

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-time visitor,
I want the site to open in my language automatically and remember my choice,
so that I'm not forced to pick a language on every visit.

This story turns the locale-less root from "just resolves to a locale" (Story 1.1 deliberately left it at default `en`) into the full first-visit negotiation: detect the visitor's language from `Accept-Language`, redirect, persist the choice, honor returning visitors' stored preference, and let an explicit `/uk`/`/en` path override and update that preference. It is a **proxy-layer behavior + verification story**, not a new-UI story — the locale switcher (Story 1.5) and analytics events (Epic 6) come later.

> **The single most important thing to understand before you touch any code:** next-intl's `createMiddleware(routing)` — already wired in `src/proxy.ts` by Story 1.1 — implements **the entire FR-2 resolution chain by default**. Do **not** hand-write `Accept-Language` parsing, cookie reads, or redirect logic. See Dev Notes "Do not reinvent next-intl" — this is the #1 way this story goes wrong.

## Acceptance Criteria

1. **First visit, no cookie → `Accept-Language` decides, `en` is the fallback.** _(FR-2)_
   **Given** a first visit to `/` with no stored `NEXT_LOCALE` cookie,
   **When** `proxy.ts` resolves the locale,
   **Then** a browser preferring Ukrainian (`Accept-Language: uk` / `uk-UA`) is redirected to `/uk`, and one preferring English **or any unsupported language** (e.g. `fr`, `de`, none) is redirected to `/en` (default).

2. **Returning visitor → persisted cookie wins over the header.** _(FR-2)_
   **Given** a returning visitor with a persisted `NEXT_LOCALE` cookie,
   **When** they request `/`,
   **Then** they are served their persisted locale **regardless of `Accept-Language`** (cookie ranks above the header).

3. **Persistence survives across browser sessions.** _(FR-2 — "remember my choice"; see Dev Notes "The cookie-lifetime trap")_
   **Given** a visitor whose preference was stored,
   **When** they return in a later browser session (cookie not cleared on close),
   **Then** the stored locale is still honored — i.e. `NEXT_LOCALE` is a durable cookie with an explicit `maxAge`, not a session-only cookie.

4. **Explicit `/uk` or `/en` path is authoritative and updates the preference.** _(UJ-1 edge case)_
   **Given** an explicit `/uk` or `/en` link,
   **When** it is opened even though the browser prefers the other language,
   **Then** the path is honored (no redirect away from it) **and** the persisted `NEXT_LOCALE` preference is updated to the visited locale.

5. **No flash of the wrong language — resolution happens before paint.** _(UX-DR-11)_
   **Given** locale negotiation at `/`,
   **When** the visitor lands,
   **Then** the redirect to the resolved locale subpath happens in the proxy (a 307/308 server redirect) before any page renders — there is no client-side language flip after first paint.

6. **All cookie/header reads stay confined to `proxy.ts`.** _(AR-4)_
   **Given** locale negotiation runs,
   **When** it reads cookies/headers,
   **Then** those reads occur **only** in `proxy.ts` — none in any page, layout, or `generateMetadata` body — so `/en` and `/uk` remain statically prerendered (build route table shows `●`/`○`, not `ƒ`).

7. **`NEXT_LOCALE` is a first-party essential/functional cookie, not consent-gated.** _(AR-12)_
   **Given** the `NEXT_LOCALE` cookie,
   **When** it is set,
   **Then** it is a first-party functional cookie classified essential and **exempt from consent gating** — no consent check wraps it (there is no consent system yet; that is Epic 6, and its Cookie-Policy disclosure is Epic 5). Do not add any consent logic in this story.

8. **Quality gate + deploy pipeline intact.** _(NFR-6, AR-13)_
   **Given** the changes,
   **When** `next build` runs,
   **Then** `tsc --noEmit` + ESLint pass, `/en` and `/uk` stay statically prerendered, and the existing GitHub→Vercel auto-deploy on `main` is unaffected.

## Tasks / Subtasks

- [x] **Task 1 — Read the installed docs before touching the proxy (AC: 1,2,3,4,5,6)**
  - [x] Per `AGENTS.md`/Project Context: this is Next.js 16 (middleware → `proxy.ts`) with next-intl **4.13.0** — verify every API against the installed package, not training data.
  - [x] Read `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` (matcher rules, redirect behavior) and the next-intl middleware/routing docs (`node_modules/next-intl/dist/types/routing/config.d.ts` is the authoritative options surface; README is minimal).
  - [x] Confirm the **resolution order** in `node_modules/next-intl/dist/esm/production/middleware/resolveLocale.js`: explicit path → `NEXT_LOCALE` cookie → `Accept-Language` (via `negotiator` + `@formatjs/intl-localematcher`) → `defaultLocale`. This is exactly FR-2 — it already exists.

- [x] **Task 2 — Verify the out-of-the-box behavior FIRST, before changing anything (AC: 1,2,4,5)**
  - [x] `npm run build && npx next start` (the proxy/redirect must be tested against a real server, not `next dev` assumptions). Probe with `curl -i`:
    - `curl -i -H 'Accept-Language: uk' http://localhost:3000/` → expect `307`/`308` to `/uk`.
    - `curl -i -H 'Accept-Language: en' http://localhost:3000/` and `-H 'Accept-Language: fr'` and no header → expect redirect to `/en`.
    - `curl -i -H 'Cookie: NEXT_LOCALE=uk' -H 'Accept-Language: en' http://localhost:3000/` → expect `/uk` (cookie beats header, AC-2).
    - `curl -i -H 'Accept-Language: en' http://localhost:3000/uk` → expect `200` (path honored, AC-4) and a `Set-Cookie: NEXT_LOCALE=uk` in the response (preference updated).
  - [x] Record the observed status codes + `Set-Cookie` attributes in Completion Notes. If all pass, AC-1/2/4/5 are satisfied by Story 1.1's `createMiddleware(routing)` with **no logic change** — your remaining work is the cookie-lifetime fix (Task 3) and the static-discipline guard (Task 4).

- [x] **Task 3 — Make the locale cookie durable + intentional in `routing.ts` (AC: 3,7)**
  - [x] In `src/i18n/routing.ts`, the default `localeCookie` resolved by next-intl 4.13 is `{ name: "NEXT_LOCALE", sameSite: "lax" }` with **no `maxAge`** → a **session cookie** that is lost on browser close, which fails AC-3 ("remember my choice"). Add an explicit `localeCookie` with a durable `maxAge`:
    ```ts
    localeCookie: {
      maxAge: 60 * 60 * 24 * 365, // 1 year — durable persisted preference (FR-2)
    },
    ```
    Keep next-intl's defaults for `name` (`NEXT_LOCALE`) and `sameSite` (`lax`) — do **not** rename the cookie (AR-12 names `NEXT_LOCALE` explicitly; the Cookie Policy in Epic 5 discloses that exact name). `secure`/`path` are handled by next-intl/Next; only override if your verification shows a concrete need.
  - [x] Optionally set `localeDetection: true` explicitly to document intent (it is already the default — this is a clarity choice, not a behavior change). **Never set it to `false`** — that disables both the cookie and `Accept-Language` detection and breaks AC-1/2.
  - [x] Re-run the Task 2 probes; confirm the `Set-Cookie: NEXT_LOCALE` now carries `Max-Age=31536000` (durable), then confirm AC-3 by reloading with that cookie.

- [x] **Task 4 — Guard the static-prerender discipline (AC: 6,8)**
  - [x] Confirm **no** `cookies()` / `headers()` / `next/headers` / `draftMode` reads exist in any `src/app/**` page/layout or `generateMetadata` body (current state: none — keep it that way; this story must not introduce any).
  - [x] `npm run build`: the route table must still show `/[locale]` static (`●` with `/en`, `/uk` prerendered), **not** `ƒ` dynamic. A page going dynamic is the signature of a stray request-time read leaking out of the proxy.

- [x] **Task 5 — Confirm no out-of-scope work crept in (AC: 7)**
  - [x] No locale-switcher UI (Story 1.5). No analytics/`locale_switch` event (Epic 6). No consent banner or `mealloop_consent` cookie (Epic 6). No Cookie-Policy page/disclosure copy (Epic 5). No `uk` catalog work (Story 1.4). This story is the proxy negotiation + cookie durability only.

- [x] **Task 6 — Final quality gate (AC: 8)**
  - [x] `npm run build` green (tsc + ESLint via `next build`); `npm run lint` exit 0.
  - [x] Re-run the full `curl` matrix from Task 2/3 one last time against `next start` and paste results into Completion Notes (this is the only "test" — there is no test runner; verification is behavioral per AR-13).

### Review Findings

_Code review 2026-06-19 (adversarial 3-layer: Blind Hunter, Edge Case Hunter, Acceptance Auditor). 14 findings dismissed as noise/false-positive. Acceptance Auditor: no AC/scope violations — implementation matches spec; AC-1/2/4/5/8 rest on behavioral curl/build evidence in Completion Notes that cannot be re-confirmed statically, but every underlying next-intl mechanism was independently verified in source._

- [x] [Review][Decision→Patch] Comments embed requirement-ID traceability (FR-2, AR-12, AC-1/AC-2, "Epic 5 Cookie Policy", "next-intl 4.x") — project-context/CLAUDE.md says default to no comments and don't reference the task/fix ("those belong in the PR description and rot"). **Resolved: trimmed to the why** — comments now explain only the next-intl 4.x session-cookie gotcha; requirement-ID cross-refs removed. [src/i18n/routing.ts:11-18]
- [x] [Review][Patch] `NEXT_LOCALE` cookie ships without `Secure` in production — Dev Notes claim "secure ... handled by next-intl/Next", but installed source disproves it: `receiveRoutingConfig` resolves the default to `{name:"NEXT_LOCALE", sameSite:"lax"}` and `syncCookie` only auto-adds `path` — neither sets `secure`. **Fixed: added `secure: true` to `localeCookie`.** [src/i18n/routing.ts:16-18]
- [x] [Review][Defer] 1-year persistent cookie creates downstream consent/disclosure obligations [src/i18n/routing.ts:16-18] — deferred, out of scope: AC-7 deliberately classifies `NEXT_LOCALE` essential/consent-exempt; consent banner is Epic 6.4 and the Cookie-Policy disclosure (exact name + 1-year lifetime) is Epic 5.1.

## Dev Notes

### Do not reinvent next-intl (the #1 disaster to prevent here)
`src/proxy.ts` already contains `export default createMiddleware(routing)`. In next-intl 4.13 that single line resolves the locale in this exact order (verified in `dist/esm/production/middleware/resolveLocale.js`, function `i`):
1. **Explicit path locale** (`/uk`, `/en`) — always wins.
2. **`NEXT_LOCALE` cookie** — if `localeDetection` is on (default).
3. **`Accept-Language`** — matched with `negotiator` + `@formatjs/intl-localematcher` (proper BCP-47: `uk-UA` → `uk`, quality values, case-insensitive, longest-match-first).
4. **`defaultLocale`** (`en`).

It also **persists the choice automatically** (`dist/esm/production/middleware/syncCookie.js`): when the resolved locale differs from what the cookie/header would give, it emits `Set-Cookie: NEXT_LOCALE=<locale>`. So AC-1, AC-2, AC-4, AC-5 are **already implemented**. Writing custom `request.headers.get('accept-language')` parsing or manual `NextResponse.redirect` logic would duplicate this, almost certainly diverge from the spec's matching rules, and is explicitly forbidden. The only code change this story needs is the cookie `maxAge` (Task 3). [Source: node_modules/next-intl/dist/esm/production/middleware/resolveLocale.js, syncCookie.js]

### The cookie-lifetime trap (the one real, non-obvious bug to fix)
next-intl 4.13's resolved default for the locale cookie is **`{ name: "NEXT_LOCALE", sameSite: "lax" }` — with no `maxAge`** (verified: `dist/esm/production/routing/config.js`, `receiveRoutingConfig`). A cookie set with no `Max-Age`/`Expires` is a **session cookie**: it survives reloads and in-session navigation but is **deleted when the browser closes**. That technically satisfies a narrow reading of AC-2 but **fails the story's intent** ("remember my choice" / "not forced to pick on every visit") for a true returning visitor on a new day. This is exactly the "breaking change vs. your training data" `AGENTS.md` warns about — older next-intl (3.x) defaulted this cookie to a 1-year `maxAge`; 4.x does not. Fix by setting an explicit `maxAge` on `localeCookie` (Task 3). Verify the `Set-Cookie` response header actually carries `Max-Age=...` before calling AC-3 done — do not assume. [Source: node_modules/next-intl/dist/esm/production/routing/config.js; node_modules/next-intl/dist/types/routing/config.d.ts#RoutingConfig.localeCookie]

### `localeCookie` / `localeDetection` option surface (authoritative)
From `node_modules/next-intl/dist/types/routing/config.d.ts`:
- `localeCookie?: boolean | CookieAttributes` — `CookieAttributes` = `Pick<…, 'maxAge'|'domain'|'partitioned'|'path'|'priority'|'sameSite'|'secure'|'name'>`. Set an object to customize; `false` disables the cookie entirely (do not).
- `localeDetection?: boolean` — defaults `true`. "By setting this to `false`, the cookie as well as the `accept-language` header will no longer be used for locale detection." Leave it on.
- These go on the **`defineRouting(...)` config in `src/i18n/routing.ts`**, which `proxy.ts` already consumes via `routing` — you do **not** edit `proxy.ts` for this. [Source: dist/types/routing/config.d.ts]

### Brownfield reality — current state of the files you will touch (read before editing)
- `src/proxy.ts` — `export default createMiddleware(routing)` + a static `config.matcher = ["/((?!api|_next|_vercel|.*\\..*).*)"]`. **Do not change the logic.** The matcher already covers `/` (empty match) so the root gets negotiated. You generally won't edit this file at all.
- `src/i18n/routing.ts` — `defineRouting({ locales: LOCALES, defaultLocale: DEFAULT_LOCALE, localePrefix: "always" })`. **This is where Task 3's `localeCookie` (and optional explicit `localeDetection`) is added.**
- `src/i18n/request.ts` — request config + deep-merge `en` fallback. **Out of scope** for 1.2 (it reads `requestLocale`, not cookies/headers — leave it).
- `src/i18n/navigation.ts` — locale-aware `Link`/`useRouter`/`redirect`. Untouched here (switcher is 1.5).
- `src/lib/site.ts` — `LOCALES = ['en','uk']`, `DEFAULT_LOCALE = 'en'`, `SITE_ORIGIN`, `APP_STORE_URL`/`APP_STORE_LIVE`. Single source for locales — don't redeclare. No change expected unless you choose to co-locate a cookie-name/maxAge constant (optional; next-intl's default name is fine).
- `src/app/[locale]/{layout.tsx,page.tsx}` — sole html-bearing layout carries per-locale `<html lang>`; both call `setRequestLocale(locale)` for static rendering. **Must stay free of any cookie/header read** (AC-6). [Source: docs/implementation-artifacts/1-1-i18n-scaffolding-localized-route-shell.md#Completion Notes / File List]

### Static-prerender discipline (AR-4 — protects CWV, do not break it)
`/en` and `/uk` are statically prerendered. The instant any page/layout/`generateMetadata` reads `cookies()` or `headers()`, Next flips that route to dynamic (`ƒ`) and you lose the CWV/static guarantees. **All** request-time locale logic lives in `proxy.ts` (which is allowed to read cookies/headers). Story 1.1 verified the route table shows `● /[locale]`; Task 4 must re-confirm this after your change. The current grep for `next/headers`/`cookies()`/`headers()` across `src/app` + `src/components` returns nothing — that is the state to preserve. [Source: docs/planning-artifacts/architecture.md#Internationalization & Routing, #Static-prerender discipline (AR-4); architecture.md lines 235-237, 522-524]

### `Accept-Language` matching specifics you can rely on (so you don't re-test the library)
next-intl delegates to `negotiator` (parses the header, honors `q=` weights) and `@formatjs/intl-localematcher` (BCP-47 best-fit). Practical consequences for the AC-1 probes: `uk`, `uk-UA`, `uk-UA,en;q=0.8` → `uk`; `en-US`, `en-GB` → `en`; `fr`, `de`, `ru`, empty/absent → fall through to `defaultLocale` `en` (there is no `ru`/other locale, so "unsupported → en" holds). You do not need to enumerate every header permutation — test one representative `uk`, one `en`, one unsupported, and one absent. [Source: dist/esm/production/middleware/resolveLocale.js#getAcceptLanguageLocale]

### Why "explicit path updates the preference" already works (AC-4)
`syncCookie.js`: if the `NEXT_LOCALE` cookie is present and differs from the resolved locale → it's rewritten; if absent and the `Accept-Language`-derived locale differs from the resolved (path) locale → it's set. So visiting `/uk` with `Accept-Language: en` and no cookie sets `NEXT_LOCALE=uk`; visiting `/en` later flips it to `en`. Confirm via the `Set-Cookie` header in the Task 2 probe rather than trusting this note. [Source: dist/esm/production/middleware/syncCookie.js]

### Voice / a11y / motion contracts
No new visible UI or copy ships in 1.2, so the microcopy-voice rules (UX-DR-18), focus-ring/touch-target contracts, and reduced-motion guard don't apply here. UX-DR-11 ("no flash of the wrong language") **does** apply and is satisfied by the server-side proxy redirect (AC-5) — there is no client-side locale flip to suppress. [Source: docs/planning-artifacts/epics.md#UX-DR-11]

### Scope boundaries — do NOT do these in 1.2 (they belong to later stories)
- **Locale switcher UI / on-surface switching / focus handling** → Story 1.5.
- **`locale_switch` analytics event** → Epic 6 (Story 6.3). **Consent banner / `mealloop_consent`** → Epic 6 (6.4).
- **Cookie-Policy page + the AR-12 disclosure copy** → Epic 5 (5.1). (1.2 only ensures the cookie *is* essential and ungated; it documents nothing user-facing.)
- **`uk` catalog + Outfit `cyrillic` subset** → Story 1.4. **Copy externalization** → Story 1.3.
- **Per-locale metadata / hreflang / sitemap** → Epic 3.

### Project Structure Notes
- Expected change set is **small and config-only**: edit `src/i18n/routing.ts` (add `localeCookie` + optional explicit `localeDetection`). `src/proxy.ts` is expected to remain **unchanged**. No new files. If your verification surprises you and you must touch `proxy.ts`, note exactly why in Completion Notes — that would be a deviation from the architecture's "proxy = bare `createMiddleware`" model.
- This story adds no routes, no components, no catalog keys. If you find yourself creating a component or a `messages/*` entry, you've drifted out of scope. [Source: docs/planning-artifacts/architecture.md#Complete Project Directory Structure, lines 445, 522-524]

### References
- [Source: docs/planning-artifacts/epics.md#Story 1.2: First-visit detection & persisted preference] — the five BDD ACs (FR-2, AR-4, AR-12, UJ-1).
- [Source: docs/planning-artifacts/epics.md#FR-2] — first-visit detection + persisted preference statement.
- [Source: docs/planning-artifacts/epics.md#AR-4] — cookie/header reads confined to `proxy.ts`; static prerender.
- [Source: docs/planning-artifacts/epics.md#AR-12] — `NEXT_LOCALE` is essential/functional, consent-exempt, disclosed in Cookie Policy (Epic 5).
- [Source: docs/planning-artifacts/epics.md#UX-DR-11] — locale negotiation before paint, no flash; explicit path authoritative over header.
- [Source: docs/planning-artifacts/architecture.md#Internationalization & Routing (the spine)] (lines 230-239) — detection order cookie → Accept-Language → en; explicit path wins and updates the cookie.
- [Source: docs/planning-artifacts/architecture.md] (lines 199-202) — locale preference uses next-intl's built-in `NEXT_LOCALE` cookie, classified essential.
- [Source: docs/implementation-artifacts/1-1-i18n-scaffolding-localized-route-shell.md] — established proxy location (`src/proxy.ts`), layout structure, locale single-sourcing; 1.1 explicitly deferred Accept-Language/cookie negotiation to 1.2.
- [Source: docs/project-context.md] — Next 16 `proxy.ts` rename, RSC-default, read bundled docs first, no test runner (gate = tsc + ESLint), 320/360/390/768 manual QA.
- [Source: node_modules/next-intl/dist/types/routing/config.d.ts] — `localeCookie` / `localeDetection` option types (authoritative for 4.13).
- [Source: node_modules/next-intl/dist/esm/production/middleware/resolveLocale.js, syncCookie.js; routing/config.js] — resolution order, cookie-sync behavior, default cookie `{name:"NEXT_LOCALE", sameSite:"lax"}` with no `maxAge`.
- [Source: node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md] — Next 16 Proxy convention, matcher, redirect semantics.

## Dev Agent Record

### Agent Model Used

claude-opus-4-8 (Claude Code, dev-story workflow)

### Debug Log References

- Installed versions verified: next-intl **4.13.0**, next **16.2.9** (from `node_modules/*/package.json`).
- Resolution order confirmed in `node_modules/next-intl/dist/esm/production/middleware/resolveLocale.js` (function `i`): explicit path → `NEXT_LOCALE` cookie (`c`) → `Accept-Language` (`getAcceptLanguageLocale` via `negotiator` + `@formatjs/intl-localematcher`) → `defaultLocale`. `localeDetection` gates both cookie and header.
- Default cookie confirmed in `node_modules/next-intl/dist/esm/production/routing/config.js` (`receiveRoutingConfig`): `{ name: "NEXT_LOCALE", sameSite: "lax" }` with **no `maxAge`** → session cookie. `syncCookie.js` sets the cookie with `...c`, so an added `maxAge` propagates.
- `localeCookie` / `localeDetection` option surface verified in `node_modules/next-intl/dist/types/routing/config.d.ts`.

### Completion Notes List

- **Only code change:** added `localeCookie: { maxAge: 60*60*24*365 }` and explicit `localeDetection: true` to `src/i18n/routing.ts`. `src/proxy.ts` unchanged (stays a bare `createMiddleware(routing)`), no new files, no components, no catalog keys — matches the architecture's "proxy = bare createMiddleware" model.
- **AC-1/2/4/5 already satisfied by Story 1.1's `createMiddleware(routing)` with no logic change** — confirmed via the baseline curl matrix before touching code.
- **AC-3 was the one real bug:** baseline `Set-Cookie` was `NEXT_LOCALE=en; Path=/; SameSite=lax` (session cookie, no `Max-Age`). After the fix it carries `Expires=Sat, 19 Jun 2027 ...; Max-Age=31536000` — durable. Name (`NEXT_LOCALE`) and `sameSite` (`lax`) preserved per AR-12.
- **AC-6/8:** `npm run build` route table shows `● /[locale]` static (`/en`, `/uk` prerendered), not `ƒ` dynamic, before and after the change. `grep` for `next/headers`/`cookies()`/`headers()`/`draftMode` across `src/app` + `src/components` → none. `npm run lint` exit 0; build (tsc + ESLint) green.
- **AC-7:** `NEXT_LOCALE` set with no consent gate; no consent system added (Epic 6). No switcher UI, analytics event, consent banner, Cookie-Policy copy, or `uk` catalog work — scope clean.
- **Final curl matrix (`next start`, port 3210, after fix):**
  - `Accept-Language: uk` → `307` → `/uk`; `uk-UA,en;q=0.8` → `307` → `/uk`
  - `Accept-Language: en` → `307` → `/en`; `fr` (unsupported) → `307` → `/en`; no header → `307` → `/en`
  - `Cookie: NEXT_LOCALE=uk` + `Accept-Language: en` → `307` → `/uk` (cookie beats header)
  - first visit (no header) → `Set-Cookie: NEXT_LOCALE=en; Path=/; Expires=...2027; Max-Age=31536000; SameSite=lax`
  - explicit `/uk` (header `en`) → `200` + `Set-Cookie: NEXT_LOCALE=uk; Max-Age=31536000` (preference updated)
  - explicit `/en` (cookie was `uk`) → `200` + `Set-Cookie: NEXT_LOCALE=en; Max-Age=31536000` (preference flipped)
  - return with `Cookie: NEXT_LOCALE=uk` on `/uk` → `200`, no flip

### File List

- `src/i18n/routing.ts` (modified) — added durable `localeCookie.maxAge` + explicit `localeDetection: true`.

## Change Log

- 2026-06-19 — Code review (done). Applied 2 patches to `src/i18n/routing.ts`: added `secure: true` to `localeCookie` (next-intl does not set it; prior Dev Note claim was inaccurate) and trimmed the comments to the next-intl session-cookie *why* (dropped rot-prone requirement-ID cross-refs). 1 finding deferred (downstream consent/disclosure → Epic 5.1/6.4). Re-ran `next build`: tsc green, `/en`+`/uk` stay static `●` (AC-6/AC-8 hold).
- 2026-06-19 — Story 1.2 implemented (review). Added durable `localeCookie.maxAge` (1 year) + explicit `localeDetection: true` to `src/i18n/routing.ts`; `proxy.ts` unchanged. Verified FR-2 resolution chain + cookie persistence behaviorally via `curl` against `next start` (AC-1/2/4/5 already worked; AC-3 fixed from session → durable cookie). Build (tsc+ESLint) green, lint exit 0, `/[locale]` stays statically prerendered (AC-6/8).
- 2026-06-19 — Story 1.2 drafted (ready-for-dev). First-visit `Accept-Language` detection + persisted `NEXT_LOCALE` preference, building on Story 1.1's `createMiddleware(routing)`. Core finding captured for the dev: next-intl 4.13 already implements the full FR-2 resolution chain and cookie-sync by default; the only real code change is an explicit durable `localeCookie.maxAge` (default is a session cookie), plus behavioral verification via `curl` against `next start` and a static-prerender guard (AR-4).
