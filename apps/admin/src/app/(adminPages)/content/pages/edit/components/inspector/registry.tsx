"use client";
import type { ComponentType } from "react";
import type { BlockEditorProps } from "./types";
import {
  ProductListV1,
  ProductDetailV1,
  CartPageV1,
  CartSummaryV1,
  AddToCartV1,
  ProductGridV1,
} from "./editors/commerce";
import {
  HeaderV1,
  LayoutSection,
  FormV1,
  FooterV1,
  HeroV1,
  UtilitySpacer,
  UtilityDivider,
  UtilityRichText,
} from "./editors/structure";

/**
 * Per-block editor registry. As block branches are extracted out of the
 * BlocksPropForm monolith they get registered here; BlockPropsForm performs a
 * single lookup before falling through to its remaining inline branches.
 */
export const BLOCK_EDITORS: Record<string, ComponentType<BlockEditorProps>> = {
  "ProductList/V1": ProductListV1,
  "ProductDetail/V1": ProductDetailV1,
  "CartPage/V1": CartPageV1,
  "CartSummary/V1": CartSummaryV1,
  "AddToCart/V1": AddToCartV1,
  "ProductGrid/V1": ProductGridV1,
  "Header/V1": HeaderV1,
  "Layout/Section": LayoutSection,
  "Form/V1": FormV1,
  "Footer/V1": FooterV1,
  Hero: HeroV1,
  "Hero/V1": HeroV1,
  "Utility/Spacer": UtilitySpacer,
  "Utility/Divider": UtilityDivider,
  "Utility/RichText": UtilityRichText,
};
