# Comprehensive User Documentation

## 1. 🚀 Getting Started

### 1.1 Platform Overview
The platform is an all-in-one visual website builder plus ecommerce management system designed for teams that want to create, publish, and operate online stores without stitching multiple tools together. It is built for founders, marketers, designers, catalog managers, and operations teams. Core capability areas include visual page building, theme and style management, SEO controls, form and menu configuration, and store-scoped commerce operations such as products, categories, variants, inventory, and orders. Architecturally, content and publishing state are managed separately from structured commerce data, then composed at runtime on storefront. This keeps editing safe (draft mode), publishing controlled (snapshot model), and operations reliable (store scope and structured workflows).

Steps:
- Identify your role: content, catalog, operations, admin.
- Confirm active site and store context before editing.
- Start with onboarding flow and default home page.

Pointers:
- Treat draft and published as separate states.
- Most “missing product” issues are scope-related.
- Publish after validated changes, not during experimentation.

### 1.2 Account Setup
Account setup should be completed with a clean handoff from authentication to onboarding. Users create an account, complete verification if enabled in environment, then sign in and land in onboarding where site setup starts. Password reset should be tested early by admins to ensure support readiness. Team-based installations should document role expectations from day one (owner/admin/editor/operator) and avoid giving broad privileges by default. If role/permission mapping is managed via module access, verify module availability immediately after login so users are not blocked mid-setup. Good setup discipline prevents downstream confusion around inaccessible screens, missing modules, or unauthorized edits.

Steps:
- Create account with valid email and password.
- Complete verification (if applicable).
- Login and finish onboarding site creation.
- Test logout/login and password reset once.

Pointers:
- Keep owner account recovery-safe.
- Use least privilege for non-admin users.
- Confirm catalog and builder modules are enabled.

### 1.3 Dashboard Overview
The admin dashboard is the control center for content, commerce, and operations. Navigation is grouped by function: Content (pages, assets, menus, forms, theme, SEO, publish), Catalog (stores, brands, categories, products), and Manage (inventory, orders, submissions). Workspace behavior is context-sensitive: many screens rely on site and store identifiers. Teams must internalize workspace context as a first check before any action. Switching stores/projects should be explicit and verified through page-level indicators. Dashboard cards are informative but not authoritative for scope-sensitive operations; always cross-check current context in URL and screen labels before bulk actions.

Steps:
- Open dashboard and verify selected site.
- Switch to intended store/project context.
- Navigate by module, not by bookmark alone.

Pointers:
- Do not perform catalog operations without store confirmation.
- Keep one browser tab per store during heavy operations.
- Use manage screens for daily operational checks.

## 2. 🏗 Web Builder (Site Builder)

### 2.1 Site Setup
Site setup establishes the foundational web container where pages, menus, forms, and theme settings live. You can start with templates or blank setup depending on launch speed vs design control. For faster onboarding, start with default pages and customize incrementally. Subdomain and custom domain setup should be completed before launch rehearsal so SSL and DNS propagation issues surface early. Keep naming conventions consistent (site name, handle, route strategy) to reduce SEO and routing confusion later. If multiple environments exist, separate staging and production naming conventions clearly.

Steps:
- Create new site from onboarding or site manager.
- Choose template or blank start.
- Confirm home page (`/`) exists.
- Configure subdomain/custom domain.
- Validate SSL status before launch.

Pointers:
- Freeze route conventions early.
- Keep one canonical primary domain.
- Avoid late route rewrites after content indexing starts.

### 2.2 Visual Page Builder
The visual page builder allows drag-and-drop style composition with inspector-based property and styling controls. The interface generally has three layers: canvas (what you build), inspector (what you edit), and insertion dialogs (what you add). For predictable output, build pages using structural hierarchy instead of random standalone blocks. Start with high-level section structure, then place content blocks, then style and responsive tuning. Visual builder supports direct manipulation and contextual controls; hover actions may reveal add/reorder tools. Always save draft and run quick preview checks on key routes before publish.

Steps:
- Open page editor from Pages list.
- Add section/layout and then content blocks.
- Edit selected block properties in inspector.
- Reorder/duplicate/delete as needed.
- Save and preview key routes.

Pointers:
- Edit the correct layer (section/row/column/block).
- Keep spacing rhythm consistent.
- Validate canvas behavior on mobile breakpoints.

### 2.3 Components / Blocks
Blocks are reusable functional UI units that accelerate page creation. Common blocks include Hero, text, image/media, buttons, forms, sliders, accordions, feature grids, testimonials, pricing tables, and custom code areas. Use blocks as composable building units, not fixed templates. Configure each block with content props and style props in inspector. For high-conversion pages, prioritize hierarchy: Hero -> benefits/features -> social proof -> CTA -> FAQ. Keep CTA blocks clear and singular in purpose. For dynamic blocks (forms, menus, product blocks), validate bindings (form ID/menu ID/data source) before publish.

Steps:
- Add block via Add New Block dialog.
- Configure content fields first.
- Configure style fields next.
- Verify connected dependencies (menu/form/product).

Pointers:
- Avoid overloading one page with too many block types.
- Reuse proven block patterns across pages.
- Reserve custom code blocks for advanced use cases only.

### 2.4 Styling & Design
Styling controls should be managed with system thinking: global tokens first, local overrides second. Typography, colors, spacing, and theme presets should be standardized early to keep UI coherent and maintainable. Over-customization at block level creates long-term friction during redesigns. Use global styles and theme settings for brand foundations, then apply targeted local overrides only where needed. Custom CSS should be minimal and documented; undocumented custom CSS becomes a maintenance risk. Treat style decisions as reusable standards, not isolated per-page tweaks.

Steps:
- Define typography scale and primary/secondary palette.
- Set theme defaults globally.
- Apply block-level overrides only for exceptions.
- Test contrast and readability on all major sections.

Pointers:
- Keep color usage semantically consistent.
- Build a spacing baseline (8/12/16/24 etc.).
- Track custom CSS snippets in internal changelog.

### 2.5 Responsive Design
Responsive editing ensures pages look intentional on desktop, tablet, and mobile. Do not assume desktop layouts will naturally collapse correctly. Test each key page at breakpoints and tune visibility, spacing, and stacking behavior. Hide non-essential decorative elements on mobile when they hurt clarity or performance. Use layout controls (column behavior, gap, alignment) instead of ad-hoc hacks for breakpoint fixes. Responsive quality directly impacts conversion and user trust, especially on commerce pages where most traffic is mobile-heavy.

Steps:
- Switch through desktop/tablet/mobile views in editor.
- Verify section spacing and text readability.
- Adjust visibility controls for low-priority elements.
- Recheck CTA prominence on mobile.

Pointers:
- Mobile-first validation is mandatory for product pages.
- Avoid tiny text and dense columns on phone width.
- Keep thumb-friendly CTA/button spacing.

### 2.6 SEO Settings
SEO settings exist at both page and site level. Each page should have a distinct title and meta description aligned to user intent and actual content. Configure Open Graph values so social sharing appears professional and consistent. Use canonical URLs when duplicates or variant-like routes could exist. Robots settings should be explicit for private/test pages to avoid accidental indexing. Generate and verify sitemap behavior after major page additions. SEO should be part of content workflow, not post-launch cleanup.

Steps:
- Set page title/meta for every important route.
- Configure OG image/title/description.
- Confirm canonical URL for indexable pages.
- Review robots directives before publish.

Pointers:
- Avoid duplicate titles across core pages.
- Match metadata to page intent, not keyword stuffing.
- Revisit SEO fields after major copy updates.

### 2.7 Publishing
Publishing moves validated draft content to live storefront via snapshot flow. Treat publishing as release management, not just a final button click. Pre-publish checks should include page routing, menu links, form bindings, and key commerce blocks. Use preview mode for draft verification but keep preview links internal. After publish, always run a post-publish sanity pass on home, listing, detail, and cart routes. If issues appear after publish, use version history/rollback strategy where available and document the incident.

Steps:
- Preview critical pages.
- Run pre-publish checklist.
- Publish snapshot.
- Verify live routes.
- Log release notes.

Pointers:
- Do not publish partially validated content.
- Keep a rollback-ready release habit.
- Separate staging checks from production publish cadence.

### 2.8 Detailed Module: Menus
Menus are structural navigation contracts, not just UI labels. In this platform, menu configuration directly affects header and footer rendering, route discoverability, and crawlability for important pages. A properly designed menu system reduces user friction and increases conversion by making it obvious where users can go next. In practice, you should design menus around real user intent: primary commercial actions (Shop, Categories, Offers), trust actions (About, Contact), and policy/support actions (Privacy, Terms, Help). Avoid overloaded top-level menus with too many equal-priority items. Keep top navigation shallow and use footer navigation for broader informational depth.

For block bindings, header/footer blocks can use explicit menu IDs, or slot-based defaults where supported. Footer now supports multiple menu groups with custom titles and per-group text style controls. This enables professional “multi-column” footers without custom coding. If menu links break after page slug changes, update menu references immediately and run publish again. Treat route changes as release events because menus, CTAs, and SEO all depend on route stability.

Steps:
1. Open `Content → Menus`.
2. Create or edit a menu with clear naming.
3. Add links in a user-intent order.
4. Assign slot or bind menu ID in Header/Footer blocks.
5. For footer, create multiple menu groups and set custom titles.
6. Preview navigation flow on desktop/mobile.
7. Publish snapshot.

Pointers:
- Keep primary navigation minimal and conversion-focused.
- Use footer for legal/support/deep links.
- Re-validate menus after slug or page structure updates.
- Use consistent menu naming so editors can bind quickly.

### 2.9 Detailed Module: Forms
Forms are operational capture points for leads, support, and customer communications. A form that looks good but has weak schema design or no submission process is a business risk. In this platform, form creation is split into schema definition and page integration. Schema design should prioritize clarity: ask only required fields, label them clearly, and avoid ambiguous field names. Use consistent naming conventions for field IDs to support downstream processing and exports.

After creating forms, ensure blocks are correctly bound through `formId`. If using multiple forms (contact, quote request, support), keep purpose-specific forms separate to avoid mixing submission intent. Submission handling must be operationalized: assign ownership, review frequency, and expected response SLAs. Teams often forget this and only discover missed submissions later. Include submissions review in daily ops.

When troubleshooting, check three layers: form schema exists, block binding is correct, and submission endpoint responses are successful. If UI shows “Submitting…” indefinitely, verify client reset handling and backend response shape. For public trust, keep confirmation behavior clear and avoid silent failures.

Steps:
1. Open `Content → Forms` and create form schema.
2. Add fields, required flags, and options where needed.
3. Save form and copy/confirm form ID.
4. Add Form block (or Atomic Form) to target page.
5. Bind `formId` and set title/submit button text.
6. Submit test entry from storefront.
7. Verify in submissions management screen.

Pointers:
- One intent per form is better than one mega-form.
- Keep required fields minimal to improve completion rate.
- Always test form submission before publish.
- Assign internal owner for submission response workflow.

### 2.10 Detailed Module: Layout/Section Block
Layout/Section is the high-control compositional engine for advanced page building. It uses a hierarchical model: Section → Row → Column → Atomic blocks. This structure allows designers to recreate modern landing page systems with consistent spacing and alignment while preserving renderer compatibility. Section controls outer framing and background behavior. Row controls content arrangement strategy (preset/manual, gap, justify/align). Columns contain content stacks and local style boundaries. Atomic blocks provide final content units (text, image, button, video, icon, form, group, etc.).

Current defaults are intentional: section starts centered (`display:flex`, `justify:center`) and rows use a practical max width (`1208px`) for consistent reading/composition behavior. This avoids full-bleed layout drift and improves parity between editor and storefront. For speed, use row presets for common compositions. Switch to manual mode only when custom grid/flex behavior is required. Group block can be used inside columns for reusable micro-components like feature cards and pricing cells.

Most mistakes happen when editing wrong hierarchy level. If row alignment seems broken, verify whether styles were accidentally applied to section or column. Use inspector grouping order: layout first, spacing second, color/border third, typography last.

Steps:
1. Add `Layout/Section` block.
2. Add first row (preset or manual mode).
3. Configure row columns and gap/alignment.
4. Add columns and insert atomic blocks.
5. Style section/row/col progressively.
6. Test responsive behavior and adjust.
7. Save and preview/publish.

Pointers:
- Preserve spacing rhythm across rows for clean visual flow.
- Avoid over-nesting unless component complexity requires it.
- Use group block for repeatable patterns.
- Validate mobile stacking after desktop composition.

### 2.11 Detailed Module: Theme
Theme controls are your global design system. They should define default colors, typographic tone, and baseline visual identity so individual block editing does not become a maintenance burden. Teams that use theme tokens effectively can rebrand faster and keep cross-page consistency high. Teams that overuse one-off overrides usually face inconsistent UI and expensive redesign cycles.

Start by defining primary/secondary colors, neutral text/background scale, and contrast-safe combinations. Then establish typography standards (heading/body scales and weights). Ensure button/link defaults align with brand and accessibility goals. Theme values should be treated as defaults; use block-level overrides only when a specific section requires exception styling. Inconsistent exception usage is a warning sign that global theme needs refinement.

When theme edits are made, run visual checks on key pages (Home, Product List, PDP, Cart) before publish. Theme changes can have broad impact and should be released with controlled validation. If primary color is intended for buttons and links, verify fallback logic behaves correctly when explicit classes are absent.

Steps:
1. Open `Content → Theme`.
2. Configure base colors and text defaults.
3. Set typographic hierarchy and readable sizes.
4. Save and review key pages in draft.
5. Adjust only targeted overrides where necessary.
6. Publish after visual QA.

Pointers:
- Theme-first styling reduces long-term maintenance.
- Always check contrast on colored backgrounds.
- Keep override usage intentional and documented.
- Re-test critical conversion pages after theme updates.

### 2.12 Detailed Module: Assets
Assets are foundational to perceived quality, performance, and accessibility. Good asset management is not just upload-and-forget. Use consistent naming, clear alt text, and optimized dimensions. Large or inconsistent media often causes slower pages and uneven visual output. Keep a standard for hero images, product images, and content illustrations so layouts feel intentional.

In editor flows, asset picker reliability depends on upload finalization and state refresh. If newly uploaded assets do not appear immediately, refresh/reopen picker context. Avoid embedding random external URLs for core brand visuals unless required; managed assets provide better control and portability. For product catalogs, image consistency directly affects conversion and trust. For SEO and accessibility, alt text should be meaningful (not keyword stuffing, not empty unless decorative).

Operationally, define periodic cleanup for unused assets and a convention for media ownership. Teams often accumulate orphan assets over time, which increases confusion and storage overhead. If CDN or endpoint changes are introduced, validate that existing asset references still resolve properly in both draft and published snapshots.

Steps:
1. Open `Content → Assets`.
2. Upload optimized media with clear names.
3. Add/verify alt text.
4. Use asset picker in block inspector.
5. Confirm rendering in preview and storefront.
6. Run periodic cleanup and organization.

Pointers:
- Standardize image dimensions per use-case.
- Always verify alt text on important visuals.
- Recheck assets after domain/CDN config changes.
- Keep placeholders temporary; replace before launch.

### 2.13 Visual Builder Deep Dive (Operational Guide)

The visual builder is the primary production tool for building pages with high speed and low technical risk. It is not just a drag-and-drop canvas; it is a structured content system with rendering parity goals across draft, preview, and published storefront. The most important concept is editing by layer: page -> block -> layout node (section/row/col/group) -> atomic content. Most consistency issues come from editing the wrong layer, not from missing style options.

At runtime, each block reads props and style contracts. Legacy blocks use their own block-level contracts, while `Layout/Section` uses hierarchy contracts (`section`, `rows`, `cols`, `children`) and atomic blocks for granular design. The inspector is context-aware: fields should appear based on selected type and selected layout mode (for example, grid-specific options only when grid layout is active). The builder is optimized for fast composition: add actions appear contextually on hover, and inspector edits apply directly to selected node state.

Use visual builder in this order: compose structure, bind data, then polish style. Do not start with typography micro-tuning before hierarchy is stable. For operational teams, this sequence reduces rework by 40-60% on average during page iterations.

Steps:
1. Start from a page with clear route intent (home, collection, PDP, cart, policy).
2. Add high-level structure first using `Layout/Section` (top fold, trust strip, content sections, CTA/footer).
3. Inside each section, add rows using presets or manual flex/grid depending on complexity.
4. Add columns, then insert atomic blocks (Text/Image/Button/Video/Icon/Form/Group).
5. Bind dynamic blocks (menu, form, product blocks) before advanced styling.
6. Configure spacing rhythm globally (e.g., 8/12/16/24 scale) and then local exceptions.
7. Verify responsive views, then run preview, then publish.

Pointers:
- Build hierarchy first; styling first usually causes later churn.
- Keep section purpose singular (one conversion objective per section).
- Prefer reusable group patterns for cards/feature units.

#### 2.13.1 Interface Anatomy

The interface has three working surfaces: canvas, inspector, and insertion dialogs. Canvas is the visual truth of structure and placement. Inspector is the editing truth of props and style. Dialogs are discovery surfaces for block selection and template selection. Keeping these roles clear prevents accidental state edits and improves team handoff.

Canvas behavior:
- Hover outlines indicate interactive boundaries for section, row, column, and atomic blocks.
- Add controls (`+ Add Row`, `+ Add Col`, `+ Add Block`) are hover-only to keep canvas clean.
- Reorder/remove/duplicate actions should be available in-context where supported.

Inspector behavior:
- Layout options come first (display, flex/grid, alignment, gaps, width/height constraints).
- Content options come next (text/media/link/source bindings).
- Style groups follow (spacing, typography, color/border, background, effects).
- Advanced options are collapsible and should not overwhelm first-time users.

Dialogs behavior:
- “Add New Block” should open a searchable visual picker.
- Categories should separate layout, commerce, media, forms, utility, and templates.
- Thumbnails should indicate actual block purpose; avoid generic placeholders.

Steps:
1. Select layer directly on canvas.
2. Confirm selected layer name/type in inspector header.
3. Edit layout first, then content, then style.
4. Use dialog search to add blocks by function, not by guesswork.

Pointers:
- If an edit seems ignored, verify correct node is selected.
- Keep inspector open while canvas scrolls; do not scroll both panels.

#### 2.13.2 Layout/Section Authoring Standard

`Layout/Section` is the recommended system for new page composition. Standard hierarchy is `Section -> Row -> Column -> Atomic`. Section controls outer framing and background behavior. Row controls arrangement and alignment of columns. Column controls local content stack and local alignment. Atomic blocks render final visible content. Group block enables nested composition for reusable micro-components.

Recommended defaults for stable composition:
- Section: centered layout (`display:flex`, `justify-content:center`), sensible padding.
- Row: max width around content container (e.g., `1208px`), defined gap.
- Column: vertical flow with explicit gap for predictable rhythm.

Preset row strategy:
- Use presets for common structures: `1`, `2`, `3`, `4` columns, `70/30`, `30/70`, feature triplets, asymmetric split.
- Manual mode for custom flex/grid behaviors.
- Grid-only controls should appear only when `display:grid` is selected.

Steps:
1. Add section and set purpose (hero/info/proof/cta).
2. Add row preset matching content shape.
3. Tune row alignment and gap.
4. Populate columns with atomic blocks.
5. Verify mobile stacking and adjust order if required.

Pointers:
- Avoid deeply nested rows unless design requires it.
- Use consistent container width to maintain rhythm across page.

#### 2.13.3 Atomic Block Authoring

Atomic blocks are the final content units and should stay focused. Keep each atomic block responsible for one job. Complex components should be built by combining atomics in `Group` rather than overloading a single block.

Atomic usage guidelines:
- Text: use semantic tag selection (`h1-h6`, `p`, `span`) based on document structure.
- Image: define fit behavior and alt text; prefer managed assets over random external URLs.
- Button: prioritize clear CTA copy; support icon/text combinations and hover states.
- Video: use clear aspect ratio and fallback behavior.
- Icon: searchable picker is preferred for scale.
- Form: bind by `formId`, validate preview and live submission.

Typography discipline:
- One primary heading style per section.
- Body text at readable line-height.
- Limit font size variants to prevent noise.

Spacing discipline:
- Use section spacing for macro rhythm.
- Use atomic margin/padding only for local correction.

Steps:
1. Add atomic block into target column.
2. Fill required props first (content/src/link/formId).
3. Apply typography and spacing.
4. Add hover/interaction only after static layout is correct.

Pointers:
- Empty atomics should still render helpful placeholders in editor.
- Don’t use button color as text default for unrelated content.

#### 2.13.4 Responsive & Accessibility Workflow

Responsive quality is mandatory. Builder parity with storefront depends on safe style generation, valid class safelisting, and robust inline style handling. Always validate on desktop/tablet/mobile before publish. Accessibility is not optional: semantic headings, contrast-safe text, alt text, and keyboard-reachable controls are baseline requirements.

Responsive process:
- Compose on desktop for structure.
- Tune tablet for spacing and alignment drift.
- Finalize mobile for readability and CTA priority.

Accessibility process:
- Heading hierarchy should be logical.
- Buttons/links should have clear labels.
- Images should include meaningful alt text.
- Color contrast must pass practical readability checks.

Steps:
1. Switch breakpoints and inspect each major section.
2. Fix stacking and spacing per breakpoint.
3. Re-check CTA visibility and tap comfort.
4. Audit heading order and alt text.

Pointers:
- If mobile feels cramped, reduce columns and increase vertical rhythm.
- Decorative visuals can be hidden on mobile when clarity improves.

#### 2.13.5 Publish Parity, QA, and Troubleshooting

A page is complete only when draft, preview, and published rendering are consistent. Most parity issues are caused by scope mismatch (site/store/handle), missing bindings, stale assets, or style generation gaps. Use a repeatable QA checklist before publish.

Pre-publish checklist:
- Correct site context and route slug.
- Menus/forms bound correctly.
- Product blocks read correct store scope.
- Theme defaults applied intentionally.
- No unresolved placeholders in critical sections.

Common issues and fast checks:
- “Style differs in storefront”: verify style safelist/class generation and inline style resolution.
- “Data block empty”: verify store scope, bindings, and published snapshot data.
- “Preview opens wrong route”: check preview query handling and route preservation.
- “Asset not updating”: verify picker refresh and asset mapping state.

Steps:
1. Save draft and open preview for target route.
2. Test menu navigation and key conversion path.
3. Publish snapshot.
4. Re-verify live home, list, detail, cart, and policy routes.
5. Record release note with what changed.

Pointers:
- Treat publish as release management, not a cosmetic action.
- Keep rollback habit for high-impact updates.
- If parity fails, isolate whether issue is data, style, or routing.

## 3. 🛒 Ecommerce Setup

### 3.1 Store Setup
Store setup activates commerce behavior and defines operational rules. Configure currency, tax, shipping zones, payment gateways, and checkout defaults before high-traffic launch. Store settings should align with legal and financial requirements in your region. If multiple stores exist under one tenant, each should have clearly scoped catalog ownership and operational responsibility. Make sure checkout and payment configuration are verified with test orders prior to launch. Incomplete store settings can cause order failures even if pages and products render correctly.

Steps:
- Enable ecommerce for site/store.
- Configure store-level settings.
- Set currency and tax strategy.
- Add shipping zones and rates.
- Connect payment methods.
- Test checkout end-to-end.

Pointers:
- Keep policy pages aligned with checkout behavior.
- Validate taxes and shipping with realistic test carts.
- Reconfirm settings after major region expansion.

### 3.2 Catalog Management
Catalog management is store-scoped and should be treated as a structured data workflow. Categories and attributes define product information quality; brands/distributors define commercial structure; products/variants define sellable inventory. Collections help merchandising. Do not build catalog randomly—define taxonomy first, then attributes, then product entry standards. This prevents inconsistent filters, weak search relevance, and messy PDP layouts.

Steps:
- Define category tree first.
- Define reusable attributes per category.
- Add brands and assign ownership.
- Create products with complete metadata.
- Add variants and inventory.

Pointers:
- One strong taxonomy beats many shallow categories.
- Keep attribute names standardized.
- Audit catalog consistency weekly.

#### 3.2.1 Categories
Categories organize product discoverability and influence filtering UX. Use clear, user-facing names and avoid over-nesting unless catalog size justifies it. For each category, configure attributes that matter for buyer decisions (size, color, material, compatibility, etc.). Category SEO settings should target intent relevant to that catalog slice. Keep category naming aligned with navigation labels and collection names to avoid customer confusion.

Steps:
- Create category name and slug.
- Add parent category if nested.
- Define required and optional attributes.
- Save and verify filter behavior.

Pointers:
- Start flat, then nest only when necessary.
- Keep slugs stable after indexing.
- Use category edit modal for controlled schema updates.

#### 3.2.2 Brands
Brands (or distributors) provide merchant-side organization and storefront trust signals. Use consistent naming and logos where supported. Brand pages can be strong SEO and browsing hubs when catalog volume is high. If store type has business rules (single brand vs multiple), enforce them operationally.

Steps:
- Create brand entry under selected store.
- Add descriptive metadata/logo where available.
- Link products to appropriate brand.

Pointers:
- Avoid duplicate brand spellings.
- Keep brand naming customer-readable.
- Review brand coverage in product list regularly.

#### 3.2.3 Products
Product quality drives conversion. Every product should include accurate title, rich description, clear imagery, pricing, SKU, inventory, and mapped category/brand. Use structured descriptions (benefits, specs, care/instructions) instead of long unformatted text blocks. Product SEO should reflect real search intent and avoid generic metadata. For media, prioritize consistent image framing and resolution standards.

Steps:
- Add product basics (name, price, SKU, stock).
- Select category and brand.
- Fill category-driven attributes.
- Upload primary and supporting images.
- Save and publish product state.

Pointers:
- Incomplete attributes reduce filter quality.
- Keep titles descriptive but concise.
- Standardize image style for catalog cohesion.

#### 3.2.4 Variants
Variants support option-based product combinations (e.g., size/color). Use explicit SKU strategy per variant to avoid fulfillment errors. Price overrides and stock tracking should be configured at variant level where needed. Variant imagery is essential when visual differences impact conversion (colorways, finishes, packaging). Keep option naming normalized to avoid duplicate semantic values (e.g., “Grey” vs “Gray”).

Steps:
- Define variant options (size/color/etc.).
- Generate or assign variant SKUs.
- Set price override if needed.
- Set inventory per variant.
- Upload variant-specific images.

Pointers:
- Never reuse ambiguous SKUs.
- Keep option values standardized.
- Verify PDP selection updates image and stock correctly.

#### 3.2.5 Collections
Collections are merchandising layers independent of strict taxonomy. Manual collections are curated; automated collections use rules. Use manual for campaigns/seasonal storytelling and automated for scalability. Collections improve discovery and landing page conversion when tied to audience intent.

Steps:
- Create collection (manual or automated).
- Add products or define rules.
- Place collection on page/block.

Pointers:
- Keep collection names customer-friendly.
- Time-box seasonal collections and retire cleanly.
- Audit rule logic after catalog changes.

### 3.3 Inventory Management
Inventory controls stock availability and customer trust. Use centralized adjustment flows and maintain consistency between catalog edits and stock operations. Low stock alert handling should be procedural, not ad-hoc. Bulk updates are useful for restocks but require strict scope verification to prevent cross-store mistakes.

Steps:
- Open inventory screen in correct store scope.
- Search SKU/product.
- Apply adjustments (+/-).
- Save and verify reflected quantities.

Pointers:
- Confirm store scope before bulk actions.
- Log significant manual adjustments.
- Review low-stock SKUs daily.

### 3.4 Orders
Orders management is the operational heartbeat. Define status workflow clearly (new, processing, shipped, delivered, cancelled, etc.) and enforce it across team members. Use order notes to preserve decision context. Export orders for finance/reconciliation as needed. Refund handling should follow policy and accounting controls.

Steps:
- Review new orders queue.
- Open order detail and verify customer/address/items.
- Update status by fulfillment stage.
- Add notes and process refunds if required.
- Export reports periodically.

Pointers:
- Don’t skip item-level verification.
- Keep status updates timely.
- Use notes for internal traceability.

### 3.5 Customers
Customer records connect orders, preferences, and support workflows. Grouping customers helps segmentation for marketing and service. Manual customer creation is useful for assisted sales or B2B contexts. Keep customer data quality high to improve downstream communication and retention efforts.

Steps:
- Review customer profiles regularly.
- Group customers by lifecycle/value where needed.
- Use order history to support service decisions.
- Add manual customer records only with clean data.

Pointers:
- Avoid duplicate customer records.
- Standardize phone/address formats.
- Respect privacy and data handling policies.

### 3.6 Discounts & Coupons
Discounts influence conversion and margin simultaneously, so configure carefully. Define offer type (percentage, fixed, shipping), usage limits, expiry windows, and eligibility clearly. Test discount behavior with realistic carts before launch. Avoid stacking scenarios that unintentionally erode margin. Keep promotional naming clear for support and analytics.

Steps:
- Create discount code.
- Choose discount type and value.
- Set usage limits and expiry.
- Test in checkout flow.
- Monitor performance and abuse patterns.

Pointers:
- Time-box high-impact promotions.
- Use clear campaign naming conventions.
- Review edge cases (minimum spend, excluded items).

---

## Final Operational Notes
- Always validate scope first (site/store).
- Always validate state second (draft/published).
- Publish only after checklist completion.
- Keep documentation and release notes updated.

---

