import { requireSession, requireModule } from "@acme/auth";
import { listFormSubmissions } from "@acme/db-mongo";

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (s.includes('"') || s.includes(",") || s.includes("\n"))
    return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: Request) {
  const session = await requireSession();
  const tenant_id = session.user.tenant_id;

  const { searchParams } = new URL(req.url);
  const site_id = searchParams.get("site_id") || "";
  const form_id = searchParams.get("form_id") || "";
  const limit = Number(searchParams.get("limit") || 2000);

  await requireModule({ tenant_id, site_id, module: "forms" });

  const subs = await listFormSubmissions({
    tenant_id,
    site_id,
    form_id: form_id || undefined,
    limit,
  });

  // Collect column keys from data payloads
  const keys = new Set<string>();
  for (const s of subs) for (const k of Object.keys(s.data || {})) keys.add(k);

  const columns = ["created_at", "form_id", ...Array.from(keys).sort()];
  const lines: string[] = [];
  lines.push(columns.map(csvEscape).join(","));

  for (const s of subs) {
    const row = [
      new Date(s.created_at).toISOString(),
      s.form_id,
      ...Array.from(keys)
        .sort()
        .map((k) => s.data?.[k] ?? ""),
    ];
    lines.push(row.map(csvEscape).join(","));
  }

  const csv = lines.join("\n");
  const filename = `submissions_${site_id}_${form_id || "all"}_${Date.now()}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
