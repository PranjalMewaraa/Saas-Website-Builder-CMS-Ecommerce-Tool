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
  const token = String(body.token || "");
  const form_id = String(body.form_id || "");
  const data = body.data || {};
  const honeypot = String(body.hp || "");

  if (honeypot) return NextResponse.json({ ok: true });

  const site = await getSiteByHandle(handle);
  if (!site)
    return NextResponse.json(
      { ok: false, error: "Site not found" },
      { status: 404 }
    );

  if (!site.preview_token || token !== site.preview_token) {
    return NextResponse.json(
      { ok: false, error: "Invalid preview token" },
      { status: 401 }
    );
  }

  if (!site.draft_snapshot_id) {
    return NextResponse.json(
      { ok: false, error: "No draft snapshot" },
      { status: 404 }
    );
  }

  const snapshot: any = await getSnapshotById(site.draft_snapshot_id);
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
