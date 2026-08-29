---
name: Harudam
colors:
  surface: '#fff8f3'
  surface-dim: '#e4d8c9'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fef2e2'
  surface-container: '#f8ecdd'
  surface-container-high: '#f2e6d7'
  surface-container-highest: '#ece1d2'
  on-surface: '#201b12'
  on-surface-variant: '#56423b'
  inverse-surface: '#363025'
  inverse-on-surface: '#fbefe0'
  outline: '#89726a'
  outline-variant: '#dcc1b7'
  surface-tint: '#9d431c'
  primary: '#943d16'
  on-primary: '#ffffff'
  primary-container: '#b4542c'
  on-primary-container: '#fff3ef'
  inverse-primary: '#ffb59a'
  secondary: '#605e58'
  on-secondary: '#ffffff'
  secondary-container: '#e6e2da'
  on-secondary-container: '#66645e'
  tertiary: '#5f574d'
  on-tertiary: '#ffffff'
  tertiary-container: '#786f65'
  on-tertiary-container: '#fff4e9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7e2c05'
  secondary-fixed: '#e6e2da'
  secondary-fixed-dim: '#c9c6bf'
  on-secondary-fixed: '#1c1c17'
  on-secondary-fixed-variant: '#484741'
  tertiary-fixed: '#ede1d4'
  tertiary-fixed-dim: '#d0c5b9'
  on-tertiary-fixed: '#201b13'
  on-tertiary-fixed-variant: '#4d463c'
  background: '#fff8f3'
  on-background: '#201b12'
  surface-variant: '#ece1d2'
typography:
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.3'
  story-body:
    fontFamily: Source Serif 4
    fontSize: 22px
    fontWeight: '400'
    lineHeight: '1.7'
  label-lg:
    fontFamily: Noto Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: '1.2'
  label-md:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: '1.2'
  helper-text:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  margin-page: 2rem
  gutter-block: 1.5rem
  tap-target-min: 64px
  stack-spacing: 1rem
---

## Brand & Style
The design system is built on the metaphor of a physical journal—a quiet, tactile space for legacy and reflection. It targets elderly users who may feel alienated by contemporary digital interfaces. The emotional response is one of warmth, dignity, and calm, intentionally avoiding the coldness of medical software or the anxiety of complex data management.

The style is **Tactile Minimalism** with a paper-like foundation. It prioritizes legibility and physical familiarity over digital trends. Every screen should feel like a fresh page in a high-quality notebook, focusing on a single thoughtful prompt at a time. High contrast and generous spacing ensure accessibility for aging eyes without compromising the sophisticated, literary aesthetic.

## Colors
The palette is inspired by traditional ink and paper. The primary surface is a warm cream that reduces eye strain compared to pure white. 

- **Primary (Sunset Orange):** Reserved strictly for the most important action on a screen (e.g., "Save Story" or "Finish Recording"). Use it sparingly to maintain its significance.
- **Secondary (Paper Cream):** The base surface for all screens. In dark mode, this shifts to a deep charcoal-brown to maintain the warmth of the "ink" theme.
- **Tertiary (Ink Black):** Used for all primary body text and headings to ensure a minimum 7:1 contrast ratio.
- **Neutral (Stone Gray):** Used for secondary information, borders, and disabled states.

## Typography
This design system uses a dual-font approach to balance editorial beauty with functional clarity. 

**Source Serif 4** (substituting for Gowun Batang) is used for the "Soul" of the app: daily questions, the user's recorded stories, and the logo. It provides the literary, handwritten quality that evokes a physical book.

**Noto Sans** is used for the "Utility" of the app: button labels, navigation, and settings. This ensures that functional elements are unmistakable and highly legible. 

Line heights are intentionally generous (1.7x for body text) to accommodate users with visual impairments, ensuring lines of text do not bleed together.

## Layout & Spacing
The layout follows a **Fixed-Width Fluid** model. Content is centered with substantial safe-area margins (32px minimum) to prevent interactive elements from being too close to the edges of the device, which can be difficult for older users to grip.

- **Primary Action Focus:** Only one primary button should be visible at the bottom of the screen at any time.
- **Vertical Rhythm:** Use a strict vertical stack. Avoid side-by-side buttons or complex grids.
- **Tap Targets:** Every interactive element must have a minimum height of 64px to account for reduced motor precision.
- **Negative Space:** Use white space as a structural tool to separate thoughts. If a screen feels full, it should be broken into two separate steps.

## Elevation & Depth
Depth is communicated through **Tonal Layers** rather than shadows. To maintain the paper metaphor, avoid heavy drop shadows that suggest "floating" digital windows.

- **Level 0 (Surface):** The base Cream Paper.
- **Level 1 (Card):** A slightly lighter or darker tint with a subtle 1px border in a neutral tone. This simulates a sheet of paper resting on a desk.
- **Active State:** When a button is pressed, use a subtle "inset" look (Neomorphic influence) to simulate the physical depression of a button, providing immediate tactile feedback.
- **No Overlays:** Avoid complex modals or pop-ups. Use full-screen transitions to maintain a linear, easy-to-follow user journey.

## Shapes
The shape language is soft and organic. A standard radius of 20px (represented by `rounded-lg` in this system) is used for all containers and buttons. This high degree of rounding removes "sharpness" from the UI, making the digital experience feel friendlier and more approachable.

Avoid circles for everything except profile photos; buttons should be rounded rectangles to provide a larger, more reliable hit area for fingertips.

## Components
- **Primary Action Button:** 64px height, Sunset Orange background with Ink Black or White text. Use Noto Sans Bold.
- **The Story Card:** A cream surface with a subtle 1px border. Inside, the prompt is set in Source Serif 4, Large.
- **Input Fields:** Instead of a single-line box, use a "ruled paper" look with horizontal lines to guide the eye, reinforcing the handwriting metaphor.
- **Navigation:** Use a simple "Back" button with a text label (e.g., "← Back to Stories") rather than an icon alone. Icons must always be accompanied by labels.
- **Audio Recorder:** A large, singular button in the center of the screen. When recording, use a soft pulse effect (Sunset Orange) to indicate activity without distracting motion.
- **Lists:** Items should be separated by clear horizontal rules with 24px of padding above and below each item to ensure no accidental taps.