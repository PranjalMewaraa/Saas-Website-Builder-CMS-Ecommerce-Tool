import Hero from "./HeroV1";
import { HeroSchema, HeroDefaults } from "./../../schemas/blocks/hero";

export const HeroBlock = {
  type: "Hero",
  schema: HeroSchema,
  defaults: HeroDefaults,
  // performanceHint: "server",
  render: Hero,
};

// Optional backwards-compat alias (so old pages with Hero still render)
export const HeroV1AliasBlock = {
  type: "Hero",
  schema: HeroSchema,
  defaults: HeroDefaults,
  render: Hero,
};
