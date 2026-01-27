import React from "react";

import HeaderV1 from "../Header/HeaderV1";
import FooterV1 from "../Footer/FooterV1";
import ProductGridV1 from "../ProductGrid/ProductGridV1";
import ProductGridVisualStub from "../ProductGrid/ProductGrid.visual";
import FormV1 from "../Form/FormV1";
import Hero from "../Hero/HeroV1";
import {
  BannerCTAV1Schema,
  TestimonialsV1Schema,
  FeaturesGridV1Schema,
  StatsCounterV1Schema,
  LogosCloudV1Schema,
  NewsletterSignupV1Schema,
} from "../../schemas/blocks/marketing";
import {
  HeaderV1Schema,
  FooterV1Schema,
  ProductGridV1Schema,
  FormV1Schema,
  HeroSchema,
} from "../../schemas";

import {
  PricingTableV1Schema,
  ProductHighlightV1Schema,
} from "../../schemas/blocks/commerce";
import { Spacer, SpacerDefaults } from "../utility/Spacer";
import { Divider, DividerDefaults } from "../utility/Divider";
import { RichText, RichTextDefaults } from "../utility/RichText";

import {
  SpacerSchema,
  RichTextSchema,
  DividerSchema,
} from "../../schemas/blocks/utility";
import BannerCTAV1 from "../marketing/BannerCTA";
import FeaturesGridV1 from "../marketing/FeaturesGrid";
import TestimonialsV1 from "../marketing/Testimonials";
import ProductHighlightV1 from "../commerce/ProductHighlight";
import PricingTableV1 from "../commerce/PricingTable";
import LogosCloudV1 from "../marketing/LogosCloud";
import NewsletterSignupV1 from "../marketing/Newsletter";
import StatsCounterV1 from "../marketing/StatsCounter";

export const BLOCKS: Record<
  string,
  { type: string; schema: any; render: any; defaults?: any }
> = {
  // ------------------------
  // Layout / Core
  // ------------------------

  "Header/V1": {
    type: "Header/V1",
    schema: HeaderV1Schema,
    render: HeaderV1,
  },

  Hero: {
    type: "Hero",
    schema: HeroSchema,
    render: Hero,
  },

  "Hero/V1": {
    type: "Hero/V1",
    schema: HeroSchema,
    render: Hero,
  },

  "Footer/V1": {
    type: "Footer/V1",
    schema: FooterV1Schema,
    render: FooterV1,
  },

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

  // ------------------------
  // Utility Blocks (Phase 0)
  // ------------------------

  "Utility/Spacer": {
    type: "Utility/Spacer",
    schema: SpacerSchema,
    render: Spacer,
    defaults: SpacerDefaults,
  },

  "Utility/Divider": {
    type: "Utility/Divider",
    schema: DividerSchema,
    render: Divider,
    defaults: DividerDefaults,
  },

  "Utility/RichText": {
    type: "Utility/RichText",
    schema: RichTextSchema,
    render: RichText,
    defaults: RichTextDefaults,
  },
  "BannerCTA/V1": {
    type: "BannerCTA/V1",
    schema: BannerCTAV1Schema,
    render: BannerCTAV1,
  },

  "FeaturesGrid/V1": {
    type: "FeaturesGrid/V1",
    schema: FeaturesGridV1Schema,
    render: FeaturesGridV1,
  },

  "Testimonials/V1": {
    type: "Testimonials/V1",
    schema: TestimonialsV1Schema,
    render: TestimonialsV1,
  },
  "ProductHighlight/V1": {
    type: "ProductHighlight/V1",
    schema: ProductHighlightV1Schema,
    render: ProductHighlightV1,
  },

  "PricingTable/V1": {
    type: "PricingTable/V1",
    schema: PricingTableV1Schema,
    render: PricingTableV1,
  },

  "StatsCounter/V1": {
    type: "StatsCounter/V1",
    schema: StatsCounterV1Schema,
    render: StatsCounterV1,
  },

  "LogosCloud/V1": {
    type: "LogosCloud/V1",
    schema: LogosCloudV1Schema,
    render: LogosCloudV1,
  },

  "NewsletterSignup/V1": {
    type: "NewsletterSignup/V1",
    schema: NewsletterSignupV1Schema,
    render: NewsletterSignupV1,
  },
};

export function getBlock(type: string) {
  return BLOCKS[type];
}
