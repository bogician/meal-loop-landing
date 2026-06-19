# Deferred Work

Items intentionally deferred during reviews. Each entry notes its origin.

## Deferred from: code review of 1-1-i18n-scaffolding-localized-route-shell (2026-06-19)

- Dotted unmatched paths render Next's bare default 404, not the branded localized one (`src/app/[locale]/not-found.tsx` / no root `app/not-found.tsx`). The proxy matcher excludes dot-containing paths by design, so e.g. `/foo.bar` falls through to Next's auto `/_not-found` (unstyled). All in-locale navigation 404s render the branded localized page, so AR-16 is satisfied; this is optional polish only. Fix if desired: add a styled root `app/not-found.tsx`. Out of Story 1.1 scope.

## Deferred from: code review of 1-2-first-visit-detection-persisted-preference (2026-06-19)

- 1-year persistent `NEXT_LOCALE` cookie (`src/i18n/routing.ts:16-18`) creates downstream consent/disclosure obligations. Story 1.2 deliberately classifies it essential/consent-exempt (AC-7), so no action now — but the consent banner (Epic 6.4) must not gate it, and the Cookie-Policy page (Epic 5.1) must disclose the exact cookie name (`NEXT_LOCALE`) and 1-year lifetime. Out of Story 1.2 scope.

## Deferred from: code review of 1-4-ukrainian-catalog-cyrillic-typography (2026-06-19)

- Loop-node pills may overflow/overlap at 320px with the longer Ukrainian labels ("Повторювати" 11ch, "Планувати" 9ch). `src/components/sections/loop.tsx` positions fixed auto-width pills at a 120px radius inside a `w-72` (288px) container with no `max-width`/`whitespace-nowrap`. The geometry is index-based so there's no functional break — cosmetic only. Needs a manual responsive browser pass at 320/360/390/768px on `/uk` (already tracked as an outstanding human verification in Story 1.4 Task 4). Out of Story 1.4's code scope.
- Planning docs still name Outfit as the brand font and assume it supports Cyrillic: `docs/planning-artifacts/DESIGN.md`, `architecture.md`, `epics.md`, `prd.md`, and `docs/project-context.md` (line 60, the now-stale "Known v1→v2 Gaps" font note, incl. the now-impossible "add Outfit's `cyrillic` subset"). Story 1.4 swapped the brand font site-wide to Manrope per Bogdan's approval. Reconcile these docs to Manrope via a correct-course / docs pass so the discrepancy doesn't resurface. Out of Story 1.4's code scope.
