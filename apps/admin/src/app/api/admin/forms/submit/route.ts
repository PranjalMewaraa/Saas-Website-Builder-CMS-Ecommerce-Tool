import { NextResponse } from "next/server";
import { headers } from "next/headers";
import {
  getSiteByHandle,
  getSnapshotById,
  createFormSubmission,
} from "@acme/db-mongo";
import { validateAgainstSnapshotForm } from "../../../../../../../storefront/src/lib/forms-validate";

function newId() {
  return `sub_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getClientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
}

export async function POST(req: Request) {
  const h = await headers();
  const body = await req.json();

  const handle = String(body.handle || "");
  const form_id = String(body.form_id || "");
  const data = body.data || {};
  const honeypot = String(body.hp || "");

  if (honeypot) return NextResponse.json({ ok: true }); // pretend success

  if (!handle || !form_id)
    return NextResponse.json(
      { ok: false, error: "Missing handle/form_id" },
      { status: 400 }
    );

  const site = await getSiteByHandle(handle);
  if (!site?.published_snapshot_id)
    return NextResponse.json(
      { ok: false, error: "Site not published" },
      { status: 404 }
    );

  const snapshot: any = await getSnapshotById(site.published_snapshot_id);
  const result = validateAgainstSnapshotForm(snapshot, form_id, data);

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error, errors: (result as any).errors },
      { status: result.status }
    );
  }

  await createFormSubmission({
    _id: newId(),
    tenant_id: site.tenant_id,
    site_id: site._id,
    form_id,
    data,
    meta: {
      ip: getClientIp(h),
      user_agent: h.get("user-agent") || undefined,
      referer: h.get("referer") || undefined,
    },
    created_at: new Date(),
  });

  return NextResponse.json({ ok: true, message: result.message });
}
