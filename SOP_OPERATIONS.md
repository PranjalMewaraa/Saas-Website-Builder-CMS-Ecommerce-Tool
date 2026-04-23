# SOP: Operations Runbook
## SaaS Store Builder (Daily/Weekly)

## 1) Purpose
Standardize daily operations for content + commerce reliability.

## 2) Roles
- Content Operator
- Catalog Operator
- Order/Inventory Operator
- Admin Supervisor

## 3) Daily Checklist
### 3.1 Start of Day
- Confirm active site and store context.
- Open dashboards and verify no obvious errors.

### 3.2 Orders
- Go to `Manage → Orders`.
- Filter by `new/processing`.
- Open each order detail and verify:
  - customer info
  - shipping address
  - item lines
- Update order status as per fulfillment stage.

### 3.3 Inventory
- Go to `Manage → Inventory`.
- Search low-stock SKUs.
- Apply restocks/adjustments.
- Confirm changes persisted.

### 3.4 Form Submissions
- Check new submissions.
- Route leads/tickets to responsible owner.

### 3.5 Content & Catalog Changes
- Validate scope before edits.
- If changes affect storefront, run preview.
- Publish snapshot after validated updates.

## 4) Weekly Checklist
- Review top products and low-stock trends.
- Audit category attributes for consistency.
- Review SEO completeness on top pages.
- Clean/organize assets.
- Review archived products and restore/delete as needed.

## 5) Incident SOP
## 5.1 Product Not Visible
1. Confirm store scope.
2. Confirm product publish state.
3. Confirm page block config.
4. Republish snapshot.

## 5.2 Storefront Shows Draft Unexpectedly
1. Check URL for preview token.
2. Remove token and retest.
3. Verify preview links source.

## 5.3 Catalog Data Appears Cross-Store
1. Verify request includes correct `store_id`.
2. Reopen screen from “Manage Catalog” for selected store.
3. Escalate with endpoint logs if mismatch persists.

## 5.4 Form Submit Issues
1. Check submission API status.
2. Check rate limit errors.
3. Confirm success handler resets UI state.

## 6) Change Management SOP
Before publishing production changes:
1. Capture what changed (content/catalog/theme).
2. Preview critical pages:
  - Home
  - Product list
  - PDP
  - Cart
3. Publish snapshot.
4. Verify storefront as customer.
5. Log release notes.

## 7) Data Integrity Rules
- Never edit catalog without store scope confirmation.
- Prefer soft archive over hard delete unless approved.
- Keep attribute schema stable per category to avoid PDP/filter confusion.

## 8) Escalation Matrix
- UI issue only: Content/Catalog operator
- Data mismatch: Admin supervisor + backend engineer
- Order/inventory critical issue: immediate escalation, pause affected flow if needed

## 9) Release Log Template
- Date/time:
- Operator:
- Scope:
- Pages changed:
- Catalog changes:
- Snapshot published: yes/no
- Post-publish QA result:
- Rollback notes:
