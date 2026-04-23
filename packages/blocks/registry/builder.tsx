import HeaderV1 from "../Header/HeaderV1";
import HeroV1 from "../Hero/HeroV1";
import FooterV1 from "../Footer/FooterV1";
import FormV1 from "../Form/FormV1";
import {
  FooterV1Schema,
  FormV1Schema,
  HeaderV1Schema,
  HeroSchema,
  ProductGridV1Schema,
} from "../../schemas";

// Schemas
// keep schema, but no mysql

// Builder-safe placeholder (no mysql)
function ProductGridPlaceholder(props: any) {
  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 py-8 border rounded-xl">
        <div className="text-sm font-semibold">Product Grid Preview</div>
        <div className="text-sm opacity-70 mt-2">
          Builder preview uses a placeholder to avoid MySQL in the browser.
        </div>
        <div className="text-xs opacity-60 mt-2">
          title: {props.title || "(none)"} · limit: {props.limit ?? "(none)"}
        </div>
      </div>
    </section>
  );
}

type BlockDef = { type: string; schema: any; render: any };

const BLOCKS: Record<string, BlockDef> = {
  "Header/V1": { type: "Header/V1", schema: HeaderV1Schema, render: HeaderV1 },
  Hero: { type: "Hero", schema: HeroSchema, render: HeroV1 },
  "Footer/V1": { type: "Footer/V1", schema: FooterV1Schema, render: FooterV1 },
  "Form/V1": { type: "Form/V1", schema: FormV1Schema, render: FormV1 },

  // ✅ placeholder
  "ProductGrid/V1": {
    type: "ProductGrid/V1",
    schema: ProductGridV1Schema,
    render: ProductGridPlaceholder,
  },
};

export function getBlockBuilder(type: string) {
  return BLOCKS[type] || null;
}
