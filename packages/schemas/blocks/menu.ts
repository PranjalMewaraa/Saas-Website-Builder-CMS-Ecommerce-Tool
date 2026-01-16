export type MenuNode = {
  id: string;
  label: string;
  type: "page" | "external";
  ref: {
    slug?: string;
    href?: string;
  };
  children?: MenuNode[];
};

export type Menu = {
  _id: string;
  site_id: string;
  draft_tree: MenuNode[];
  published_tree?: MenuNode[];
};
