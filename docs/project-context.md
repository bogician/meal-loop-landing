---
project_name: 'MealLoop Marketing Site — v2'
user_name: 'Bogdan'
date: '2026-06-19'
sections_completed: ['technology_stack', 'framework_rules', 'styling_tokens', 'code_organization', 'configuration', 'quality_gate', 'known_gaps']
existing_patterns_found: 17
status: 'complete'
rule_count: 21
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Next.js 16.2.9** — App Router + RSC + Turbopack. ⚠️ Next 16 has breaking changes vs. older versions: **middleware is renamed to `proxy.ts`**. Per `AGENTS.md`, consult `node_modules/next/dist/docs/` before writing framework code and heed deprecation notices.
- **React 19.2.4 / react-dom 19.2.4**
- **TypeScript 5** — `strict: true`, `noEmit`, `moduleResolution: "bundler"`, path alias `@/*` → `src/*`.
- **Tailwind CSS v4** — CSS-first via `@tailwindcss/postcss`. **No `tailwind.config.js`**; theme lives in `src/app/globals.css` under `@theme inline`. `tw-animate-css` for animation utilities.
- **shadcn 4.11.0 on `@base-ui/react` 1.6.0** — built on **Base UI, not Radix**. Style preset `base-nova`; icons `lucide-react` 1.21.
- **`class-variance-authority` 0.7.1** + **`tailwind-merge` 3.6 + `clsx` 2.1** via `cn()`.
- **`motion` 12.40** — imported from `motion/react` (the `motion` package, not `framer-motion`).
- **ESLint 9** flat config (`eslint-config-next` core-web-vitals + typescript). **No test framework configured.**
- **Deploy:** Vercel via GitHub auto-deploy on push to `main`.

## Critical Implementation Rules

### Next.js 16 / Framework
- **Read the bundled docs first.** `AGENTS.md` mandates this is not the Next.js in your training data — check `node_modules/next/dist/docs/` for the relevant area before writing routing/metadata/middleware code.
- **Middleware → `proxy.ts`.** Request-time logic (locale negotiation, redirects) goes in `proxy.ts` at the repo root, not `middleware.ts`.
- **RSC by default.** The only client island is `src/components/motion.tsx` (`'use client'`); `hero.tsx` is client only because it uses `motion` directly. Don't add `'use client'` without a real reason.
- **Turbopack root is pinned** in `next.config.ts` (`turbopack.root = __dirname`) to stop a stray home-dir lockfile from mis-inferring the workspace root — don't remove it.

### Styling & Tokens (Tailwind v4 + Base UI)
- **Never hardcode hex.** Use tokens from `globals.css` `@theme`: `bg-brand`, `text-brand-foreground`, `bg-warm`, `bg-mint`, `bg-paper`, plus shadcn tokens (`bg-primary`, `text-muted-foreground`, `border-border`, `ring-ring`). `--brand` and `--primary` are the same forest green.
- **No JS Tailwind config.** Extend tokens in `globals.css` `@theme inline`; never reintroduce `tailwind.config.js` (`components.json` sets `tailwind.config: ""`).
- **Merge classes with `cn()`** from `@/lib/utils` (`twMerge(clsx(...))`).
- **shadcn primitives import from `@base-ui/react/*`** (e.g. `@base-ui/react/button`), prop types like `ButtonPrimitive.Props`. Do **not** import `@radix-ui/*`. Variants via `cva` (see `ui/button.tsx`).
- **Dark mode is a `.dark` class variant** (`@custom-variant dark (&:is(.dark *))`) — **not** wired to `prefers-color-scheme`, and nothing toggles `.dark` today. Dark tokens exist but are dormant. DESIGN.md/architecture call dark "OS-driven"; that wiring does not exist yet — don't assume it works.
- **Radius scale** derives from `--radius: 0.875rem` via `calc()` (`rounded-md`/`lg`/`xl`/`2xl`).

### Code Organization & Naming
- **Files kebab-case** (`how-it-works.tsx`); **exports PascalCase** (`Nav`, `AppStoreButton`); hooks/functions camelCase.
- **Layout:** sections in `src/components/sections/`; shadcn primitives in `src/components/ui/`; cross-cutting widgets in `src/components/`; logic in `src/lib/`; hooks in `src/hooks/` (alias set, dir not yet created).
- **Style:** double-quoted imports, semicolons in app code; leave shadcn-generated `ui/*` and `utils.ts` as the generator produced them (no semicolons).

### Single-Sourced Configuration
- **All site constants live in `src/lib/site.ts`:** `APP_STORE_URL` (currently `"#"`), `APP_STORE_LIVE` (`APP_STORE_URL !== "#"`), `SITE`, `NAV_LINKS`. Every App Store CTA derives from `APP_STORE_URL` — flip the whole site live by changing one value. No inline external URLs/origins in components.

### Quality Gate (lean — no automated tests in v2)
- Gate = `tsc --noEmit` (via `next build`) + `eslint`. **No test runner exists** — don't assume Jest/Vitest. If a test is added, co-locate `*.test.tsx` (no `__tests__/` tree).
- Responsive/a11y verification is **manual** across 320 / 360 / 390 / 768 px.

### Known v1→v2 Gaps (don't mistake for finished)
- `APP_STORE_URL = "#"` → CTAs in `nav.tsx` / `app-store-button.tsx` are currently dead `#` links (v2 adds Coming-soon).
- `layout.tsx`: Outfit is `subsets: ["latin"]` only (v2 adds `cyrillic`); `<html lang="en">` hardcoded (v2 → per-locale); inline metadata, **no `metadataBase`** (v2 single-sources `SITE_ORIGIN`).
- Light `--brand`/`--primary`/`--ring` = `#3d8a5a`; the v2 AA fix to `#2E7D4F` is **not yet applied**.
- Nav links hidden under `md` with **no mobile menu**; `LoopMark`/`Logo` is a placeholder.
- No i18n yet (no `next-intl`, `proxy.ts`, `app/[locale]`, or `messages/`).

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow all rules exactly; when in doubt, prefer the more restrictive option.
- Cross-check `docs/planning-artifacts/architecture.md` for v2 structural decisions and `docs/planning-artifacts/epics.md` for the story-by-story plan.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when the technology stack or conventions change; retire the "Known v1→v2 Gaps" entries as each is resolved.

Last Updated: 2026-06-19
