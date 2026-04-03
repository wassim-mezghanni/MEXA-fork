# Design System Document: The Scholarly Lens

## 1. Overview & Creative North Star
**Creative North Star: The Precision Curator**
This design system moves away from the "software-as-a-service" aesthetic toward a "High-End Editorial" experience. It is designed to feel like a living research paper—authoritative, quiet, and meticulously organized. We reject the cluttered, boxy layout of traditional dashboards in favor of **The Precision Curator** ethos: where white space is as functional as the data itself, and hierarchy is defined by tonal depth rather than structural lines.

By utilizing intentional asymmetry—such as offset experiment configuration panels and wide-margin data storytelling—we create a rhythmic flow that guides a researcher's eye through complex multilingual datasets without cognitive overload.

## 2. Colors & Tonal Architecture
The palette is a sophisticated interplay of deep teals and clinical neutrals. It avoids the "pure white" glare, opting for a layered, paper-like foundation.

### The "No-Line" Rule
**Explicit Instruction:** You are prohibited from using 1px solid borders to define sections. Boundaries must be created through background color shifts or subtle tonal transitions. For example, a data visualization area should be defined by a `surface-container-low` background sitting against a `surface` main body.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of fine vellum.
- **Base Level:** `surface` (#f8f9fa) for the main canvas.
- **Sectioning:** `surface-container-low` (#f3f4f5) for large layout blocks (e.g., sidebar or footer).
- **Interactive Layers:** `surface-container-lowest` (#ffffff) for primary content cards and data entry fields to create a "lifted" feel.
- **Overlays:** `surface-container-high` (#e7e8e9) for subtle callouts or secondary data clusters.

### The "Glass & Gradient" Rule
To escape the "flat" look, main Action buttons and Hero data points should utilize a subtle linear gradient from `primary` (#004655) to `primary_container` (#005f73). Floating configuration panels should use Glassmorphism: a semi-transparent `surface` color with a `backdrop-blur` of 12px-20px to maintain context of the underlying data.

## 3. Typography
The system uses a pairing of **Manrope** (Display/Headlines) and **Inter** (UI/Body) to balance academic authority with technical legibility.

*   **Display & Headlines (Manrope):** Chosen for its geometric precision. Use `display-md` for high-level LLM performance scores. Its wide stance conveys modern scholarly rigor.
*   **Body & Labels (Inter):** The workhorse. Use `body-md` for research notes and `label-sm` for data axis titles. Inter’s high x-height ensures that complex multilingual strings remain legible even at small scales.
*   **Hierarchy Tip:** Use `on-surface-variant` (#3f484c) for secondary metadata to create a "muted-ink" effect, reserving `on-surface` (#191c1d) for primary research findings.

## 4. Elevation & Depth
In this system, depth is "ambient," not "structural."

*   **The Layering Principle:** Stack `surface-container-lowest` cards on top of `surface-container` sections. This creates a soft, natural lift that mimics physical paper without the need for aggressive shadows.
*   **Ambient Shadows:** If a panel must float (e.g., a language selector), use a shadow with a 32px blur and 4% opacity, tinted with `on-surface`.
*   **The "Ghost Border" Fallback:** For accessibility in high-density data tables, use the `outline-variant` (#bfc8cc) at **15% opacity**. A 100% opaque border is considered a failure of the design system.

## 5. Components

### Data-Centric Components
*   **Complex Charts:** Use the `primary` (#004655) and `tertiary` (#004749) tokens for primary data series. For comparative multilingual sets, use the `primary_fixed` (#b2ebff) for a high-contrast but harmonious look.
*   **Data Tables:** Forbid the use of vertical and horizontal divider lines. Use alternating row colors (`surface` to `surface-container-low`) and generous vertical padding (16px) to define rows.
*   **Experiment Configuration Panels:** These should be treated as "Secondary Stages." Use `surface-container-highest` (#e1e3e4) for the background to signal a shift from "Viewing" to "Editing."

### Primitive Components
*   **Buttons:**
    *   *Primary:* Gradient fill (`primary` to `primary_container`), `lg` roundedness (0.5rem), white text.
    *   *Secondary:* `surface-container-lowest` fill with a "Ghost Border."
*   **Chips (Language/Model Tags):** Use `secondary_container` (#d5e5eb) with `on_secondary_container` (#58676c) text. Use `sm` roundedness (0.125rem) to maintain a "technical" sharp-edged look.
*   **Input Fields:** Use `surface-container-lowest` with a subtle 2px bottom-accent of `primary` when focused. Forbid full-box outlines.
*   **Tooltips:** Sophisticated `inverse_surface` (#2e3132) background with `inverse_on_surface` (#f0f1f2) text. Use a 150ms ease-in-out transition.

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. A wider left margin for the title and a narrower right margin for the data creates a sophisticated, editorial rhythm.
*   **Do** use `tertiary` colors for "Success" or "Validated" data points instead of a standard bright green. It feels more scholarly.
*   **Do** leverage `surface-tint` for subtle brand presence in large empty states.

### Don't
*   **Don't** use pure black (#000000) for text. Always use `on-surface` (#191c1d) to maintain the premium, soft-ink look.
*   **Don't** use 9999px "pill" buttons unless they are floating action buttons. Stick to the `lg` (0.5rem) or `md` (0.375rem) roundedness for a more architectural feel.
*   **Don't** use "Drop Shadows" on cards. Use tonal background shifts instead. If the card doesn't pop, your background color choice is likely too dark.