# Quickstart User Guide (Short)
## SaaS Store Builder

## 1) Goal
Launch and operate a content + commerce site quickly with correct scope and publish flow.

## 2) Fast Setup (10–20 min)
1. Create a **Site** (`Content → Sites`).
2. Create a **Store** (`Stores`).
3. Add **Brand(s)** (`Brands`) for that store.
4. Add **Categories + Attributes** (`Categories`).
5. Create **Products** (`Products → New Product`).
6. Build/edit pages (`Content → Pages`).
7. Publish (`Content → Publish`).

## 3) Must-Check Before Any Catalog Action
- Confirm selected store context (`store_id` / `catalog_id`).
- If wrong store is selected, products/categories will appear incorrect.

## 4) Page Editing Essentials
- Use **Add New Block** dialog.
- Click block on canvas → edit in inspector.
- For layout pages: `Section → Row → Col → Atomic blocks`.
- Save draft, preview, then publish.

## 5) Key Block Tips
- **Hero**:
  - `Hero Preset`: Basic/Advanced.
  - Basic background color is editable.
- **Footer**:
  - Supports multiple menu groups.
  - Each group can have custom title + text size/style.

## 6) Publish & Preview Rules
- Draft preview requires explicit `token`.
- Published pages should not auto-switch to draft.
- After major content/catalog changes, publish snapshot again.

## 7) Daily Operations
1. Check **Orders** (`Manage → Orders`).
2. Check **Inventory** (`Manage → Inventory`).
3. Check **Form Submissions**.
4. Process updates and publish if storefront content changed.

## 8) Troubleshooting Quick Checks
- Product missing in grid:
  - Store scope wrong?
  - Product published?
  - Snapshot republished?
- Style mismatch admin vs storefront:
  - Re-publish snapshot and verify resolver path.
- Category/brand appears wrong:
  - Verify current store context.

## 9) Where to Go
- Pages: `Content → Pages`
- Menus: `Content → Menus`
- Forms: `Content → Forms`
- Theme/SEO: `Content → Theme / SEO`
- Publish: `Content → Publish`
- Catalog: `Stores / Brands / Categories / Products`
- Ops: `Manage → Inventory / Orders / Submissions`
