import { NextResponse } from "next/server";
import { requireSession } from "@acme/auth";
import { sitesCollection } from "@acme/db-mongo";
import { MODULE_REGISTRY, ModuleKey } from "@acme/core";

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  if (!site_id) {
    return NextResponse.json(
      { ok: false, error: "Missing site_id" },
      { status: 400 },
    );
  }

  const body = await req.json();
  const key = body.key as ModuleKey | undefined;
  const enabled = body.enabled as boolean | undefined;
  const patch = body.modules_enabled as Record<string, boolean> | undefined;

  const col = await sitesCollection();
  const site = await col.findOne({ _id: site_id, tenant_id });
  if (!site) {
    return NextResponse.json(
      { ok: false, error: "SITE_NOT_FOUND" },
      { status: 404 },
    );
  }

  const current = site.modules_enabled || {};
  const next = { ...current };

  function canDisable(k: ModuleKey) {
    const def = MODULE_REGISTRY[k];
    return !def.defaultEnabled;
  }

  function dependentsOf(k: ModuleKey) {
    return (Object.keys(MODULE_REGISTRY) as ModuleKey[]).filter((m) =>
      MODULE_REGISTRY[m].dependencies.includes(k),
    );
  }

  if (key && typeof enabled === "boolean") {
    if (!MODULE_REGISTRY[key]) {
      return NextResponse.json(
        { ok: false, error: "UNKNOWN_MODULE" },
        { status: 400 },
      );
    }

    if (!enabled && !canDisable(key)) {
      return NextResponse.json(
        { ok: false, error: "CORE_PLUGIN_LOCKED" },
        { status: 400 },
      );
    }

    if (!enabled) {
      const deps = dependentsOf(key).filter((d) => current[d] === true);
      if (deps.length) {
        return NextResponse.json(
          {
            ok: false,
            error: `DEPENDENTS_ENABLED: ${deps.join(", ")}`,
          },
          { status: 400 },
        );
      }
      next[key] = false;
    } else {
      next[key] = true;
      const deps = MODULE_REGISTRY[key].dependencies || [];
      deps.forEach((d) => (next[d] = true));
    }
  }

  if (patch) {
    (Object.keys(patch) as ModuleKey[]).forEach((k) => {
      if (!MODULE_REGISTRY[k]) return;
      if (patch[k] === false && !canDisable(k)) return;
      next[k] = patch[k] === true;
    });
  }

  await col.updateOne(
    { _id: site_id, tenant_id },
    { $set: { modules_enabled: next, updated_at: new Date() } },
  );

  const updated = await col.findOne({ _id: site_id, tenant_id });
  return NextResponse.json({ ok: true, site: updated });
}
