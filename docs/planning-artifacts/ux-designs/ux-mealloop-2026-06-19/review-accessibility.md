# Accessibility Review — MealLoop Marketing Site (v2)

Reviewer lens: WCAG 2.1 AA + inclusive interaction behavior. Scope: the two specs (`DESIGN.md`, `EXPERIENCE.md`) as built-intent, not code.
Reviewed: 2026-06-19. Sources: `./DESIGN.md`, `./EXPERIENCE.md`.

## Verdict

Strong, accessibility-literate spec — but it cannot ship its own AA claim as written: **two locked light-mode pairings fail AA for normal text and the brand focus ring fails the 3:1 UI-component minimum**, and three behavioral items (Coming-soon semantics, locale-toggle target geometry, focus-ring contrast) are under-specified.

## Contrast computations

Relative luminance per WCAG: `L = 0.2126·R + 0.7152·G + 0.0722·B`, where each channel `c8/255` is linearized as `c/12.92` if `≤0.03928` else `((c+0.055)/1.055)^2.4`. Ratio = `(L_light+0.05)/(L_dark+0.05)`. Required: 4.5:1 normal text, 3:1 large text (`≥24px`, or `≥18.66px` bold) and UI components / focus indicators (1.4.11).

| Pairing | Ratio | Required | Pass/Fail |
|---|---|---|---|
| **LIGHT** ink `#1A1918` on paper `#F5F4F1` | 15.96:1 | 4.5 | PASS |
| LIGHT ink `#1A1918` on card `#FFFFFF` | 17.56:1 | 4.5 | PASS |
| LIGHT muted-fg `#6D6C6A` on paper `#F5F4F1` | 4.77:1 | 4.5 | PASS (marginal) |
| LIGHT muted-fg `#6D6C6A` on card `#FFFFFF` | 5.25:1 | 4.5 | PASS |
| LIGHT coming-soon caption (muted-fg on paper, 14px) | 4.77:1 | 4.5 | PASS (marginal) |
| LIGHT brand-fg white `#FFFFFF` on brand `#3D8A5A` | **4.22:1** | 4.5 | **FAIL** (normal text) |
| LIGHT mint-fg `#1F3D2C` on mint `#C8F0D8` | 9.60:1 | 4.5 | PASS |
| LIGHT brand-as-text `#3D8A5A` on paper `#F5F4F1` (active locale, link) | **3.83:1** | 4.5 | **FAIL** (normal text) |
| LIGHT brand-as-text `#3D8A5A` on card `#FFFFFF` | **4.22:1** | 4.5 | **FAIL** (normal text) |
| LIGHT focus ring brand `#3D8A5A` on paper `#F5F4F1` | **3.83:1** | 3.0 | PASS (UI), see note |
| **DARK** ink `#F5F4F1` on paper `#1A1816` | 16.10:1 | 4.5 | PASS |
| DARK muted-fg `#B5B3B0` on paper `#1A1816` | 8.46:1 | 4.5 | PASS |
| DARK muted-fg `#B5B3B0` on card `#221F1C` | 7.84:1 | 4.5 | PASS |
| DARK coming-soon caption (muted-fg on paper, 14px) | 8.46:1 | 4.5 | PASS |
| DARK brand-fg `#1A1816` on brand `#4FAA70` | 6.17:1 | 4.5 | PASS |
| DARK mint-fg `#F5F4F1` on mint `#1F3D2C` | 10.84:1 | 4.5 | PASS |
| DARK brand-as-text `#4FAA70` on paper `#1A1816` (active locale, link) | 6.17:1 | 4.5 | PASS |
| DARK brand-as-text `#4FAA70` on card `#221F1C` | 5.71:1 | 4.5 | PASS |
| DARK focus ring brand `#4FAA70` on paper `#1A1816` | 6.17:1 | 3.0 | PASS |

Notes on the math:
- **White on light brand green = 4.22:1** is below the 4.5 normal-text floor. This is the single filled primary button (`DESIGN.md` `button-primary`, `components.button-primary.foreground = brand-foreground`). The button label is 15px weight-500 (`label` role) — that is *not* WCAG "large text" (needs `≥18.66px` bold or `≥24px`), so 4.5 applies and it FAILS. The dark equivalent (ink on `#4FAA70`) is fine at 6.17:1.
- **Brand green as text/foreground in light = 3.83:1 on paper, 4.22:1 on card.** `DESIGN.md` `locale-switcher.activeForeground = brand` and the Colors section assigns brand to "the active locale label, link emphasis." At `label` 15px / nav-link size these are normal text and FAIL both surfaces. Dark mode passes comfortably.
- **Focus ring at 3.83:1 (light)** technically clears the 3:1 non-text/UI minimum (1.4.11) *only if* the ring is a solid ≥2px adjacent indicator against paper and the adjacent component itself is also discernible. It is below 4.5, so if the ring is thin or sits against the white card (where brand drops to 4.22:1, still ≥3 but tighter), it gets marginal. The spec never states ring thickness or offset — see SHOULD-FIX.
- Marginal passes (muted-fg 4.77:1 / caption 4.77:1) clear AA but have almost no headroom; sub-pixel rendering, font-smoothing differences, or any future paper-tone tweak could push them under. Worth knowing, not a blocker.

---

## BLOCKER

**B1 — Primary CTA / button label contrast fails AA in light mode (4.22:1).**
Location: `DESIGN.md` frontmatter `colors.brand-foreground: #FFFFFF` + `components.button-primary` (white on `#3D8A5A`), and Components → "Button (primary) — brand fill, white text." Body Colors: "Forest Green … Primary CTA fills."
Why it matters: white-on-`#3D8A5A` = 4.22:1 < 4.5 for 15px label text. Every filled green button on the marketing surface fails. (Note: the App Store badge itself is Apple artwork and exempt, but any *other* primary button — and the "live" CTA wrapper if it adds a styled label — is affected.)
Recommendation: Darken the light brand to reach 4.5:1 against white text (e.g. around `#3A8456`/`#367E51` gets ≥4.5 — verify the exact value), OR restrict white-on-green to large-text/icon-only contexts. Because the palette is explicitly locked and mirrored from `globals.css` ("never fork the palette"), this must be resolved *upstream in `globals.css`/the iOS source*, not patched in the marketing layer — flag to the token owner. The spec's own Do's-and-Don'ts says "Verify AA in light and dark"; this pairing was not verified.

**B2 — Brand green as foreground text fails AA in light mode (3.83:1 on paper, 4.22:1 on card).**
Location: `DESIGN.md` Colors ("the active locale label, link emphasis"), `components.locale-switcher.activeForeground: {colors.brand}`, and `EXPERIENCE.md` Component Patterns → Locale switcher ("active label emphasized").
Why it matters: The active locale label and any "link emphasis" rendered in `#3D8A5A` is normal-size text below 4.5:1. The locale switcher is one of only two interactive text controls on the page, so this is on a critical path (UJ-1 Olena switches to Ukrainian).
Recommendation: Same upstream brand-green darkening as B1 resolves both at once. Alternatively, in light mode signal the active locale with weight/underline + ink-colored text rather than relying on green color alone (this also helps the 1.4.1 "not by color alone" concern, see SF4). Confirm the chosen fix re-passes against both paper and card.

**B3 — Coming-soon CTA accessibility semantics are named as a goal but never specified — screen-reader announcement is undefined.**
Location: `DESIGN.md` `app-store-cta` ("non-interactive badge … not a dead link") + Components bullet; `EXPERIENCE.md` Component Patterns → App Store CTA ("role/affordance reflect 'not yet a link,' never a `#` dead link") and State Patterns "App Store not live."
Why it matters: The spec correctly bans a `#` dead link and says "non-interactive," but never resolves *what AT actually encounters*. "Non-interactive badge" could be built three incompatible ways: (a) an `<img>`/static graphic with the caption as adjacent text — fine, but then the badge needs a sensible `alt` or `alt=""` with the caption carrying the meaning; (b) a `<button disabled>` / `aria-disabled` control — announces "App Store, dimmed/unavailable," which is defensible but must be paired with the caption being programmatically associated; (c) a focusable-but-inert element — the worst case, a keyboard tab-stop that does nothing. The caption "Coming soon to the App Store" is described as a separate `caption` line in muted-fg, with no stated programmatic link to the badge — a screen-reader user may hear "App Store" (badge alt) and "Coming soon to the App Store" as two disconnected fragments, or may hear only the badge.
Recommendation: Specify explicitly. Recommended: render the coming-soon state as **static, non-focusable content** — the badge as a decorative image (or `role="img"` with an accessible name like "App Store — coming soon") whose accessible name *includes* the coming-soon status, so a single coherent announcement results; the visible caption then reinforces sighted users. Do **not** make it a focusable disabled button (adds a confusing empty tab stop for a control that will never be enabled in this state). State that it is removed from / not present in the tab order while in coming-soon. This is a blocker because it is the page's single conversion target and the spec leaves the actual semantics ambiguous.

---

## SHOULD-FIX

**SF1 — Locale toggle 44px target conflicts with 15px inline text + a separator; geometry is under-specified and the two docs are loosely consistent but not airtight.**
Location: `DESIGN.md` `locale-switcher.minTarget: 44px` and `label` = 15px weight-500; Components "Each label is a ≥44px tap target." `EXPERIENCE.md` "Each label ≥44px target."
Why it matters: `EN · УК` is two ~2-character labels at 15px with a thin border separator between them. At 15px the natural hit box is far under 44px tall and the labels sit close together horizontally. "Each label is a ≥44px tap target" is achievable only via generous padding/min-width on each label *individually* — but the inline `·`/border separator design implies they are visually adjacent, risking (a) labels that are smaller than 44px in reality, or (b) overlapping/adjacent 44px boxes where a tap near the separator hits the wrong locale. The spec asserts the 44px outcome without specifying the padding or the inter-target spacing that makes two adjacent small labels each independently meet it.
Recommendation: Specify per-label `min-height: 44px` AND `min-width: 44px` with internal padding, and a minimum gap (or the separator's own width counted as dead space) between the two hit areas so adjacent targets don't merge. Note WCAG 2.1 AA's 2.5.5 (Target Size) is AAA, but 44px is the spec's own self-imposed floor and 2.1's 2.5.8 (24px) is the AA bar — either way, two tightly-packed 2-char labels need explicit geometry. Confirm at 320px where horizontal room is tightest.

**SF2 — Focus ring contrast (3.83:1 light) is marginal and ring geometry is unspecified.**
Location: `DESIGN.md` `colors.ring: #3D8A5A`; `EXPERIENCE.md` Interaction Primitives "visible focus ring (`{colors.ring}`)" and Accessibility Floor "Visible focus indicator on every focusable element."
Why it matters: 3.83:1 clears the 3:1 non-text minimum but with little margin, and the spec never states thickness, offset, or behavior against the white card surface (where brand = 4.22:1) vs paper. A 1px green ring on a green-adjacent or busy area can become hard to perceive. 1.4.11 requires the indicator to contrast against adjacent colors; a ring touching the green button itself (green-on-green) would have effectively no contrast.
Recommendation: Specify a ≥2px ring with a 2px offset and, where the focused element is itself brand-green (the primary button), use a contrasting offset color (e.g. ink or paper halo) so the indicator never sits green-on-green. If the brand green is darkened per B1/B2, the ring contrast improves to ≥4.2:1 as a side benefit — re-check.

**SF3 — Device mockups: `aria-hidden` is correct, but the spec assumes they "carry no unique text" without enforcing that the product story is told in real text.**
Location: `EXPERIENCE.md` Component Patterns → Device mockup ("decorative, `aria-hidden` from the accessibility tree where they carry no unique text") and Accessibility Floor ("meaningful text is real text, not baked into images").
Why it matters: The mockups *are* a load-bearing part of the argument for UJ-2 Mark ("he can see the actual product"). If the Library/Planner/Groceries screens contain labels or value that exist *only* inside the mockup and the surrounding section copy doesn't restate them, `aria-hidden` would hide genuine information from AT users — a 1.1.1 gap. The spec hedges with "where they carry no unique text" but doesn't make the section-copy-must-stand-alone rule explicit, and flags real screenshots may replace the HTML/CSS frames post-v2 (screenshots = baked-in text = higher risk).
Recommendation: Add an explicit rule: the surrounding section heading + body must convey the product value independently, so the mockups can be safely `aria-hidden`. For the post-v2 real-screenshot swap, require descriptive `alt` text or a visually-hidden caption per screen, since baked-in screen text is otherwise inaccessible.

**SF4 — "Active locale" and "link emphasis" rely on color (green) as the sole differentiator (1.4.1 Use of Color).**
Location: `DESIGN.md` `locale-switcher` (active = brand color, inactive = muted-fg); Colors ("the active locale label, link emphasis" in green).
Why it matters: Distinguishing the active locale and emphasized links by green color alone fails 1.4.1 for users who can't perceive the hue, and compounds B2 (the green also fails contrast in light). Weight-500 is mentioned for the active locale, but inactive is muted-fg weight unspecified — a 500-vs-400 weight delta alone is a weak non-color cue.
Recommendation: Add a non-color indicator for active locale (underline, or `aria-current="true"`/`aria-pressed` exposed to AT) and for emphasized links (underline on hover/focus at minimum). `aria-current` on the active locale also helps screen-reader users understand state.

**SF5 — Reduced-motion handling is tagged `[ASSUMPTION]` and the fallback is "static frame OR cross-fade" — the cross-fade option may still violate the no-motion intent.**
Location: `EXPERIENCE.md` State Patterns → Reduced motion ("static final frame (or cross-fades without motion); `[ASSUMPTION]` static frame; confirm at finalize") and Interaction Primitives "Banned: autoplaying motion under `prefers-reduced-motion`."
Why it matters: The static-frame path is correct and AA-adequate. But the parenthetical "cross-fades without motion" is contradictory — a cross-fade *is* an animation/opacity transition that some reduced-motion users specifically want suppressed; "without motion" doesn't make an autoplaying cross-fade loop acceptable. Leaving this as an unresolved `[ASSUMPTION]` with two divergent options means the build could ship the wrong one.
Recommendation: Resolve the assumption now: under `prefers-reduced-motion: reduce`, render a single static frame with **no autoplaying cross-fade or loop**. If any transition occurs, it must be user-initiated, not autoplaying. Confirm the loop also has no parallax/scroll-triggered motion under reduced-motion.

---

## NICE-TO-HAVE

**N1 — Marginal muted-foreground/caption contrast (4.77:1 light) has near-zero headroom.**
Location: `colors.muted-foreground: #6D6C6A`; used for coming-soon caption, captions, secondary text.
Recommendation: Consider nudging light muted-foreground one step darker (e.g. `#666563`/`#636260` → ~5:1) so the secondary-text floor isn't riding the AA line. Not a blocker — it passes — but it is the second tightest pairing on the page and is used for the conversion-adjacent coming-soon caption.

**N2 — Cyrillic font-subset gap: confirm there is no a11y consequence beyond aesthetics, and there isn't a meaningful one — but the *fallback path* should be vetted.**
Location: `DESIGN.md` Typography "Cyrillic requirement (load-bearing)"; `EXPERIENCE.md` `<html lang>` per locale.
Finding: Missing the `cyrillic` subset is primarily a brand/aesthetic issue (Ukrainian falls back to a system font). It is **not** a screen-reader or text-alternative failure — the glyphs still render via fallback, `<html lang="uk">` is correctly set, and AT reads the underlying Unicode text regardless of font. So no direct WCAG violation. The one a11y-adjacent risk: if the *fallback font stack is not specified* and the browser picks a font lacking certain Cyrillic glyphs, tofu/missing-glyph boxes could appear, which *would* harm legibility (1.4.x readability). 
Recommendation: The DESIGN.md instruction to add the `cyrillic` subset "or a vetted Cyrillic-covering fallback in the font stack" already covers this — just ensure the fallback is explicitly a Cyrillic-complete family, not a bare `sans-serif`. No blocker.

**N3 — Heading structure / landmarks: spec is correct and complete.**
Location: `EXPERIENCE.md` SEO ("One `<h1>` per page … no skipped heading levels") and Accessibility Floor ("one `<header>`/nav, `<main>`, `<footer>`; one `<h1>`; no skipped heading levels").
Finding: One `<h1>` (hero), section `<h2>`s, feature/legal `<h3>`/`<h2>` mapped via the type ramp, landmark roles named. This satisfies 1.3.1 / 2.4.6 / 2.4.10. No action — noting it as solid. One small watch-item: `DESIGN.md` Typography maps `subheading` to both "feature titles" (likely `<h3>`) and "legal `<h2>`" — ensure the *visual* size sharing doesn't lead a builder to skip a level (e.g. an `<h3>` styled like an `<h2>` is fine; an actual level skip is not). Reinforce that the ramp is visual, not structural.

**N4 — Mobile overlay focus management: spec is complete.**
Location: `EXPERIENCE.md` Component Patterns → Mobile-menu overlay and Accessibility Floor.
Finding: Covers all four required behaviors — focus moves into the panel, focus is trapped while open, `Esc` and `✕` both close, **focus returns to the hamburger trigger**, and **body scroll is locked**. This is the complete 2.4.3 / 2.1.2 keyboard-trap-avoidance set and nothing is missing. The only un-stated detail: the overlay should expose an accessible name/role (e.g. `role="dialog"` + `aria-modal="true"` + a label) so AT announces it as a modal on open — worth adding to the spec, but the behavioral floor is met. No blocker.

---

## Cross-document consistency

- DESIGN.md and EXPERIENCE.md are mutually consistent on the big rocks (44px targets, focus ring token, overlay behavior, reduced-motion intent, Coming-soon "not a dead link"). The contradictions are not *between* the two docs but *within* the locked palette vs the AA claim both docs assert (B1, B2) — the specs repeatedly promise "both light and dark verified AA" while the locked light brand green does not meet it for white-text or green-text uses.
- One soft internal tension: `EXPERIENCE.md` Accessibility Floor says contrast "lives in DESIGN.md (light and OS-driven dark token sets both verified AA)" — this verification claim is not actually substantiated by the palette and is contradicted by the computed ratios above. The claim should be downgraded to "to be verified" until B1/B2 are fixed upstream.
- AA-relevant gap neither doc covers: **no mention of `aria-live` or focus handling for the locale switch**, which is a client-side navigation ("navigation, not a page reload to top," `EXPERIENCE.md` i18n → Switching). On SPA-style locale swap, AT users may get no announcement that the page language/content changed and focus may be lost. Recommend specifying that after a locale switch the new `<html lang>` is set (it is) *and* focus is sensibly placed (e.g. retained on the switcher or moved to the page heading) so the change is perceivable. Minor, but currently unaddressed.
