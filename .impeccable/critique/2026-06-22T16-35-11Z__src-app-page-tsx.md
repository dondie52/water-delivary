---
target: landing
total_score: 25
p0_count: 0
p1_count: 2
timestamp: 2026-06-22T16-35-11Z
slug: src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Landing appropriately static; track/order paths visible. No misleading loading states. |
| 2 | Match System / Real World | 4 | Gaborone/campus language, Pula pricing, pickup point names feel local and concrete. |
| 3 | User Control and Freedom | 3 | Multiple exits to order/track/WhatsApp; mobile menu dismisses on navigate. |
| 4 | Consistency and Standards | 2 | Mixed button implementations (`CustomerButton` vs inline `Link` styles); `rounded-3xl` pricing cards vs `rounded-2xl` elsewhere. |
| 5 | Error Prevention | 2 | Newsletter form submits to `#` with no handler — invites a dead-end interaction. |
| 6 | Recognition Rather Than Recall | 3 | Services and prices are visible, but hero exposes 7 category circles and pricing shows 6 similar cards at once. |
| 7 | Flexibility and Efficiency | 2 | Many paths to order (good for novices); no efficiency layer for repeat buyers beyond header Track. |
| 8 | Aesthetic and Minimalist Design | 2 | ~10 sections on one page with repeated 3-step flows and multi-card grids; middle feels padded. |
| 9 | Error Recovery | 1 | Newsletter and other placeholder forms offer no success/error feedback. |
| 10 | Help and Documentation | 3 | FAQ accordion, WhatsApp, floating assistant, and contact in final CTA cover help adequately. |
| **Total** | | **25/40** | **Acceptable — significant trim and consistency work before it feels premium** |

## Anti-Patterns Verdict

**LLM assessment:** This does not scream generic AI on first glance — the hero is concrete, the palette is cool aquatic (not cream), and there are no numbered section eyebrows. The tell shows up in the **middle and lower page**: stacked identical card grids (6 pricing tiles, 4 winter benefit tiles, 4 community tiles), a seasonal "Winter Wellness" block with hashtag footer copy, and **two separate 3-step explainers** (Quick Order + Delivery Demo). That combination reads as landing-page template assembly rather than a tight local counter experience.

**Deterministic scan:** Clean. `detect.mjs` returned **0 findings** across 11 landing source files (`src/app/page.tsx` + customer sections).

**Visual overlays:** Not available — browser automation could not inject `detect.js` (Playwright browsers not installed; no mutable browser tab in session). Assessment relied on source review and an older hero screenshot that predates the current light hero refactor.

## Overall Impression

The top of the page works: clear H1, real pricing hooks, strong photography, and a credible header. The page loses focus after the first two sections — it keeps re-explaining the same order story with more cards, more cyan washes, and a seasonal detour. The single biggest opportunity is **distillation**: cut or merge redundant sections so the landing feels as fast as the product promise ("order in under a minute").

## What's Working

1. **Hero hierarchy** — Concrete offer in the H1, supporting slogan in water cyan, dual CTAs with sensible primary/secondary weight. Trust chips (P1.60/L, P30 delivery, pickup) answer price anxiety immediately.
2. **Quick order cards** — Full-card links with real photos, price hints, and hover lift match the signature pattern in DESIGN.md. Horizontal scroll on mobile is the right pattern for service discovery.
3. **Final CTA band** — Primary-filled closing section with order, track, WhatsApp, and phone in one scannable block. Good peak-end for a long page.

## Priority Issues

### [P1] Landing page is over-sectioned and repetitive
- **Why it matters:** Users scrolling on mobile hit decision fatigue before the FAQ. Two 3-step flows and multiple card grids re-teach the same story.
- **Fix:** Merge Quick Order steps + Delivery Demo into one flow section; cut or demote Winter Hydration to a seasonal banner; collapse community 4-card grid into prose or two proof points.
- **Suggested command:** `$impeccable distill landing`

### [P1] Identical pricing card grid (6-up) fights the anti-slop rules
- **Why it matters:** Six same-shaped product tiles with image + badge + "Order" button is the exact SaaS/AI card-grid reflex your DESIGN.md forbids. `rounded-3xl` also drifts from the 16px card spec.
- **Fix:** Show 3 highlighted prices + "View all" link, or a compact price list/table for the rest. Normalize radius to `rounded-2xl`.
- **Suggested command:** `$impeccable layout pricing-section`

### [P2] Non-functional newsletter capture
- **Why it matters:** The email form in `lower-landing-sections.tsx` uses `action="#"` and an icon-only submit — users get no confirmation and screen-reader users get weak button labeling.
- **Fix:** Wire to a real endpoint or remove until ready; use a labeled "Subscribe" button with inline success/error states.
- **Suggested command:** `$impeccable harden lower-landing-sections`

### [P2] Component vocabulary inconsistency across CTAs
- **Why it matters:** Pickup, corporate, winter, and pricing sections each re-implement primary buttons with slightly different classes (`hover:bg-[#08466f]` vs `primary-hover`, mixed shadows). Erodes premium polish.
- **Fix:** Route all customer CTAs through `CustomerButton` / `CustomerButtonLink` variants.
- **Suggested command:** `$impeccable polish customer landing CTAs`

### [P2] Header shows hamburger alongside full nav at `lg+`
- **Why it matters:** In `customer-header.tsx`, the menu toggle is `lg:inline-flex` while nav links are `md:flex` — large screens can show both, which is confusing and non-standard.
- **Fix:** Hide hamburger at `md+` (or remove desktop hamburger entirely; keep mobile-only toggle).
- **Suggested command:** `$impeccable adapt customer-header`

## Persona Red Flags

**Jordan (First-Timer):** Hero category row uses **7** tiny 11px labels in a horizontal scroller — easy to mis-tap and hard to parse. Two different "how ordering works" sections (quick-order 3-step strip + delivery demo stepper) create "did I already read this?" confusion. Newsletter looks real but does nothing on submit.

**Casey (Mobile, one-handed):** Page length is extreme — repeat buyer must scroll past winter wellness, 6 price cards, testimonials, community grid, FAQ, and help links to reach corporate content. Horizontal carousels (quick order, pricing) help, but overall scroll cost is high. Floating assistant sits above thumb zone but is appropriately smaller than Order.

**Thabo (Campus student, project-specific):** Wants price and pickup truth in under 10 seconds. Gets that in hero chips and pickup section — good. Loses patience at generic "Boosts immunity / Helps digestion" winter copy and hashtag footer; reads like social marketing, not a campus water counter.

## Minor Observations

- `text-primary/75` and `text-primary/80` body copy on aqua backgrounds may be borderline for AA — worth auditing.
- Winter section hard-codes `#061a4f` navy while hero moved to light background — tonal split between "old campaign" and "new shop" aesthetics.
- Floating assistant + WhatsApp is acceptable (assistant is smaller) but two chat entry points still split help behavior.
- Promo bar "Learn more" links to `/order` rather than an anchor explaining the promo — weak label match.

## Questions to Consider

- What if the landing were **half the length** — hero, quick order, pickup/pricing, FAQ, final CTA — with corporate and winter as secondary routes?
- Does "Winter Wellness" earn its place for a **June** pilot in Gaborone, or is it stale campaign scaffolding?
- What would a **repeat student orderer** see if the page recognized returning visitors (last service, track CTA above the fold)?
