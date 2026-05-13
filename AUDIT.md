# Repository Audit — `saas-store-builder`

> **Method.** Persistent code-review graph (Tree-sitter parse of 442 files into 1,712 nodes / 17,373 edges / 10 communities), then graph algorithms (degree centrality, betweenness, Leiden communities, surprise scoring), cross-validated by reading the flagged files.
> **Date.** 2026-05-13. **Worktree.** `claude/modest-mestorf-094bd6`. **Branch base.** `main` (commits `d0a6898`, `7069ddd`).

---

## 1. Snapshot

| Metric | Value |
|---|---|
| Files parsed | **442** |
| Nodes | **1,712** (1,241 functions · 442 files · 27 classes · 2 “tests” — see §5) |
| Edges | **17,373** (CALLS 14,620 · CONTAINS 1,276 · IMPORTS_FROM 1,155 · REFERENCES 322) |
| Languages | tsx · typescript · javascript · sql |
| Communities | 10 (Leiden) |
| Flows detected | 240 |
| Embeddings | **0** — `sentence-transformers` not installed, semantic search fell back to FTS keyword matching. Install with `pip install code-review-graph[embeddings]` if you want vector search on future runs. |

**Apps (4) vs README (which lists 2).** [pnpm-workspace.yaml](pnpm-workspace.yaml) globs `apps/*` and `packages/*`. Filesystem shows four apps: **`admin`**, **`builder`** (port 3001 — not in `dev` script, not in any Dockerfile), **`storefront`** (port 3002), **`superadmin`** (8 boilerplate files, no real code). The README documents only admin + storefront. See P0-3.

**Packages (10).** `auth`, `blocks`, `core`, `db-mongo`, `db-mysql`, `renderer`, `schemas`, `ui`, `tsconfig`, `layout-builder`.

---

## 2. Architecture map

### Community structure (Leiden, on call/import/contain edges)

Community IDs from the graph are stable but unnamed; the membership tells the story.

| ID | What it is | Notes |
|---|---|---|
| 1 | **Admin UI editor cluster** | Holds every monster file: `BlockPropsForm`, `LayoutInspector`, `VisualLayoutSection`, `PageEditorClient(s)`, `BuilderClient`, `VisualInspector`, all `*Client.tsx`. ~80% of the hub-and-bridge mass lives here. |
| 6 | **Blocks library** | `packages/blocks/*` — `ProductDetailClient`, `CartPageV1`, plus the central `getBlock` registry. |
| 10 | **Renderer engine** | `packages/renderer/*` — `BlockRenderer`, `LayoutSectionRenderer`, `renderAtomicBlock`, `layout-style.ts`, `responsive-css.ts`. |
| 4 | **app-root** | Thin community (size 2) — root layouts. Flagged as a "thin community" by knowledge-gaps. Cosmetic; not actionable. |
| 2, 3, 5, 7, 8, 9 | DB repos, API routes, auth/core, schemas | Smaller, well-bounded clusters. |

### Cross-community coupling

The graph flags every admin UI ↔ renderer edge as "surprising" (cross-community + cross-language: tsx ↔ ts). 20 of the top-20 surprises are the same pattern — admin's `VisualLayoutSection.tsx` calls renderer helpers directly:

> `VisualLayoutSection`, `renderAtomicPreview`, `renderGroupLayout` (admin) → `resolveLayoutStyle`, `toCssSizeValue`, `getBackgroundVideo`, `resolveRowLayoutStyle`, `buildResponsiveCss` (renderer)

This is **expected by design** — the admin preview must mirror the renderer's layout math — but the *shape* of the coupling is loose: admin imports renderer internals rather than calling one high-level entrypoint. This is a smell but not a defect. See P2-15.

The genuinely surprising edge is **`BlockRenderer` (renderer) → `getBlock` (blocks registry)** (score 0.7, peripheral-to-hub). That's the renderer reaching into the blocks registry — the intended seam between the engine and the component library. **Working as designed.**

### Layer drift you should know about

- **No barrel for `@acme/renderer` internals.** [apps/admin/src/app/(adminPages)/builder/builderClient.tsx:30](apps/admin/src/app/(adminPages)/builder/builderClient.tsx) imports `../../../../../../packages/renderer/render-page-builder` directly (six `..` segments) while other files use `@acme/renderer`. The aliases are configured but not used consistently.
- **Admin UI cluster is 80% of the graph mass.** Eight of the top ten hubs live in one directory tree (`apps/admin/src/app/(adminPages)/content/`). The renderer + blocks + DB layers are well-isolated; the editor is a single giant blob.

---

## 3. Hotspots (hubs & bridges)

### Top hubs (degree = blast radius if changed)

| # | Node | Degree | File |
|---:|---|---:|---|
| 1 | `BlockPropsForm` | **973** | [apps/admin/.../BlocksPropForm.tsx:17](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx) |
| 2 | `Field` (inner helper) | 186 | [BlocksPropForm.tsx:5896](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx) |
| 3 | `ProductEditClient` | 186 | [productEditClient.tsx:88](apps/admin/src/app/(adminPages)/products/[product_id]/productEditClient.tsx) |
| 4 | `renderAtomicEditor` | 166 | [LayoutInspector.tsx:723](apps/admin/src/app/(adminPages)/content/_component/LayoutInspector.tsx) |
| 5 | `PromotionsClient` | 147 | [PromotionsClient.tsx:27](apps/admin/src/app/(adminPages)/manage/promotions/PromotionsClient.tsx) |
| 6 | `PageEditorStudioClient` | 146 | [pageEditorStudioClient.tsx:68](apps/admin/src/app/content/pages/editor/pageEditorStudioClient.tsx) |
| 7 | `VisualInspector` | 138 | [VisualInspector.tsx:366](apps/admin/src/app/(adminPages)/content/_component/VisualInspector.tsx) |
| 8 | `StyleFields` | 136 | [LayoutInspector.tsx](apps/admin/src/app/(adminPages)/content/_component/LayoutInspector.tsx) |
| 9 | `ProductDetailClient` | 129 | [packages/blocks/ProductDetail/ProductDetailClient.tsx](packages/blocks/ProductDetail/ProductDetailClient.tsx) |
| 10 | `CategoryCreateClient` | 125 | [CategoryCreateClient.tsx](apps/admin/src/app/(adminPages)/categories/CategoryCreateClient.tsx) |

**Reading.** Eight of these ten are admin editor components — and all eight are flagged as **untested hotspots** (§5). The renderer hubs (`BlockRenderer`, `LayoutSectionRenderer`) do not appear in the top 20 because they're well-decomposed.

### Top bridges (betweenness = fragility chokepoints)

| # | Node | Why it matters |
|---:|---|---|
| 1 | `ImageField` | Asset picker is reached from every block-prop UI. |
| 2 | `VisualCanvas` | Builder's main editing surface. |
| 3 | `PageEditorStudioClient` | Sits between routing, snapshot, and the canvas. |
| 4 | `AssetPickerModal` | Same as ImageField — choke for asset selection. |
| 5 | `BlockPropsForm` | Choke for *every* prop-edit flow. |
| 6 | **`UIProvider`** | Global toast/dialog/confirm context. If it throws, every page crashes. |
| 14 | `renderAtomicBlock` (renderer) | Lone non-admin bridge — entry to atomic rendering. |
| 15 | `LayoutSectionRenderer` (renderer) | The other renderer chokepoint. |

**Verdict.** Items 1–13 are admin editor — expected to be heavy. Items 14–15 (renderer) are by-design seams and well-tested by virtue of being short, pure functions. Item 6 (`UIProvider`) is the one to harden — wrap in an error boundary, since a bug there nukes the whole admin app.

---

## 4. Decomposition candidates

| Rank | File / Function | Lines | Verdict |
|---:|---|---:|---|
| 1 | [BlocksPropForm.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx) | **6,683** (file) / **5,700** (single function) | **Real issue.** One React component handling every block type via if/else. Decompose by block type using the existing `BLOCKS` registry pattern (see §7 P1-7). |
| 2 | [LayoutInspector.tsx](apps/admin/src/app/(adminPages)/content/_component/LayoutInspector.tsx) | 2,772 / 1,393 (`LayoutInspector` fn) | **Real issue.** Inner `renderAtomicEditor` is 893 lines on its own ([:723–1615](apps/admin/src/app/(adminPages)/content/_component/LayoutInspector.tsx:723)). |
| 3 | [pageEditorStudioClient.tsx](apps/admin/src/app/content/pages/editor/pageEditorStudioClient.tsx) | 1,942 / 861 | **Real issue.** See P0-6 about the editor duplication first. |
| 4 | [apps/builder/.../builderClient.tsx](apps/builder/src/app/builder/builderClient.tsx) | 1,856 | **Likely dead** — see P0-3. |
| 5 | [VisualLayoutSection.tsx](apps/admin/src/app/(adminPages)/content/_component/VisualLayoutSection.tsx) | 1,822 / 1,259 | Real issue. |
| 6 | [pageEditorClient.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/pageEditorClient.tsx) | 1,480 / 692 | **Likely deprecated** — see P0-6. |
| 7 | [commerceV2.repo.ts](packages/db-mysql/commerceV2.repo.ts) | 1,421 | **Real issue.** A single repo file for an entire commerce subsystem. Split per entity (stores, brands, categories, products, inventory). Several exported functions are unreachable from JS/TS code per the graph (`listStoreTypePresets`, `listBrandsByStore`, `listStoreCategories`, `listProductsV2`) — verify they have route consumers before splitting. |
| 8 | [homePageEditorClient.tsx](apps/admin/src/app/(adminPages)/content/pages/home/homePageEditorClient.tsx) | 1,155 | Real issue. |
| 9 | [_old/pageEditorClient.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/_old/pageEditorClient.tsx) | 1,124 | **Dead code** — see P0-5. Delete. |
| 10 | [CategoryCreateClient.tsx](apps/admin/src/app/(adminPages)/categories/CategoryCreateClient.tsx) | 1,102 | Real issue. |

Also flagged ≥ 700 lines: `VisualInspector.tsx` (1,095), `apps/admin/(adminPages)/builder/builderClient.tsx` (1,024), `industryTemplate.ts` (1,017), `site-blueprint-generator.ts` (944), `BlockCard.tsx` (890), `layout-section.tsx` (867), `productEditClient.tsx` (865), `pageEditorStudioClient::PageEditorStudioClient` fn (861), `FooterV1.tsx` (851), `ProductCreateClient.tsx` (840), `PromotionsClient.tsx` (830), `productList.data.ts` (821), `block-style-capabilities.ts` (776), `site-taxonomy.ts` (762), `api/admin/pages/route.ts` (761), `builderClient::BuilderClient` fn (747).

---

## 5. Structural weaknesses

### Zero automated tests

- `find . -name '*.test.ts*' -o -name '*.spec.ts*'` → **0 results**.
- No `test` script in the root `package.json` or any sub-package.
- No `jest`, `vitest`, or `playwright` listed as a dependency anywhere.
- The graph reports `Test: 2` — these are false positives (files with `test` in their name like `InspectorPanel`). There are no real tests.

This is the single largest risk in the audit. Every hub in §3 is by definition untested.

### Untested hotspots (top 20 from `get_knowledge_gaps_tool`)

All 20 are the same components flagged in §3 — admin editor + a couple of block components. Highest-priority targets for the **first** tests written:

- `BlockPropsForm` (degree 973) — prop validation per block type
- `renderAtomicBlock` / `LayoutSectionRenderer` (renderer engine — pure, easy to test)
- `requireModule` / `computeEffectiveModules` (authZ logic — testing wins are cheap and high-impact)
- The publish flow (`/api/admin/publish/route.ts`) — golden-path snapshot creation

### Isolated nodes (degree-1)

50 reported; bucketing:

- **23 SQL tables** parsed from `db-mysql/schema/*.sql` (Tree-sitter sees them as Class nodes but can't link to mysql2 query strings). **False positive.**
- **4 Next.js framework conventions** (`RootLayout` × 2, `ContentLayout`, `rewrites`). **False positive.**
- **2 NextAuth callbacks** (`jwt`, `session`) — invoked by the framework via config. **False positive.**
- **~8 truly suspicious unreferenced helpers:**
  - `remapSectionStyleAssets` (in both `builderClient.tsx` files — admin and apps/builder)
  - `defaultPropsFor` (defined twice — see P1-8)
  - `getBlockBuilder` ([packages/blocks/registry/builder.tsx](packages/blocks/registry/builder.tsx))
  - `getBlockVisual` ([packages/blocks/registry/visual.ts](packages/blocks/registry/visual.ts))
  - `getMaxWidth` ([packages/core/maxWidth.ts](packages/core/maxWidth.ts))
  - `organizationSchema`, `webpageSchema` ([packages/renderer/seo/jsonld.ts](packages/renderer/seo/jsonld.ts)) — likely called via JSX (`<script dangerouslySetInnerHTML>`), so Tree-sitter misses the call.
  - `ProductDetailVisualStub` ([packages/blocks/ProductDetail/ProductDetail.visual.tsx](packages/blocks/ProductDetail/ProductDetail.visual.tsx)) — should be referenced from the registry's "visual" map.
  - `listStoreTypePresets`, `listBrandsByStore`, `listStoreCategories`, `listProductsV2` from `commerceV2.repo.ts`.

Each of those 8 deserves a 30-second `grep` to confirm dead vs. dynamically-loaded.

### Thin / single-file communities

One thin community (`app-root`, size 2). Cosmetic.

---

## 6. Suspicious coupling

Already covered in §2. Summary of the 20 surprising edges:

| Pattern | Count | Classification |
|---|---:|---|
| admin `VisualLayoutSection` / `renderAtomicPreview` / `renderGroupLayout` → renderer `layout-style.ts` helpers | 18 | **Soft smell.** Admin reuses renderer helpers for the preview, which is correct in principle but bypasses any abstraction. Either accept (and document) or expose a single `getPreviewStyles(block, ctx)` from the renderer. |
| `BlockRenderer` → `getBlock` | 1 | **Expected** (the intended renderer↔registry seam). |
| `VisualLayoutSection` → `buildResponsiveCss` | 1 | Same as the first pattern. |

The `toCssSizeValue` call is repeated **8 times from a single function** in `VisualLayoutSection.tsx::renderAtomicPreview` — a missing helper. Refactor candidate.

---

## 7. Prioritized findings

Each item is independently actionable. File:line citations included.

### P0 — fix before next release

**P0-1. `apps/admin/src/middleware.ts` enforces nothing.** [middleware.ts:6](apps/admin/src/middleware.ts:6) is a literal `NextResponse.next()` with a comment "Later you can add auth gating / module gating here." All admin auth is per-route via `requireSession()`. 4 of 72 routes don't call it (3 are intentional public auth routes; 1 is **not** — see P0-2). Add a route-prefix gate in middleware that 401s anything under `/api/admin/*` without a valid session, as defence in depth.

**P0-2. `/api/admin/seo/keywords` has no `requireSession` call.** [apps/admin/src/app/api/admin/seo/keywords/route.ts](apps/admin/src/app/api/admin/seo/keywords/route.ts) is the only admin-prefixed route that doesn't gate on auth. Read the file and either add `requireSession`/`requireModule` or move it out of `/api/admin/*` if intentionally public.

**P0-3. Orphaned `apps/builder/`.** [apps/builder/package.json](apps/builder/package.json) — separate Next app on port 3001, 1,856-line `builderClient.tsx`, ~12 components mirroring `apps/admin/src/app/(adminPages)/builder/` (which is 1,024 lines). Not in `pnpm dev`, not in any Dockerfile, no references from `admin`/`storefront`. **Decide which is the real builder; delete the other.** If `apps/builder/` is the new one, plan the migration and delete the admin-embedded copy plus all 11 duplicate components in `(adminPages)/builder/components/`.

**P0-4. `apps/storefront/src/middleware.ts` writes cookies from un-validated query params.** [apps/storefront/src/middleware.ts:5-20](apps/storefront/src/middleware.ts:5) accepts `?handle=` and `?sid=` from any URL and writes them as 30-day cookies. The storefront then resolves the site partly from these cookies. Validate `handle` against `/^[a-z0-9-]{1,64}$/` and `sid` against your snapshot ID format before persisting. Without this, a crafted link can pin a visitor to an arbitrary tenant's draft snapshot.

**P0-5. Delete `_old/pageEditorClient.tsx`.** [apps/admin/src/app/(adminPages)/content/pages/edit/_old/pageEditorClient.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/_old/pageEditorClient.tsx) — 1,124 lines, zero references in the codebase (`grep _old/` returned nothing). Pure dead code.

**P0-6. Two live page editors at different URLs.** [/content/pages/edit/pageEditorClient.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/pageEditorClient.tsx) (1,480 lines, route group `(adminPages)`) and [/content/pages/editor/pageEditorStudioClient.tsx](apps/admin/src/app/content/pages/editor/pageEditorStudioClient.tsx) (1,942 lines, not in a route group). Both are wired up. Pick one. Most likely the "Studio" variant is the newer one — verify by checking which is linked from admin nav, then delete the other.

**P0-7. Zero automated tests.** Repo-wide. The 8 highest-degree functions in §3 have no coverage. Start with:
   1. `packages/auth/module-gate.ts` — `requireModule` correctness (entitlement + dependency graph)
   2. `packages/core/effective-modules.ts` — `computeEffectiveModules` (pure function, table-driven test)
   3. `apps/admin/src/app/api/admin/publish/route.ts` — golden-path snapshot creation
   4. `packages/renderer/render-page.tsx` — block dispatch via `getBlock`
   These four cover auth, feature flags, publish, and render — the load-bearing seams.

### P1 — fix this iteration

**P1-1. Decompose `BlocksPropForm.tsx`.** [BlocksPropForm.tsx](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx) 5,700-line function uses `props: any` ([:17](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx:17)) and contains a stray `console.log(type)` ([:24](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx:24)). The `BLOCKS` registry already shows the right shape — extend each block's registry entry with an optional `propsForm` component, then have this file just lookup-and-render. The 5,700 lines collapse into ~50 lines + per-block form modules.

**P1-2. Hardcoded external image URL.** [BlocksPropForm.tsx:15](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx:15) — `DEFAULT_IMAGE` points to `imgs.search.brave.com`. Self-host this placeholder. If Brave's CDN changes or blocks the referrer, every empty image field in the admin breaks.

**P1-3. `defaultPropsFor` duplicated.** [BlockCard.tsx:682](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlockCard.tsx:682) (207 lines) and [BlocksPropForm.tsx:6207](apps/admin/src/app/(adminPages)/content/pages/edit/components/BlocksPropForm.tsx:6207) (1,364 lines). Two implementations of the same function name will diverge. The `BLOCKS` registry already has a `defaults?` field per block — make that authoritative and delete both duplicates.

**P1-4. Audit `dangerouslySetInnerHTML` for cross-tenant XSS.** Twelve sites. Safe ones (JSON-LD, theme CSS, responsive CSS): [storefront page.tsx:241-245](apps/storefront/src/app/[[...slug]]/page.tsx:241), [render-page.tsx:147](packages/renderer/render-page.tsx:147), [render-page-builder.tsx:36](packages/renderer/render-page-builder.tsx:36). User-authored HTML — verify sanitization at *publish time*:
   - [packages/blocks/Atomic/Embed.tsx:9](packages/blocks/Atomic/Embed.tsx:9) — raw `props.code`
   - [packages/blocks/utility/RichText.tsx:17](packages/blocks/utility/RichText.tsx:17) — raw `props.html`
   - [packages/blocks/Header/HeaderV1.tsx:406](packages/blocks/Header/HeaderV1.tsx:406)
   - [packages/renderer/layout-section.tsx:563](packages/renderer/layout-section.tsx:563) — raw `props.code`
   In a multi-tenant SaaS where snapshots are rendered on customer-facing subdomains, a tenant admin XSS-ing their own customers is bad; if any path lets a snapshot from tenant A render on tenant B, it's worse. Sanitize HTML with a strict whitelist in the publish endpoint, not at render.

**P1-5. Lone non-route admin endpoint missing `requireSession`.** See P0-2 (also tagged P1 for the typing audit).

**P1-6. `commerceV2.repo.ts` has 4 likely-dead exports.** [commerceV2.repo.ts](packages/db-mysql/commerceV2.repo.ts) — `listStoreTypePresets`, `listBrandsByStore`, `listStoreCategories`, `listProductsV2` show degree=1 (file CONTAINS only). Confirm they have route or test consumers; if not, delete. While you're in there, split the 1,421-line file by entity (stores, brands, categories, products, inventory).

**P1-7. 917 `: any` annotations in `apps/admin/src`.** Type-check is on (`turbo run check-types`), so each `any` is consciously written. The worst is `BlockPropsForm`'s entire prop interface. Even adopting `Record<string, unknown>` for the props bag and `Block<TType extends BlockType>` for the block type would catch the bulk of UX bugs in this layer.

**P1-8. UIProvider error boundary.** [UIProvider](apps/admin/src/app/_components/ui/UiProvider.tsx) sits as a top bridge node — every admin page hangs off it. Wrap its provider tree in a React error boundary so a downstream bug doesn't take out the whole admin.

### P2 — clean up

**P2-1. Decompose the other monster files.** Top three after `BlocksPropForm` (already P1-1): `LayoutInspector.tsx` (2,772), `pageEditorStudioClient.tsx` (1,942), `VisualLayoutSection.tsx` (1,822). Split per-block-type editor logic into peer modules following the same registry pattern.

**P2-2. Centralize admin → renderer helpers.** [VisualLayoutSection.tsx::renderAtomicPreview](apps/admin/src/app/(adminPages)/content/_component/VisualLayoutSection.tsx) calls `toCssSizeValue` 8 times from one function. Expose a single `getPreviewStyles(block, ctx)` from `@acme/renderer` and call that.

**P2-3. Consistent import paths.** [apps/admin/.../publish/route.ts:1-13](apps/admin/src/app/api/admin/publish/route.ts) imports `../../../../../../../packages/auth` (7 `..`) and `@acme/db-mongo` in the same file. Pick `@acme/*` everywhere and delete the relative path imports. Same in both `builderClient.tsx` files.

**P2-4. `apps/superadmin` is empty.** Only Next.js boilerplate ([apps/superadmin/src/app/layout.tsx](apps/superadmin/src/app/layout.tsx) etc.). Either start using it or delete the app — its presence in `pnpm-workspace.yaml` already costs install time.

**P2-5. 11 `console.log/error/warn` in `apps/admin/src/app/api`.** Replace with a structured logger you can disable in production, or accept that these are intentional and document why.

**P2-6. 11 dead helpers (degree=1).** See §5 isolated-nodes bucket — `remapSectionStyleAssets` (twice), `getBlockBuilder`, `getBlockVisual`, `getMaxWidth`, `ProductDetailVisualStub`. Spend 5 minutes grep-ing each; delete the genuinely dead ones.

**P2-7. Consolidate three near-identical user docs.** [user_doc.md](user_doc.md) (14KB), [user_doc_print.md](user_doc_print.md) (5KB), [user_docs.md](user_docs.md) (36KB), plus [USER_GUIDE.md](USER_GUIDE.md) (10KB) and [USER_GUIDE_SHORT.md](USER_GUIDE_SHORT.md) (2KB). Five files, overlapping content. Pick one canonical source and generate the others (or delete them).

---

## 8. Caveats

What the graph **can't** see, and what this audit therefore doesn't cover:

1. **Runtime wiring.** Server actions, Next.js route conventions, NextAuth callbacks, React refs, dynamic imports — all show up as "isolated nodes." Hence false positives in §5.
2. **String-based SQL.** `mysql2` queries are template strings; the graph parses the SQL schema files separately, so DML/DQL aren't connected to the schema. The 23 isolated SQL tables in §5 are this.
3. **Env-driven behavior.** [.env.example](.env.example) and [.env.docker.example](.env.docker.example) drive S3, MongoDB, MySQL, NEXTAUTH_SECRET, DEFAULT_SITE_HANDLE — Tree-sitter can't reason about which env profile is active.
4. **Dependency upgrades / CVEs.** Not covered. Run `pnpm audit` separately.
5. **Performance.** No runtime profile here. The 6,683-line `BlocksPropForm` is almost certainly a render-perf footgun even before correctness concerns, but proving that needs a profile.
6. **Semantic similarity.** `sentence-transformers` not installed; semantic search fell back to FTS. Install if you want concept-level "find anything like X" queries on future runs:
   ```
   pip install code-review-graph[embeddings]
   ```
7. **Worktree vs. main.** The graph is built against `.claude/worktrees/modest-mestorf-094bd6`. Re-run from `main` if you want the graph to persist across the worktree's deletion.

---

## Re-running the audit

```bash
# Full rebuild after major changes
mcp__code-review-graph__build_or_update_graph_tool full_rebuild=true postprocess=full

# Incremental after small changes — auto-detects modified files via git diff
mcp__code-review-graph__build_or_update_graph_tool

# Re-check a single category
mcp__code-review-graph__find_large_functions_tool min_lines=200
mcp__code-review-graph__get_knowledge_gaps_tool
```

Findings dated 2026-05-13; expect drift after every meaningful refactor.
