import { pool } from "./index";

export async function setProductAttributeValue(args: {
  tenant_id: string;
  product_id: string;
  attribute_id: string;
  value_text?: string;
  value_number?: number;
  value_bool?: boolean;
  option_id?: string;
}) {
  await pool.query(
    `
    INSERT INTO product_attribute_values
    (tenant_id, product_id, attribute_id, value_text, value_number, value_bool, option_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      value_text=VALUES(value_text),
      value_number=VALUES(value_number),
      value_bool=VALUES(value_bool),
      option_id=VALUES(option_id)
    `,
    [
      args.tenant_id,
      args.product_id,
      args.attribute_id,
      args.value_text ?? null,
      args.value_number ?? null,
      args.value_bool ?? null,
      args.option_id ?? null,
    ],
  );
}
