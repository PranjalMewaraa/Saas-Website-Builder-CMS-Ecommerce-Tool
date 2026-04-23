# USER_DOC
## SaaS Store Builder — Complete Product Documentation

Version: Current Workspace Build  
Audience: Site Owners, Content Editors, Catalog Managers, Operations Teams, Admins

---

## Table of Contents
1. Platform Introduction
2. Roles and Permissions
3. Core Concepts (Tenant, Site, Store, Snapshot)
4. First-Time Onboarding
5. Admin Navigation Map
6. Content System
7. Visual Builder Deep Guide
8. Layout/Section System (Deep)
9. Block Library Reference
10. Theme and Styling System
11. Menus System
12. Forms System
13. Assets System
14. Templates and Presets
15. SEO System
16. Publish, Preview, and Draft Workflow
17. Commerce System (Store-Scoped V2)
18. Product, Variant, and Attribute Management
19. Inventory Management
20. Orders Management
21. Storefront Runtime Behavior
22. Integrations and Plugin Management
23. IDs, Slugs, and Scope Rules
24. Troubleshooting and Known Pitfalls
25. Best Practices and Governance
26. Operational SOP Checklist
27. FAQ
28. Glossary

---

## 1) Platform Introduction
SaaS Store Builder is a multi-tenant website + commerce platform where users can:
- Build pages visually
- Manage content modules (pages, menus, forms, assets, theme, SEO)
- Configure store-scoped catalog (brands, categories, products, variants)
- Publish sites through snapshot-based deployment
- Run operations (orders, inventory, submissions)

### Key design principles
- **Draft-first editing:** nothing goes live until publish.
- **Scope safety:** catalog actions are store-scoped.
- **Backward compatibility:** legacy data remains supported.
- **Composable rendering:** content blocks + commerce data are merged at runtime.

---

## 2) Roles and Permissions
### 2.1 Recommended role model
- **Owner/Admin:** full access
- **Content Editor:** pages, theme, assets, menus, forms, SEO
- **Catalog Manager:** brands, categories, products
- **Operations:** inventory, orders, submissions

### 2.2 Module gating
Platform modules can be enabled/disabled per tenant/site (depending on environment policy):
- catalog
- builder
- themes
- menus
- forms
- assets

If a screen is inaccessible, check module entitlements first.

---

## 3) Core Concepts
### 3.1 Tenant
Top-level account boundary. Data isolation starts here.

### 3.2 Site
A website instance under a tenant. Has:
- name
- handle
- pages
- theme
- menus
- forms
- SEO
- snapshots

### 3.3 Store
Commerce scope under tenant. Catalog data should be store-scoped in V2.

### 3.4 Snapshot
Published bundle of content state. Storefront primarily serves published snapshot unless preview token is explicitly used.

### 3.5 Draft vs Published
- **Draft:** editable state in admin
- **Published:** live state on storefront

---

## 4) First-Time Onboarding
Current onboarding behavior:
1. User signs up.
2. Redirect to onboarding flow.
3. User creates site.
4. System auto-creates Home page (`/`).
5. Redirect to `/content/pages`.
6. Guided modal appears with next steps:
   - create pages
   - build visually
   - setup menus/forms
   - setup store/catalog
   - publish

### 4.1 Why this matters
Users start with a usable site baseline and clear sequence, reducing setup drop-off.

---

## 5) Admin Navigation Map
Typical high-level navigation:
- **Content**
  - Pages
  - Assets
  - Menus
  - Forms
  - Theme
  - SEO
  - Templates
  - Publish
- **Stores/Catalog**
  - Stores
  - Brands
  - Categories
  - Products
- **Manage**
  - Inventory
  - Orders
  - Form Submissions
- **Settings**
  - Plugins
  - Domain/config related screens

---

## 6) Content System
## 6.1 Pages
Use for route-level content pages.

### Features
- Create, edit, duplicate, delete pages
- Slug management (with collision checks)
- Template-based page bootstrap
- Home page (`/`) protection

### How to use
1. Open `Content → Pages`.
2. Click `New Page`.
3. Set name and slug.
4. Select a template (optional).
5. Open editor.

### Customization notes
- Keep slug strategy consistent.
- Avoid changing critical commerce route slugs if route-based blocks depend on them.

## 6.2 Home page
- Default created during onboarding/site setup.
- Entry point for most storefront journeys.

---

## 7) Visual Builder Deep Guide
## 7.1 Builder anatomy
- **Canvas:** visual output
- **Inspector:** selected element settings
- **Add Block dialogs:** grouped block insertion UX

## 7.2 Selection model
You can select:
- top-level blocks
- layout section
- row
- column
- atomic block
- nested group internals

## 7.3 Common actions
- Add block
- Duplicate block
- Delete block
- Reorder by controls / drag
- Edit style and props

## 7.4 Save behavior
- Draft updates are persisted through page API updates.
- Publish required for live visibility.

---

## 8) Layout/Section System (Deep)
Layout/Section is the advanced compositional block.

Hierarchy:
- `Section`
  - `Row`
    - `Col`
      - `Atomic blocks`

## 8.1 Section defaults
Current defaults:
- `display: flex`
- `justify: center`

Purpose:
- keeps content centered and consistent out of the box.

## 8.2 Row defaults
Current defaults include:
- `maxWidth: 1208px`
- baseline padding

Purpose:
- predictable content width and better parity between builder and storefront.

## 8.3 Row layout modes
- **Preset mode** (quick templates)
- **Manual mode** (grid/flex options)

### Preset mode
Use predefined layouts such as 1-col, 2-col, uneven splits, sidebar patterns.

### Manual mode
Control:
- display: flex/grid
- columns
- gap
- align/justify
- wrap

## 8.4 Columns
Each column supports:
- layout controls
- full style controls
- any number of atomic blocks

## 8.5 Atomic blocks inside columns
Common atomic set:
- Text
- Image
- Video
- Button
- Icon
- Spacer
- Divider
- Badge
- List
- Card
- Accordion
- Menu
- Countdown
- Embed
- Form
- Group

## 8.6 Group block
Group is an atomic container for building reusable “micro-components” (cards/feature tiles/etc.) inside layout columns.

---

## 9) Block Library Reference
## 9.1 Header
Capabilities:
- menu binding
- variant-based layout
- up to multiple CTA button options
- icon support

How to customize:
- choose menu source
- configure CTA labels/hrefs/icons
- set layout variant

## 9.2 Hero
Capabilities:
- hero preset enum: `Basic`, `Advanced` (scaffold branch)
- variants: basic/image/video
- alignment/width/min-height
- CTA + secondary CTA

Customization:
- `Basic` variant supports editable background color
- image/video variants support background media + overlay controls

## 9.3 Footer
Capabilities:
- layout presets
- social links + icon styles
- panel background/border/text controls
- **multi-menu groups**:
  - per-group menu source
  - custom section title
  - per-group text size/style

## 9.4 ProductGrid / ProductList / PDP / Cart blocks
Commerce-aware blocks that bind to scoped runtime data.

Configuration examples:
- card count
- detail path prefix
- filters/search toggles
- cart labels and button text

## 9.5 Utility blocks
- RichText
- Spacer
- Divider

Used for structure and editorial control.

---

## 10) Theme and Styling System
## 10.1 Theme editor
Central token control for colors and style defaults.

## 10.2 Style layers
Typically you’ll see:
- block defaults
- preset styles
- inspector overrides
- responsive overrides

## 10.3 Color handling
- Color picker support in inspector
- Theme colors used as defaults where explicit styles are absent

---

## 11) Menus System
## 11.1 Menu creation
1. Open `Content → Menus`.
2. Create menu.
3. Add links/pages.
4. Save.

## 11.2 Slots
Menus may be assigned to slots (header/footer) and resolved automatically if block menu ID is not explicitly set.

## 11.3 Footer multi-menu usage
For richer footer structures:
- add menu groups
- assign each group a menu
- set title and text style per group

---

## 12) Forms System
## 12.1 Form builder
Build form schema with field types and validation settings.

## 12.2 Add form to page
Use form block or atomic form and bind `formId`.

## 12.3 Submissions
Submissions are stored and viewable in admin submission management pages.

---

## 13) Assets System
## 13.1 Upload and management
- upload image/video
- reuse via asset picker
- maintain metadata (alt, labels where available)

## 13.2 Picker behavior
If updates appear delayed:
- refresh/reopen picker
- confirm finalize/upload completion

---

## 14) Templates and Presets
## 14.1 Page templates
Use for rapid page setup:
- blank
- landing
- about
- contact
- policy pages
- commerce pages

## 14.2 Block templates
Insert reusable sections or blocks from template manager.

## 14.3 Design presets
Apply style presets to accelerate visual consistency.

---

## 15) SEO System
## 15.1 Site SEO
Global metadata and verification fields.

## 15.2 Page SEO
Per-page title/description/OG setup.

## 15.3 Best practices
- unique title per page
- clear, user-intent-based descriptions
- meaningful OG assets

---

## 16) Publish, Preview, Draft Workflow
## 16.1 Publish
1. Open `Content → Publish`.
2. Publish snapshot.
3. Validate storefront.

## 16.2 Preview
Preview requires explicit token and should be isolated from published browsing.

## 16.3 Important behavior
Published URLs should not become draft automatically due to stale token state.

---

## 17) Commerce System (Store-Scoped V2)
## 17.1 Scope model
Catalog entities are store-scoped:
- brands
- categories
- category attributes/options
- products/variants

## 17.2 Why scope matters
Wrong scope is the #1 cause of “missing” or “wrong” catalog data in admin views.

---

## 18) Product, Variant, and Attribute Management
## 18.1 Brands
- created per selected store
- type rules depend on store type

## 18.2 Categories
- created per selected store
- include dynamic attribute schema
- now editable via modal UI

### Category edit modal
- opens from category card
- edit name
- add/remove/edit attributes
- edit options for select/multi-select
- save updates through V2 update API

## 18.3 Products
Product create/edit includes:
- name/description/price/SKU/inventory
- brand + category selection
- dynamic attribute values
- variant management
- image uploads (including per variant)

---

## 19) Inventory Management
## 19.1 Use
Path: `Manage → Inventory`

Actions:
- search products
- apply positive/negative adjustments
- save per row

Rules:
- operations are scoped to active/selected store

---

## 20) Orders Management
## 20.1 Use
Path: `Manage → Orders`

Capabilities:
- list/filter/search
- open order details modal
- inspect customer/address/items
- update status

## 20.2 What to verify per order
- customer contact data
- shipping correctness
- line item details
- payment/total consistency (if integrated)

---

## 21) Storefront Runtime Behavior
## 21.1 Site resolution
Storefront resolves site using handle/sid context.

## 21.2 Commerce rendering
Product blocks fetch store-scoped product data.

## 21.3 Routing
Ensure product list and detail routes are aligned with configured page slugs.

---

## 22) Integrations and Plugin Management
Plugin manager supports extension management patterns.

Current policy in many environments:
- core/fixed plugins may be locked
- promotional/plugin marketplace UX may be available

---

## 23) IDs, Slugs, and Scope Rules
## 23.1 IDs in UI
System increasingly prefers names over raw IDs for readability.

## 23.2 Slugs
- must be unique per site (pages)
- special templates may reserve fixed slugs

## 23.3 Scope hierarchy
Tenant -> Site -> Store -> Catalog entities

Always verify this chain before catalog actions.

---

## 24) Troubleshooting and Known Pitfalls
## 24.1 Product not appearing
Check:
- selected store scope
- publish status
- snapshot published after updates
- grid block config

## 24.2 Preview/published confusion
Check:
- token presence
- preview-specific URL
- mode expectations

## 24.3 Visual vs storefront style mismatch
Check:
- publish snapshot freshness
- renderer style resolution
- class/style availability in storefront build

## 24.4 Category changes not reflected
Check:
- save response success
- store scope on category + product screens
- attribute schema update actually persisted

## 24.5 Asset not updating
Check:
- finalize success
- picker refresh
- block props referencing correct asset id/url

---

## 25) Best Practices and Governance
- Standardize naming conventions.
- Use templates/presets for speed and consistency.
- Limit hard deletes; prefer archive where possible.
- Review inventory and orders daily.
- Publish in controlled batches.
- Track release notes for major changes.

---

## 26) Operational SOP Checklist
Daily:
- verify scope
- process orders
- adjust low stock
- review submissions
- publish validated changes

Weekly:
- review catalog quality
- audit SEO coverage
- clean assets
- review archived items

---

## 27) FAQ
### Q1: Why do I see wrong products?
Most likely wrong store scope.

### Q2: Why does preview differ from live?
Draft and published snapshots are different states.

### Q3: Can I style footer menus separately?
Yes. Use footer menu groups and per-group text controls.

### Q4: Can I prepare advanced hero layouts now?
Yes. Hero preset supports Advanced branch scaffold for future designs.

### Q5: Why is Home already there after onboarding?
It is auto-created to ensure a ready starting point.

---

## 28) Glossary
- **Tenant**: account boundary
- **Site**: website under tenant
- **Store**: commerce scope
- **Snapshot**: publishable content state
- **Draft**: unpublished editable state
- **PDP**: product detail page
- **Atomic block**: smallest layout content unit
- **Preset**: predefined configuration bundle

---

## Appendix A: Quick Start Paths
- Pages: `/content/pages`
- Editor: `/content/pages/edit`
- Menus: `/content/menus`
- Forms: `/content/forms`
- Theme: `/content/theme`
- SEO: `/content/seo`
- Publish: `/content/publish`
- Stores: `/stores`
- Brands: `/brands`
- Categories: `/categories`
- Products: `/products`
- Inventory: `/manage/inventory`
- Orders: `/orders`

