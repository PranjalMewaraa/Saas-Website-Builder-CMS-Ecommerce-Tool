import HeaderV1 from "../Header/HeaderV1";
import FooterV1 from "../Footer/FooterV1";
import ProductGridV1 from "../ProductGrid/ProductGridV1";
import ProductGridVisualStub from "../ProductGrid/ProductGrid.visual";
import FormV1 from "../Form/FormV1";
import Hero from "../Hero/HeroV1";

import {
  HeaderV1Schema,
  FooterV1Schema,
  ProductGridV1Schema,
  FormV1Schema,
  HeroSchema,
} from "../../schemas";
import React from "react";

export const BLOCKS: Record<
  string,
  { type: string; schema: any; render: any }
> = {
  "Header/V1": { type: "Header/V1", schema: HeaderV1Schema, render: HeaderV1 },

  Hero: { type: "Hero", schema: HeroSchema, render: Hero },
  "Hero/V1": { type: "Hero/V1", schema: HeroSchema, render: Hero },

  "Footer/V1": { type: "Footer/V1", schema: FooterV1Schema, render: FooterV1 },

  "ProductGrid/V1": {
    type: "ProductGrid/V1",
    schema: ProductGridV1Schema,
    render: (props: any) => {
      if (props.__editor) {
        return React.createElement(ProductGridVisualStub, props);
      }
      return React.createElement(ProductGridV1 as any, props);
    },
  },

  "Form/V1": {
    type: "Form/V1",
    schema: FormV1Schema,
    render: FormV1,
  },
};

export function getBlock(type: string) {
  return BLOCKS[type];
}
