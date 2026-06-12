# Design System

The shared visual language and component kit for the admin control panel and
builder. Components live in `@acme/ui` (`packages/ui`); tokens live in
`apps/admin/src/app/globals.css` under Tailwind v4 `@theme`. The builder app
(`apps/builder/src/app/globals.css`) mirrors the same `@theme` set — keep the
two in sync when a token changes.

> **One rule:** screens compose `@acme/ui` components and reference tokens via
> utility classes. Don't hardcode hex colors, pixel radii, or one-off form
> markup in feature code.

---

## Tokens

Defined as CSS variables in the `@theme` block. Tailwind v4 turns each into a
utility automatically.

### Color

| Token | Value | Utilities | Use |
| --- | --- | --- | --- |
| `--color-canvas` | `#fafaf8` | `bg-canvas` | App background |
| `--color-surface` | `#ffffff` | `bg-surface` | Cards, panels, inputs |
| `--color-ink` | `#1a1a1a` | `text-ink`, `bg-ink` | Primary text; primary button |
| `--color-muted` | `#5b5f66` | `text-muted` | Secondary text, hints |
| `--color-line` | `#e7e5e0` | `border-line` | Borders, dividers |
| `--color-accent` | `#127556` | `bg-accent`, `text-accent` | Primary CTAs, active state |
| `--color-accent-fg` | `#ffffff` | `text-accent-fg` | Text on accent |
| `--color-accent-soft` | `#e7f1ec` | `bg-accent-soft` | Accent/live badge bg |
| `--color-draft` / `-soft` | `#b45309` / `#fdf3e7` | `text-draft`, `bg-draft-soft` | Draft status |
| `--color-danger` / `-fg` / `-soft` | `#b42318` / `#fff` / `#fdecea` | `text-danger`, `bg-danger` | Errors, destructive |

### Radius

| Token | Value | Utility | Use |
| --- | --- | --- | --- |
| `--radius-control` | 8px | `rounded-control` | Buttons, inputs, badges |
| `--radius-card` | 12px | `rounded-card` | Cards, panels |
| `--radius-modal` | 20px | `rounded-modal` | Dialogs |

### Shadow

| Token | Utility | Use |
| --- | --- | --- |
| `--shadow-rest` | `shadow-rest` | Cards at rest |
| `--shadow-raised` | `shadow-raised` | Dialogs, popovers |

### Type

| Token | Utility | Use |
| --- | --- | --- |
| `--font-sans` (Inter) | `font-sans` | All UI text (default on `<body>`) |
| `--font-display` (Fraunces) | `font-display` | Large display headings |

To re-theme (e.g. change the accent), edit the variable once in `globals.css`.

---

## Components (`@acme/ui`)

Import from the package root: `import { Button, Input } from "@acme/ui";`

### Button
`variant`: `primary` (ink) · `accent` · `secondary` · `ghost` · `danger`.
`size`: `sm` · `md` (default) · `lg`. `loading` shows a spinner, disables the
button, and sets `aria-busy`. Defaults to `type="button"`.

### Form controls — Input, Textarea, Select
All take a **required** `label` plus optional `hint`, `error`, `required`. They
render through `Field`, which guarantees a real `<label htmlFor>`, marks
required fields for screen readers, and links `hint`/`error` via
`aria-describedby` (errors get `role="alert"`, control gets `aria-invalid`).
IDs auto-generate via `useId()`. **Never** render a bare `<input>` in feature
code — use these.

`Field`, `fieldAria(id, hint, error)`, and `controlClass(error?)` are exported
for the rare custom control that still needs accessible wiring.

### Card / CardHeader
`Card` is the standard surface (`padded` defaults true; set false for flush
content like tables). `CardHeader` takes `title`, optional `description`, and an
optional `action` slot (right-aligned).

### Badge
Status pill. `tone`: `neutral` · `accent` · `draft` · `danger` · `live`.
`dot` adds a leading status dot (pair with `live`/`draft`).

### EmptyState
Zero-state for empty lists/panels: `icon?`, `title`, `description?`, `action?`.
Use instead of leaving a blank region — always give the user a next step.

### Skeleton
Loading placeholder; size it with className. Pulse respects
`prefers-reduced-motion` via the global motion reset.

### Dialog / ConfirmDialog
`Dialog` is an accessible modal (portal-rendered): focus moves in on open and
restores on close, Tab is trapped, Escape and backdrop click dismiss,
`role="dialog"` + `aria-modal` + labelled/described by title/description.
`ConfirmDialog` is the **standard convention** for "are you sure?" flows; set
`destructive` for irreversible actions (renders the danger button) and pass
`loading` while the action is in flight.

---

## Block inspector (builder)

The page-builder inspector is **registry-driven**, not a monolith. To add or
change a block's edit form:

- **Editors** live in
  `apps/admin/src/app/(adminPages)/content/pages/edit/components/inspector/editors/`,
  grouped by domain: `commerce.tsx`, `structure.tsx`, `marketing.tsx`. Each
  exports one component per block type, typed as `BlockEditorProps` (`types.ts`).
- **Register** the block in `inspector/registry.tsx` (`BLOCK_EDITORS`), keyed by
  block type (e.g. `"Hero/V1"`). `BlocksPropForm` does a single lookup and
  renders the match, falling through to a generic "no form" message.
- **Shared inputs** (`Field`, `NumberField`, `Select`, `RichTextEditor`,
  `IconPicker`, …) come from `inspector/primitives`; don't hand-roll inputs.
- **Defaults** for a new block come from one shared `inspector/defaultPropsFor.ts`.

Don't reintroduce per-type `if (type === …)` branches in `BlocksPropForm` — that
monolith (F7) is what the registry replaced.

---

## Quality floor (every screen)

Each rebuilt screen must be: responsive, keyboard-navigable with a visible
focus ring (global `:focus-visible` outline), honor `prefers-reduced-motion`,
use semantic HTML, give every input a real label, and handle all five states —
**empty, loading, error, partial, and ideal**.
