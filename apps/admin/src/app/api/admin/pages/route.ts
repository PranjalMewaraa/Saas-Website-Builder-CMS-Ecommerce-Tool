import { NextResponse } from "next/server";
import { requireSession, requireModule } from "@acme/auth";
import { getMongoDb } from "@acme/db-mongo";

function normalizeSlug(input: string) {
  let s = (input || "").trim();
  if (!s) return "/";
  if (!s.startsWith("/")) s = "/" + s;
  // remove trailing slash except root
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  // collapse double slashes
  s = s.replace(/\/{2,}/g, "/");
  return s;
}

function isValidSlug(slug: string) {
  // allow nested paths: /about, /contact/us, /faq
  // no spaces, no query, no hash
  if (!slug.startsWith("/")) return false;
  if (slug.includes(" ") || slug.includes("?") || slug.includes("#"))
    return false;
  return true;
}

function newPageId() {
  return `page_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function seedLayout(template: string) {
  // minimal single-section seed (works with your current editor)
  if (template === "contact") {
    return {
      version: 1,
      sections: [
        {
          id: "sec_main",
          label: "Contact",
          blocks: [
            {
              id: `b_${Date.now()}_h`,
              type: "Hero",
              props: {
                variant: "basic",
                headline: "Contact Us",
                subhead: "We reply quickly.",
                ctaText: "",
                ctaHref: "",
              },
              style: { overrides: {}, responsive: {} },
            },
            {
              id: `b_${Date.now()}_f`,
              type: "Form/V1",
              props: {
                formId: "form_contact",
                title: "Send a message",
                submitText: "Send",
              },
              style: { overrides: {}, responsive: {} },
            },
          ],
        },
      ],
    };
  }

  if (template === "about") {
    return {
      version: 1,
      sections: [
        {
          id: "sec_main",
          label: "About",
          blocks: [
            {
              id: `b_${Date.now()}_h`,
              type: "Hero",
              props: {
                variant: "basic",
                headline: "About Us",
                subhead: "Our story and mission.",
                ctaText: "",
                ctaHref: "",
              },
              style: { overrides: {}, responsive: {} },
            },
          ],
        },
      ],
    };
  }

  if (template === "landing") {
    return {
      version: 1,
      sections: [
        {
          id: "sec_main",
          label: "Landing",
          blocks: [
            {
              id: `b_${Date.now()}_hdr`,
              type: "Header/V1",
              props: {
                menuId: "menu_main",
                ctaText: "Shop",
                ctaHref: "/products",
              },
              style: { overrides: {}, responsive: {} },
            },
            {
              id: `b_${Date.now()}_hero`,
              type: "Hero",
              props: {
                variant: "image",
                headline: "New Collection",
                subhead: "Built with your builder.",
                ctaText: "Browse",
                ctaHref: "/products",
                bg: {
                  type: "image",
                  overlayColor: "#000000",
                  overlayOpacity: 0.45,
                },
              },
              style: { overrides: {}, responsive: {} },
            },
            {
              id: `b_${Date.now()}_grid`,
              type: "ProductGrid/V1",
              props: { title: "Featured", limit: 8 },
              style: { overrides: {}, responsive: {} },
            },
            {
              id: `b_${Date.now()}_ftr`,
              type: "Footer/V1",
              props: { menuId: "menu_footer" },
              style: { overrides: {}, responsive: {} },
            },
          ],
        },
      ],
    };
  }

  // blank (default)
  return {
    version: 1,
    sections: [{ id: "sec_main", label: "Main", blocks: [] }],
  };
}

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const page_id = searchParams.get("page_id") || "";
  const slug = searchParams.get("slug") || "";
  const include_deleted = searchParams.get("include_deleted") === "1";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const db = await getMongoDb();
  const col = db.collection("pages");

  if (page_id) {
    const page = await col.findOne({
      _id: page_id as any,
      tenant_id,
      site_id,
    } as any);
    return NextResponse.json({ ok: true, page });
  }

  if (slug) {
    const s = normalizeSlug(slug);
    const page = await col.findOne({
      tenant_id,
      site_id,
      slug: s,
      ...(include_deleted ? {} : { deleted_at: { $exists: false } }),
    } as any);
    return NextResponse.json({ ok: true, page });
  }

  const pages = await col
    .find({
      tenant_id,
      site_id,
      ...(include_deleted ? {} : { deleted_at: { $exists: false } }),
    } as any)
    .sort({ slug: 1 })
    .toArray();

  return NextResponse.json({ ok: true, pages });
}

export async function POST(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();

  // op: "create" | "duplicate"
  const op = String(body.op || "create");

  const db = await getMongoDb();
  const col = db.collection("pages");

  if (op === "duplicate") {
    const source_page_id = String(body.source_page_id || "");
    const slug = normalizeSlug(String(body.slug || ""));
    const name = String(body.name || "").trim() || `Copy of ${slug}`;

    if (!source_page_id) {
      return NextResponse.json(
        { ok: false, error: "Missing source_page_id" },
        { status: 400 }
      );
    }
    if (!isValidSlug(slug)) {
      return NextResponse.json(
        { ok: false, error: "Invalid slug" },
        { status: 400 }
      );
    }

    const src = await col.findOne({
      _id: source_page_id as any,
      tenant_id,
      site_id,
    } as any);
    if (!src)
      return NextResponse.json(
        { ok: false, error: "Source page not found" },
        { status: 404 }
      );

    const exists = await col.findOne({
      tenant_id,
      site_id,
      slug,
      deleted_at: { $exists: false },
    } as any);
    if (exists)
      return NextResponse.json(
        { ok: false, error: "Slug already exists" },
        { status: 409 }
      );

    const _id = newPageId();
    const now = new Date();

    await col.insertOne({
      _id,
      tenant_id,
      site_id,
      slug,
      name,
      seo: src.seo ?? {},
      draft_layout: src.draft_layout ?? seedLayout("blank"),
      created_at: now,
      updated_at: now,
      created_by: session.user.user_id,
    } as any);

    return NextResponse.json({ ok: true, page_id: _id });
  }

  // default: create
  const slug = normalizeSlug(String(body.slug || "/new-page"));
  const name = String(body.name || "New Page").trim() || "New Page";
  const template = String(body.template || "blank");

  if (!isValidSlug(slug)) {
    return NextResponse.json(
      { ok: false, error: "Invalid slug" },
      { status: 400 }
    );
  }

  const exists = await col.findOne({
    tenant_id,
    site_id,
    slug,
    deleted_at: { $exists: false },
  } as any);
  if (exists)
    return NextResponse.json(
      { ok: false, error: "Slug already exists" },
      { status: 409 }
    );

  const _id = newPageId();
  const now = new Date();

  await col.insertOne({
    _id,
    tenant_id,
    site_id,
    slug,
    name,
    seo: {},
    draft_layout: seedLayout(template),
    created_at: now,
    updated_at: now,
    created_by: session.user.user_id,
  } as any);

  return NextResponse.json({ ok: true, page_id: _id });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  const body = await req.json();
  const page_id = String(body.page_id || "");

  if (!page_id) {
    return NextResponse.json(
      { ok: false, error: "Missing page_id" },
      { status: 400 }
    );
  }

  const db = await getMongoDb();
  const col = db.collection("pages");

  const page = await col.findOne({
    _id: page_id as any,
    tenant_id,
    site_id,
  } as any);
  if (!page)
    return NextResponse.json(
      { ok: false, error: "Page not found" },
      { status: 404 }
    );

  // safe rules
  const nextSlug = body.slug ? normalizeSlug(String(body.slug)) : undefined;
  if (nextSlug && !isValidSlug(nextSlug)) {
    return NextResponse.json(
      { ok: false, error: "Invalid slug" },
      { status: 400 }
    );
  }
  if (page.slug === "/" && nextSlug && nextSlug !== "/") {
    return NextResponse.json(
      { ok: false, error: "Home page slug cannot be changed" },
      { status: 400 }
    );
  }

  if (nextSlug && nextSlug !== page.slug) {
    const exists = await col.findOne({
      tenant_id,
      site_id,
      slug: nextSlug,
      deleted_at: { $exists: false },
    } as any);
    if (exists)
      return NextResponse.json(
        { ok: false, error: "Slug already exists" },
        { status: 409 }
      );
  }

  const patch: any = {
    updated_at: new Date(),
    updated_by: session.user.user_id,
  };

  if (typeof body.name === "string") patch.name = body.name;
  if (typeof nextSlug === "string") patch.slug = nextSlug;
  if (typeof body.seo === "object") patch.seo = body.seo;
  if (typeof body.draft_layout === "object")
    patch.draft_layout = body.draft_layout;

  await col.updateOne(
    { _id: page_id as any, tenant_id, site_id } as any,
    { $set: patch } as any
  );

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const page_id = searchParams.get("page_id") || "";

  await requireModule({ tenant_id, site_id, module: "builder" });

  if (!page_id) {
    return NextResponse.json(
      { ok: false, error: "Missing page_id" },
      { status: 400 }
    );
  }

  const db = await getMongoDb();
  const col = db.collection("pages");

  const page = await col.findOne({
    _id: page_id as any,
    tenant_id,
    site_id,
  } as any);
  if (!page)
    return NextResponse.json(
      { ok: false, error: "Page not found" },
      { status: 404 }
    );

  if (page.slug === "/") {
    return NextResponse.json(
      { ok: false, error: "Cannot delete Home page" },
      { status: 400 }
    );
  }

  await col.updateOne(
    { _id: page_id as any, tenant_id, site_id } as any,
    {
      $set: {
        deleted_at: new Date(),
        deleted_by: session.user.user_id,
        updated_at: new Date(),
      },
    } as any
  );

  return NextResponse.json({ ok: true });
}
