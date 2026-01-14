import { getMongoDb } from "./index";

export async function ensureMongoIndexes() {
  const db = await getMongoDb();

  // users: unique email per tenant
  await db
    .collection("users")
    .createIndex(
      { tenant_id: 1, email: 1 },
      { unique: true, name: "uq_users_tenant_email" }
    );

  // tenants
  await db
    .collection("tenants")
    .createIndex({ status: 1 }, { name: "idx_tenants_status" });
  await db
    .collection("tenants")
    .createIndex({ plan: 1 }, { name: "idx_tenants_plan" });

  // sites: unique handle, unique domain host
  await db
    .collection("sites")
    .createIndex(
      { tenant_id: 1, handle: 1 },
      { unique: true, name: "uq_sites_tenant_handle" }
    );
  await db
    .collection("sites")
    .createIndex(
      { "domains.host": 1 },
      { unique: true, sparse: true, name: "uq_sites_domain_host" }
    );
  await db
    .collection("sites")
    .createIndex(
      { tenant_id: 1, store_id: 1 },
      { name: "idx_sites_tenant_store" }
    );

  // themes
  await db
    .collection("themes")
    .createIndex(
      { tenant_id: 1, site_id: 1 },
      { name: "idx_themes_tenant_site" }
    );

  // menus
  await db
    .collection("menus")
    .createIndex(
      { tenant_id: 1, site_id: 1, name: 1 },
      { unique: true, name: "uq_menus_site_name" }
    );

  // pages: unique slug per site
  await db
    .collection("pages")
    .createIndex(
      { tenant_id: 1, site_id: 1, slug: 1 },
      { unique: true, name: "uq_pages_site_slug" }
    );
  await db
    .collection("pages")
    .createIndex(
      { tenant_id: 1, site_id: 1, updated_at: -1 },
      { name: "idx_pages_updated" }
    );

  // templates: unique type per site
  await db
    .collection("templates")
    .createIndex(
      { tenant_id: 1, site_id: 1, template_type: 1 },
      { unique: true, name: "uq_templates_site_type" }
    );

  // forms
  await db
    .collection("forms")
    .createIndex(
      { tenant_id: 1, site_id: 1, name: 1 },
      { unique: true, name: "uq_forms_site_name" }
    );

  // assets meta
  await db
    .collection("assets_meta")
    .createIndex(
      { tenant_id: 1, site_id: 1, created_at: -1 },
      { name: "idx_assets_created" }
    );
  await db
    .collection("assets_meta")
    .createIndex(
      { tenant_id: 1, site_id: 1, tags: 1 },
      { name: "idx_assets_tags" }
    );

  // custom entities
  await db
    .collection("custom_entities")
    .createIndex(
      { tenant_id: 1, site_id: 1, slug: 1 },
      { unique: true, name: "uq_custom_entities_slug" }
    );

  // snapshots: version per site
  await db
    .collection("snapshots")
    .createIndex(
      { tenant_id: 1, site_id: 1, version: -1 },
      { unique: true, name: "uq_snapshots_site_version" }
    );
  await db
    .collection("snapshots")
    .createIndex(
      { tenant_id: 1, site_id: 1, created_at: -1 },
      { name: "idx_snapshots_created" }
    );

  // audit logs
  await db
    .collection("audit_logs")
    .createIndex(
      { tenant_id: 1, site_id: 1, created_at: -1 },
      { name: "idx_audit_site_created" }
    );
  await db
    .collection("audit_logs")
    .createIndex(
      { tenant_id: 1, action: 1, created_at: -1 },
      { name: "idx_audit_action_created" }
    );
}
