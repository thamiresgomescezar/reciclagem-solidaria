---
name: EcoSolidarity System
colors:
  surface: '#f5fbef'
  surface-dim: '#d6dcd0'
  surface-bright: '#f5fbef'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f6ea'
  surface-container: '#eaf0e4'
  surface-container-high: '#e4eade'
  surface-container-highest: '#dee4d9'
  on-surface: '#171d16'
  on-surface-variant: '#3f4a3c'
  inverse-surface: '#2c322a'
  inverse-on-surface: '#edf3e7'
  outline: '#6f7a6b'
  outline-variant: '#becab9'
  surface-tint: '#006e1c'
  primary: '#006e1c'
  on-primary: '#ffffff'
  primary-container: '#4caf50'
  on-primary-container: '#003c0b'
  inverse-primary: '#78dc77'
  secondary: '#1b6d24'
  on-secondary: '#ffffff'
  secondary-container: '#a0f399'
  on-secondary-container: '#217128'
  tertiary: '#3e6a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#74aa34'
  on-tertiary-container: '#203900'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#94f990'
  primary-fixed-dim: '#78dc77'
  on-primary-fixed: '#002204'
  on-primary-fixed-variant: '#005313'
  secondary-fixed: '#a3f69c'
  secondary-fixed-dim: '#88d982'
  on-secondary-fixed: '#002204'
  on-secondary-fixed-variant: '#005312'
  tertiary-fixed: '#b9f474'
  tertiary-fixed-dim: '#9ed75b'
  on-tertiary-fixed: '#0f2000'
  on-tertiary-fixed-variant: '#2e4f00'
  background: '#f5fbef'
  on-background: '#171d16'
  surface-variant: '#dee4d9'
  eco-bg-light: '#E8F5E9'
  recycle-blue: '#2196F3'
  recycle-yellow: '#FFEB3B'
  recycle-red: '#F44336'
  leaf-green: '#388E3C'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Work Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Work Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-lg:
    fontFamily: Work Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.5px
  label-sm:
    fontFamily: Work Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  margin-mobile: 20px
  gutter: 16px
  card-padding: 24px
---

## Brand & Style

This design system is built to facilitate community-driven sustainability. The brand personality is **altruistic, energetic, and transparent**, aiming to evoke a sense of environmental responsibility and civic pride.

The visual style is **Modern / Tactile**, blending organic inspiration with functional efficiency. It utilizes soft geometry, a "fresh" atmosphere inspired by natural growth, and a high-clarity interface to ensure accessibility for all demographics, from individual citizens to waste management professionals. The use of a subtle watermark pattern (natural iconography) provides depth without cluttering the functional workspace.

## Colors

The palette is rooted in the "Recycling Green" spectrum. 
- **Primary:** A vibrant green used for major calls to action and brand identification.
- **Secondary:** A deep forest green for high-contrast text and structural elements to ensure readability.
- **Tertiary:** A brighter, lime-toned green used for accents and secondary information.
- **Neutral:** Surfaces use a very pale, mint-tinted white (`#E8F5E9`) to reduce eye strain compared to pure white while maintaining a "clean" environmental feel.
- **Named Colors:** These are reserved for specific recycling categories (paper, plastic, metal, glass) to maintain international recycling color standards within the app's iconography.

## Typography

The system uses **Plus Jakarta Sans** for headlines to provide a friendly, optimistic, and welcoming tone. Its rounded terminals mirror the organic nature of the brand.

**Work Sans** is used for body text and labels due to its exceptional legibility at small sizes and its professional, neutral character. This ensures that technical information (like collection times or addresses) is consumed without friction. 

Mobile-first scaling is prioritized; the `display-lg` style is reserved for welcome screens, while `headline-sm` is the standard for card titles and page headers.

## Layout & Spacing

This system employs a **Fluid Grid** model with a base unit of **8px**. 

- **Mobile:** A 4-column layout with 20px side margins. Cards typically span 2 columns (2x2 grid) or 4 columns (full width).
- **Tablet/Desktop:** A 12-column grid. Action cards reflow into a maximum of 4 columns to maintain touch targets and visual balance.

Spacing is generous to promote a sense of "air" and "cleanliness," consistent with the sustainability theme. Navigation elements like the footer are pinned to the bottom of the viewport with a distinct safe-area margin.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Soft Ambient Shadows**.

- **Level 0 (Surface):** The mint-tinted background.
- **Level 1 (Cards):** Pure white surfaces with a very soft, diffused green-tinted shadow (8px blur, 10% opacity of `#2E7D32`). This makes action cards feel "lifted" and interactable.
- **Header/Footer:** Uses a subtle inner-glow effect or a light backdrop blur (Glassmorphism) when overlapping the background pattern to maintain legibility.
- **Input Fields:** Inset shadows are used to indicate "hollow" spaces for data entry, providing a tactile feel.

## Shapes

The shape language is **Rounded (0.5rem / 8px)**. This avoids the clinical feel of sharp corners while remaining more structured and professional than a full pill-shaped system.

- **Standard Elements:** 8px radius (Buttons, Input fields).
- **Cards/Containers:** 16px radius (Large action blocks).
- **Navigation Footer:** 24px top-only radius to create a "drawer" effect.

## Components

### Action Cards
Cards are the primary navigation method. They must feature a white background, a centered icon using the brand's green palette, and a `label-lg` title below the icon. Icons should incorporate the standard recycling colors where applicable.

### Buttons
Primary buttons use a vertical gradient from `primary_color_hex` to `secondary_color_hex` to provide depth. Text inside buttons is always white and centered.

### Input Fields
Inputs are minimalist: a single `leaf-green` bottom border or a light grey stroke that transforms to `primary_color_hex` on focus. Labels sit above the input in `label-sm`.

### Navigation Footer
The footer is a solid white or semi-transparent container. It houses three primary icons: 
1. **Home/Profile (Leaf):** Context-aware icon.
2. **Action (Recycle):** Centered, often slightly larger or emphasized.
3. **Menu (Hamburger):** System settings and secondary navigation.

### Chips & Status
Small rounded badges used to indicate material types (e.g., "Plastic", "Organic"). These use a background of 15% opacity of the respective named color with 100% opacity text for contrast.