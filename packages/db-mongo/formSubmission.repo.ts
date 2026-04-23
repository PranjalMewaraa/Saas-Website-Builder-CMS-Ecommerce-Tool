import { getMongoDb } from "./index";

export type FormSubmissionDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  form_id: string;
  data: Record<string, any>;
  meta: { ip?: string; user_agent?: string; referer?: string };
  created_at: Date;
};

export async function formSubmissionsCollection() {
  const db = await getMongoDb();
  return db.collection<FormSubmissionDoc>("form_submissions");
}

export async function createFormSubmission(doc: FormSubmissionDoc) {
  const col = await formSubmissionsCollection();
  await col.insertOne(doc as any);
  return doc;
}

export async function listFormSubmissions(args: {
  tenant_id: string;
  site_id: string;
  form_id?: string;
  limit?: number;
}) {
  const col = await formSubmissionsCollection();
  const q: any = { tenant_id: args.tenant_id, site_id: args.site_id };
  if (args.form_id) q.form_id = args.form_id;

  return col
    .find(q)
    .sort({ created_at: -1 })
    .limit(args.limit ?? 100)
    .toArray();
}
