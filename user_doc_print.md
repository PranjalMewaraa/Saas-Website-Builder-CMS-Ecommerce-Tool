# USER DOC (Print / PDF Version)
## SaaS Store Builder

Prepared for: User training, internal handover, and client onboarding documentation.

---

## 1. Platform Summary
SaaS Store Builder is a multi-tenant platform combining:
- visual website builder,
- content management,
- store-scoped e-commerce,
- publish/preview workflow,
- operations modules (orders, inventory, submissions).

---

## 2. Core Concepts
### 2.1 Tenant
Top-level organization boundary.

### 2.2 Site
Website under a tenant. Holds pages, theme, menus, forms, SEO, snapshots.

### 2.3 Store
Commerce scope under tenant. Brands/categories/products should be scoped here.

### 2.4 Snapshot
Published content bundle used by storefront runtime.

### 2.5 Draft vs Published
- Draft = editable state.
- Published = live state.

---

## 3. First-Time Onboarding
### 3.1 Flow
1. User signs up.
2. Onboarding starts.
3. User creates site.
4. Home page (`/`) is auto-created.
5. User is redirected to `Content > Pages`.
6. Guided modal shows next actions.

### 3.2 Guided next actions
- Create pages.
- Build visually.
- Setup menus/forms.
- Setup store/catalog.
- Publish snapshot.

---

## 4. Main Navigation
### 4.1 Content
- Pages
- Assets
- Menus
- Forms
- Theme
- SEO
- Templates
- Publish

### 4.2 Catalog
- Stores
- Brands
- Categories
- Products

### 4.3 Manage
- Inventory
- Orders
- Form submissions

---

## 5. Pages Module
### 5.1 What it does
- Create/edit/duplicate/delete pages
- Manage slug and page template
- Open visual editor

### 5.2 Best practices
- Keep Home page slug as `/`.
- Keep route-sensitive pages stable (product list/detail).

---

## 6. Visual Builder
### 6.1 Structure
- Canvas
- Inspector
- Add Block dialog

### 6.2 Actions
- Add blocks/sections
- Duplicate/delete/reorder
- Edit props and styles

### 6.3 Save behavior
- Changes are saved to draft.
- Publish is required for storefront live update.

---

## 7. Layout/Section Deep Use
### 7.1 Hierarchy
Section -> Row -> Column -> Atomic blocks

### 7.2 Defaults
- Section: `display:flex`, `justify:center`
- Row: `max-width: 1208px`

### 7.3 Row configuration
- Preset mode for quick layouts
- Manual mode for flex/grid controls

### 7.4 Columns
- Infinite atomic composition
- Independent style and layout controls

---

## 8. Block Reference (Key)
### 8.1 Header
- Menu binding
- Layout variant
- CTA controls

### 8.2 Hero
- Hero Preset: Basic / Advanced (scaffold)
- Variant: basic/image/video
- Basic background color editable

### 8.3 Footer
- Presets and panel styling
- Social link rendering
- Multiple menu groups with:
  - custom title,
  - text size,
  - text style.

### 8.4 Commerce blocks
- ProductGrid
- ProductList
- ProductDetail
- Cart blocks

---

## 9. Menus
### 9.1 Setup
Create menu and assign to header/footer or block menuId.

### 9.2 Footer menu groups
Add more than one menu and title each section independently.

---

## 10. Forms
### 10.1 Builder
Create form schema and save.

### 10.2 Usage
Bind form to Form block / Atomic Form.

### 10.3 Submissions
Review in submissions management screens.

---

## 11. Assets
### 11.1 Usage
Upload and select assets from picker.

### 11.2 If stale
Refresh picker/reopen panel and verify upload finalized.

---

## 12. Theme and Styling
### 12.1 Theme editor
Set global tokens/colors.

### 12.2 Overrides
Inspector style values override defaults.

---

## 13. SEO
### 13.1 Site SEO
Global metadata and verification fields.

### 13.2 Page SEO
Per-page title/description/OG configuration.

---

## 14. Publish and Preview
### 14.1 Publish
Use `Content > Publish` to create a live snapshot.

### 14.2 Preview
Preview mode requires explicit token.
Published URLs should stay in published mode.

---

## 15. Catalog Setup
### 15.1 Stores
Create/select store scope first.

### 15.2 Brands
Store-scoped brand/distributor entries.

### 15.3 Categories
Store-scoped categories with typed attributes.

### 15.4 Category Edit Modal
Modern light modal to update category name and full attribute schema.

### 15.5 Products
- Core fields + pricing + inventory
- Brand/category mapping
- Dynamic attributes
- Variants and variant images

---

## 16. Inventory
### 16.1 Screen
Manage inventory adjustments by product/SKU.

### 16.2 Rule
Always operates within selected store scope.

---

## 17. Orders
### 17.1 Screen
List, search, view detail, update status.

### 17.2 Verify in details
- Customer data
- Shipping data
- Item lines

---

## 18. Troubleshooting
### 18.1 Product missing
Check store scope, publish state, and snapshot republish.

### 18.2 Preview confusion
Remove token for live testing.

### 18.3 Style mismatch
Republish and verify renderer path/style sources.

### 18.4 Category mismatch
Verify `store_id` context and update success.

---

## 19. Operations Checklist
### Daily
- Check orders
- Check low stock
- Check submissions
- Publish validated changes

### Weekly
- Audit categories/attributes
- SEO review
- Asset cleanup

---

## 20. Quick Links (Reference)
- Pages: `/content/pages`
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

---

## 21. PDF Export Tips
Use any Markdown-to-PDF flow. Suggested:
1. Open `user_doc_print.md` in editor preview.
2. Print to PDF (A4, 1-inch margins).
3. Enable page headers/footers if needed.

