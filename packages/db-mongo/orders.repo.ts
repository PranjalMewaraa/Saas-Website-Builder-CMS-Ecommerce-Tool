import { getMongoDb } from "./index";

export type OrderDoc = {
  _id?: string;
  tenant_id: string;
  site_id: string;
  store_id?: string;
  order_number: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  items: any[];
  subtotal_cents: number;
  total_cents: number;
  currency: string;
  customer?: any;
  shipping_address?: any;
  created_at: Date;
  updated_at: Date;
};

export async function ordersCollection() {
  const db = await getMongoDb();
  return db.collection<OrderDoc>("orders");
}

export async function listOrders(tenant_id: string, site_id: string, status?: string) {
  const col = await ordersCollection();
  const query: any = { tenant_id, site_id };
  if (status) query.status = status;
  return col.find(query).sort({ created_at: -1 }).toArray();
}

export async function getOrderById(tenant_id: string, site_id: string, id: string) {
  const col = await ordersCollection();
  return col.findOne({ _id: id, tenant_id, site_id } as any);
}

export async function updateOrderStatus(
  tenant_id: string,
  site_id: string,
  id: string,
  status: OrderDoc["status"],
) {
  const col = await ordersCollection();
  await col.updateOne(
    { _id: id, tenant_id, site_id } as any,
    { $set: { status, updated_at: new Date() } },
  );
}
