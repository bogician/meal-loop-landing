# Input Reconciliation — v2 Scope Brief vs. PRD + Addendum

Pass date: 2026-06-18
Inputs reconciled:
- Seed: `docs/v2-scope-brief.md`
- PRD: `docs/planning-artifacts/prds/prd-mealloop-2026-06-18/prd.md`
- Addendum: `docs/planning-artifacts/prds/prd-mealloop-2026-06-18/addendum.md`

Method: each brief item checked for representation in PRD or addendum. Gaps below are brief content that is **missing**, **weakened**, or **contradicted**. Items judged fully carried over are not listed; a coverage note for each pillar/section closes the file.

---

## Gaps

### Repo / deployment identity

- **Gap R-1 — Repo name contradiction.**
  - Brief location: §"Tech & deployment constraints" line 81 (`github.com/bogician/meal-loop-landing`) and §Context line 11 (this repo is `mealloop-web`).
  - Issue: **Contradicted/ambiguous.** The brief itself names two different repo identities — the working dir is `mealloop-web` but the deploy repo is stated as `meal-loop-landing`. PRD §0 says "this repo `mealloop-web`" while PRD §10 / addendum repeat `github.com/bogician/meal-loop-landing`. The PRD carried the inconsistency forward instead of resolving it.
  - Severity: **low**
  - Suggested fix: Add one line confirming the GitHub remote name vs. local dir name so the auto-deploy target is unambiguous.

### Pillar 1 — SEO

- **Gap S-1 — Three JSON-LD types collapsed to two.**
  - Brief location: §"1. SEO" line 47 ("Organization / SoftwareApplication / MobileApplication").
  - Issue: **Weakened.** Brief lists three structured-data entities; PRD FR-9 says "Organization and an application type" and the addendum explicitly de-selects `MobileApplication` as "less-standard." This is a reasonable decision, but the brief's third named type was dropped rather than acknowledged as deliberately rejected in the PRD body.
  - Severity: **low**
  - Suggested fix: Note in FR-9 that `MobileApplication` was considered and rejected (pointer to addendum), so the brief item is visibly accounted for, not silently lost.

### Pillar 2 — Internationalization

- **Gap I-1 — Default locale + fallback "defined" is asserted but not differentiated.**
  - Brief location: §"2. Internationalization" line 56 ("Default locale + fallback behavior defined").
  - Issue: **Partially weakened.** PRD §3/§9 set `en` as both default and fallback. The brief lists default *and* fallback as two behaviors to define; the PRD conflates them ("`en` is the Default locale and fallback"). No spec for what happens when a `uk` catalog key is missing (string-level fallback to `en`?). Catalog-completeness is asserted (FR-4) but missing-key fallback behavior is undefined.
  - Severity: **med**
  - Suggested fix: Add a consequence to FR-4 specifying per-string fallback to `en` when a `uk` key is absent (or assert catalogs are exhaustively validated at build).

### Pillar 3 — Brand / real logo

- **Gap B-1 — "Designed fresh in Figma / commissioned" path fully dropped.**
  - Brief location: §"3. Brand" line 61 ("Likely designed in Figma (the Figma MCP is available) or commissioned; export SVG + PNG") and Open Question 3 (line 93: "design fresh in Figma now, or ship a refined interim wordmark and design the mark later").
  - Issue: **Weakened/narrowed.** The PRD resolved this to "reuse and adapt the iOS app's existing assets, no net-new design" (§5 non-goal, §4.3). That is a legitimate resolution, but the brief left fresh-design as a live option and explicitly flagged the Figma MCP as available. The PRD's decision to reuse iOS assets is sound; the gap is that the *interim-wordmark-vs-design-later* nuance and the Figma option are not even mentioned as rejected alternatives.
  - Severity: **low**
  - Suggested fix: One sentence in addendum "Brand assets" noting fresh Figma design / commission was considered and rejected in favor of reusing locked iOS assets.

- **Gap B-2 — "real logo" assumed locked; brief never asserted it exists.**
  - Brief location: §"3. Brand" lines 59–61 — the brief frames the logo as something to *produce* ("Replace the placeholder... a real logo: wordmark + mark, light/dark variants").
  - Issue: **Assumption inserted.** The PRD/addendum assume a finished `brand-logo.svg` already exists in the iOS repo to adapt. The brief did not state the iOS app has a final mark — it described producing one. If `brand-logo.svg` is itself a placeholder/WIP, the whole "reuse, don't redraw" plan and the `[NOTE FOR PM]` in FR-13 collapse.
  - Severity: **med**
  - Suggested fix: Elevate the FR-13 `[NOTE FOR PM]` to an Open Question / launch dependency: confirm the iOS `brand-logo.svg` is final before deriving favicon + OG set.

### Pillar 4 — Mobile-friendliness

- (No material gap — see coverage note.)

### Pillar 5 — Analytics + consent

- **Gap A-1 — Plausible / EU data-residency angle demoted out of PRD body.**
  - Brief location: §"5. Analytics + consent" line 71 ("Plausible (EU/cookieless)") and Open Question 4 (line 94).
  - Issue: **Weakened.** Resolved to Vercel Analytics; Plausible kept only as an addendum fallback. The brief's specific *EU/Ukrainian data-residency* motivation for Plausible is a real consideration for this exact audience and now lives only in the addendum, not in the PRD's §12 privacy posture. Acceptable as a decision, but the data-residency tradeoff is invisible to a PRD-only reader.
  - Severity: **low**
  - Suggested fix: One line in §12 noting analytics is cookieless but US-hosted (Vercel); EU data residency is an addendum-tracked revisit trigger.

### Brand / Voice source-of-truth references

- **Gap V-1 — Voice source path is referenced but not version/section-pinned.**
  - Brief location: §"Source of truth for brand & voice" lines 36–38 (`../MealLoop/docs/microcopy-voice.md` UX-DR18) and line 34 (DESIGN.md path).
  - Issue: **Carried, minor weakening.** PRD §11/§0 reference both files and the five UX-DR18 rules verbatim — good coverage. The DESIGN.md path in the brief is elided (`.../ux-designs/.../DESIGN.md`); the PRD repeats the elision rather than resolving the concrete path. Low risk since globals.css already reflects it.
  - Severity: **low**
  - Suggested fix: Resolve the concrete DESIGN.md path once in the addendum for downstream UX/architecture work.

- **Note V-2 — UX-DR18 application scope is actually *strengthened* (not a gap).** PRD §11 extends the voice rules explicitly to Coming-soon, consent, and legal copy, and adds counter-metric SM-C3 (no keyword-stuffing). This over-delivers on the brief.

### Out-of-scope items

- **Note O-1 — All three brief out-of-scope items are carried (PRD §5):** blog/CMS/multi-page, waitlist/email capture, user-facing dark-mode toggle. The PRD also adds non-goals (support/help surfaces, net-new logo). No gap. Minor nuance: brief calls dark-mode toggle an "optional stretch (tokens exist)"; PRD §5/§6.2 keep it a stretch — consistent.

### The five "open questions for the PRD to resolve"

All five brief open questions (lines 91–95) were addressed; the gap is that **the PRD opened five *new* open questions (§8) and did not visibly close the brief's five as a checklist**, making it hard to confirm each was resolved:

- **Gap Q-1 — Brief OQ1 (i18n routing + default locale):** Resolved (subpath + `en` default, FR-1/FR-2). Covered. No gap.
- **Gap Q-2 — Brief OQ2 (uk copy authorship):** Resolved to "AI-assisted, Bogdan-reviewed" (FR-4 desc). PRD §8.5 reopens whether a *second native reviewer* is wanted — consistent extension. No gap.
- **Gap Q-3 — Brief OQ3 (logo: fresh vs. interim):** Resolved to reuse iOS assets — see Gap B-1 (option dropped, not shown as rejected). Severity low.
- **Gap Q-4 — Brief OQ4 (analytics tool):** Resolved to Vercel — see Gap A-1. Severity low.
- **Gap Q-5 — Brief OQ5 (legal pages authorship):** Brief asks *who drafts them*; PRD says "drafted from a template... reviewed by Bogdan" (FR-21) but never names the **author/owner**. The "who" is left implicit (presumably Bogdan/AI). PRD §8.4 reopens *jurisdiction scope* but not authorship.
  - Severity: **med**
  - Suggested fix: Name the legal-page drafting owner explicitly (e.g. "AI-drafted, Bogdan-reviewed; no lawyer in v2") in FR-21 or §8, matching how uk authorship was resolved.

---

## Coverage summary (carried over cleanly)

- **All five v2 pillars** map to PRD features: SEO→§4.2, i18n→§4.1, Brand→§4.3, Mobile→§4.4, Analytics+consent→§4.5 (plus §4.6 Legal, §4.7 CTA broken out — an improvement).
- **SEO sub-bullets** (per-locale metadata, canonical+hreflang, sitemap/robots, JSON-LD, semantic headings, OG/Twitter, CWV-as-SEO-input) all present FR-6–FR-11 + §10.
- **i18n sub-bullets** (subpath routing, next-intl, switcher, `<html lang>`, externalized catalogs) all present FR-1–FR-5; addendum confirms next-intl + middleware.
- **Mobile sub-bullets** (responsive QA, hamburger/sheet, ≥44px, no h-overflow, mobile type, mobile perf) all present FR-15–FR-17 + §10.
- **Analytics sub-bullets** (Vercel/Plausible, consent banner, CTA + locale events, legal pages) present FR-18–FR-22.
- **Tech constraints** (App Router + RSC, minimal client comps, Tailwind v4 `@theme` no JS config, Vercel auto-deploy) present §10.
- **v1 current-state facts** (stack, sections list, mockups, palette, `APP_STORE_URL` constant, placeholder LoopMark) all reflected in PRD §1, §4, glossary.

## Net assessment

No **high-severity** gaps. Strongest items to address: **B-2 / Q-5** (unconfirmed logo-asset finality; unnamed legal-page author) and **I-1** (missing-key fallback behavior) — each med. The remaining gaps are low-severity "rejected alternative not visibly acknowledged" cases (S-1, B-1, A-1) and the repo-name inconsistency (R-1) the brief itself introduced.
