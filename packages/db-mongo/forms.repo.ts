import { getMongoDb } from "./index";
import type { FormSchema } from "../schemas";

export type FormDoc = {
  _id: string;
  tenant_id: string;
  site_id: string;
  name: string;
  draft_schema: FormSchema;
  created_at: Date;
  updated_at: Date;
};

export async function formsCollection() {
  const db = await getMongoDb();
  return db.collection<FormDoc>("forms");
}

export async function listForms(tenant_id: string, site_id: string) {
  const col = await formsCollection();
  return col.find({ tenant_id, site_id }).sort({ created_at: -1 }).toArray();
}

export async function getForm(
  tenant_id: string,
  site_id: string,
  form_id: string
) {
  const col = await formsCollection();
  return col.findOne({ _id: form_id, tenant_id, site_id });
}

export async function upsertFormDraft(args: {
  tenant_id: string;
  site_id: string;
  form_id: string;
  name: string;
  draft_schema: any;
}) {
  const col = await formsCollection();
  await col.updateOne(
    { _id: args.form_id, tenant_id: args.tenant_id, site_id: args.site_id },
    {
      $set: {
        name: args.name,
        draft_schema: args.draft_schema,
        updated_at: new Date(),
      },
      $setOnInsert: { created_at: new Date() },
    },
    { upsert: true }
  );
}
