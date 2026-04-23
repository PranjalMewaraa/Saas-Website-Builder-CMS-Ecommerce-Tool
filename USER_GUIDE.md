# User Manual / User Guide
## SaaS Store Builder (Admin + Storefront)

## 1) Purpose of This Guide
This manual explains how to use the platform end-to-end:
- Set up site and store
- Build pages visually
- Configure catalog (brands/categories/products/variants)
- Publish and verify storefront
- Manage orders, inventory, and form submissions

It is written for non-technical users, operators, and admins.

---

## 2) Platform Overview
The platform has two main apps:
- **Admin App** (`/admin`) for setup, editing, and operations
- **Storefront App** (public URL/subdomain) for customer browsing and checkout

Main modules in Admin:
- **Content**: pages, assets, menus, forms, theme, SEO, templates, publish
- **Catalog**: stores, brands, categories, products
- **Manage**: inventory, orders, form submissions

---

## 3) Who Should Use What
- **Founder/Owner**: site setup, publish, high-level configuration
- **Content Editor**: pages, sections/blocks, theme, SEO
- **Catalog Manager**: brands, categories, products, variants
- **Operations Manager**: orders, inventory, form submissions

---

## 4) Prerequisites
Before starting:
- You have an admin account and access to a tenant
- At least one site is created
- Catalog module is enabled for your tenant/site
- You have store scope selected (active store or `catalog_id` context)

---

## 5) First-Time Setup Flow
### Step 1: Create Site
1. Go to **Content → Sites**.
2. Click **New Site**.
3. Enter site name.
4. Slug/handle is generated automatically.
5. Save.

Expected result:
- Site exists.
- Default pages are initialized (home and core commerce pages if enabled).

### Step 2: Create Store
1. Go to **Stores**.
2. Click **Create Store**.
3. Select store preset/type (e.g., fashion, electronics).
4. Save.

Expected result:
- Store created under your tenant.
- Store can become active context.

### Step 3: Create Brand(s)
1. Go to **Brands**.
2. Select the store.
3. Add brand/distributor entries.

Rules:
- If store type is **brand**, primary brand constraints apply.
- If store type is **distributor**, multiple entries are supported.

### Step 4: Create Categories + Attributes
1. Go to **Categories**.
2. Select store context.
3. Create category name.
4. Add attributes (size, color, material, etc.).
5. Save.

Tips:
- You can use preset suggestions, then customize.
- Mark required attributes carefully.

### Step 5: Create Products
1. Go to **Products → New Product**.
2. Confirm store scope.
3. Fill product basics (name, price, SKU, inventory).
4. Select brand and category.
5. Fill dynamic attributes from selected category.
6. Add variants and variant images if needed.
7. Save.

Expected result:
- Product appears in product list for that store.

---

## 6) Content Management Guide
## 6.1 Pages
Path: **Content → Pages**

What you can do:
- Create, duplicate, edit, delete pages
- Set name + slug
- Open visual editor

Important:
- Home slug should remain `/`
- Commerce core pages may require fixed route structure (e.g. PDP paths)

## 6.2 Visual Page Editor
Path: **Content → Pages → Edit**

Main areas:
- **Canvas**: visual page preview
- **Inspector**: selected block/section settings
- **Block insertion dialogs**: add blocks visually

### Add blocks
1. Click **Add New Block**.
2. Use search/categories.
3. Insert block.

### Edit blocks
1. Click block on canvas.
2. Use inspector fields to edit props and styles.

### Layout/Section block
Structure:
- Section → Row → Col → Atomic Blocks

Workflow:
1. Add **Layout/Section** block.
2. Add row.
3. Configure row preset or manual layout.
4. Add columns and atomic blocks.
5. Style section/row/col in inspector.

Default behavior:
- Section defaults to `display:flex; justify:center`
- Row defaults to `max-width: 1208px`

### Reorder and duplicate
- Use move/reorder controls on canvas
- Use duplicate for quick copies with styles retained

### Delete
- Delete controls are available on canvas and inspector

## 6.3 Header/Footer
### Header
- Choose menu source
- Configure CTAs and variant options

### Footer
- Choose layout and preset
- Configure social links
- Use **multiple menu groups**:
  - menu selection per group
  - custom title per group
  - text size/style per group

## 6.4 Hero
- Set **Hero Preset** (`Basic` or `Advanced` placeholder)
- Set variant (`basic`, `image`, `video`)
- For **Basic**, background color is editable

## 6.5 Menus
Path: **Content → Menus**

1. Create menu.
2. Add links/pages.
3. Assign slot (header/footer if required).
4. Save.

## 6.6 Forms
Path: **Content → Forms**

1. Create form.
2. Add fields.
3. Save draft schema.
4. Use form block on page.

Submissions:
- View under **Manage → Form Submissions** (or forms submissions screen)

## 6.7 Assets
Path: **Content → Assets**

- Upload images/videos
- Reuse in blocks via asset picker
- Keep alt text updated

If picker seems stale:
- Use refresh/reopen picker
- Verify asset finalized status

## 6.8 Theme
Path: **Content → Theme**

- Configure theme colors
- Use color picker where available
- Theme colors should flow as defaults where explicit block styles are not set

## 6.9 SEO
Path: **Content → SEO**

- Set site-level metadata
- Set page-level metadata
- Configure OG image and custom header/meta scripts as needed

## 6.10 Publish
Path: **Content → Publish**

1. Click **Publish Snapshot**.
2. Wait for success.
3. Open storefront URL.

Preview vs Published:
- Draft preview requires explicit preview token
- Published routes should not auto-switch to draft

---

## 7) Catalog Management Guide
## 7.1 Store Scope Rules
Always confirm scope before catalog actions:
- Active store, or
- URL query (`catalog_id`/`store_id`) from “Manage Catalog” actions

If products look wrong:
- Wrong store scope is the first thing to check.

## 7.2 Brands
Path: **Brands**

- Brands are store-scoped
- Add/delete within selected store

## 7.3 Categories
Path: **Categories**

- Categories are store-scoped
- Attributes define required product metadata
- You can now **edit categories in modal**:
  - update category name
  - update attributes and options

## 7.4 Products
Path: **Products**

List actions:
- Edit
- Archive/restore/delete
- Publish toggle (storefront visibility)

Product create/edit:
- Brand + category required per workflow
- Attribute values from selected category
- Variants and per-variant images supported

## 7.5 Inventory
Path: **Manage → Inventory**

- Search by product/SKU
- Enter positive value to restock
- Enter negative value to reduce stock
- Apply per-row

Scope:
- Inventory acts on selected active/store context only

## 7.6 Orders
Path: **Manage → Orders**

- List/filter/search orders
- Open order details modal
- View customer/shipping/items
- Update status

---

## 8) Storefront Behavior Guide
## 8.1 URL Context
Storefront uses:
- `handle` (site handle)
- `sid` (site id)

Preview only:
- `token` for draft preview

Important:
- Published URLs should not retain preview token accidentally.

## 8.2 Product Routing
- Product cards should resolve to PDP slug path
- Ensure PDP page exists and is correctly routed

## 8.3 Cart and Checkout
- Add to cart from listing/PDP
- Checkout captures customer + address details
- Order appears in admin orders page

---

## 9) Templates and Presets
## 9.1 Block Templates
- Use Add Block dialog tabs/categories
- Select templates to bootstrap sections quickly

## 9.2 Policy Pages
- Use privacy/terms template patterns
- Prefer rich text editor over raw HTML for non-technical users

---

## 10) Recommended Daily Workflow
1. Open admin with correct site selected.
2. Verify store context before catalog actions.
3. Update content/products.
4. Preview key pages.
5. Publish snapshot.
6. Verify storefront rendering.
7. Monitor orders/inventory/submissions.

---

## 11) Troubleshooting
## 11.1 Product not showing in grid
Checklist:
- Product belongs to selected store
- Product is published to store scope
- Grid block store/site context matches
- Snapshot published after change

## 11.2 Preview shows wrong mode
Checklist:
- Remove preview token if testing published
- Verify preview link and route source

## 11.3 Styles differ between admin and storefront
Checklist:
- Confirm renderer uses same block props/style data
- Verify class safelist/runtime style resolution
- Re-publish snapshot

## 11.4 Asset update not visible immediately
Checklist:
- Reopen asset picker
- Verify asset finalized
- Trigger refresh in editor

## 11.5 Category/brand appears global
Checklist:
- Ensure API request includes selected `store_id`
- Confirm selected store in UI context

## 11.6 Cannot create page due to duplicate slug
- Slug must be unique per site
- Archived/deleted handling may still retain reserved slug constraints depending on implementation

## 11.7 Forms submit but UI stuck
- Check submit response handling and client reset state
- Verify rate-limit/config errors in logs

---

## 12) Best Practices
- Keep naming consistent (stores, categories, attributes, menus)
- Use presets for speed, then customize
- Avoid editing without verifying scope
- Publish in controlled cycles (batch changes)
- Track low stock daily
- Keep SEO titles/descriptions updated per major page

---

## 13) Security and Data Notes
- Tenant boundaries are enforced by session + module gate
- Store-level scoping is required for catalog integrity
- Use least privilege account access for operators/editors

---

## 14) Quick Reference (Where to Go)
- Site dashboard: **Content**
- Page editor: **Content → Pages**
- Menus: **Content → Menus**
- Forms: **Content → Forms**
- Theme/SEO: **Content → Theme / SEO**
- Publish: **Content → Publish**
- Stores: **Stores**
- Brands/Categories/Products: **Catalog screens**
- Inventory/Orders/Submissions: **Manage**

---

## 15) Change Log Template (for your team)
Use this after each release:
- Release date:
- Features shipped:
- Breaking changes: none / list
- Migration steps:
- QA checklist completed:
- Rollback plan:

---

## 16) Appendix: Common Terms
- **Tenant**: Top-level organization/account boundary
- **Site**: Website instance under tenant
- **Store**: Catalog/commerce scope under tenant
- **Snapshot**: Publishable content state
- **Draft**: Editable but not live state
- **PDP**: Product detail page

