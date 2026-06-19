# Deferred Work

Items intentionally deferred during reviews. Each entry notes its origin.

## Deferred from: code review of 1-1-i18n-scaffolding-localized-route-shell (2026-06-19)

- Dotted unmatched paths render Next's bare default 404, not the branded localized one (`src/app/[locale]/not-found.tsx` / no root `app/not-found.tsx`). The proxy matcher excludes dot-containing paths by design, so e.g. `/foo.bar` falls through to Next's auto `/_not-found` (unstyled). All in-locale navigation 404s render the branded localized page, so AR-16 is satisfied; this is optional polish only. Fix if desired: add a styled root `app/not-found.tsx`. Out of Story 1.1 scope.
