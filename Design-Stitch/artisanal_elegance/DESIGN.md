---
name: Artisanal Elegance
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cb'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae0'
  surface-container-high: '#fbe3d9'
  surface-container-highest: '#f5ded3'
  on-surface: '#251912'
  on-surface-variant: '#504444'
  inverse-surface: '#3b2d26'
  inverse-on-surface: '#ffede6'
  outline: '#827473'
  outline-variant: '#d4c2c2'
  surface-tint: '#7b5455'
  primary: '#7b5455'
  on-primary: '#ffffff'
  primary-container: '#d4a5a5'
  on-primary-container: '#5d3a3b'
  inverse-primary: '#ecbbba'
  secondary: '#745853'
  on-secondary: '#ffffff'
  secondary-container: '#fed7d0'
  on-secondary-container: '#795c57'
  tertiary: '#5f5e5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#b2b0ac'
  on-tertiary-container: '#444340'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdad9'
  primary-fixed-dim: '#ecbbba'
  on-primary-fixed: '#2f1314'
  on-primary-fixed-variant: '#603d3e'
  secondary-fixed: '#ffdad4'
  secondary-fixed-dim: '#e3beb8'
  on-secondary-fixed: '#2b1613'
  on-secondary-fixed-variant: '#5b403c'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fff8f6'
  on-background: '#251912'
  surface-variant: '#f5ded3'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
---

## Brand & Style

The brand personality is a sophisticated blend of feminine grace and commanding luxury. It celebrates the meticulous craft of crochet through a lens of high-end fashion, making traditional techniques feel contemporary and "imposing" in their quality.

The visual style is **Minimalist / Tactile**, characterized by:
- **Arched Architectures:** Using soft, organic curves and arched image masks to evoke a sense of sanctuary and classic elegance.
- **Breezy Composition:** Generous whitespace (or "cream-space") ensures the intricate textures of the crochet work remain the focal point.
- **Refined Motion:** Subtle fade-in animations and smooth scaling on hover to reinforce the "welcoming" and "delicate" nature of the brand.

## Colors

The palette is rooted in warmth and high-contrast sophistication:
- **Background (#FAF7F2):** A rich off-white/cream that provides a softer, more luxurious canvas than pure white.
- **Accents (#D4A5A5):** A tea rose/dusty rose used for primary actions, subtle highlights, and organic shapes.
- **Typography (#3E2723):** A deep coffee brown that offers the "imposing" contrast required for luxury, replacing harsh blacks with organic depth.
- **Muted Earth (#8D7A71):** A secondary neutral for borders, secondary text, and iconography to maintain a soft transition between the cream and dark brown.

## Typography

The typography system relies on the interplay between the editorial authority of **Playfair Display** and the modern accessibility of **Plus Jakarta Sans**.

- **Headlines:** Use Playfair Display to convey the "imposing" and "luxurious" tone. For hero sections, use slightly tighter letter spacing to create a high-fashion look.
- **Body Text:** Plus Jakarta Sans provides a clean, welcoming readability that balances the decorative nature of the headlines.
- **Labels:** Use uppercase Jakarta Sans with increased letter spacing for small UI elements (like "New Arrival" or "Sold Out") to maintain a structured, organized aesthetic.

## Layout & Spacing

This design system utilizes a **Fixed Grid** on desktop and a **Fluid Grid** on mobile.

- **Desktop (12 columns):** A 1280px centered container with 24px gutters. Sections should be separated by large vertical intervals (80px to 120px) to simulate a luxury boutique atmosphere.
- **Mobile (4 columns):** Full-width layout with 20px side margins. 
- **Arched Layouts:** Following the reference images, use asymmetrical layouts where images are often contained within arch-top frames. These frames should align with grid columns but vary in height to create a dynamic, rhythmic flow.

## Elevation & Depth

Visual hierarchy is achieved through soft tonal layering rather than aggressive shadows:
- **Surface-to-Surface:** Use the primary background (#FAF7F2) as the base, with slightly lighter or slightly darker (#F3EEE7) containers to define sections.
- **Subtle Shadows:** When elevation is required (e.g., product cards on hover), use highly diffused shadows: `0px 10px 30px rgba(62, 39, 35, 0.05)`. The shadow color should be a tint of the Coffee Brown typography, never pure gray.
- **Arched Masks:** Use CSS clip-paths or border-radius to create arch-shaped images, providing a structural depth that feels more like architecture than a screen.

## Shapes

The shape language is defined by "Soft Curves." 
- **Cards & Inputs:** Use a 16px corner radius (rounded-lg) for standard elements.
- **Arches:** Large decorative containers and featured product images should use a top-heavy border-radius (e.g., `120px 120px 16px 16px`) to create the signature arch silhouette.
- **Buttons:** Use fully pill-shaped (rounded-xl) or semi-rounded (12px) shapes to maintain a welcoming feel.

## Components

### Product Cards
Cards should be "borderless" with the image contained in a soft-arched frame. The product name (Playfair Display) and price (Jakarta Sans) should be centered underneath. A subtle hover state should gently scale the image or reveal a "Quick Add" button in the accent Tea Rose color.

### Filter Chips
Chips utilize the Tea Rose (#D4A5A5) for active states. Use a 1px border of #D4A5A5 for inactive states with Coffee Brown text. The shape should be pill-shaped with 12px vertical padding and 24px horizontal padding.

### Testimonial Carousel
Center-aligned typography. Use a large Playfair Display italic for the quote body. The carousel controls should be minimalist: simple Coffee Brown arrows or thin horizontal progress lines instead of traditional dots.

### Input Fields
Soft cream background (#F3EEE7) with a 1px border that darkens on focus. Labels should be small, uppercase Jakarta Sans, positioned above the field to maintain a clean, organized look.

### Primary Buttons
Solid Tea Rose (#D4A5A5) with white or Coffee Brown text. Use a light fade-in transition (300ms) for hover states, shifting the background slightly darker or adding a very soft lift shadow.