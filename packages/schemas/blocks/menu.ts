export type MenuNode = {
  id: string;
  label: string;
  type: "page" | "external";
  ref: {
    slug?: string;
    href?: string;
  };
  mega?: {
    enabled?: boolean;
    columns?: number;
    sections?: Array<{
      title?: string;
      links?: Array<{
        label?: string;
        type?: "page" | "external";
        ref?: { slug?: string; href?: string };
        href?: string;
        badge?: string;
      }>;
    }>;
    promo?: {
      title?: string;
      description?: string;
      ctaText?: string;
      ctaHref?: string;
    };
  };
  children?: MenuNode[];
};

export type Menu = {
  _id: string;
  site_id: string;
  draft_tree: MenuNode[];
  published_tree?: MenuNode[];
};
