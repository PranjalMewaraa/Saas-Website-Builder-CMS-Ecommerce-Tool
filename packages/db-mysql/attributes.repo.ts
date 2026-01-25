import { pool } from "./index";
import { newId, nowSql } from "./id";

export type ProductAttributeRow = {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  type: string;
  is_filterable: number;
  is_variant: number;
  is_required: number;
  created_at: string;
};

export async function createAttribute(
  tenant_id: string,
  input: {
    code: string;
    name: string;
    type: string;
    is_filterable?: boolean;
    is_variant?: boolean;
    is_required?: boolean;
    options?: string[];
  },
) {
  const id = newId("attr");
  const ts = nowSql();
  const final_id = id.slice(0, 20);
  await pool.query(
    `INSERT INTO product_attributes 
     (id, tenant_id, code, name, type, is_filterable, is_variant, is_required, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      final_id,
      tenant_id,
      input.code,
      input.name,
      input.type,
      input.is_filterable ? 1 : 0,
      input.is_variant ? 1 : 0,
      input.is_required ? 1 : 0,
      ts,
    ],
  );

  if (input.options?.length) {
    for (const val of input.options) {
      await pool.query(
        `INSERT INTO product_attribute_options (id, attribute_id, value) VALUES (?, ?, ?)`,
        [newId("opt").slice(0, 20), final_id, val],
      );
    }
  }

  return final_id;
}

export async function listAttributes(tenant_id: string) {
  const [rows] = await pool.query(
    `SELECT * FROM product_attributes WHERE tenant_id = ? ORDER BY created_at ASC`,
    [tenant_id],
  );
  return rows as ProductAttributeRow[];
}
