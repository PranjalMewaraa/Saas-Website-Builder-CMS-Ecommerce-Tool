# Redesign Log

A running log of the UI/UX redesign. Newest increments at the top. Each
increment leaves the app in a working state and is committed separately.

Scope: **Admin control panel** + **Drag-and-drop builder** (the two surfaces
a store owner uses to run their site). Storefront and superadmin are out of
scope for this pass.

Design direction (agreed): lean, spacious, low-jargon. Emerald accent
(`#127556`), Inter for UI text, Fraunces for display headings.

---

## Audit findings (Phase 0–2)

Problems the redesign is meant to fix, grouped by theme. Each is mapped to a
resolution as screens are rebuilt.

### Language & clarity
- **F1 — Jargon over plain language.** The shell calls routine actions things
  like "Initialize Workspace", "Active Environment", and "Select a digital
  asset to manage within your ecosystem." A store owner does not think in these
  terms. _Resolution: rewrite to task language ("Create site", "Current site")._
- **F2 — Unclear primary action.** No consistent, always-visible "what do I do
  next" affordance (e.g. a Publish bar). _Resolution: persistent publish/status
  bar in the shell._

### Navigation & structure
- **F3 — Accordion nav collapses context.** The sidebar shows one group at a
  time, hiding where you are in the rest of the product. _Resolution: flat,
  always-visible grouped nav._
- **F4 — Decorative glassmorphism** reduces contrast and legibility for no
  functional gain. _Resolution: solid surfaces, token-driven contrast._

### Forms & accessibility
- **F5 — Inputs without labels.** Signup and other forms use placeholder-only
  inputs, no real `<label>`, email field not `type="email"`, and some forms are
  not wrapped in `<form>`. _Resolution: the new `Field`/`Input` components make
  a real label mandatory; rebuild auth + settings forms on them._
- **F6 — No consistent states.** Loading, empty, and error states are ad hoc or
  missing. _Resolution: `Skeleton`, `EmptyState`, and field `error` are now part
  of the base kit._

### Code health (affecting maintainability of the UI)
- **F7 — `BlocksPropForm.tsx` is ~6,700 lines.** Monolithic inspector form.
  _Resolution (later): decompose as the builder inspector is rebuilt._
- **F8 — Orphaned dead code:** `content/pages/edit/_old/pageEditorClient.tsx`
  is unreachable. _Resolution: remove during builder rebuild._

---

## Increment 2 — Base component library — DONE (commit `fe86020`)
Built the accessibility-first base kit in `@acme/ui`, all consuming the new
tokens:
- `Button` (primary/accent/secondary/ghost/danger, sm/md/lg, `loading`)
- `Field` + `fieldAria` + `controlClass` (mandatory real labels, aria-wired
  hint/error)
- `Input`, `Textarea`, `Select` (built on `Field`)
- `Card` + `CardHeader`
- `Badge` (status tones + dot)
- `EmptyState`, `Skeleton`
- `Dialog` + `ConfirmDialog` (focus trap, Escape/backdrop dismiss, focus
  restore; the standard destructive-confirm convention)

`packages/ui/index.ts` now exports all of the above. `@acme/ui` typechecks
clean against the admin app (0 errors in `packages/ui/`).

## Increment 1 — Design tokens + fonts + config cleanup — DONE (commit `fe86020`)
- Rewrote `apps/admin/src/app/globals.css` to Tailwind v4 `@theme` tokens
  (color/radius/shadow/font scale), added `@source "../../../../packages/ui"`
  so the shared package is scanned, a global `:focus-visible` outline, and a
  `prefers-reduced-motion` reset. Kept the `.theme-root` storefront-preview
  rules.
- Switched `apps/admin/src/app/layout.tsx` to `next/font/google` Inter +
  Fraunces, exposed as CSS variables; body now `bg-canvas text-ink font-sans`.
- Deleted `apps/admin/tailwind.config.js` (vestigial under v4 — no `@config`
  directive references it; it held a debug safelist and a `console.log`).

---

## Next up
1. **App shell + nav + Publish bar** (fixes F1–F4).
2. **Home / dashboard** screen.
3. **Products / Orders** lists (real tables, empty/loading states — F6).
4. **Builder** inspector rebuild (F7, F8).
5. Bring `apps/builder` globals into token parity.
