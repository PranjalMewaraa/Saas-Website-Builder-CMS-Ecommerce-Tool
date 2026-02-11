export type StorePresetKey =
  | "fashion"
  | "electronics"
  | "grocery"
  | "beauty_cosmetics"
  | "home_furniture"
  | "sports_fitness"
  | "automotive"
  | "books_stationery"
  | "jewelry"
  | "toys"
  | "pet_supplies"
  | "digital_products"
  | "handmade_crafts"
  | "pharmacy"
  | "hardware_tools";

export type StorePresetCategory = {
  name: string;
  slug?: string;
  attributes: Array<{
    code: string;
    name: string;
    type:
      | "text"
      | "textarea"
      | "select"
      | "multi_select"
      | "number"
      | "boolean"
      | "color"
      | "date";
    required?: boolean;
    filterable?: boolean;
    options?: string[];
  }>;
};

export type StorePreset = {
  key: StorePresetKey;
  label: string;
  categories: StorePresetCategory[];
  filters: string[];
};

function c(
  name: string,
  attributes: StorePresetCategory["attributes"],
): StorePresetCategory {
  return { name, attributes };
}

export const STORE_TYPE_PRESETS: StorePreset[] = [
  {
    key: "fashion",
    label: "Fashion",
    categories: [
      c("T-Shirts", [
        {
          code: "size",
          name: "Size",
          type: "select",
          required: true,
          options: ["S", "M", "L", "XL"],
        },
        { code: "fabric", name: "Fabric", type: "text", required: true },
        { code: "color", name: "Color", type: "color", required: true },
        { code: "fit", name: "Fit", type: "select", options: ["Slim", "Regular", "Oversized"] },
      ]),
      c("Jeans", [
        { code: "waist", name: "Waist", type: "number", required: true },
        { code: "length", name: "Length", type: "number", required: true },
        { code: "fit", name: "Fit", type: "select", options: ["Skinny", "Straight", "Relaxed"] },
      ]),
    ],
    filters: ["size", "color", "price", "fit", "fabric"],
  },
  {
    key: "electronics",
    label: "Electronics",
    categories: [
      c("Laptops", [
        { code: "ram", name: "RAM", type: "select", required: true, options: ["8GB", "16GB", "32GB"] },
        { code: "storage", name: "Storage", type: "select", required: true, options: ["256GB", "512GB", "1TB"] },
        { code: "processor", name: "Processor", type: "text", required: true },
      ]),
      c("Mobiles", [
        { code: "display", name: "Display", type: "text", required: true },
        { code: "battery", name: "Battery", type: "text", required: true },
        { code: "camera", name: "Camera", type: "text" },
      ]),
    ],
    filters: ["brand", "ram", "storage", "price"],
  },
  {
    key: "grocery",
    label: "Grocery",
    categories: [c("Packaged Food", [{ code: "weight", name: "Weight", type: "text", required: true }])],
    filters: ["brand", "price", "weight"],
  },
  {
    key: "beauty_cosmetics",
    label: "Beauty & Cosmetics",
    categories: [c("Skincare", [{ code: "skin_type", name: "Skin Type", type: "select", options: ["Dry", "Oily", "Combination"] }])],
    filters: ["brand", "skin_type", "price"],
  },
  {
    key: "home_furniture",
    label: "Home & Furniture",
    categories: [c("Sofas", [{ code: "material", name: "Material", type: "text" }, { code: "dimensions", name: "Dimensions", type: "text", required: true }])],
    filters: ["material", "price"],
  },
  {
    key: "sports_fitness",
    label: "Sports & Fitness",
    categories: [c("Equipment", [{ code: "weight", name: "Weight", type: "number" }, { code: "usage", name: "Usage", type: "text" }])],
    filters: ["brand", "price", "weight"],
  },
  {
    key: "automotive",
    label: "Automotive",
    categories: [c("Accessories", [{ code: "vehicle_type", name: "Vehicle Type", type: "text", required: true }])],
    filters: ["vehicle_type", "price"],
  },
  {
    key: "books_stationery",
    label: "Books & Stationery",
    categories: [c("Books", [{ code: "author", name: "Author", type: "text", required: true }, { code: "language", name: "Language", type: "text" }])],
    filters: ["author", "language", "price"],
  },
  {
    key: "jewelry",
    label: "Jewelry",
    categories: [c("Rings", [{ code: "metal", name: "Metal", type: "select", options: ["Gold", "Silver", "Platinum"] }, { code: "size", name: "Size", type: "text" }])],
    filters: ["metal", "price"],
  },
  {
    key: "toys",
    label: "Toys",
    categories: [c("Educational Toys", [{ code: "age_group", name: "Age Group", type: "text", required: true }])],
    filters: ["age_group", "price"],
  },
  {
    key: "pet_supplies",
    label: "Pet Supplies",
    categories: [c("Pet Food", [{ code: "pet_type", name: "Pet Type", type: "select", options: ["Dog", "Cat", "Bird", "Fish"] }])],
    filters: ["pet_type", "price"],
  },
  {
    key: "digital_products",
    label: "Digital Products",
    categories: [c("Software", [{ code: "license_type", name: "License Type", type: "text" }, { code: "download_size", name: "Download Size", type: "text" }])],
    filters: ["license_type", "price"],
  },
  {
    key: "handmade_crafts",
    label: "Handmade & Crafts",
    categories: [c("Decor", [{ code: "handmade_by", name: "Handmade By", type: "text" }, { code: "material", name: "Material", type: "text" }])],
    filters: ["material", "price"],
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    categories: [c("OTC", [{ code: "dosage", name: "Dosage", type: "text" }, { code: "expiry_date", name: "Expiry Date", type: "date" }])],
    filters: ["price", "dosage"],
  },
  {
    key: "hardware_tools",
    label: "Hardware & Tools",
    categories: [c("Power Tools", [{ code: "power", name: "Power", type: "text" }, { code: "warranty", name: "Warranty", type: "text" }])],
    filters: ["power", "price", "brand"],
  },
];

export function getStorePreset(key?: string | null) {
  return STORE_TYPE_PRESETS.find((p) => p.key === key) || null;
}
