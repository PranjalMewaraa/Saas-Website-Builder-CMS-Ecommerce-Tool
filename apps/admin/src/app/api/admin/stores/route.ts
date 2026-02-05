import { requireSession } from "@acme/auth";
import { listStores, updateStoreStatus, deleteStore } from "@acme/db-mysql";

export async function GET() {
  const session = await requireSession();
  const stores = await listStores(session.user.tenant_id);

  return Response.json({ stores });
}

export async function PUT(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const body = await req.json();
  const store_id = String(body.store_id || "");
  const status =
    body.status === "active"
      ? "active"
      : body.status === "archived"
        ? "archived"
        : "suspended";

  if (!store_id) {
    return Response.json({ ok: false, error: "Missing store_id" }, { status: 400 });
  }

  await updateStoreStatus(tenant_id, store_id, status);
  return Response.json({ ok: true });
}

export async function DELETE(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;
  const { searchParams } = new URL(req.url);
  const store_id = searchParams.get("store_id") || "";

  if (!store_id) {
    return Response.json({ ok: false, error: "Missing store_id" }, { status: 400 });
  }

  await deleteStore(tenant_id, store_id);
  return Response.json({ ok: true });
}
