---
stepsCompleted: [1, 2, 3, 4, 5, 6]
status: 'complete'
overallReadiness: 'READY'
inputDocuments:
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/prd.md
  - docs/planning-artifacts/prds/prd-mealloop-2026-06-18/addendum.md
  - docs/planning-artifacts/architecture.md
  - docs/planning-artifacts/epics.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/DESIGN.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/EXPERIENCE.md
  - docs/planning-artifacts/ux-designs/ux-mealloop-2026-06-19/review-accessibility.md
  - docs/project-context.md
project_name: 'MealLoop Marketing Site — v2'
date: '2026-06-19'
---

# Implementation Readiness Assessment Report

**Date:** 2026-06-19
**Project:** MealLoop Marketing Site — v2

## Document Inventory

| Type | File(s) | Status |
|---|---|---|
| PRD | `prds/prd-mealloop-2026-06-18/prd.md` (+ `addendum.md`) | Included — single file, not sharded |
| Architecture | `architecture.md` | Included — whole |
| Epics & Stories | `epics.md` | Included — whole |
| UX Design | `ux-designs/ux-mealloop-2026-06-19/DESIGN.md` + `EXPERIENCE.md` (+ `review-accessibility.md`) | Included — multi-file spec |
| Project Context | `docs/project-context.md` | Included — supplementary (brownfield) |

**Duplicates:** none (no whole-vs-sharded conflicts).
**Missing required documents:** none (PRD, Architecture, Epics, UX all present).
**Excluded as historical/process artifacts:** `reconcile-v2-scope-brief.md`, `review-rubric.md`, `review-technical-feasibility.md`, `.decision-log.md` files.

## PRD Analysis

### Functional Requirements

Grouped under 7 features (PRD §4); 24 total.

- **FR-1: Locale-subpath routing** — every page served under `/en` and `/uk` via next-intl on the App Router; locale-less `/` resolves to a locale; internal links + CTA preserve the active locale.
- **FR-2: First-visit detection + persisted preference** — `/` selects locale from `Accept-Language` (default `en`), redirects, and persists; returning visitors get the persisted locale; explicit `/uk`/`/en` link always wins and updates the preference.
- **FR-3: Locale switcher** — nav control switches locale on the current surface, updates the subpath, persists, indicates the active locale, and meets touch-target/a11y rules.
- **FR-4: Externalized, translated content** — all visible copy + metadata from message catalogs (no hard-coded strings); `uk` complete + voice-compliant; missing `uk` keys fall back to `en` per string.
- **FR-5: Correct per-Locale language attributes** — `<html lang>` matches the active locale on every page.
- **FR-6: Per-Locale metadata** — distinct, language-correct `<title>`/description via the Metadata API from catalogs.
- **FR-7: Canonical + hreflang alternates** — self-referential canonical + `en`/`uk`/`x-default` alternates with correct absolute URLs.
- **FR-8: Locale-aware sitemap + robots** — `sitemap.xml` (both locales + legal) with hreflang; `robots.txt` allows crawl + references sitemap.
- **FR-9: Structured data (JSON-LD)** — Organization + an application entity, schema.org-valid.
- **FR-10: Social cards + OG image** — OG + Twitter metadata per locale backed by a real OG image.
- **FR-11: Semantic heading structure** — single `<h1>` + logical hierarchy, no skipped levels.
- **FR-12: Real Brand mark in nav + footer** — placeholder replaced site-wide, correct light/dark vector rendering.
- **FR-13: Favicon + app icon set** — full favicon + Apple touch icons wired into the head.
- **FR-14: OG / social image** — real OG image at documented dimensions, both locales.
- **FR-15: Mobile navigation menu** — hamburger/sheet below `md` exposing nav links + switcher, accessible open/close.
- **FR-16: Responsive integrity across sections** — no overflow across the breakpoint set, verified at 320px, within CLS budget.
- **FR-17: Touch targets + mobile type scale** — ≥44px targets; body ≥16px on mobile.
- **FR-18: Privacy-friendly analytics** — Vercel Analytics records pageviews per locale, no tracking cookie.
- **FR-19: Conversion + locale event tracking** — CTA click + locale switch as distinct custom events.
- **FR-20: Consent gating** — consent banner gates non-essential cookies/PII; cookieless analytics + FR-19 events run regardless; never blocks content.
- **FR-21: Privacy, Terms, Cookie pages** — per-locale, content from catalogs, describing actual practices.
- **FR-22: Footer legal links resolve** — real pages, no `#`; Privacy URL reusable for App Store.
- **FR-23: Single-source App Store CTA** — every CTA derives from `APP_STORE_URL` (+ derived `APP_STORE_LIVE`).
- **FR-24: Coming-soon state** — calm non-broken affordance while not live, still emits the FR-19 intent event, voice-compliant.

**Total FRs: 24**

### Non-Functional Requirements

From PRD §10 (cross-cutting), §11 (aesthetic/tone/brand), §12 (privacy/compliance).

- **NFR-1: Performance / CWV** — mobile LCP ≤2.5s, CLS ≤0.1, INP ≤200ms; image/font tuned; measured via Vercel Speed Insights / Lighthouse mobile.
- **NFR-2: Responsive baseline** — Tailwind base/sm/md/lg/xl, hard 320px floor, body ≥16px.
- **NFR-3: Accessibility** — WCAG 2.1 AA: landmarks, keyboard-operable nav/menu/switcher, visible focus, ≥44px targets, AA contrast in light + dark.
- **NFR-4: Architecture constraints** — Next.js 16 App Router + RSC, minimal client islands, Tailwind v4 CSS-first `@theme` (no JS config), next-intl.
- **NFR-5: Maintainability** — copy in catalogs; constants single-sourced in `src/lib/site.ts`; CTA single-sourced via `APP_STORE_URL`.
- **NFR-6: Deployment** — Vercel GitHub auto-deploy on `main`; must not break the existing pipeline.
- **NFR-7: SEO hygiene** — one `<h1>` per page, valid structured data, no duplicate-content (canonical + hreflang).
- **NFR-8: Voice & tone** — no exclamation marks/emojis, complete sentences, never blame the user, calm ("sells less"), both languages.
- **NFR-9: Visual brand** — locked palette (light brand AA-fixed to `#2E7D4F`) + Outfit ramp, light-first with dark tokens; extend, never diverge.
- **NFR-10: Privacy / compliance** — cookieless analytics, no PII capture, GDPR/ePrivacy consent posture for EU + Ukrainian audience.

**Total NFRs: 10**

### Additional Requirements

- **Assumptions (§9):** Ukrainian as first-class audience; `en` default + fallback; `Accept-Language` detection; ≥10% CTR target once live; 90-day organic window; standard "good" CWV thresholds; cookieless analytics under legitimate interest.
- **Open questions (§8):** App Store listing date; OG image composition (OQ-2); persisted-preference mechanism (OQ-3, resolved to cookie); legal-page jurisdiction scope; `uk` translation review loop (OQ-5).
- **Success metrics (§7):** SM-1 CTA CTR (north-star), SM-2 organic discoverability, SM-3 bilingual reach, SM-4 mobile quality; counter-metrics SM-C1/C2/C3.
- **Non-goals (§5):** no blog/CMS, no waitlist/email capture, no dark-mode toggle, no locales beyond en/uk, no support surfaces, no net-new logo.

### PRD Completeness Assessment

The PRD is `status: final`, requirements are explicitly numbered (FR-1–24) with testable "Consequences" per FR, NFRs are consolidated, and metrics tie back to FRs. Open questions are tracked and most are resolved downstream (OQ-3 in Architecture; OQ-2/OQ-5 carried into stories as acceptance dependencies). No requirement is left unnumbered or untestable. High completeness; proceeding to coverage validation.

## Epic Coverage Validation

### Coverage Matrix

| FR | Requirement (short) | Epic / Story | Status |
|---|---|---|---|
| FR-1 | Locale-subpath routing | Epic 1 / 1.1 | ✓ Covered |
| FR-2 | First-visit detection + persistence | Epic 1 / 1.2 | ✓ Covered |
| FR-3 | Locale switcher | Epic 1 / 1.5 | ✓ Covered |
| FR-4 | Externalized, translated content | Epic 1 / 1.3, 1.4 | ✓ Covered |
| FR-5 | Per-locale `<html lang>` | Epic 1 / 1.1, 1.4 | ✓ Covered |
| FR-6 | Per-locale metadata | Epic 3 / 3.2 | ✓ Covered |
| FR-7 | Canonical + hreflang | Epic 3 / 3.2 | ✓ Covered |
| FR-8 | Sitemap + robots | Epic 3 / 3.3 (+ 5.2 extends) | ✓ Covered |
| FR-9 | JSON-LD structured data | Epic 3 / 3.4 | ✓ Covered |
| FR-10 | Social cards + OG image | Epic 3 / 3.5 | ✓ Covered |
| FR-11 | Semantic heading structure | Epic 3 / 3.1 | ✓ Covered |
| FR-12 | Real brand mark | Epic 2 / 2.1 | ✓ Covered |
| FR-13 | Favicon + app icon set | Epic 2 / 2.2 | ✓ Covered |
| FR-14 | OG / social image | Epic 2 / 2.3 | ✓ Covered |
| FR-15 | Mobile navigation menu | Epic 4 / 4.1 | ✓ Covered |
| FR-16 | Responsive integrity to 320px | Epic 4 / 4.2 | ✓ Covered |
| FR-17 | Touch targets + type scale | Epic 4 / 4.1, 4.3 | ✓ Covered |
| FR-18 | Cookieless analytics | Epic 6 / 6.1 | ✓ Covered |
| FR-19 | CTA + locale event tracking | Epic 6 / 6.2, 6.3 | ✓ Covered |
| FR-20 | Consent gating | Epic 6 / 6.4 | ✓ Covered |
| FR-21 | Privacy/Terms/Cookie pages | Epic 5 / 5.1 | ✓ Covered |
| FR-22 | Footer legal links resolve | Epic 5 / 5.2 | ✓ Covered |
| FR-23 | Single-source App Store CTA | Epic 6 / 6.2 | ✓ Covered |
| FR-24 | Coming-soon state | Epic 6 / 6.2 | ✓ Covered |

### Missing Requirements

None. All 24 PRD FRs map to at least one story with addressing acceptance criteria. No phantom requirements found (epics also track Additional/Architecture requirements AR-1–16 and UX-DR-1–21, which are supplementary, not unmapped FRs).

### Coverage Statistics

- Total PRD FRs: **24**
- FRs covered in epics: **24**
- Coverage percentage: **100%**

## UX Alignment Assessment

### UX Document Status

**Found** — `DESIGN.md` (visual identity/tokens/components), `EXPERIENCE.md` (IA, behavior, states, i18n, a11y floor, flows), and `review-accessibility.md` (WCAG 2.1 AA audit). Both specs are `status: final`.

### UX ↔ PRD Alignment

- **Strong.** `EXPERIENCE.md` cites the PRD + addendum as sources; its key flows map 1:1 to the PRD journeys (Flow 1 Olena = UJ-1, Flow 2 Mark = UJ-2). All seven PRD feature areas (i18n, SEO, brand, mobile, analytics/consent, legal, conversion) are reflected in the UX spec, and the UX-DR18 voice rule is applied consistently across hero/Coming-soon/consent/legal copy.
- No UX requirement contradicts the PRD; the UX spec elaborates PRD behavior rather than diverging from it.

### UX ↔ Architecture Alignment

- **Strong.** The Architecture explicitly lists `DESIGN.md`/`EXPERIENCE.md` as inputs and **codifies the EXPERIENCE.md accessibility contract verbatim** into its implementation patterns (mobile overlay `role="dialog"` + focus trap + return-focus; locale switcher ≥44px + `aria-current` + non-color cue; Coming-soon `role="img"`; ≥2px focus ring; reduced-motion static frame). Every UX client island (LocaleSwitcher, MobileMenu/Sheet, ConsentBanner, analytics) maps to a concrete file.
- Architecture supports the UX performance contract (static prerender + Speed Insights for CWV; Outfit `cyrillic` subset for `/uk` brand fidelity).

### Alignment Issues (minor — none blocking)

1. **Brand-green hex inconsistency.** PRD §11 still names the original `#3D8A5A`; `DESIGN.md`, Architecture, `epics.md`, and `project-context.md` use the AA-fixed `#2E7D4F`. The fix is fully documented (a11y review B1/B2) and propagated to every build-facing doc. *Recommendation:* add a one-line note to PRD §11 pointing at the AA fix, or accept as a known, resolved supersedence.
2. **Dark-mode AA claim is aspirational.** The UX a11y floor asserts "light and dark verified AA," but `review-accessibility.md` downgrades dark to "to verify" and OS-driven dark is a **deferred stretch** (PRD §5 non-goal + Architecture "deferred"). Scope is internally consistent (dark is not a v2 commitment); just don't treat dark-mode AA as shipped. `project-context.md` already flags that `.dark` is unwired in code.

### Warnings

- **No missing UX documentation** — the site is user-facing and the UX spec is complete and first-class.
- **Open dependencies (tracked, not gaps):** OG composition (OQ-2 → UX-DR-20), `uk` native-speaker review (OQ-5 → UX-DR-21), and Vercel Pro for custom events (AR-7) are carried into stories as acceptance dependencies.

## Epic Quality Review

Reviewed against the create-epics-and-stories standards: user value, epic independence, no forward dependencies, story sizing, AC quality, and brownfield handling.

### Best-Practices Compliance Checklist

| Check | Result |
|---|---|
| Each epic delivers user (or maintainer) value, not a pure technical milestone | ✅ Pass (2 minor notes) |
| Each epic functions independently of *future* epics | ✅ Pass |
| Stories appropriately sized for a single dev agent | ✅ Pass (1 minor note) |
| No forward story dependencies within an epic | ✅ Pass |
| Database/entity creation only when needed | ✅ N/A — no datastore; catalogs created in 1.3/1.4 when needed |
| Acceptance criteria in Given/When/Then, testable, FR-tagged | ✅ Pass |
| Traceability to FRs maintained | ✅ Pass (100%, per Step 3) |
| Starter-template / brownfield handling correct | ✅ Pass — no starter (AR-1); Epic 1.1 extends the existing v1 repo |

### Dependency Analysis

- **Epic graph:** `1 → (2 → 3)`, `1 → 4`, `1 → 5 → 6`. No epic requires a *future* epic; all cross-epic dependencies point backward (Epic 3 consumes Epic 2's OG image/logo; Epic 6 links Epic 5's Cookie Policy; both ordered after their dependency).
- **Within-epic:** every story builds only on earlier stories in its epic. Verified per epic (e.g. 1.5 switcher needs 1.1 routing + 1.3/1.4 catalogs — all prior; 2.2/2.3 need 2.1's locked assets; 6.2/6.3 need 6.1 infra).
- **Cross-epic component augmentation (not forward deps):** Story 6.3 adds a `track()` call to the Epic-1 switcher; Story 5.2 extends the Epic-3 sitemap. Both are backward-sequenced additions to already-built artifacts.

### Findings by Severity

🔴 **Critical violations:** None.

🟠 **Major issues:** None.

🟡 **Minor concerns (accept or optionally refine — none blocking):**

1. **Story 1.1 is the heaviest, bundling multiple concerns** (next-intl scaffolding + `app/[locale]` restructure + `proxy.ts` + `metadataBase`/`SITE_ORIGIN` + the `#2E7D4F` AA token fix + Outfit config). Justified by AR-2 (i18n scaffolding mandated as the first story) and it produces user-visible output (`/en`,`/uk` render). *Optional remediation:* a dev agent may split the AA token fix (UX-DR-1) and `SITE_ORIGIN`/`metadataBase` wiring into a small companion setup story if 1.1 proves too large in practice.
2. **Maintainer-value stories (6.1 analytics infra, 6.3 locale event; partially 1.3 copy externalization)** are framed as "As the maintainer (Bogdan)" rather than end-user value. Legitimate for a measurement/infra epic (PRD §4.5, SM-1/SM-3) and not a technical-milestone-as-epic violation, but worth noting they deliver stakeholder rather than end-user value.
3. **Two FRs are intentionally split across stories** — FR-19 (6.2 CTA event + 6.3 locale event) and FR-8 (3.3 base sitemap + 5.2 legal entries). Coverage is complete, but each is only "done" when both stories ship; sprint sequencing should keep the pairs in mind.

### Remediation Guidance

No remediation required to proceed. The three minor notes are advisory: keep Story 1.1 as-is unless the implementing agent finds it unwieldy, and track the split-FR pairs (FR-8, FR-19) so neither is marked complete prematurely.

## Summary and Recommendations

### Overall Readiness Status

**READY** — clear to proceed to Phase 4 (Sprint Planning → story cycle).

The planning set is internally consistent and complete: all 24 FRs trace to stories (100% coverage), the UX spec is first-class and its accessibility contract is codified verbatim into the Architecture, and the epic/story structure passes the quality bar with no critical or major violations. The only findings are minor doc-hygiene notes and tracked external dependencies — none block implementation.

### Critical Issues Requiring Immediate Action

**None.** No blockers identified.

### Findings Tally

- 🔴 Critical: 0
- 🟠 Major: 0
- 🟡 Minor: 5 (2 UX doc-consistency + 3 epic-quality advisories)
- Tracked external/sequencing dependencies (not gaps): 3 (brand-asset lock, Vercel Pro, OG composition / `uk` review)

### Recommended Next Steps

1. **Sequence the critical path first.** Lock the iOS brand assets (`brand-logo.svg`/`AppIcon.png`, AR-8) before starting Epic 2 — favicons (FR-13), the OG image (FR-14), and the JSON-LD logo (FR-9) all derive from them, and the OG image gates Epic 3's social cards.
2. **Confirm the Vercel plan (AR-7)** before relying on Epic 6's custom events — `app_store_cta_click`/`locale_switch` need Vercel Pro, or fall back to the documented Plausible option.
3. **(Optional, cosmetic) Reconcile the brand-green hex in PRD §11** (`#3D8A5A`) with the AA-fixed `#2E7D4F` used everywhere else, or accept it as a documented supersedence.
4. **Resolve the two carried open questions during their stories** — OG composition (OQ-2 → UX-DR-20) and `uk` native-speaker review (OQ-5 → UX-DR-21).
5. **Proceed to `bmad-sprint-planning`** to produce the sprint plan, then run the story cycle (`bmad-create-story` → validate → `bmad-dev-story` → `bmad-code-review`), respecting the epic order `1 → (2 → 3), 4, 5 → 6`.

### Final Note

This assessment reviewed 4 document sets across 5 validation dimensions and identified 5 minor issues and 0 blockers. The artifacts may be used as-is for implementation; the recommendations above are sequencing and hygiene improvements, not prerequisites.

**Assessor:** Implementation Readiness workflow (PM/traceability lens) · **Date:** 2026-06-19
