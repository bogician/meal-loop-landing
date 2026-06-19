---
name: MealLoop
description: Visual identity for the MealLoop marketing website (v2). shadcn/ui on Next.js 16 + Tailwind v4. Extends — never diverges from — the iOS app design system already reflected in src/app/globals.css. This file specifies the marketing-surface delta only.
status: final
updated: 2026-06-19
colors:
  # Locked MealLoop palette, mirrored from src/app/globals.css (the iOS DESIGN.md
  # is the upstream source of truth; this repo's globals.css is its reflection).
  # Light (paper-soft)
  paper: '#F5F4F1'        # --background / --paper — primary canvas
  ink: '#1A1918'          # --foreground — primary text
  card: '#FFFFFF'         # --card — raised surfaces, device mockup frames
  brand: '#2E7D4F'        # --primary / --brand — forest green, primary action.
                          # AA FIX: darkened from the original locked #3D8A5A (which
                          # failed AA in light: white-on-green 4.22:1, green-on-paper
                          # 3.83:1). #2E7D4F → ~5.1:1 white-on-green, ~4.6:1 on paper.
                          # ACTION: globals.css --brand/--ring (light) + the iOS source
                          # DESIGN.md must adopt this value so app + site stay one system.
  brand-foreground: '#FFFFFF'
  warm: '#D89575'         # --warm — terracotta, secondary warmth accent
  warm-foreground: '#1A1918'
  mint: '#C8F0D8'         # --accent / --mint — soft highlight fills
  mint-foreground: '#1F3D2C'
  muted: '#EDECEA'        # --muted / --secondary
  muted-foreground: '#6D6C6A'  # rides the AA line (4.77:1 on paper); consider ~#636260 (~5:1)
  border: '#E5E4E1'       # --border / --input — hairlines
  ring: '#2E7D4F'         # --ring — focus indicator (matches darkened brand)
  destructive: '#D08068'
  # Dark (warm dark — OS-driven via prefers-color-scheme, no toggle)
  paper-dark: '#1A1816'
  ink-dark: '#F5F4F1'
  card-dark: '#221F1C'
  brand-dark: '#4FAA70'
  brand-foreground-dark: '#1A1816'
  warm-dark: '#E5A688'
  mint-dark: '#1F3D2C'
  mint-foreground-dark: '#F5F4F1'
  muted-dark: '#2F2C29'
  muted-foreground-dark: '#B5B3B0'
  border-dark: '#34312E'
  ring-dark: '#4FAA70'
typography:
  # One family — Outfit (geometric sans) — loaded via --font-sans. Heading == sans.
  # [ASSUMPTION] Marketing ramp below; mobile-first sizes, fluid up at md+.
  # NOTE: Outfit must add the `cyrillic` subset for the /uk locale (see Typography).
  display:
    fontFamily: 'Outfit'
    fontSize: 'clamp(2.25rem, 6vw, 3.5rem)'  # hero h1, 36→56px
    fontWeight: '600'
    lineHeight: '1.05'
    letterSpacing: '-0.02em'
  heading:
    fontFamily: 'Outfit'
    fontSize: 'clamp(1.75rem, 4vw, 2.5rem)'  # section h2, 28→40px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: '-0.015em'
  subheading:
    fontFamily: 'Outfit'
    fontSize: '1.25rem'   # h3 / feature titles, 20px
    fontWeight: '600'
    lineHeight: '1.3'
  body:
    fontFamily: 'Outfit'
    fontSize: '1rem'      # 16px floor on mobile — avoids iOS tap-to-zoom
    fontWeight: '400'
    lineHeight: '1.6'
  lead:
    fontFamily: 'Outfit'
    fontSize: 'clamp(1.125rem, 2.5vw, 1.375rem)'  # hero subcopy, 18→22px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'Outfit'
    fontSize: '0.9375rem' # nav links, buttons, locale toggle, 15px
    fontWeight: '500'
    letterSpacing: '0'
  caption:
    fontFamily: 'Outfit'
    fontSize: '0.875rem'  # coming-soon caption, legal meta, footnotes, 14px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  # Mirrors the globals.css radius scale (base --radius: 0.875rem = 14px).
  sm: '0.525rem'   # calc(radius * 0.6) ≈ 8.4px — inputs, small chips
  md: '0.7rem'     # calc(radius * 0.8) ≈ 11.2px — buttons, locale toggle
  lg: '0.875rem'   # radius — cards, consent banner
  xl: '1.225rem'   # calc(radius * 1.4) — feature cards, section panels
  2xl: '1.575rem'  # calc(radius * 1.8) — device mockup frame
  3xl: '1.925rem'  # calc(radius * 2.2)
  full: '9999px'   # pills, app-icon-style avatars
spacing:
  # Tailwind v4 default 4px scale inherited as-is. Marketing rhythm tokens below.
  section-y-mobile: '4rem'   # 64px vertical padding between landing sections (mobile)
  section-y: '6rem'          # 96px (md+)
  gutter: '1.25rem'          # 20px page side margin (mobile); container-padded at md+
  content-max: '72rem'       # 1152px max content width (max-w-6xl)
  prose-max: '42rem'         # 672px max for legal / reading copy
components:
  button-primary:
    background: '{colors.brand}'
    foreground: '{colors.brand-foreground}'
    radius: '{rounded.md}'
    minHeight: '44px'
  app-store-cta:
    note: 'Apple-supplied App Store badge artwork; do not restyle the badge itself. Live = link to APP_STORE_URL. Coming-soon = non-interactive badge + {typography.caption} line in {colors.muted-foreground}.'
  locale-switcher:
    activeForeground: '{colors.brand}'
    inactiveForeground: '{colors.muted-foreground}'
    separator: '{colors.border}'
    radius: '{rounded.md}'
    minTarget: '44px'
  mobile-menu-overlay:
    background: '{colors.paper}'
    foreground: '{colors.ink}'
    note: 'Full-viewport opaque overlay (not a translucent scrim). Large stacked links in {typography.subheading}.'
  device-mockup:
    frame: '{colors.ink}'
    screen: '{colors.card}'
    radius: '{rounded.2xl}'
    note: 'HTML/CSS iPhone frame reproducing Library / Planner / Groceries. Real screenshots may replace these post-v2.'
  feature-card:
    background: '{colors.card}'
    border: '{colors.border}'
    radius: '{rounded.xl}'
  consent-banner:
    background: '{colors.card}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
    note: 'Bottom-anchored, content-non-blocking. Not a full-screen wall.'
---

## Brand & Style

MealLoop's marketing site is the calm front door to a calm product. The premise it sells: stop re-deciding dinner every week — plan from the dishes you already cook, and the grocery list writes itself. The site's job is to make a visitor *understand the product in one calm scroll* and tap the App Store badge.

The product's character is **restraint**, and the site embodies it more strictly than the app does. The guiding instruction for v2: scale *up* in capability (two languages, real SEO, real brand mark, consent) while scaling *down* in noise — faster, quieter, more trustworthy. Warm paper surfaces, a single confident forest green for action, terracotta as an occasional human warmth, and a lot of breathing room. Text-first. No gradients-as-decoration, no chromatic competition, nothing that reads as a "marketing site trying to convert you."

This DESIGN.md does **not** invent a palette. It mirrors the locked MealLoop tokens already in `src/app/globals.css` (themselves a reflection of the iOS app's `DESIGN.md`) and specifies only the marketing-surface delta: the type ramp for landing-page scale, section rhythm, and a handful of site-specific components (App Store CTA, locale switcher, mobile overlay, device mockup, consent banner). The shadcn/ui primitives (Button, Card, Sheet, Dialog) ship as-is except where a component token below overrides them. **The spine wins on conflict with any mock; `globals.css` wins on conflict over hardcoded values — never fork the palette.**

## Colors

The palette is paper-and-green with terracotta warmth. Every token is mirrored from `globals.css`; the marketing surface uses a deliberately small subset.

- **Paper (`#F5F4F1` light / `#1A1816` dark)** is the canvas — a warm off-white, never pure white, so the page reads soft rather than clinical. Pure white (`{colors.card}`) is reserved for raised surfaces: cards and the device-mockup screen.
- **Forest Green (`#3D8A5A` light / `#4FAA70` dark)** is the brand and the single action color. Primary CTA fills, the active locale label, link emphasis, focus ring, and the loop mark. Green means "go / this is the action."
- **Terracotta (`#D89575` light / `#E5A688` dark)** is human warmth, used sparingly — an accent rule, an icon tint, a how-it-works step marker. Never a second CTA color; never competing with green for "the action."
- **Mint (`#C8F0D8` light / `#1F3D2C` dark)** is a soft highlight fill — a quiet badge, a feature-icon backing, a "the loop" emphasis. Low-energy, supportive.
- **Ink (`#1A1918` light / `#F5F4F1` dark)** is body text; **Muted-foreground (`#6D6C6A` / `#B5B3B0`)** is secondary text, captions, the coming-soon line. **Border (`#E5E4E1` / `#34312E`)** is the hairline — the lightest separator that still reads.

Avoid: gradients as decoration, a second saturated CTA color, terracotta-on-green or green-on-terracotta text pairings (contrast fails), and destructive red anywhere on the marketing surface (this is a landing page, not a form).

**Dark mode is OS-driven** (`prefers-color-scheme`), no toggle. Both token sets must pass AA on real devices — the warm-dark set is not an afterthought.

**Light brand green — AA fix (resolved 2026-06-19; see `review-accessibility.md` B1/B2).** The original locked light green `#3D8A5A` failed AA (white-on-green 4.22:1, green-on-paper 3.83:1, green-on-card 4.22:1; need 4.5:1). Decision: **darken the light brand green to `#2E7D4F`** — computed ~5.1:1 white-on-green and ~4.6:1 on paper/card (verify in build). Dark green `#4FAA70` was already compliant and is unchanged. **Required action (outside this spec):** update `src/app/globals.css` light `--brand` and `--ring` to `#2E7D4F`, and flag the iOS app `DESIGN.md` token owner to adopt the same value so app and site remain one system — do not let the web fork the token. With this fix, light-mode AA can be claimed once verified on-device.

## Typography

One family: **Outfit**, a geometric sans, loaded through `--font-sans` (heading and body share it). The marketing ramp leans on weight and size for hierarchy, not on a second family. Headings are `600`; body is `400`; the only "display" moment is the hero `display` role.

- `display` — hero `<h1>` only, fluid 36→56px, tight tracking. One per page.
- `heading` — section `<h2>` (How it works, Features, The loop, screenshots, CTA), fluid 28→40px.
- `subheading` — feature titles, mobile-menu links, legal `<h2>`, 20px.
- `lead` — hero subcopy / section intros, fluid 18→22px.
- `body` — paragraph copy, **16px floor on mobile** (prevents iOS tap-to-zoom), 1.6 line-height.
- `label` — nav links, buttons, locale toggle, 15px / weight 500.
- `caption` — coming-soon line, legal meta, footnotes, 14px in `muted-foreground`.

**Cyrillic requirement (load-bearing).** Outfit is currently loaded with `subsets: ["latin"]` only (`src/app/layout.tsx`). The `/uk` locale renders Ukrainian (Cyrillic) and **requires the `cyrillic` subset** added to the `Outfit()` config, or a vetted Cyrillic-covering fallback in the font stack. Without it, Ukrainian copy falls back to a system font and breaks brand consistency on the exact surface UJ-1 (Olena) lands on.

## Layout & Spacing

Tailwind v4's 4px spacing scale is inherited as-is. The marketing layer adds vertical-rhythm tokens: sections breathe at `{spacing.section-y-mobile}` (64px) on phones, `{spacing.section-y}` (96px) at `md+`. Page side margin is `{spacing.gutter}` (20px) on mobile, resolving to a centered container at `md+`.

Content is single-column and centered within `{spacing.content-max}` (1152px). Reading surfaces — legal pages — narrow to `{spacing.prose-max}` (672px) for line length. No horizontal overflow at any width down to **320px** (hard rule). The device-mockup row may scroll horizontally on the smallest viewports rather than shrink below legibility.

## Elevation & Depth

Inherited from shadcn — minimal. Cards and the device mockup sit on `{colors.card}`, distinguished from `{colors.paper}` by tone and a hairline border, not by heavy shadow. Shadow is reserved for genuine layering: the mobile-menu overlay (full-cover, so effectively no shadow needed) and the consent banner (a single soft shadow lifting it off the page). Hierarchy comes from type and space, not elevation.

## Shapes

The radius scale mirrors `globals.css` (base 14px). Buttons and the locale toggle use `{rounded.md}` (~11px); cards and the consent banner use `{rounded.lg}` (14px); feature cards and section panels use `{rounded.xl}` (~20px); the device mockup frame uses `{rounded.2xl}` (~25px) to read as a phone. Pills (`{rounded.full}`) are reserved for small badges and the app-icon-style mark. The rounding is friendly but not bubbly — soft corners, calm product.

## Components

shadcn primitives ship as-is: **Button** (base), **Card**, **Sheet**, **Dialog**, **Separator**. Marketing-layer specs:

- **Button (primary)** — `{colors.brand}` fill, white text, `{rounded.md}`, min-height 44px. The only filled-green button on a surface is the primary action.
- **App Store CTA** — Apple-supplied badge artwork; never restyle the badge itself. Two states driven by `APP_STORE_LIVE`: **live** → badge links to `APP_STORE_URL`; **coming-soon** → badge is non-interactive (not a dead `#` link) with a `{typography.caption}` line beneath in `{colors.muted-foreground}`: "Coming soon to the App Store" (localized). See EXPERIENCE.md State Patterns.
- **Locale switcher** — inline `EN · УК`, a thin `{colors.border}` separator between. Each label is an independent ≥44×44px tap target (padding + a real gap so adjacent hit areas don't merge; verify at 320px). The active locale carries `{colors.brand}` (the darkened `#2E7D4F`, now AA-compliant) **plus a non-color cue** — underline / weight and `aria-current` — never hue alone (1.4.1). Inactive in `{colors.muted-foreground}`. Lives in the nav (desktop) and inside the mobile overlay.
- **Mobile-menu overlay** — full-viewport **opaque** `{colors.paper}` panel (not a translucent scrim), triggered by the hamburger. Stacked links in `{typography.subheading}`, the App Store CTA, and the locale switcher. Close affordance (`✕`) top-right.
- **Device mockup** — HTML/CSS iPhone frame in `{colors.ink}` with a `{colors.card}` screen, `{rounded.2xl}`, reproducing Library / Planner / Groceries. May be replaced by real screenshots after v2.
- **Feature card** — `{colors.card}` on `{colors.border}` hairline, `{rounded.xl}`; icon backed by a `{colors.mint}` chip.
- **Consent banner** — bottom-anchored `{colors.card}` panel, `{rounded.lg}`, one soft shadow. Content-non-blocking, never full-screen. Visual treatment of accept/decline detailed in EXPERIENCE.md.

Visual references (token-pinned, illustrative — spine wins on conflict): [`mockups/hero.html`](mockups/hero.html), [`mockups/mobile-overlay.html`](mockups/mobile-overlay.html), [`mockups/app-store-cta.html`](mockups/app-store-cta.html).

## Do's and Don'ts

| Do | Don't |
|---|---|
| Mirror `globals.css` tokens; let the spine name the marketing delta | Fork or hardcode a second palette in marketing components |
| Use forest green as the single action color | Introduce a second CTA color or a green/terracotta text pairing |
| Use terracotta + mint sparingly, as warmth/highlight | Use accent colors for chrome, borders, or state badges |
| Keep `display` to one hero `<h1>` per page | Set decorative headings in `display` "to fill space" |
| Hold the 16px body floor and 320px no-overflow rule | Let mobile body drop below 16px or sections overflow at 320px |
| Add Outfit's `cyrillic` subset before shipping `/uk` | Ship Ukrainian copy on a latin-only font load |
| Verify AA in light **and** OS-driven dark on real phones | Treat dark mode as untested because there's no toggle |
