import React from "react";

import HeaderV1 from "../Header/HeaderV1";
import FooterV1 from "../Footer/FooterV1";
import ProductGridVisualStub from "../ProductGrid/ProductGrid.visual";
import ProductListVisualStub from "../ProductList/ProductList.visual";
import ProductDetailVisualStub from "../ProductDetail/ProductDetail.visual";
import CartPageV1 from "../cart/CartPageV1";
import CartSummaryV1 from "../cart/CartSummaryV1";
import AddToCartV1 from "../cart/AddToCartV1";
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
  ProductListV1Schema,
  ProductDetailV1Schema,
  CartPageV1Schema,
  CartSummaryV1Schema,
  AddToCartV1Schema,
} from "../../schemas/blocks/commerce";
import { Spacer, SpacerDefaults } from "../utility/Spacer";
import { Divider, DividerDefaults } from "../utility/Divider";
import { RichText, RichTextDefaults } from "../utility/RichText";
import LayoutSection from "../layout/Section";
import AtomicText from "../Atomic/Text";
import AtomicImage from "../Atomic/Image";
import AtomicVideo from "../Atomic/Video";
import AtomicButton from "../Atomic/Button";
import AtomicGroup from "../Atomic/Group";
import AtomicIcon from "../Atomic/Icon";
import AtomicDivider from "../Atomic/Divider";
import AtomicSpacer from "../Atomic/Spacer";
import AtomicBadge from "../Atomic/Badge";
import AtomicList from "../Atomic/List";
import AtomicCard from "../Atomic/Card";
import AtomicAccordion from "../Atomic/Accordion";
import AtomicMenu from "../Atomic/Menu";
import AtomicCountdown from "../Atomic/Countdown";
import AtomicEmbed from "../Atomic/Embed";

import {
  SpacerSchema,
  RichTextSchema,
  DividerSchema,
} from "../../schemas/blocks/utility";
import {
  LayoutSectionPropsSchema,
  LayoutGroupPropsSchema,
  AtomicTextSchema,
  AtomicImageSchema,
  AtomicVideoSchema,
  AtomicButtonSchema,
  AtomicIconSchema,
  AtomicDividerSchema,
  AtomicSpacerSchema,
  AtomicBadgeSchema,
  AtomicListSchema,
  AtomicCardSchema,
  AtomicAccordionSchema,
  AtomicMenuSchema,
  AtomicCountdownSchema,
  AtomicEmbedSchema,
} from "../../schemas";
import BannerCTAV1 from "../marketing/BannerCTA";
import FeaturesGridV1 from "../marketing/FeaturesGrid";
import TestimonialsV1 from "../marketing/Testimonials";
import ProductHighlightV1 from "../commerce/ProductHighlight";
import PricingTableV1 from "../commerce/PricingTable";
import LogosCloudV1 from "../marketing/LogosCloud";
import NewsletterSignupV1 from "../marketing/Newsletter";
import StatsCounterV1 from "../marketing/StatsCounter";

export const VISUAL_BLOCKS: Record<
  string,
  { type: string; schema: any; render: any; defaults?: any }
> = {
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
    render: ProductGridVisualStub,
  },
  "ProductList/V1": {
    type: "ProductList/V1",
    schema: ProductListV1Schema,
    render: ProductListVisualStub,
  },
  "ProductDetail/V1": {
    type: "ProductDetail/V1",
    schema: ProductDetailV1Schema,
    render: ProductDetailVisualStub,
  },
  "CartPage/V1": {
    type: "CartPage/V1",
    schema: CartPageV1Schema,
    render: (props: any) => React.createElement(CartPageV1 as any, { ...props, __editor: true }),
  },
  "CartSummary/V1": {
    type: "CartSummary/V1",
    schema: CartSummaryV1Schema,
    render: (props: any) => React.createElement(CartSummaryV1 as any, { ...props, __editor: true }),
  },
  "AddToCart/V1": {
    type: "AddToCart/V1",
    schema: AddToCartV1Schema,
    render: (props: any) => React.createElement(AddToCartV1 as any, { ...props, __editor: true }),
  },
  "Form/V1": {
    type: "Form/V1",
    schema: FormV1Schema,
    render: FormV1,
  },
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
  "Layout/Section": {
    type: "Layout/Section",
    schema: LayoutSectionPropsSchema,
    render: LayoutSection,
  },
  "Atomic/Text": {
    type: "Atomic/Text",
    schema: AtomicTextSchema,
    render: AtomicText,
  },
  "Atomic/Image": {
    type: "Atomic/Image",
    schema: AtomicImageSchema,
    render: AtomicImage,
  },
  "Atomic/Video": {
    type: "Atomic/Video",
    schema: AtomicVideoSchema,
    render: AtomicVideo,
  },
  "Atomic/Button": {
    type: "Atomic/Button",
    schema: AtomicButtonSchema,
    render: AtomicButton,
  },
  "Atomic/Icon": {
    type: "Atomic/Icon",
    schema: AtomicIconSchema,
    render: AtomicIcon,
  },
  "Atomic/Divider": {
    type: "Atomic/Divider",
    schema: AtomicDividerSchema,
    render: AtomicDivider,
  },
  "Atomic/Spacer": {
    type: "Atomic/Spacer",
    schema: AtomicSpacerSchema,
    render: AtomicSpacer,
  },
  "Atomic/Badge": {
    type: "Atomic/Badge",
    schema: AtomicBadgeSchema,
    render: AtomicBadge,
  },
  "Atomic/List": {
    type: "Atomic/List",
    schema: AtomicListSchema,
    render: AtomicList,
  },
  "Atomic/Card": {
    type: "Atomic/Card",
    schema: AtomicCardSchema,
    render: AtomicCard,
  },
  "Atomic/Accordion": {
    type: "Atomic/Accordion",
    schema: AtomicAccordionSchema,
    render: AtomicAccordion,
  },
  "Atomic/Menu": {
    type: "Atomic/Menu",
    schema: AtomicMenuSchema,
    render: AtomicMenu,
  },
  "Atomic/Countdown": {
    type: "Atomic/Countdown",
    schema: AtomicCountdownSchema,
    render: AtomicCountdown,
  },
  "Atomic/Embed": {
    type: "Atomic/Embed",
    schema: AtomicEmbedSchema,
    render: AtomicEmbed,
  },
  "Atomic/Group": {
    type: "Atomic/Group",
    schema: LayoutGroupPropsSchema,
    render: AtomicGroup,
  },
};

export function getBlockVisual(type: string) {
  return VISUAL_BLOCKS[type];
}
