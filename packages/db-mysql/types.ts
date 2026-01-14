export type StoreType = "brand" | "distributor";

export type StoreRow = {
  id: string;
  tenant_id: string;
  name: string;
  store_type: StoreType;
  currency: string;
  timezone: string;
  status: "active" | "suspended";
  created_at: string;
  updated_at: string;
};

export type BrandRow = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProductRow = {
  id: string;
  tenant_id: string;
  brand_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  base_price_cents: number;
  compare_at_price_cents: number | null;
  sku: string | null;
  custom_data: any | null;
  created_at: string;
  updated_at: string;
};

export type ProductVariantRow = {
  id: string;
  tenant_id: string;
  product_id: string;
  sku: string | null;
  price_cents: number;
  compare_at_price_cents: number | null;
  options_json: any | null;
  inventory_qty: number;
  created_at: string;
  updated_at: string;
};
