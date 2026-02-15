# Visual Builder Documentation (Detailed)

This document is a dedicated operational and technical guide for the Website Visual Builder. It explains how to build pages safely and efficiently, with special focus on the `Layout/Section` block model, inspector behavior, and customization strategy.

---

## 1) Purpose and Scope

The Visual Builder is the primary editing surface for designing pages without writing code. It is optimized for three outcomes:

1. Fast page composition for business users.
2. Predictable render parity between editor preview and published storefront.
3. Safe, structured customization through block contracts and inspector controls.

This guide is intended for:

1. Content editors building landing pages, policy pages, and conversion flows.
2. Catalog/marketing operators creating product listing and offer pages.
3. Designers who need precise layout control without custom CSS for every section.
4. Admins supporting teams and troubleshooting page behavior.

---

## 2) Builder Architecture Overview

The visual builder uses a layered architecture:

1. Canvas Layer:
   Shows live page composition and supports direct selection/hover actions.
2. Inspector Layer:
   Shows controls for the currently selected target (block, section, row, column, atomic).
3. Insertion Layer:
   Dialogs for adding new blocks/templates/atomics with category and search.
4. Renderer Layer:
   Converts block JSON into storefront-ready output using registered block definitions.
5. Snapshot/Publish Layer:
   Keeps draft changes separate from published state.

Core principle: **edit the correct layer**.  
Most styling/layout issues happen because users edit section styles while expecting row/column behavior (or vice versa).

---

## 3) Recommended Authoring Workflow

Use this sequence for reliable results:

1. Structure first:
   Add `Layout/Section` blocks and define content architecture.
2. Content second:
   Insert atomic blocks and fill real content (text/image/buttons/forms).
3. Layout tuning third:
   Adjust row/column alignment, spacing, width constraints.
4. Styling fourth:
   Apply typography, color, background, borders, hover styles.
5. Responsive pass:
   Validate desktop/tablet/mobile behavior.
6. QA and publish:
   Preview critical routes and publish snapshot.

Please note:

- Do not over-style before structure is stable.
- Use consistent spacing rhythm across the page.
- Validate data bindings (menu/form/product) before final styling.

---

## 4) Visual Builder UI Map

### 4.1 Canvas

Canvas is where you visually place and select elements.

Behavior expectations:

1. Hover outlines for interactive targets.
2. Hover-only controls for add/reorder/delete (to reduce UI clutter).
3. In-place selection of section/row/column/atomic.
4. Context actions near selected node.

### 4.2 Inspector

Inspector is the control center for selected node settings.

Expected grouping order:

1. Layout controls.
2. Content/props controls.
3. Spacing controls.
4. Typography controls.
5. Color & border controls.
6. Background controls.
7. Advanced/effects controls.

Inspector behavior guidelines:

1. Show only relevant fields for selected target.
2. Hide grid-only fields unless display is `grid`.
3. Hide flex-only fields unless display is `flex`.
4. Keep one accordion open at a time for focus.

### 4.3 Add Dialogs

Add dialogs should support:

1. Category tabs.
2. Search.
3. Visual thumbnails/previews.
4. Optional templates/presets.

---

## 5) Layout/Section Block (Detailed)

The `Layout/Section` block is the modern composition primitive.

Hierarchy:

1. `Section`
2. `Row`
3. `Column`
4. `Atomic blocks` (Text/Image/Video/Button/Form/Icon/Group/…)

This hierarchy allows precise page composition while preserving render compatibility.

### 5.1 Section Node

Section controls the outer shell:

1. Container width behavior.
2. Section height/min-max constraints.
3. Outer spacing (margin/padding).
4. Background (solid/gradient/image/video when enabled).
5. Global alignment anchor for inner rows.

Typical defaults:

1. Centered content framing (`display:flex`, `justify-content:center`).
2. Reasonable top/bottom padding.
3. Neutral background unless explicitly set.

Use section for:

1. Page-level rhythm.
2. Visual separation between content groups.
3. Full-width background treatments with centered inner content.

### 5.2 Row Node

Row controls arrangement of columns.

Row responsibilities:

1. Column count and distribution.
2. Layout mode (`flex` or `grid`).
3. Gap and alignment.
4. Max-width container control.
5. Preset-based quick layout or manual control.

Row presets are ideal for speed:

1. Single column.
2. 2-column equal split.
3. 3-column feature row.
4. Asymmetric split (70/30, 30/70, etc.).

Manual mode is best when:

1. You need custom alignment logic.
2. You need explicit grid track behavior.
3. You need non-standard responsive composition.

### 5.3 Column Node

Column is the local stack/container for content.

Column responsibilities:

1. Content flow direction and local alignment.
2. Internal spacing (gap/padding).
3. Width/min/max constraints.
4. Background/border when card-like surfaces are needed.
5. Holding multiple atomic blocks.

Use columns to:

1. Group related content units.
2. Create card-like surfaces.
3. Maintain independent local alignment from sibling columns.

### 5.4 Group as Atomic Container

`Group` block acts like a mini-layout region inside a column.

Use cases:

1. Feature card.
2. Pricing tile.
3. Info chips cluster.
4. Trust badge strip.

Best practice:

1. Keep section/row/column for macro layout.
2. Use group for reusable micro-layout patterns.

---

## 6) Inspector Deep Dive

Inspector should be context-sensitive and predictable.

### 6.1 Layout Group

Fields usually include:

1. Display (`block`, `flex`, `grid`).
2. Flex direction/wrap.
3. Align/justify.
4. Grid template columns/rows.
5. Gap.
6. Width/height/min/max values.

Conditional visibility rules:

1. Show flex controls only in flex mode.
2. Show grid controls only in grid mode.
3. Keep size controls always available where supported.

### 6.2 Spacing Group

Fields:

1. Margin (all + per-side).
2. Padding (all + per-side).
3. Row/column gap where applicable.

Input UX recommendation:

1. Unit-aware input (`px`, `%`, `rem`, `em`, `vw`, `vh`).
2. Auto-detect unit from typed value.
3. Dropdown unit selector for quick conversion.

### 6.3 Typography Group

Fields:

1. Font size/weight/line-height.
2. Letter spacing.
3. Text align.
4. Text transform/decoration.
5. Semantic tag choice for text atomics (`h1-h6`, `p`, etc.).

Guidance:

1. Keep heading hierarchy semantic.
2. Use presets for consistency.

### 6.4 Color & Border Group

Fields:

1. Text color.
2. Background color.
3. Border color/style/width/radius.
4. Opacity.
5. Optional hover color variants for interactive elements.

UI stability requirements:

1. Inputs must not overlap at narrower inspector widths.
2. Prefer single-column arrangement where dense fields exist.

### 6.5 Background Group

Background options should be grouped separately:

1. Solid color.
2. Gradient (from/to, angle/type).
3. Image background (size, position, repeat, overlay).
4. Video background (source, fit, overlay, fallback).

Rules:

1. Keep fallback readable (contrast first).
2. Avoid forcing hidden overlays that block expected edits.

### 6.6 Content/Props Group

For atomics:

1. Text content and semantic tag.
2. Image source/alt.
3. Video source/options.
4. Button text/link/icon/target.
5. Form binding (`formId`).

For dynamic blocks:

1. Menu binding in header/footer.
2. Product source/store scope where applicable.

### 6.7 Advanced Group

Fields:

1. Shadows.
2. Transitions.
3. Z-index.
4. Overflow behavior.
5. Custom classes (if allowed).

Use carefully:

1. Prefer system controls first.
2. Use advanced fields for specific visual edge-cases.

---

## 7) Customization Matrix (What to Edit Where)

Use this map to avoid layer confusion:

1. Need full-width section background:
   Edit `Section` background, not row.
2. Need inner content container width:
   Edit `Row` max-width.
3. Need spacing between cards in same row:
   Edit `Row` gap or grid gap.
4. Need spacing between text and button in one column:
   Edit `Column` gap or atomic margin.
5. Need button hover styling:
   Edit `Atomic/Button` hover fields.
6. Need card pattern reused in multiple columns:
   Build once with `Group` then duplicate.

---

## 8) Rendering Parity and QA

Parity target: visual builder output should match preview and published site.

Checklist before publish:

1. Validate route and scope context.
2. Validate dynamic bindings (menu/form/products).
3. Validate responsive layout.
4. Validate typography and contrast.
5. Validate CTA behavior and links.
6. Validate placeholders are replaced.

Common mismatch causes:

1. Scope mismatch (wrong site/store/handle).
2. Missing bindings.
3. Draft vs published confusion.
4. Missing style safelist for dynamic classes.
5. Hidden defaults or forced overlays.

---

## 9) Troubleshooting Guide

### Problem: “Style change not visible”

Checks:

1. Confirm correct node is selected.
2. Confirm style is not overridden at child level.
3. Confirm mode-specific field relevance (grid/flex).
4. Confirm saved draft and refreshed preview.

### Problem: “Preview differs from published”

Checks:

1. Confirm snapshot was published after edits.
2. Confirm route query is not forcing draft preview mode.
3. Confirm correct site/handle context.

### Problem: “Dynamic content block appears empty”

Checks:

1. Verify binding IDs (menu/form/category/store).
2. Verify data exists in active scope.
3. Verify published snapshot contains latest references.

### Problem: “Layout stacks unexpectedly”

Checks:

1. Verify row display mode.
2. Verify column width constraints.
3. Remove accidental wrapper styles that break layout flow.

---

## 10) Governance and Team Standards

For multi-editor teams, define standards:

1. Naming:
   Section purpose naming and block naming conventions.
2. Spacing:
   Shared spacing scale.
3. Typography:
   Shared heading/body presets.
4. Review:
   Pre-publish QA checklist.
5. Ownership:
   Assign owners for content, design consistency, and release approval.

Operational rule:

1. No direct publish for major pages without preview sign-off.
2. Keep release notes for significant page edits.
3. Use templates/presets to reduce variation drift.

---

## 11) Quick Start (Practical)

If you need to build one conversion page quickly:

1. Add a `Layout/Section` for hero.
2. Add row preset (2-col or centered single-col).
3. Add text/image/button atomics.
4. Add trust/proof section using feature cards (group blocks).
5. Add FAQ or form section.
6. Add CTA footer section.
7. Run responsive pass.
8. Preview route and publish.

Please note:

- Optimize for clarity before decoration.
- Keep one primary CTA per viewport section.
- Use inspector groups in order: Layout -> Content -> Spacing -> Typography -> Color/Background.

