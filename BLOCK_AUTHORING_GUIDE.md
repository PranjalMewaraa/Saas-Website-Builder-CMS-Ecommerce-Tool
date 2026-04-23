# Block Authoring Guide

This guide explains the minimum steps required when adding a new block to the builder so it behaves correctly in:

- block picker
- page editor
- visual inspector
- default content generation
- future responsive/editor upgrades

## Goal

Every new block should ship with:

- a stable block type id
- renderer registration
- sensible default props
- block-specific content form fields
- style capability metadata

If any of these are skipped, the editor may show useless controls, save incomplete data, or render inconsistent previews.

## 1. Choose A Stable Block Type

Use a namespaced type:

- `Header/V1`
- `Hero/V1`
- `Utility/RichText`
- `Atomic/Text`

Rules:

- Keep the name stable after release.
- Prefer versioned names for major visual/behavior changes.
- Use prefixes consistently so family-based editor defaults continue to work.

## 2. Add The Block To Registry

Update:

- `/Users/pranjal/Desktop/MyProject/Saas/saas-store-builder/packages/blocks/registry/block-types.ts`
- `/Users/pranjal/Desktop/MyProject/Saas/saas-store-builder/packages/blocks/registry/index.ts`

Checklist:

- add the type to `BLOCK_TYPES`
- register renderer/schema in registry
- make sure editor-safe preview behavior exists where needed

## 3. Add Default Props

Update:

- `/Users/pranjal/Desktop/MyProject/Saas/saas-store-builder/apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx`

Specifically:

- add defaults in `defaultPropsFor(type)`

Rules:

- defaults should produce a usable block immediately after insertion
- never rely on undefined props for core rendering behavior
- arrays should default to arrays
- nested objects should default to full usable shapes

Bad:

```ts
return { items: undefined };
```

Good:

```ts
return { items: [{ title: "Item", text: "Description" }] };
```

## 4. Add Block-Specific Content Form

Update:

- `/Users/pranjal/Desktop/MyProject/Saas/saas-store-builder/apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx`

Add a new `if (type === "...")` branch for the block.

Rules:

- only expose fields that actually map to real props
- keep labels human-readable
- prefer compact groups of meaningful controls
- if a block is controlled elsewhere, say so explicitly instead of exposing fake controls

Example:

- `Layout/Section` correctly tells the user to use the layout editor instead of rendering misleading fields

## 5. Declare Style Capabilities

Update:

- `/Users/pranjal/Desktop/MyProject/Saas/saas-store-builder/packages/blocks/registry/block-style-capabilities.ts`

This file controls which generic style controls appear in `VisualInspector`.

Supported capabilities:

- `display`
- `textAlign`
- `flex`
- `grid`
- `container`
- `maxWidth`
- `padding`
- `margin`
- `typography`
- `textColor`
- `border`
- `radius`
- `shadow`
- `background`
- `stylePreview`

Rules:

- enable a capability only if the renderer meaningfully respects it
- do not expose typography for wrapper-only blocks unless text styling is genuinely applied
- do not expose grid/flex controls unless the block wrapper supports those layout modes
- use family defaults where possible, then override per block when needed

Examples:

- `Hero/V1`: typography, spacing, background, colors
- `Header/V1`: wrapper colors/background/border, but not generic typography
- `Utility/Spacer`: spacing only

## 6. Validate Renderer Support

Before enabling any style capability, verify the renderer actually consumes the style.

Questions to ask:

- does `textColor` affect real visible text?
- does `background` affect the block wrapper?
- does `padding` change visible spacing?
- does `radius` apply to the actual surface users expect?

If the answer is "not really", do not expose that control.

## 7. Keep Wrapper Styling And Internal Styling Distinct

Many blocks have nested internals:

- section wrapper
- cards
- headings
- buttons
- panels

The generic style inspector mostly targets wrapper-level styling.

So:

- use generic capabilities for wrapper concerns
- use block-specific props form for internal component design choices

Examples:

- grid card appearance belongs in the block-specific form
- section background belongs in generic style inspector

## 8. Avoid Fake Controls

Do not add fields that:

- write to props the renderer ignores
- imply responsiveness that is not implemented
- imply nested style control when only wrapper style exists

If a feature is not supported yet, leave it out.

## 9. Test Before Shipping

For every new block, test all of these:

1. add block from editor
2. edit content props
3. edit generic style props
4. save draft
5. reload editor
6. preview/render page
7. duplicate block
8. save block as template if applicable

Make sure:

- nothing crashes
- controls persist
- controls visibly affect the correct element

## 10. Future-Proofing Rule

When adding a new block, do not stop after renderer registration.

Minimum completion checklist:

1. block registered
2. defaults added
3. content form branch added
4. style capabilities added
5. editor-tested end to end

If any of the above is missing, the block is not editor-complete.

