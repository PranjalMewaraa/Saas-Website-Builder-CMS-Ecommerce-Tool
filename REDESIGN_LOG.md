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

## Findings → Resolutions (handoff)

Every audit finding is resolved. Where it landed:

| Finding | Resolution | Where |
| --- | --- | --- |
| **F1** — Jargon over plain language | Shell copy rewritten to task language ("Create site", "Current site", "Publish") | Increment 3 (app shell) |
| **F2** — Unclear primary action | Persistent Publish/status bar in the shell | Increment 3 |
| **F3** — Accordion nav collapses context | Flat, always-visible grouped nav | Increment 3 |
| **F4** — Decorative glassmorphism | Solid token-driven surfaces (`bg-surface`/`bg-canvas`), removed glass | Increment 1 (tokens) + Increment 3 |
| **F5** — Inputs without labels | `Field`/`Input`/`Textarea`/`Select` make a real `<label>` mandatory; auth forms rebuilt on them | Increment 2 (base kit) + Increment 6 (auth) |
| **F6** — No consistent states | `Skeleton`, `EmptyState`, `Badge`, field `error` in the base kit; applied across rebuilt screens (empty/loading/error/partial/ideal) | Increment 2 + Increments 4–5 |
| **F7** — `BlocksPropForm.tsx` ~6,700 lines | Decomposed into shared primitives + per-block editor modules behind one registry; `BlocksPropForm` now ~128 lines; one shared `defaultPropsFor` | Increments 8–12 |
| **F8** — Orphaned/dead code + builder off-token | Removed `_old/pageEditorClient.tsx`; brought `apps/builder` globals to token parity; removed the accidental home-editor paste from `builderClient.tsx` (and fixed its broken `defaultProps`); tokenized `builderClient.tsx` + `InspectorPanel.tsx` | Increment 7 + Increment 13 |

Reference deliverables: **`DESIGN_SYSTEM.md`** (tokens + component kit + quality
floor) and this log (per-increment detail, newest first).

---

## Increment 16 — Improve blocks: picker previews + inspector tokenization — DONE
"Improve blocks" pass over the block authoring experience in the Page Editor
Studio. Four commits, all pure UI (no logic/API/registry/renderer change):

- **Add Block picker — schematic previews.** The picker cards showed only the
  block name repeated twice (once as a flat label-in-a-box). Replaced the box
  with a token-colored SVG wireframe (`BlockGlyph`) that schematically shows
  each block's layout — bar-top/footer, hero, grid, list, split, panel, form,
  banner, features, quote, pricing columns, map, section, divider, etc.
  `blockGlyphKind()` maps the 40+ registered types to ~16 archetypes; the card
  keeps the readable name via `title="Insert …"`, glyph is `aria-hidden`.
- **VisualInspector — tokenized.** Shared field primitives (Field, UnitField,
  TextArea, NumberField, Select, Checkbox) plus the breakpoint "Editing" card
  moved off slate/blue (blue focus rings, rounded-lg/xl) onto surface/line/
  control + accent focus. Delete Block -> danger token.
- **LayoutInspector — tokenized.** Same duplicated primitives, plus preset/
  gallery pickers, breakpoint toggles (bg-black -> accent), collapsible
  `<details>` panels, and the icon-picker modal (bg-black/40 -> bg-ink/40,
  bg-white -> surface/rounded-modal, +role=dialog/aria). Bare borders paired
  with border-line.
- **ImageField + StylePreviewCard.** ImageField was glassmorphism (F4 finding:
  rounded-[2rem], bg-white/50, blur, bg-black button) — rebuilt on solid
  canvas/line/surface, accent button + focus rings. StylePreviewCard frame
  tokenized; its preview-canvas overlays kept neutral by design.
- Verification: each file greps clean of off-brand palette/radius classes;
  admin `tsc` unchanged at its 40 pre-existing baseline errors (none in touched
  files). Still pending under "improve blocks": renderer default-props/spacing
  polish and any net-new block types — both structural, to be flagged first.

## Increment 15 — Page Editor Studio onto the design system — DONE
The `/content/pages/editor` "Page Editor Studio" (a second, drag-and-drop
visual editor distinct from the main builder) had never been touched by the
redesign and still shipped a slate/blue/indigo/gray/black palette with
`rounded-xl/2xl` radii and native-looking buttons. Brought it fully onto the
admin tokens. **Pure styling pass — no logic, API, payload, or layout/grid
change; the existing `useUI()` toast/confirm/prompt provider stays.**

- **States & actions:** loading → centered `Loader2` spinner + `sr-only`
  `role=status`; error → tokenized card with `Button` Retry; JSON-mode and the
  footer **Save Draft** → `@acme/ui` `Button` (`primary`/`accent`-success,
  `loading` from `saveStatus`).
- **Left panel & tabs:** panel container on `bg-canvas/surface` + `border-line`
  + `shadow-rest`; Layers/Inspector and the SEO-view Layout/SEO toggles →
  `role=tablist`/`role=tab`/`aria-selected`, active `bg-surface text-accent
  shadow-rest`; layer rows use accent selection ring; empty-layers and
  empty-inspector states tokenized.
- **Add Block modal:** `role=dialog`/`aria-modal`; `bg-ink/60` backdrop,
  `rounded-modal` surface; Blocks/Templates tabs + search input + preview cards
  on tokens with focus rings; Close → `Button variant="secondary"`.
- **Canvas Toolbar:** page title/slug, device (laptop/tablet/mobile), zoom,
  Fit, Grid, Outline controls moved off slate/blue onto tokens with
  `aria-pressed` and `bg-surface text-accent shadow-rest` active state.
- Verification: `grep` confirms zero off-brand palette/radius classes remain in
  the file; admin `tsc` shows no errors in `pageEditorStudioClient.tsx` (the 40
  baseline errors are pre-existing and elsewhere). Committed separately from any
  correctness work.

## Increment 14 — Builder UX polish: accessible states & dialogs — DONE
A follow-on pass over the builder's *interaction* quality (not the block
catalog). The shell and its panels still leaned on jarring native
`alert/confirm/prompt`, had no real empty/loading states, and the panel
subcomponents were off-token. Brought them onto `@acme/ui` and the design
system. No business-logic change — same API endpoints, same payload shapes.

- **Correctness prerequisite (committed separately):** `@acme/ui` is a React
  component library that declared **no React dependency**. The builder had
  never imported `@acme/ui` before this work; once it did, `tsc` followed into
  the package source, failed to resolve `react`, and every component's prop
  types collapsed to empty (bogus "Cannot find module 'react'" + missing-prop
  errors). This was a latent issue admin already shipped with (same errors in
  its baseline). Fixed by mirroring `@acme/renderer`: react/react-dom as
  `peerDependencies`, `@types/react(-dom)` as `devDependencies`. Cleans the
  errors from **both** apps' typechecks.
- **`builderClient.tsx` (states & dialogs):** section-delete with content →
  destructive `ConfirmDialog` (empty sections still delete immediately); the
  "Save Section as Template" `prompt`-chain → a real `Dialog` form (name/tags/
  scope) posting the identical `/api/admin/section-templates` payload, with
  inline validation + a success `Badge`; Save Draft `alert()` → `Button`
  loading/"Saved ✓" state; plain "Loading…" → a 3-column `Skeleton` screen with
  an `sr-only` status; empty canvas → `EmptyState` with a "Browse blocks" next
  step.
- **Subcomponents (tokenize + a11y):** `SectionCanvas` (accent ring + token
  borders; native `prompt` rename → accessible inline input with Enter/Escape),
  `TemplatesPanel` (native `confirm` delete → `ConfirmDialog` + loading; scope
  `Badge`; no-results `EmptyState`), `BlockLibraryPanel` (tokenized cards +
  focus rings, `Input` search, no-match `EmptyState`), `SortableBlockRow`
  (`Button` actions), `SectionInspectorPanel` (`bg-black` breakpoint toggles →
  accent/secondary `Button` group with `aria-pressed`/`role=group`),
  `StyleEditor` (token inputs + focus rings, value-callback helpers intact).
- Verification: builder `tsc` stays at the 6 pre-existing baseline errors
  (InspectorPanel zod-variance, db-mongo, renderer) — none in touched files.

## Increment 13 — Builder client repair + token parity (F8, final) — DONE
Closed the piece Increment 7 deferred: the builder's two large surfaces
(`builderClient.tsx`, `InspectorPanel.tsx`) were still on legacy utility
classes, and `builderClient.tsx` did not even compile.

- **Structural repair (committed separately):** `builderClient.tsx` had ~1100
  lines of the home editor accidentally appended (commit `d0a6898`) — a second
  `export default`, plus `_component/*` imports unresolvable from the builder
  path. The real `BuilderClient.addBlock` also called an undefined
  `defaultProps(type)`. Removed the dead tail and defined `defaultProps` by
  deriving from each block's zod schema via
  `getBlockBuilder(type).schema.safeParse({})` (schemas carry `.default()`),
  so adding a block yields real defaults with no mysql import.
- **Token parity:** replaced hardcoded utilities with the token set —
  `bg-black text-white` → `bg-ink text-white`, `bg-red-50` → `bg-danger-soft`,
  bare `rounded`/`border rounded` → `rounded-control` + explicit `border-line`
  (no global default border-color exists, so bare `border` was rendering as
  `currentColor`; `border-line` is both parity and a hairline fix). Directional
  borders (`border-r`/`border-l`/`border-b`) also paired with `border-line`.
- Verification: builder `tsc` drops from a non-compiling state to the 6
  pre-existing baseline errors (InspectorPanel zod-variance, db-mongo,
  renderer) — none in the touched files.

## Increment 12 — Inspector decomposition: unified defaultPropsFor (F7, final) — DONE
Collapsed the drifted `defaultPropsFor` copies into one shared module and
repointed both live page editors at it, finishing F7.

Before: three copies of `defaultPropsFor` — `edit/pageEditorClient.tsx`
(571 lines, the superset, ~45 block types), `home/homePageEditorClient.tsx`
(61 lines, 5 types), and a dead one in `edit/components/BlockCard.tsx`
(208 lines, never called/exported).

Drift analysis (home's 5 types vs edit): `Form/V1` identical; `Header/V1`,
`Footer/V1`, `ProductGrid/V1` were strict subsets of edit (same values, fewer
keys); `Hero` differed only by key name (home adds bare `"Hero"`, edit keys on
`"Hero/V1"`). No value conflicts.

This increment:
- Added `components/inspector/defaultPropsFor.ts` — edit's superset extracted
  verbatim and exported, with one change: the Hero branch now matches
  `"Hero/V1" || "Hero"` so the home palette's bare `"Hero"` keeps getting
  defaults.
- Repointed `edit` and `home` at the shared module; deleted all three local
  copies (incl. the dead BlockCard one).
- **Behavior change (approved — "converge on edit's superset"):** newly-added
  `Header/Footer/ProductGrid` blocks in the **home editor** now get edit's
  richer defaults (e.g. Footer defaults to showing description/badge/socials).
  Home's `Hero` also moves from a minimal 4-key default to the full Hero/V1
  default — home's richer Hero branch was previously dead code (shadowed by a
  duplicate `if`), so this also clears that latent bug. Existing saved pages are
  unaffected; `defaultPropsFor` only runs when a block is added.
- Net: −840 lines across the two editors + BlockCard. Typecheck unchanged
  (no new errors).

**F7 is complete:** one decomposed inspector (commerce/structure/marketing
editor modules + registry) and one shared `defaultPropsFor`, both consumed by
the edit and home editors. `BlocksPropForm.tsx` went from ~6,700 lines to 128.

## Increment 11 — Inspector decomposition: marketing editors (F7, step 4) — DONE
Migrated the final cluster — all 27 marketing/section blocks — out of the
`BlocksPropForm.tsx` monolith, completing the per-block extraction.

This increment (behavior-preserving, the `edit` route only):
- Added `components/inspector/editors/marketing.tsx` with 27 editors extracted
  verbatim (BannerCTA, FeaturesGrid, Testimonials, BrandGrid, MegaMenu,
  StoreLocator, BundleOffer, ProductHighlight, PricingTable, BentoGrid,
  BeforeAfterSlider, StickyPromoBar, TestimonialCarousel, ComparisonTable,
  MarqueeStrip, SpotlightCards, ProcessTimeline, MediaGalleryMasonry,
  VideoHeroLite, KPIRibbon, InteractiveTabs, FloatingCTA, ContentSplitShowcase,
  SocialProofTicker, StatsCounter, LogosCloud, NewsletterSignup). These call
  `ResetStyleButton` (as JSX) and `applyPresetStylePack` unguarded, so both were
  tightened to required in `BlockEditorProps`; the registry already forwards them.
- Registered all 27 under their block keys.
- Deleted the 27 inline branches and the now-dead imports they used
  (`ImageField`, `ColorPickerInput`, the inspector primitives, `DEFAULT_IMAGE`).
- **`BlocksPropForm.tsx` is now 128 lines** — just the lifted context/state, the
  three menu/variant/rich-text effects, the registry lookup, and the generic
  "no form available" fallback for unknown types. Down from the original ~6,700.
- Net this increment: 3,608 → 128 lines. Typecheck clean for touched files.

_Next step (final F7): build one superset `defaultPropsFor` and repoint `home`
(and `edit`) at the shared registry, with per-route verification — the four
existing `defaultPropsFor` copies have drifted, so this needs a careful diff
rather than a straight move._

## Increment 10 — Inspector decomposition: structure/hero editors (F7, step 3) — DONE
Migrated the structural and hero block branches — the largest cluster in the
monolith — out of `BlocksPropForm.tsx` into the registry.

This increment (behavior-preserving, the `edit` route only):
- Added `components/inspector/editors/structure.tsx` with eight editors
  extracted verbatim: `HeaderV1`, `LayoutSection`, `FormV1`, `FooterV1`,
  `HeroV1`, `UtilitySpacer`, `UtilityDivider`, `UtilityRichText`. These consume
  more of the editor context than the commerce batch (menus, variant state,
  rich-text mode, `setPropPath`, `siteId`/asset wiring), so `BlockEditorProps`
  tightened the fields the branches call unguarded to required (`setPropPath`,
  `setVariant`, `setRichMode`, `menus`, `forms`, `siteId`, `variant`,
  `richMode`); the registry already forwards all of these.
- Registered the eight under their block keys (`Hero` and `Hero/V1` both map to
  `HeroV1`, matching the monolith's `||` branch).
- Moved the shared `DEFAULT_IMAGE` constant into
  `components/inspector/constants.ts` so the editor module and the form share
  one source (avoids a circular import back through `BlocksPropForm`).
- Deleted the eight migrated inline branches.
- Net: `BlocksPropForm.tsx` shrank 5,216 → 3,608 lines; no behavior change.
  Typecheck clean for the touched files.
- Note: the editor module is named `structure.tsx`, not `layout.tsx` — inside
  the `app/` tree Next reserves `layout.tsx` as a route file and the type
  generator rejected the non-default export.

_Next steps (later increments): migrate the remaining ~27 marketing blocks
(BannerCTA, FeaturesGrid, Testimonials, … NewsletterSignup) into editor modules
behind the registry; then build one superset `defaultPropsFor` and repoint
`home` (and `edit`) at it with per-route verification._

## Increment 9 — Inspector decomposition: commerce editors + registry (F7, step 2) — DONE
Stood up the per-block editor registry and migrated the first batch of block
branches out of the `BlocksPropForm.tsx` monolith into dedicated modules. This
is the dispatch layer every future batch plugs into.

This increment (behavior-preserving, the `edit` route only):
- Added `components/inspector/types.ts` exporting `BlockEditorProps` — the
  shared context contract each per-block editor receives (mirrors the loose
  `any` props the monolith already passes; no stricter contract invented).
- Added `components/inspector/editors/commerce.tsx` with the six commerce
  editors extracted verbatim from the monolith: `ProductListV1`,
  `ProductDetailV1`, `CartPageV1`, `CartSummaryV1`, `AddToCartV1` (carrying its
  local `presets`), `ProductGridV1`.
- Added `components/inspector/registry.tsx` mapping block type → editor
  (`BLOCK_EDITORS`). `BlockPropsForm` now does one lookup after its effects and
  before the inline if-chain: `const Editor = BLOCK_EDITORS[type]; if (Editor)
  return <Editor {...ctx} />`. Unregistered types fall through unchanged.
- Deleted the six now-migrated inline branches.
- Net: `BlocksPropForm.tsx` shrank 5,716 → 5,216 lines; no behavior change.
  Typecheck clean for the touched files (remaining tsc noise is the known
  dev-server `.next/dev/types` JSX-prop regeneration, unrelated to this change).

_Next steps (later increments): migrate the remaining ~39 branches (hero/layout,
then marketing blocks) into editor modules behind the same registry; then build
one superset `defaultPropsFor` and repoint `home` (and `edit`) at it with
per-route verification since the four copies have drifted._

## Increment 8 — Inspector decomposition: shared primitives (F7, step 1) — DONE
First step of consolidating the triplicated block-prop inspector into one
decomposed registry. Mapping first surfaced that the inspector logic is
duplicated across three page editors — `/content/pages/edit` (uses the shared
`BlocksPropForm.tsx`), `/content/pages/home` (own inline copy), and the
orphaned `/content/pages/editor` "studio" (own inline copy) — with
`defaultPropsFor` living in four drifted copies (476 / 571 / 61 / 605 lines).
Per direction: converge on one inspector; keep the studio route for now.

This increment (behavior-preserving, the `edit` route only):
- Extracted the presentational primitives (`ICON_OPTIONS`, `IconPicker`,
  `SocialLinksEditor`, `Field`, `NumberField`, `Select`, `RichTextEditor`)
  from `BlocksPropForm.tsx` into a shared `components/inspector/primitives.tsx`;
  the form now imports them. This is the shared layer the per-block editor
  modules (and the home/studio editors, once repointed) will consume.
- Deleted the canonical file's `defaultPropsFor` (476 lines) — it was never
  exported or called; the live one lives in `pageEditorClient.tsx`.
- Removed a stray `console.log(type)` and the now-unused tiptap/lucide imports.
- Net: `BlocksPropForm.tsx` shrank 6,682 → 5,716 lines; no behavior change.

_Next steps (later increments): split the ~45 per-block branches into
per-block editor modules behind a registry; build one superset `defaultPropsFor`
and repoint `home` (and `edit`) at it — that one needs per-route verification
since the four copies have drifted._

## Increment 7 — Builder token parity + dead-code removal — DONE
Brought `apps/builder` onto the same token foundation as admin and cleared
audit finding **F8**.
- `apps/builder/src/app/globals.css`: replaced the stock Next boilerplate
  (Geist/Arial body, `--background`/`--foreground`, auto dark mode) with the
  full admin token set (`@theme` colors/radii/shadows/fonts), the
  `@source "../../../../packages/ui"` scan, the keyboard focus-visible ring,
  and the reduced-motion reset. Kept in sync with the admin globals.
- `apps/builder/src/app/layout.tsx`: swapped Geist → Inter + Fraunces
  (matching admin's `--font-inter`/`--font-fraunces` variables); body now
  `bg-canvas text-ink font-sans`. Fixed the placeholder "Create Next App"
  metadata.
- Removed the orphaned `content/pages/edit/_old/pageEditorClient.tsx`
  (~36 KB, unreferenced — the live editor is the sibling `pageEditorClient.tsx`).
- **Scope note:** this establishes the token/font foundation only. The large
  builder UI (`builderClient.tsx`, `InspectorPanel.tsx`) still uses legacy
  utility names (`text-foreground`, `bg-primary`, etc.); those are tokenized
  in the upcoming builder-inspector rebuild (F7).

## Increment 6 — Auth forms (signup + login) — DONE
Rebuilt the two unauthenticated entry screens on the design system. Closes
audit finding **F5** (placeholder-only inputs, no real labels).
- Both forms now use the `Input` component: every control has a real
  `<label>`, the email field is `type="email"`, password fields carry the
  right `autocomplete` (`new-password` / `current-password`), and inputs are
  wrapped in a `<form>` with a real submit button.
- Signup converted from on-click handler to `onSubmit`; tokenized `Card`
  shell, accent submit, cross-link to `/login`.
- Login keeps its login/forgot mode toggle and inline message banner
  (banner retokenized to `danger-soft`/`accent-soft` with `role=alert`/
  `status`); added a cross-link to `/signup`.
- **Behavior note:** the "Forgot password?" mode still posts to
  `/api/auth/forgot-password`, which SEC-01 disabled (returns 410). The form
  surfaces that response through its existing error banner — no new behavior
  introduced by this UI pass. Removing the reset UI is a separate decision.

## Increment 5 — Products + Orders lists — DONE
Rebuilt the two commerce list screens on the design system. All data-fetching,
bulk actions, and status/publish mutations preserved — UI-only swap.
- **Products** (`ProductsClient` + `page` + toggle/action sub-components):
  metric grid → `Card`s; tabs → `role="tablist"`/`tab` with `aria-selected`;
  native search input on `controlClass()` with `aria-label`; bulk + row actions
  via `buttonClass`; bulk-confirm dialog → `ConfirmDialog`; status/publish
  pills tokenized (`bg-accent-soft`/`bg-draft-soft`, `bg-current` dot).
- **Orders** (`ordersClient`): list rendered as a semantic `<table>` inside a
  flush `Card`; status cell → `Badge` via `statusTone()`; detail modal → the
  shared `Dialog` (labeled status `<select>`, customer/shipping cards, items).
- Five states covered on both: empty / loading (`Skeleton`) / error (toast) /
  partial (detail still loading) / ideal.
- No business-logic or API changes.

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

## Status

All planned increments are complete and all audit findings (F1–F8) are
resolved — see **Findings → Resolutions** above. The original plan, now done:

1. ~~App shell + nav + Publish bar (F1–F4)~~ — Increment 3.
2. ~~Home / dashboard~~ — Increment 4.
3. ~~Products / Orders lists (F6)~~ — Increment 5.
4. ~~Builder inspector rebuild (F7, F8)~~ — Increments 8–12.
5. ~~`apps/builder` globals into token parity~~ — Increment 7; full builder
   surface tokenized in Increment 13.

Possible follow-ups (out of the agreed scope — admin + builder): apply the same
token/component pass to the **storefront** and **superadmin** apps, and resolve
the 6 pre-existing builder `tsc` errors (InspectorPanel zod-variance, db-mongo,
renderer) that predate this redesign.
