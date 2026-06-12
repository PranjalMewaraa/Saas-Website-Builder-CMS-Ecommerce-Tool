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

## Increment 4 — Home / dashboard (`/content`) — DONE
Rebuilt the dashboard on the design system (`Card`, `CardHeader`, `Badge`,
`EmptyState`). All data-fetching (`getSiteStats`, `getCommerceStats`,
formatters) kept unchanged — pure UI swap.
- Removed glassmorphism + hardcoded neutral/blue palette → tokenized cards.
- Header now leads with the site name + a publish-status `Badge` (live/draft).
- Stat cards, "Publish status", "Next steps", "This site", and the grouped
  quick-links all rebuilt as token `Card`s.
- **5 states:** ideal (data) · loading (`content/loading.tsx` skeleton) ·
  empty/error (site-not-found → `EmptyState`) · partial (store "Not
  connected"). A dedicated error boundary is noted as follow-up.

**Bug fixed (not just cosmetic):** the old dashboard mutated the module-level
`ANALYTICS_CARDS` array on every request (`card.value = …`). Under concurrent
requests this races and can render another tenant's numbers. Replaced with a
per-render `statCards` array. _This is a correctness fix; output is otherwise
the same._

**Shared change flagged:** `content/layout.tsx` was a passthrough that wrapped
every `/content/*` page in a second `<main>` landmark plus `bg-gray-50` /
`bg-white` (it also imported `ContentNav` but never rendered it). Simplified to
return children directly — fixes the duplicate-`main` a11y issue and lets the
shell's canvas show through. Legacy content sub-pages (theme, assets, etc.,
not yet redesigned) now sit on canvas instead of a white block; they keep
their own surfaces so this reads fine, but it's a visual change to watch when
those screens get their pass.

## Increment 3 — App shell: nav + Publish bar — DONE
Rebuilt the admin chrome (`(adminPages)/shell/AdminShell.tsx`) on tokens and
the base kit. Fixes audit findings F1–F4.
- **Flat, always-visible grouped nav** (Overview / Design / Forms / Commerce /
  Settings) replacing the one-group-at-a-time accordion (F3). Active item uses
  `bg-accent-soft text-accent` + a left accent bar and `aria-current="page"`.
- **Persistent top Publish bar** (sticky header): site switcher + Preview +
  Publish actions always in reach (F2). Publish/Preview link to the existing
  `/content/publish` and `/content/preview` routes — no API behavior changed.
- **Plain language** (F1): "Initialize Workspace" / "Active Environment" /
  "Select a digital asset…" removed; nav reworded ("Store settings", "My
  store").
- **Removed glassmorphism** (F4): solid `bg-surface` / `border-line`, no
  backdrop-blur stacks.
- **Responsive**: sidebar becomes an off-canvas drawer below `lg` with a
  hamburger toggle (`aria-expanded`/`aria-controls`), backdrop, and Escape-free
  click-to-close; nav links close the drawer on navigate.
- Restyled `_components/SiteSwitcher.tsx` (tokens, listbox a11y roles) and
  `shell/Logout.tsx` (danger token) to match.
- Added `buttonClass()` export to `@acme/ui` Button so `<Link>` actions can
  read as buttons without losing link semantics.

**Behavior change flagged:** removed the client-side "forced site selection"
modal. It triggered on absence of the `site_id` *URL param*, but the
authoritative active site comes from the `active_site_id` *cookie* (read by
`ShellGate`, which already redirects to `/onboarding/create-site` when the
tenant truly has no site). The modal was a redundant, buggy gate that flashed
on first load even with an active site. `AdminShell` now accepts the
authoritative `siteId` prop from `ShellGate` (previously ignored — also the
source of a TypeScript error) and falls back to it when the URL param is
absent. Net: the panel still never renders without an active site; the false
modal is gone.

_Verification:_ `@acme/ui` + admin typecheck clean for all touched files. Dev
server serves `/` and `/login` (200) so shared modules compile. The `/content`
route itself requires an authenticated session + MongoDB (server-side
`ShellGate`), which can't be exercised via unauthenticated curl — **the shell
still needs a visual pass in an authenticated browser.**

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
