type RecipeConfig = {
  heroVariant:
    | "editorial_split"
    | "dark_launch"
    | "clean_story"
    | "trust_split"
    | "catalog_dense"
    | "default";
  featureVariant: "cards_3" | "kpi_ribbon" | "comparison";
  ctaVariant: "dark_panel" | "accent_panel" | "minimal";
};

const RECIPE_BY_ARCHETYPE: Record<string, RecipeConfig> = {
  minimalist_muse: {
    heroVariant: "editorial_split",
    featureVariant: "cards_3",
    ctaVariant: "minimal",
  },
  urban_edge: {
    heroVariant: "dark_launch",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
  eco_conscious_collective: {
    heroVariant: "clean_story",
    featureVariant: "cards_3",
    ctaVariant: "minimal",
  },
  classic_tailor: {
    heroVariant: "trust_split",
    featureVariant: "comparison",
    ctaVariant: "dark_panel",
  },
  department_powerhouse: {
    heroVariant: "catalog_dense",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
  sneakerhead_drop: {
    heroVariant: "dark_launch",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
  performance_pro: {
    heroVariant: "trust_split",
    featureVariant: "comparison",
    ctaVariant: "dark_panel",
  },
  italian_cobbler: {
    heroVariant: "editorial_split",
    featureVariant: "cards_3",
    ctaVariant: "minimal",
  },
  silicon_valley: {
    heroVariant: "clean_story",
    featureVariant: "comparison",
    ctaVariant: "minimal",
  },
  gaming_rig: {
    heroVariant: "dark_launch",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
  deep_tech: {
    heroVariant: "trust_split",
    featureVariant: "comparison",
    ctaVariant: "dark_panel",
  },
  fresh_farm: {
    heroVariant: "clean_story",
    featureVariant: "cards_3",
    ctaVariant: "minimal",
  },
  hyper_fast: {
    heroVariant: "catalog_dense",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
  trust_first: {
    heroVariant: "trust_split",
    featureVariant: "kpi_ribbon",
    ctaVariant: "dark_panel",
  },
  split_screen: {
    heroVariant: "trust_split",
    featureVariant: "cards_3",
    ctaVariant: "minimal",
  },
  dark_mode_pro: {
    heroVariant: "dark_launch",
    featureVariant: "kpi_ribbon",
    ctaVariant: "accent_panel",
  },
};

export function resolveRecipeConfig(archetype: string): RecipeConfig {
  return (
    RECIPE_BY_ARCHETYPE[archetype] || {
      heroVariant: "default",
      featureVariant: "cards_3",
      ctaVariant: "dark_panel",
    }
  );
}

