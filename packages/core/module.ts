export type ModuleKey =
  | "catalog"
  | "builder"
  | "themes"
  | "menus"
  | "forms"
  | "assets"
  | "custom_entities"
  | "checkout"
  | "promotions";

export type ModuleDef = {
  key: ModuleKey;
  label: string;
  dependencies: ModuleKey[];
  conflicts: ModuleKey[];
  defaultEnabled: boolean;
};

export const MODULE_REGISTRY: Record<ModuleKey, ModuleDef> = {
  catalog: {
    key: "catalog",
    label: "Catalog",
    dependencies: [],
    conflicts: [],
    defaultEnabled: true,
  },
  builder: {
    key: "builder",
    label: "Page Builder",
    dependencies: [],
    conflicts: [],
    defaultEnabled: true,
  },
  themes: {
    key: "themes",
    label: "Themes",
    dependencies: ["builder"],
    conflicts: [],
    defaultEnabled: true,
  },
  menus: {
    key: "menus",
    label: "Menus",
    dependencies: ["builder"],
    conflicts: [],
    defaultEnabled: true,
  },
  forms: {
    key: "forms",
    label: "Forms",
    dependencies: ["builder"],
    conflicts: [],
    defaultEnabled: true,
  },
  assets: {
    key: "assets",
    label: "Assets",
    dependencies: ["builder"],
    conflicts: [],
    defaultEnabled: true,
  },
  custom_entities: {
    key: "custom_entities",
    label: "Custom Entities",
    dependencies: ["builder"],
    conflicts: [],
    defaultEnabled: true,
  },
  checkout: {
    key: "checkout",
    label: "Checkout",
    dependencies: ["catalog"],
    conflicts: [],
    defaultEnabled: false,
  },
  promotions: {
    key: "promotions",
    label: "Promotions",
    dependencies: ["checkout", "catalog"],
    conflicts: [],
    defaultEnabled: false,
  },
};
