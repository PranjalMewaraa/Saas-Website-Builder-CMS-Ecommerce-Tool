import { getMongoDb, pagesCollection, sitesCollection } from "@acme/db-mongo";
import type { AiSiteBlueprint } from "./blueprint-schema";
import { compileBlueprintToPageLayout } from "./site-blueprint-compiler";

export type ApplyMode = "append_only" | "replace_selected";

function pageId(siteId: string, slug: string) {
  const clean = slug.replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "");
  return `page_${siteId}_${clean || "root"}_${Date.now().toString(36)}`;
}

async function resolveSlug(args: {
  tenant_id: string;
  site_id: string;
  slug: string;
}) {
  const col = await pagesCollection();
  const base = args.slug === "/" ? "/home" : args.slug;
  let candidate = args.slug;
  let i = 1;
  while (true) {
    const exists = await col.findOne({
      tenant_id: args.tenant_id,
      site_id: args.site_id,
      slug: candidate,
    });
    if (!exists) return candidate;
    i += 1;
    candidate = `${base}-ai-${i}`;
  }
}

type RunDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  user_id: string;
  mode: ApplyMode;
  status: "started" | "applied" | "failed";
  selected_slugs?: string[];
  created_page_ids: string[];
  blueprint_meta?: {
    version: number;
    industry: string;
    archetype: string;
    page_count: number;
    recipe?: string;
  };
  created_at: Date;
  updated_at: Date;
  error?: string;
};

async function runsCollection() {
  const db = await getMongoDb();
  return db.collection<RunDoc>("ai_generation_runs");
}

export async function applyAiBlueprint(args: {
  tenant_id: string;
  site_id: string;
  user_id: string;
  blueprint: AiSiteBlueprint;
  mode?: ApplyMode;
  selected_slugs?: string[];
}) {
  const mode = args.mode || "append_only";
  const selected = new Set((args.selected_slugs || []).filter(Boolean));
  const now = new Date();
  const runId = `airun_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const runs = await runsCollection();
  await runs.insertOne({
    _id: runId,
    tenant_id: args.tenant_id,
    site_id: args.site_id,
    user_id: args.user_id,
    mode,
    selected_slugs: [...selected],
    blueprint_meta: {
      version: args.blueprint.version,
      industry: args.blueprint.industry,
      archetype: args.blueprint.archetype,
      page_count: args.blueprint.pages.length,
      recipe: args.blueprint.meta?.recipe,
    },
    status: "started",
    created_page_ids: [],
    created_at: now,
    updated_at: now,
  });

  const pages = await pagesCollection();
  const createdPageIds: string[] = [];
  try {
    for (const page of args.blueprint.pages) {
      if (mode === "replace_selected" && selected.size && !selected.has(page.slug)) {
        continue;
      }
      const layout = compileBlueprintToPageLayout(page);
      if (mode === "replace_selected") {
        const existing = await pages.findOne({
          tenant_id: args.tenant_id,
          site_id: args.site_id,
          slug: page.slug,
        });
        if (existing) {
          await pages.updateOne(
            { _id: existing._id, tenant_id: args.tenant_id, site_id: args.site_id },
            {
              $set: {
                title: page.title,
                draft_layout: layout,
                seo: { title: page.title, description: "" },
                updated_at: new Date(),
              },
            },
          );
          continue;
        }
      }

      const slug = await resolveSlug({
        tenant_id: args.tenant_id,
        site_id: args.site_id,
        slug: page.slug,
      });
      const _id = pageId(args.site_id, slug);
      await pages.insertOne({
        _id,
        tenant_id: args.tenant_id,
        site_id: args.site_id,
        slug,
        title: page.title,
        draft_layout: layout,
        seo: { title: page.title, description: "" },
        created_at: new Date(),
        updated_at: new Date(),
      } as any);
      createdPageIds.push(_id);
    }

    const sites = await sitesCollection();
    await sites.updateOne(
      { _id: args.site_id, tenant_id: args.tenant_id },
      {
        $set: {
          ai_bootstrap: {
            enabled: true,
            industry: args.blueprint.industry,
            archetype: args.blueprint.archetype,
            prompt: args.blueprint.prompt || "",
            status: "applied",
            version: args.blueprint.version,
            updated_at: new Date(),
          },
          updated_at: new Date(),
        },
      },
    );

    await runs.updateOne(
      { _id: runId },
      {
        $set: {
          status: "applied",
          created_page_ids: createdPageIds,
          updated_at: new Date(),
        },
      },
    );

    return { ok: true as const, run_id: runId, created_page_ids: createdPageIds };
  } catch (err: any) {
    if (createdPageIds.length) {
      await pages.deleteMany({
        tenant_id: args.tenant_id,
        site_id: args.site_id,
        _id: { $in: createdPageIds },
      });
    }
    await runs.updateOne(
      { _id: runId },
      {
        $set: {
          status: "failed",
          created_page_ids: createdPageIds,
          error: err?.message || "apply_failed",
          updated_at: new Date(),
        },
      },
    );
    throw err;
  }
}
