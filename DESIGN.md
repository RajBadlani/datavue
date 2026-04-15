---
name: Datavue
description: Natural-language database intelligence with self-healing SQL, auditability, and proactive insights.
colors:
  warm-ledger-bg: "#F7F4EB"
  warm-ledger-panel: "#FCFAF5"
  paper-surface: "#FFFFFF"
  ink-slate: "#313852"
  muted-slate: "#7B7E8F"
  border-slate: "#C2CBD4"
  soft-border: "#E5E0D4"
  violet-primary: "#5849F2"
  violet-soft: "#EDEAFF"
  violet-pale: "#D8D2FF"
  code-surface: "#F3EEE3"
  error-bg: "#FFF1EF"
  error-border: "#F5B6B0"
  error-text: "#9F2F25"
typography:
  display:
    fontFamily: "Hagrid Text, Arial Black, Plus Jakarta Sans, sans-serif"
    fontSize: "72px"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.05em"
  headline:
    fontFamily: "Hagrid Text, Arial Black, Plus Jakarta Sans, sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.3em"
  mono:
    fontFamily: "Fira Code, monospace"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.75
rounded:
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "28px"
  xxl: "32px"
  pill: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  section: "64px"
components:
  button-primary:
    backgroundColor: "{colors.violet-primary}"
    textColor: "{colors.paper-surface}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    typography: "{typography.body}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    typography: "{typography.body}"
  input-default:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.md}"
    padding: "0 16px"
    height: "48px"
  card-default:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.xxl}"
    padding: "28px"
---

# Design System: Datavue

## 1. Overview

**Creative North Star: "The Audit Desk"**

Datavue's current visual system is a warm, controlled workspace for high-trust database work. It combines cream paper surfaces, ink-like slate text, and one decisive violet accent so product surfaces feel analytical, traceable, and safe rather than theatrical.

The interface should feel like a calm expert sitting beside the user: transparent about SQL, serious about credentials, and helpful across mixed technical fluency. Marketing surfaces can be more expressive, but authenticated product surfaces should stay restrained, structured, and legible under dense operational data.

The system explicitly rejects generic AI SaaS sparkle, dark terminal database tropes, playful consumer tone, and empty dashboard theater. Color and elevation should support trust, not decoration.

**Key Characteristics:**
- Warm ledger background with paper-like panels and precise slate text.
- Restrained violet used for primary action, focus, active selection, and important system signal.
- Large rounded surfaces balanced by fine borders and quiet shadows.
- Dense product UI is acceptable when structure, labels, and audit trails remain clear.

## 2. Colors

The Warm Ledger Palette uses cream, slate, and restrained violet to make database intelligence feel private, calm, and inspectable.

### Primary
- **Ledger Violet** (#5849F2): Primary actions, active navigation, focus rings, selected states, and high-value system signal. Its scarcity makes it feel authoritative.
- **Soft Violet Wash** (#EDEAFF): Active backgrounds, badges, code-adjacent panels, and low-pressure emphasis paired with violet text.
- **Pale Violet Marker** (#D8D2FF): Small status dots and secondary accent details only.

### Neutral
- **Warm Ledger Background** (#F7F4EB): Default page background for landing, auth, and app shells.
- **Warm Panel** (#FCFAF5): Nested forms and account panels where full white would feel too stark.
- **Paper Surface** (#FFFFFF): Current component surface for cards, headers, popovers, and form controls. Prefer tinted paper surfaces for new work unless pure white is needed for contrast against cream.
- **Ink Slate** (#313852): Primary text, strong borders on secondary buttons, and high-confidence UI labels.
- **Muted Slate** (#7B7E8F): Secondary copy, metadata, timestamps, placeholders, and inactive navigation.
- **Border Slate** (#C2CBD4): Main structural border for cards, shells, inputs, and dividers.
- **Soft Border** (#E5E0D4): Warmer low-contrast borders inside forms and account panels.
- **Code Surface** (#F3EEE3): Hero console shell and database simulation surfaces.

### Tertiary
- **Error Paper** (#FFF1EF): Error alert background.
- **Error Stroke** (#F5B6B0): Error alert border.
- **Error Ink** (#9F2F25): Error text.

### Named Rules

**The Violet Scarcity Rule.** Ledger Violet should mark decisions, focus, active state, or real system signal. Do not use it as filler decoration.

**The No Terminal Costume Rule.** Database UI should not become black screens, neon green text, or faux command-line theater unless the user is inspecting actual code.

## 3. Typography

**Display Font:** Hagrid Text with Arial Black and Plus Jakarta Sans fallbacks  
**Body Font:** Plus Jakarta Sans  
**Label/Mono Font:** Fira Code for SQL and code-like content

**Character:** The pairing is editorial at the top and product-precise everywhere else. Display type gives the landing and auth pages a distinct voice; product labels and data stay in Plus Jakarta Sans for clarity.

### Hierarchy
- **Display** (700, 72px desktop or `text-5xl` to `text-6xl` responsive, 0.95 line-height): Hero headlines and rare brand moments only.
- **Headline** (700, 32px, 1 line-height): Auth page titles and compact product page hero headings.
- **Title** (500 to 600, 16px, 1.4 line-height): Shell page titles, card headings, popover headers, and primary row labels.
- **Body** (400, 15px to 18px, 1.75 line-height): Explanatory copy, form helper text, and marketing section body. Cap prose around 65 to 75 characters.
- **Label** (600, 12px, 0.3em tracking, uppercase when used): Section labels, table headers, and diagnostic metadata. Use sparingly because the tracking is loud.
- **Mono** (400, 14px, 1.75 line-height): SQL, query snippets, schema fragments, and generated code.

### Named Rules

**The Display Is Earned Rule.** Hagrid Text belongs to brand moments and major page titles. Do not use display styling for buttons, dense labels, table headers, or settings forms.

## 4. Elevation

Datavue uses layered, restrained elevation. Most depth comes from tonal separation, borders, and rounded containers. Shadows are ambient and soft, reserved for floating panels, hero consoles, auth forms, and primary raised surfaces.

### Shadow Vocabulary
- **Hero Console Lift** (`0 30px 90px rgba(49,56,82,0.1)`): Large composed visuals such as the natural-language query simulator.
- **Auth Form Lift** (`0 20px 70px rgba(49,56,82,0.08)`): Focused authentication and high-trust forms.
- **Floating Popover Lift** (`0 20px 60px rgba(49,56,82,0.08)`): Alerts, profile menus, and transient panels above the app shell.
- **Primary Button Lift** (`0 14px 30px rgba(88,73,242,0.28)` or `0 18px 40px rgba(88,73,242,0.3)`): Main action buttons only.
- **Quiet Card Lift** (`0 18px 60px rgba(49,56,82,0.05)`): Marketing pricing and feature cards when the card must separate from the ledger background.

### Named Rules

**The Flat-Until-Floating Rule.** Resting product surfaces should rely on borders and tone. Add shadow when a surface floats above another surface or requests a decision.

## 5. Components

Components should feel precise, warm, and operational. Shape is generous, but states and borders keep the product from becoming soft or toy-like.

### Buttons
- **Shape:** Fully rounded pills (`9999px`) for primary and secondary actions.
- **Primary:** Ledger Violet background with paper text, typically `14px 24px` padding or `48px` height in forms. It may carry a soft violet shadow for major actions.
- **Hover / Focus:** Hover uses subtle brightness or surface inversion. Focus uses a `2px` violet ring with warm background offset.
- **Secondary / Ghost:** Transparent or paper background with Ink Slate border and text. Hover can invert to Ink Slate background with Warm Ledger text.

### Chips
- **Style:** Small rounded pills with Soft Violet Wash, Warm Panel, or paper backgrounds. Text should use Ledger Violet or Muted Slate depending on state.
- **State:** Selected chips may use violet text and soft violet background. Inactive chips should avoid full-saturation color.

### Cards / Containers
- **Corner Style:** Large radii from `24px` to `32px`, with `28px` appearing on forms.
- **Background:** Paper Surface or Warm Panel over Warm Ledger Background.
- **Shadow Strategy:** Use quiet ambient shadows only for hero, auth, popover, and marketing emphasis. Product cards can stay border-first.
- **Border:** Border Slate for structural edges; Soft Border for warmer nested panels.
- **Internal Padding:** Common card padding is `24px` to `32px`; dense product rows can use `12px` to `16px`.

### Inputs / Fields
- **Style:** `48px` tall, `16px` radius, Paper Surface background, Border Slate stroke, Ink Slate text, and Muted Slate placeholder.
- **Focus:** Border changes to Ledger Violet. Add a visible focus ring in new work when inputs appear inside dense workflows.
- **Error / Disabled:** Error uses Error Paper, Error Stroke, and Error Ink. Disabled states should lower opacity and preserve readable labels.

### Navigation
- **Style:** App navigation uses a fixed left rail on desktop with a warm paper surface, small icons, medium labels, and tight vertical rhythm.
- **Active State:** Current item uses Soft Violet Wash and Ledger Violet text. Avoid colored side-stripe borders for new work; use full background, icon tone, or a subtle outline instead.
- **Mobile Treatment:** Collapse navigation structurally rather than shrinking type or crowding all destinations into the header.

### Signature Component: Query Console

The query console visual combines a warm shell, paper inner panel, mono SQL block, and result table. It should demonstrate transparency: natural-language prompt, generated SQL, and resulting data all in one inspectable surface. Motion may reveal state progression, but reduced-motion preferences must still land on a useful static state.

## 6. Do's and Don'ts

### Do:
- **Do** use Warm Ledger Background (#F7F4EB) as the default atmosphere for broad surfaces.
- **Do** reserve Ledger Violet (#5849F2) for action, focus, active state, and important system signal.
- **Do** make auditability visible through labels, history, SQL snippets, status, and clear ownership of actions.
- **Do** use Border Slate (#C2CBD4) and Soft Border (#E5E0D4) to create structure before reaching for shadows.
- **Do** pair color-coded statuses with text or icons so meaning never depends on color alone.

### Don't:
- **Don't** use generic AI SaaS marketing patterns: vague sparkle, gradient blobs, interchangeable icon-card grids, or empty dashboard theater.
- **Don't** make Datavue look like a dark terminal, hacker dashboard, or neon database toy.
- **Don't** use playful consumer tone where enterprise data safety, credentials, PII, or audit logs are involved.
- **Don't** add colored side-stripe borders as card or nav accents. Use a full background, full border, icon state, or text weight instead.
- **Don't** use gradient text, decorative glassmorphism, or motion that does not communicate state.
