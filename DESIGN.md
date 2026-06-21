---
name: Fresh Water Market OS
description: Local Gaborone water brand — fast, calm, mobile-first ordering.
colors:
  primary: "#0b5284"
  water: "#289fbd"
  teal-brand: "#29998e"
  aqua: "#dcf6f9"
  secondary: "#f59024"
  accent: "#409c61"
  ink: "#191f2f"
  bg: "#f8fbfc"
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
  md: "12px"
  lg: "16px"
  xl: "24px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0 24px"
    height: "48px"
  button-whatsapp:
    backgroundColor: "#059669"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
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
---

# Design System: Fresh Water Market OS

## 1. Overview

**Creative North Star: "The Corner Water Shop, Online"**

Fresh Water Market is a real Gaborone water business — refills, bottles, ice, and branded bottles for campus and city. The interface should feel like walking up to a trusted local counter: fast, plain-spoken, and useful. Confidence comes from clarity and speed, not from spectacle. Water blue carries the brand; everything else gets out of the way so the customer can order in under a minute on a phone.

This system explicitly rejects the AI-landing-page playbook: no warm cream/beige backgrounds, no tiny uppercase tracked eyebrows on every section, no numbered section markers (01 / 02 / 03), no full-screen scroll-snap theatrics, no floating decorative particles, and no generic SaaS dashboard chrome. It also rejects cheap discount-water visuals (clip art, loud sales banners). The water is premium; the UI is calm.

**Key Characteristics:**
- Mobile-first, app-like density — compact sections, no cavernous white space.
- Deep ocean blue as the single brand anchor; teal and aqua as cool supporting tones.
- Motion is a response to interaction (hover, tap, scroll-in), never a first-paint performance.
- Real product photography over dark image overlays; show the water, don't bury it.

## 2. Colors

A cool, aquatic palette anchored by one deep blue, with a warm orange reserved for emphasis only.

### Primary
- **Deep Ocean Blue** (#0b5284): The brand anchor. Primary buttons, links, logo wordmark, active states, headings on light surfaces. Carries trust and depth.

### Secondary
- **Spring Water Cyan** (#289fbd): Mid-tone aquatic accent for gradients, secondary icons, and slot/delivery cues. The lively "fresh water" tone.
- **Brand Teal** (#29998e): Tertiary cool tone for gradients and supporting iconography.

### Tertiary
- **Signal Orange** (#f59024): The single warm accent. Used sparingly for "most popular", price emphasis, and small badges. Never a background field.
- **Trust Green** (#409c61): Reserved for success/confirmation states. WhatsApp uses its own brand emerald (#059669).

### Neutral
- **Ink** (#191f2f): Primary body and heading text on light surfaces. Meets AA on white.
- **Cool White** (#f8fbfc): Default page background; a true near-white tinted toward the brand's own cool hue, never warm cream.
- **Pale Aqua** (#dcf6f9): Section tinting and chip backgrounds for gentle zoning between white sections.

### Named Rules
**The One Warm Accent Rule.** Signal Orange (#f59024) appears on ≤10% of any screen — a "most popular" badge or a single price highlight. It is never a section background. Warmth is a punctuation mark, not a wall.

**The No Cream Rule.** Backgrounds are white (#ffffff) or cool-tinted (aqua / cool-white). Warm cream, beige, sand, and parchment are forbidden; they read as AI-default and undercut the local-premium brand.

## 3. Typography

**Display / Body / Label Font:** Inter (with `ui-sans-serif, system-ui, sans-serif` fallback).

**Character:** One humanist-geometric sans across the whole system, differentiated by weight, not by mixing families. Heavy weights (800) for headings give a confident, retail-signage feel; regular weight for calm, readable body.

### Hierarchy
- **Display** (800, clamp(2rem → 3rem), line-height 1.1, -0.02em): Hero headline and final CTA only. Capped well below shouting size.
- **Headline** (800, clamp(1.5rem → 1.875rem), line-height 1.2): Section titles.
- **Title** (700, 1.125rem): Card titles, sub-section labels.
- **Body** (400, 1rem, line-height 1.6): Descriptions and prose; cap line length 65–75ch.
- **Label** (600, 0.875rem): Buttons, chips, prices, metadata.

### Named Rules
**The Weight-Not-Family Rule.** Hierarchy is built from Inter weights (400 / 600 / 700 / 800). Never introduce a second font family to create contrast.

**The Slogan-Is-Support Rule.** "Stay Fresh. Stay Hydrated." is a supporting slogan, not the primary headline. The H1 always states the concrete offer (fresh water delivered across campus & Gaborone).

## 4. Elevation

A near-flat system with soft, low shadows used functionally. Cards rest with a subtle `shadow-sm`; hover lifts them one step to signal clickability. Depth is conveyed by tonal layering (white sections alternating with pale-aqua tinted sections) rather than heavy drop shadows. No glassmorphism as a default; blur is reserved for the sticky header over photography.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 1px 3px rgba(15,23,42,0.08)`): Default state for cards and chips.
- **Hover lift** (`box-shadow: 0 8px 24px rgba(15,23,42,0.12)`): Interactive cards on hover/focus only.

### Named Rules
**The Flat-At-Rest Rule.** Surfaces are flat by default. Shadow appears as a response to state (hover, focus), not as constant decoration.

## 5. Components

### Buttons
- **Shape:** Rounded (16px radius), fixed comfortable height (48px), generous horizontal padding.
- **Primary:** Deep Ocean Blue (#0b5284) fill, white text. Hover darkens slightly; no vertical bounce on touch.
- **WhatsApp:** Brand emerald (#059669) fill, white text, message-circle icon. Always visually distinct from the primary Order action and never larger than it.
- **Outline / Secondary:** White fill, 1px primary border, primary text. For lower-priority actions (Track, View all prices).

### Chips
- **Style:** Pale-aqua (#dcf6f9) background, primary text, pill radius (999px), 1px subtle ring. Used for pickup points, delivery slots, and tags.
- **State:** Selected = primary fill + white text. Unselected = aqua tint. Hover = white fill + primary ring.

### Cards / Containers
- **Corner Style:** 24px radius (xl) for feature cards, 16px (lg) for compact list cards.
- **Background:** White on tinted sections, subtle border (`border-slate-100`).
- **Shadow Strategy:** Flat at rest, hover-lift only (see Elevation).
- **Border:** 1px slate-100 hairline; full borders only — never a thick colored side-stripe.
- **Internal Padding:** 20px (lg).

### Quick Order Card (signature)
Full-card clickable link. Real product photo (or clean aqua-gradient fallback with product icon), short one-line description, a price hint, and an "Order now →" affordance. Photo is shown bright and legible — not buried under a near-black overlay. Hover lifts the card and nudges the arrow; all via CSS transition, no JS spring.

### Inputs / Fields
- **Style:** White fill, 1px slate-200 border, rounded (16px), 48px height for touch.
- **Focus:** 2px primary focus ring with offset (`focus-ring` utility).

### Navigation
- **Style:** Sticky top bar, white/blur when scrolled or solid by default. Logo + "Fresh Water Market" wordmark left; Order / Track / Corporate + WhatsApp right.
- **Mobile:** Logo, a primary Order button, and WhatsApp stay visible; secondary links collapse behind a compact menu toggle.

## 6. Do's and Don'ts

### Do:
- **Do** keep the page background white or cool-tinted aqua; alternate white and pale-aqua sections for rhythm.
- **Do** make hero state the concrete offer ("Fresh Water Delivered Across Campus & Gaborone") and keep "Stay Fresh. Stay Hydrated." as a small supporting slogan.
- **Do** show real product photos brightly; prefer visible product cards over dark image overlays.
- **Do** use `next/image` with proper `sizes`, and `priority` only on the single hero image.
- **Do** keep sections compact and useful — every section earns its height.
- **Do** restrict motion to hover, tap, and a single cheap scroll-in fade that respects `prefers-reduced-motion`.
- **Do** reserve Signal Orange for a single "most popular" / price emphasis per screen.

### Don't:
- **Don't** use warm cream / beige / sand / parchment backgrounds — they read as AI-default.
- **Don't** add tiny uppercase tracked eyebrows above every section, or numbered section markers (01 / 02 / 03).
- **Don't** ship full-screen (`min-h-[100svh]`) scroll-snap sections; they make the page feel slow and cavernous.
- **Don't** add floating decorative particles (bubbles), constant float animations, or first-paint entrance animations.
- **Don't** bury product photography under near-black gradient overlays.
- **Don't** use generic SaaS dashboard chrome or the hero-metric template (big number + gradient accent).
- **Don't** use colored side-stripe borders (`border-left`) or gradient text (`background-clip: text`).
- **Don't** let the WhatsApp or assistant button compete with or out-size the primary "Order Now" action.
