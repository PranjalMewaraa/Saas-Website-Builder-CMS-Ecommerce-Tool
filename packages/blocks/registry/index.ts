import HeaderV1 from "../Header/HeaderV1";
import HeroV1 from "../Hero/HeroV1";
import FooterV1 from "../Footer/FooterV1";
import ProductGridV1 from "../ProductGrid/ProductGridV1";

import {
  HeaderV1Schema,
  HeroV1Schema,
  FooterV1Schema,
  ProductGridV1Schema,
} from "../../schemas";

export const BLOCKS: Record<
  string,
  { type: string; schema: any; render: any }
> = {
  "Header/V1": { type: "Header/V1", schema: HeaderV1Schema, render: HeaderV1 },
  "Hero/V1": { type: "Hero/V1", schema: HeroV1Schema, render: HeroV1 },
  "Footer/V1": { type: "Footer/V1", schema: FooterV1Schema, render: FooterV1 },
  "ProductGrid/V1": {
    type: "ProductGrid/V1",
    schema: ProductGridV1Schema,
    render: ProductGridV1,
  },
};

export function getBlock(type: string) {
  return BLOCKS[type];
}
