---
name: MealLoop
description: Experience spine for the MealLoop marketing website (v2) — information architecture, behavior, states, i18n, accessibility, and acquisition journeys. Visual identity lives in ./DESIGN.md.
status: final
updated: 2026-06-19
design_ref: ./DESIGN.md
sources:
  - ../../prds/prd-mealloop-2026-06-18/prd.md
  - ../../prds/prd-mealloop-2026-06-18/addendum.md
  - ../../../v2-scope-brief.md
---

# MealLoop — Experience Spine

The MealLoop marketing website is the acquisition front door for a calm iOS weekly meal planner. It is **one responsive landing page plus legal pages**, in two languages (English + Ukrainian), whose single conversion goal is an App Store download. v1 is live; v2 scales up capability (i18n, SEO, real brand mark, consent, mobile QA) while scaling down noise. Visual identity, tokens, and brand voice live in `./DESIGN.md`; this spine owns how it *works*.

## Foundation

Single-surface responsive web. **shadcn/ui on Next.js 16 (App Router) + React 19 + Tailwind v4.** The component library does the structural work; the brand layer in `DESIGN.md` names the visual delta. This is a marketing site, not an app — no auth, no accounts, no app data; the only persisted client state is the visitor's locale preference and analytics consent.

The site advertises an **iOS app**. There is no Android surface and no native app surface in scope. The App Store badge is the terminal action; until the listing is live (`APP_STORE_LIVE` flag in `src/lib/site.ts`), the badge sits in a calm Coming-soon state.

Two locales only: **`en` (default + fallback)** and **`uk`**. Everything below is locale-aware. `DESIGN.md` is the visual identity reference; the spine wins on conflict with any mock.

## Information Architecture

**Routes.** Locale lives in a path prefix.

| Route | Purpose | Notes |
|---|---|---|
| `/` | Locale negotiation entry | Detects preference (persisted → `Accept-Language` → default) and resolves to `/en` or `/uk`. Not a content page of its own. |
| `/en`, `/uk` | The landing page | Same section order, localized content. Per-locale `<html lang>`. |
| `/en/privacy`, `/uk/privacy` | Privacy Policy | Launch dependency for both site and App Store listing. |
| `/en/terms`, `/uk/terms` | Terms | |
| `/en/cookies`, `/uk/cookies` | Cookie Policy | Explains the cookieless/consent posture. |

**Landing-page sections** (in scroll order; components in `src/components/sections/`):

| Section | Anchor | Purpose |
|---|---|---|
| Nav | — | Wordmark + brand mark, anchor links, locale switcher, App Store CTA; hamburger on mobile. |
| Hero | top | The one-line promise + lead subcopy + primary App Store CTA + first device mockup. Holds the single `<h1>`. |
| How it works | `#how-it-works` | Three calm steps: build a library → plan the week → list writes itself. |
| Features | `#features` | Feature cards, terracotta/mint accented icons. |
| The loop | `#loop` | The signature animated "loop" that closes the argument (library → plan → groceries → repeat). |
| Screenshots | — | Device mockups of Library / Planner / Groceries. |
| CTA | — | Final App Store CTA (+ Coming-soon caption when not live). |
| Footer | — | Wordmark, legal links, contact email, locale switcher mirror. |

Anchor links scroll within the page; there is no multi-page nav beyond legal. The mobile overlay lists the same anchors. → Composition reference: [`mockups/hero.html`](mockups/hero.html), [`mockups/mobile-overlay.html`](mockups/mobile-overlay.html), [`mockups/app-store-cta.html`](mockups/app-store-cta.html). **Spine wins on conflict.**

## Internationalization & Routing

The product-specific spine. Ukrainian is a **first-class language, not a machine afterthought.**

- **Detection (first visit, no stored preference).** `/` resolves locale by `Accept-Language`: a `uk` preference → `/uk`, otherwise → `/en` (default + fallback). Resolution happens before paint; no flash of the wrong language.
- **Explicit intent wins.** A shared `/uk` link is always honored, even when the browser prefers English (UJ-1 edge case). The path is authoritative over the header.
- **Persisted preference.** Once the visitor chooses a locale via the switcher, it persists and overrides `Accept-Language` on return. **Mechanism: a first-party functional cookie**, classed essential/functional and therefore exempt from consent gating — chosen so the server can read it during locale negotiation at `/` and render the right language on first paint (no client-side flash). The Cookie Policy discloses it as a strictly-functional cookie. (Resolves PRD Open Q3.)
- **Switching.** The `EN · УК` switcher swaps locale **on the current surface** — same section, same scroll position where feasible — by routing to the sibling locale path. It is navigation, not a page reload to top. On a client-side swap the new `<html lang>` is set **and** focus is placed sensibly (retained on the switcher, or moved to the page `<h1>`) so screen-reader users perceive that the page language and content changed — a silent content swap with lost focus is not acceptable.
- **Fallback.** Missing `uk` strings fall back to `en` silently (no empty slots, no `[missing key]`). No RTL, no region variants.
- **`<html lang>`** is set per locale on every route (en/uk), including legal pages — load-bearing for screen readers and SEO hreflang.

## SEO & Metadata Behavior

- Per-locale `<title>` and meta description; canonical URL per locale; reciprocal `hreflang` (`en`, `uk`, `x-default`).
- Sitemap lists both locales; `robots` allows indexing.
- JSON-LD structured data describing the product/organization.
- One `<h1>` per page (the hero promise); no skipped heading levels anywhere — semantic structure is both an SEO and an accessibility contract.
- Social card / OG image per locale. `[ASSUMPTION]` Composition: the real brand mark + wordmark on `{colors.paper}` with the localized tagline; no device mockup in the card to keep it legible at small sizes. Resolve at finalize (PRD Open Q2).

## Voice and Tone

Microcopy. Brand voice and aesthetic posture live in `DESIGN.md.Brand & Style`. The locked rule (UX-DR18, **both languages**): no exclamation marks, no emojis in copy, complete sentences, never blame the user, calm and understated — "sells less."

| Do | Don't |
|---|---|
| "Plan a week of meals from the dishes you already cook." | "Plan your week in seconds! 🍳" |
| "Coming soon to the App Store." | "Launching soon — stay tuned!!" |
| "We don't track you. No cookie wall, no ad pixels." | "We value your privacy! Accept cookies to continue." |
| "MealLoop isn't on the App Store yet. The link will appear here when it launches." | "Oops! This isn't ready yet." |
| Ukrainian written natively, reviewed by a native speaker | Ukrainian as a literal machine translation of English |

`[ASSUMPTION]` Ukrainian voice-sensitive copy (hero, Coming-soon, consent) gets a native-speaker review pass before launch (PRD Open Q5).

## Component Patterns

Behavioral. Visual specs live in `DESIGN.md.Components` (or shadcn defaults when inherited).

| Component | Behavioral rules |
|---|---|
| **Nav** | Sticky or static top bar (`[ASSUMPTION]` static, to keep the surface calm — confirm at finalize). Anchor links smooth-scroll to sections. On `< md`, links + switcher + CTA collapse into the hamburger. |
| **Mobile-menu overlay** | Hamburger opens a **full-viewport opaque** panel ([`mockups/mobile-overlay.html`](mockups/mobile-overlay.html)). Focus moves to the panel; focus is **trapped** while open; `Esc` and the `✕` both close and **return focus to the hamburger**. Body scroll locked while open. Tapping a link closes the overlay, then scrolls. |
| **Locale switcher** | `EN · УК`. Tap switches locale on the current surface (see Internationalization). Present in nav and in the overlay; mirrored in the footer. **Each label is an independent ≥44×44px target** with internal padding and a real gap (or the separator counted as dead space) between the two hit areas so adjacent taps don't merge — verify at 320px. The active locale is marked with `aria-current="true"` **and** a non-color cue (underline / weight), not color alone (see Accessibility Floor). |
| **App Store CTA** | Live (`APP_STORE_LIVE` true): the badge is a link to `APP_STORE_URL`, opens the App Store; tap records a conversion-intent analytics event with the active locale (consent permitting). Coming-soon (false): the badge is **static, non-focusable content removed from the tab order** — `role="img"` with an accessible name that *includes the status* (e.g. "App Store — coming soon"), so assistive tech gets one coherent announcement rather than a disconnected "App Store" + "coming soon." It is **not** a `#` dead link and **not** a focusable disabled button (which would leave an empty tab stop for a control that never enables in this state). The visible caption reinforces the same message for sighted users. The coming-soon state may still record an intent event on tap. |
| **The loop (animated)** | The signature motion: library → plan → groceries → repeat. Autoplays, loops, decorative. Fully readable and operable on small viewports; must not cause layout shift (CLS budget). Honors `prefers-reduced-motion` — see State Patterns. |
| **Device mockup** | HTML/CSS iPhone frames (Library / Planner / Groceries). They may be `aria-hidden` **only because the surrounding section heading + body convey the product value independently** — the mockups must never be the sole carrier of meaningful text (1.1.1). When real screenshots replace them post-v2, each requires descriptive `alt` text or a visually-hidden caption, since baked-in screen text is otherwise inaccessible. |
| **Feature card** | Static content card; icon + title + short body. No hover-only content (touch-first). |
| **Consent banner** | Appears once on first visit; bottom-anchored; **does not block content or scroll**. Accept / Decline are equal-weight, both reachable; a Cookie Policy link sits inline. Revocable later via a footer link. Dismiss persists the choice. See State Patterns. |
| **Footer** | Wordmark, resolved legal links (no dead links), contact email, locale switcher mirror. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| **First visit, no locale stored** | `/` | Resolve locale server-side before paint (persisted → `Accept-Language` → `en`). No wrong-language flash. |
| **Returning visitor** | `/` | Persisted preference wins over `Accept-Language`. |
| **Explicit `/uk` (or `/en`) link** | landing | Honored regardless of browser preference. |
| **App Store not live** | Hero CTA, final CTA | Badge non-interactive + `{typography.caption}` line in `{colors.muted-foreground}`: "Coming soon to the App Store" (localized). Calm, not an error. Both states + both locales: [`mockups/app-store-cta.html`](mockups/app-store-cta.html). |
| **App Store live** | Hero CTA, final CTA | `APP_STORE_LIVE` flips true → badge becomes the live link, caption disappears. Single-source change in `src/lib/site.ts`. |
| **Missing `uk` string** | any | Silent fallback to `en`. Never an empty slot or visible key. |
| **Consent undecided** | first visit | Banner shown; cookieless analytics posture means content and analytics behavior must not depend on a forced "Accept." Banner never becomes a wall. |
| **Consent declined** | global | No non-essential storage/analytics beyond what's strictly functional. The site is fully usable. The locale-preference cookie is essential/functional and remains set (it is not analytics); the Cookie Policy discloses it as such. |
| **Reduced motion** | The loop, any animation | `prefers-reduced-motion: reduce` → the loop renders as a **single static frame**: no autoplaying movement, **no autoplaying cross-fade or opacity loop**, no parallax or scroll-triggered motion. Any transition must be user-initiated, never autoplaying. |
| **Slow / mobile-data load** | landing | Fast first paint is the contract (LCP ≤ 2.5s). Hero text + CTA render first; mockups and the loop hydrate after. No blocking spinner. |

## Interaction Primitives

**Touch-first, pointer-and-keyboard equal.** The primary visitor is on a phone (UJ-1, UJ-2).

- **Scroll** is the primary navigation; anchor links are shortcuts, not the only path.
- **Tap / click** to act. **No hover-only affordances** — anything revealed on hover must also be present for touch.
- **Hamburger** toggles the full-screen overlay; `Esc` closes it.
- **Locale toggle** is a single tap; no nested menu.
- **Keyboard:** every interactive element is reachable in reading order with a visible focus ring (`{colors.ring}`); `Enter`/`Space` activate; `Esc` closes the overlay and any consent affordance.

**Banned everywhere:** dead links (`href="#"` that goes nowhere — the Coming-soon CTA must not be one), cookie walls, hover-only content on touch viewports, horizontal overflow below 320px, autoplaying motion under `prefers-reduced-motion`, exclamation-mark/emoji microcopy.

## Accessibility Floor

Behavioral. Visual contrast lives in `DESIGN.md`. **Contrast status: dark (OS-driven) token set verified AA. Light brand green was failing (B1/B2) and is resolved by darkening it to `#2E7D4F` — pending the `globals.css`/iOS token update and on-device verification.** Treat light-mode AA as "fix specified, verify in build," not yet shipped.

- **WCAG 2.1 AA** across the responsive surface, in both languages and both color schemes.
- Semantic landmarks: one `<header>`/nav, `<main>`, `<footer>`; one `<h1>`; no skipped heading levels.
- The mobile overlay traps focus, closes on `Esc`, and returns focus to its trigger; it exposes `role="dialog"` + `aria-modal="true"` + an accessible name so AT announces it as a modal on open.
- All interactive targets ≥ **44×44px** (nav links, **each** locale label independently, hamburger, CTA, consent buttons), with real spacing between adjacent targets.
- Visible focus indicator on every focusable element: **≥2px ring with a 2px offset**, and a contrasting offset/halo when the focused element is itself brand-green (the primary button) so the ring never sits green-on-green. `Tab` order matches reading order.
- **No meaning by color alone (1.4.1):** active locale and emphasized links carry a non-color cue (underline / weight / `aria-current`) in addition to any color.
- `<html lang>` correct per locale (en/uk) on every route.
- Body text ≥ 16px on mobile; no content lost or clipped at 320px or at 200% zoom.
- Decorative device mockups and the loop animation are hidden from assistive tech where they add no unique information; meaningful text is real text, not baked into images.
- `prefers-reduced-motion` honored (loop static). `prefers-color-scheme` honored (dark is automatic, untoggled, and tested).

## Responsive & Platform

Mobile-first. Tailwind breakpoints; **320px is the hard minimum width** with no horizontal overflow at any width.

| Breakpoint | Behavior |
|---|---|
| `< md` (mobile, incl. 320px floor) | Single column. Nav collapses to hamburger → full-screen overlay. Sections at `{spacing.section-y-mobile}`. Device mockups stack or scroll horizontally rather than shrink below legibility. Body ≥16px. |
| `md` (tablet) | Container centers; nav links + locale switcher + CTA visible inline (no hamburger). Sections open up toward `{spacing.section-y}`. |
| `≥ lg` (desktop) | Full inline nav; multi-column feature grid; content capped at `{spacing.content-max}` (1152px); legal prose capped at `{spacing.prose-max}`. |

The product is iOS; the site is web. No Android assets, no PWA/offline scope.

## Inspiration & Anti-patterns

- **Lifted from the iOS app:** the entire visual system — palette, type ramp (rendered in **Manrope**; the app's `DESIGN.md` named Outfit, swapped site-wide in Story 1.4 for Cyrillic coverage), radius, restraint. The site *extends, never diverges from*, the app's `DESIGN.md`. This is a deliberate posture (pixel-aligned brand), not a shortcut.
- **Lifted from shadcn:** the component vocabulary. The brand is *what we add to shadcn*, not a from-scratch system.
- **Rejected — Cookie wall / consent gate.** Consent is offered, never forced; the banner cannot block content or scroll. A wall would contradict the "trustworthy, sells less" posture (SM-C2).
- **Rejected — Email capture / waitlist.** Out of scope. The Coming-soon state is honest stasis, not a lead-gen form.
- **Rejected — Exclamation/emoji marketing voice, urgency timers, "🎉 launching soon."** Violates UX-DR18 and the restraint character.
- **Rejected — Machine-translated Ukrainian.** Ukrainian is first-class; the diaspora-and-Ukraine audience must not read a translation that "smells machine."
- **Rejected — Decorative gradients, parallax spectacle, scroll-jacking.** Motion is limited to the one signature loop; everything else is calm and standard-scroll.

## Key Flows

### Flow 1 — Olena finds MealLoop in Ukrainian (UJ-1)

Olena cooks for a household of three and is tired of re-deciding dinner every week. On her iPhone during her commute, she searches in Ukrainian and taps an organic result.

1. She lands on `/` → server detects her Ukrainian `Accept-Language` and resolves to `/uk` before the page paints. The hero greets her in Ukrainian — no English flash, no wrong-language stumble.
2. She skims the hero promise, scrolls through the three calm "how it works" steps, and reaches **the loop** — the animation closes the idea: the dishes she already cooks become a week, the week becomes a grocery list.
3. She taps the App Store badge.
4. **Climax:** instead of a broken link or an apology, she gets a calm, honest line — *"Незабаром у App Store"* — in the same restrained voice as everything else. The product hasn't over-promised; it has told her the truth quietly. Her locale is remembered, so when she returns from the App Store later, MealLoop is still speaking Ukrainian.

Edge case: a friend later sends her an explicit `/uk` link; even though she's since switched her phone to English, the `/uk` path is honored — explicit intent wins over the header.

Failure: a `uk` string is missing on a feature card → it silently shows the English text rather than an empty slot; the page never looks broken.

### Flow 2 — Mark arrives skeptical, on mobile data (UJ-2)

Mark is skeptical of "another planning app." A friend texts him a link; he taps it on mobile data, half-expecting a slow, pushy marketing page.

1. The page paints fast — hero text and the CTA are there almost immediately; the device mockups and the loop fill in after. No spinner, no layout jump.
2. The hero promise is concrete, not hype. He scrolls to the **screenshots**: Library, Planner, Groceries — he can see the actual product, not stock photography.
3. **The loop** section makes the argument click: this isn't a recipe feed, it's a way to stop re-deciding. The quiet voice — no exclamation marks, no urgency — does more to lower his guard than enthusiasm would.
4. He taps the App Store badge.
5. **Climax:** the badge shows a calm "Coming soon to the App Store" rather than dumping him into a dead link. He's mildly annoyed it's not live — but the honesty registers as trustworthy, and his tap is recorded (consent permitting) as conversion intent with his locale, so the team knows an English-speaking, shared-link visitor wanted in.

Failure: he taps the hamburger expecting it to be janky; instead the full-screen overlay opens cleanly, traps focus, and closes on `Esc` or the `✕`, returning him exactly where he was. The "another app" prejudice gets no evidence to feed on.
