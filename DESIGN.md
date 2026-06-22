---
name: Fresh Water Market OS
description: Local Gaborone water brand — fast, calm, mobile-first ordering with ops-grade admin surfaces.
colors:
  primary: "#0b5284"
  water: "#289fbd"
  teal-brand: "#29998e"
  aqua: "#dcf6f9"
  secondary: "#f59024"
  accent: "#409c61"
  ink: "#191f2f"
  bg: "#f3f9fb"
  destructive: "#df3b3b"
typography:
  display:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2rem, 5vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3vw, 1.875rem)"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "0 24px"
    height: "48px"
  button-whatsapp:
    backgroundColor: "#059669"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    height: "48px"
  card:
    backgroundColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "20px"
  chip:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.primary}"
    rounded: "999px"
    padding: "8px 16px"
  input-admin:
    backgroundColor: "#ffffff"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "0 12px"
---

# Design System: Fresh Water Market OS

## 1. Overview

**Creative North Star: "The Corner Water Shop, Online"**

Fresh Water Market is a real Gaborone water business — refills, bottles, ice, and branded bottles for campus and city. The interface should feel like walking up to a trusted local counter: fast, plain-spoken, and useful. Confidence comes from clarity and speed, not from spectacle. Water blue carries the brand; everything else gets out of the way so the customer can order in under a minute on a phone.

The system runs on **two densities within one brand**: customer surfaces are touch-forward and rounded (48px buttons, 16px card radius); admin, driver, and staff surfaces are compact and scan-friendly (40px inputs, 6–8px radius, white cards on a cool canvas). Both share the same palette and Inter weight scale — only density and corner language shift.

This system explicitly rejects the AI-landing-page playbook: no warm cream/beige backgrounds, no tiny uppercase tracked eyebrows on every section, no numbered section markers (01 / 02 / 03), no full-screen scroll-snap theatrics, no floating decorative particles, and no generic SaaS dashboard chrome. It also rejects cheap discount-water visuals (clip art, loud sales banners). The water is premium; the UI is calm.

**Key Characteristics:**
- Mobile-first, app-like density on customer flows — compact sections, no cavernous white space.
- Deep ocean blue as the single brand anchor; teal and aqua as cool supporting tones.
- Dual density: customer `rounded-2xl` / admin `rounded-md`–`rounded-lg` without changing the color story.
- Motion is a response to interaction (hover, tap, scroll-in), never a first-paint gate.
- Skeleton loading on route transitions; spinners only for inline actions.
- Real product photography over dark image overlays; show the water, don't bury it.

## 2. Colors

A cool, aquatic palette anchored by one deep blue, with a warm orange reserved for emphasis only.

### Primary
- **Deep Ocean Blue** (#0b5284 / `hsl(205 85% 28%)`): The brand anchor. Primary buttons, links, logo wordmark, active states, headings on light surfaces. Carries trust and depth.

### Secondary
- **Spring Water Cyan** (#289fbd / `hsl(192 65% 45%)`): Mid-tone aquatic accent for supporting icons, slogans, and delivery cues. The lively "fresh water" tone.
- **Brand Teal** (#29998e / `hsl(174 58% 38%)`): Tertiary cool tone for secondary buttons and gradient accents.

### Tertiary
- **Signal Orange** (#f59024 / `hsl(31 91% 55%)`): The single warm accent. Used sparingly for "most popular", price emphasis, and small badges. Never a background field.
- **Trust Green** (#409c61 / `hsl(142 42% 43%)`): Success/confirmation states and completed step indicators. WhatsApp uses its own brand emerald (#059669).

### Neutral
- **Ink** (#191f2f / `hsl(220 24% 14%)`): Primary body and heading text on light surfaces. Meets AA on white.
- **Cool Canvas** (#f3f9fb / `hsl(196 60% 96%)`): Default page background via `--background`; a true near-white tinted toward the brand's cool hue, never warm cream.
- **Pale Aqua** (#dcf6f9 / `hsl(186 72% 92%)`): Section tinting, chip backgrounds, and gentle zoning between white sections.
- **Muted Foreground** (`hsl(208 22% 36%)`): Secondary body copy and metadata. Dark enough for AA on aqua-tinted sections.

### Named Rules
**The One Warm Accent Rule.** Signal Orange (#f59024) appears on ≤10% of any screen — a "most popular" badge or a single price highlight. It is never a section background. Warmth is a punctuation mark, not a wall.

**The No Cream Rule.** Backgrounds are white (#ffffff) or cool-tinted (aqua / cool canvas). Warm cream, beige, sand, and parchment are forbidden; they read as AI-default and undercut the local-premium brand.

## 3. Typography

**Display / Body / Label Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback).

**Character:** One humanist-geometric sans across the whole system, differentiated by weight, not by mixing families. Heavy weights (800) for headings give a confident, retail-signage feel; regular weight for calm, readable body.

### Hierarchy
- **Display** (800, clamp(2rem → 3rem), line-height 1.1, -0.02em): Hero headline and final CTA only. Capped well below shouting size.
- **Headline** (800, clamp(1.5rem → 1.875rem), line-height 1.2): Section titles on customer pages; admin section headers use 700 at 1.125–1.25rem for density.
- **Title** (700–800, 1rem–1.125rem): Card titles, sub-section labels.
- **Body** (400–500, 1rem, line-height 1.6–1.75): Descriptions and prose; cap line length 65–75ch.
- **Label** (600–700, 0.875rem): Buttons, chips, prices, metadata, admin table cells.

### Named Rules
**The Weight-Not-Family Rule.** Hierarchy is built from Inter weights (400 / 600 / 700 / 800). Never introduce a second font family to create contrast.

**The Slogan-Is-Support Rule.** "Stay Fresh. Stay Hydrated." is a supporting slogan in `text-water` at small size, not the primary headline. The H1 always states the concrete offer (fresh water delivered across campus & Gaborone).

## 4. Elevation

A near-flat system with soft, low shadows used functionally. Cards rest with a subtle cyan-tinted `shadow-sm`; hover lifts them one step to signal clickability. Depth is conveyed by tonal layering (white sections alternating with pale-aqua tinted sections, plus the `water-canvas` top gradient) rather than heavy drop shadows. No glassmorphism as a default; blur is reserved for the sticky header over photography.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 2px rgba(15,23,42,0.05)` via `shadow-sm shadow-cyan-900/5`): Default state for customer cards and admin panels.
- **Hover lift** (`box-shadow: 0 4px 12px rgba(15,23,42,0.1)` via `hover:shadow-md shadow-cyan-900/10`): Interactive cards on hover/focus only; paired with a subtle `-translate-y-0.5` on customer quick-order cards.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat by default. Shadow appears as a response to state (hover, focus), not as constant decoration. Never pair a 1px border with a wide soft shadow on the same element at rest.

## 5. Components

### Buttons
- **Shape:** Customer buttons use 16px radius (`rounded-2xl`), 48px height (`h-12`), bold 14px label. Admin actions use 6–8px radius and 40px height where space is tight.
- **Primary:** Deep Ocean Blue fill, white text, subtle cyan shadow. Hover darkens via `--primary-hover` (`hsl(205 85% 24%)`).
- **Secondary:** Spring Water Cyan fill; hover shifts to Brand Teal.
- **Outline / Contact:** White fill, 1px primary/25 border, primary text. Hover adds aqua tint.
- **WhatsApp:** Brand emerald (#059669) fill, white text, message icon. Always visually distinct from the primary Order action and never larger than it.

### Chips
- **Style:** Pale-aqua (#dcf6f9) background, primary text, pill radius (999px), 1px subtle ring (`ring-cyan-100`). Used for pickup points, delivery slots, and tags.
- **State:** Selected = primary fill + white text. Unselected = aqua tint. Hover = white fill + primary ring.

### Cards / Containers
- **Customer cards** (`.customer-card`): 16px radius, white fill, 1px `border-cyan-100`, 20px padding, flat shadow at rest, hover lift on interactive cards.
- **Admin panels:** 8px radius (`rounded-lg`), white fill, 1px border, compact 12–16px padding, `shadow-sm` only.
- **Border:** 1px hairline (`border-cyan-100` customer / `border` admin); full borders only — never a thick colored side-stripe.

### Inputs / Fields
- **Customer:** White fill, 1px slate/cyan border, 16px radius, 48px height for touch (`focus-ring` utility).
- **Admin:** White fill, 1px border, 6px radius (`rounded-md`), 40px height (`h-10`), 12px horizontal padding, `text-sm`.
- **Focus:** 2px ring in `--ring` (Spring Water Cyan) with offset via `.focus-ring`.

### Navigation
- **Customer:** Sticky top bar, white/blur when scrolled. Logo + wordmark left; Order / Track / Corporate + WhatsApp right. Mobile keeps logo, primary Order, and WhatsApp visible.
- **Admin:** Functional top/side navigation; density over decoration. Current section indicated by primary color, not gradient fills.

### Skeleton / Loading
- **Style:** `animate-pulse` on `bg-muted` (`hsl(197 36% 90%)`), 6px radius default. Route-level `loading.tsx` files compose skeleton layouts that mirror the final page structure.
- **Rule:** Skeletons replace page content during navigation; they are not spinners floating in empty space.

### Order Status Stepper (signature)
- **Style:** Horizontal step list on desktop, stacked on mobile. Completed steps: Trust Green fill + check. Active step: primary fill + `ring-4 ring-primary/15`. Upcoming: `bg-cyan-50` + muted text. Connector lines: accent when complete, `cyan-100` when pending.
- **Cancelled state:** Red-50 panel with red-700 text — no stepper choreography.

### Quick Order Card (signature)
Full-card clickable link. Real product photo (bright, no dark overlay), icon badge top-left, short one-line description, price hint, and "Order now →" affordance. Hover lifts the card and nudges the photo scale (`scale-[1.03]`); all via CSS transition, no JS spring.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page background cool canvas or white; alternate white and pale-aqua sections for rhythm.
- **Do** make the hero state the concrete offer and keep "Stay Fresh. Stay Hydrated." as a small supporting slogan in water cyan.
- **Do** show real product photos brightly; prefer visible product cards over dark image overlays.
- **Do** use `next/image` with proper `sizes`, and `priority` only on the single hero image.
- **Do** keep customer sections compact and useful — every section earns its height.
- **Do** use skeleton layouts on route transitions; reserve spinners for button-level actions.
- **Do** restrict motion to hover, tap, and optional scroll-in fades that respect `prefers-reduced-motion`.
- **Do** reserve Signal Orange for a single "most popular" / price emphasis per screen.
- **Do** tighten admin density: 40px inputs, 6–8px radius, white cards on the cool canvas.

### Don't:
- **Don't** use warm cream / beige / sand / parchment backgrounds — they read as AI-default.
- **Don't** add tiny uppercase tracked eyebrows above every section, or numbered section markers (01 / 02 / 03).
- **Don't** ship full-screen (`min-h-[100svh]`) scroll-snap sections; they make the page feel slow and cavernous.
- **Don't** add floating decorative particles (bubbles), constant float animations, or first-paint entrance animations that gate content.
- **Don't** bury product photography under near-black gradient overlays.
- **Don't** use generic SaaS dashboard chrome or the hero-metric template (big number + gradient accent).
- **Don't** use colored side-stripe borders (`border-left`) or gradient text (`background-clip: text`).
- **Don't** let the WhatsApp or assistant button compete with or out-size the primary "Order Now" action.
- **Don't** pair 1px borders with wide soft drop shadows on the same resting element.
