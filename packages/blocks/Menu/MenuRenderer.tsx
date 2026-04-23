type MenuNode = {
  id: string;
  label: string;
  type: "page" | "external";
  ref: { slug?: string; href?: string };
  children: MenuNode[];
};

function renderNode(node: MenuNode) {
  const href = node.type === "external" ? node.ref.href : node.ref.slug || "#";

  return (
    <li key={node.id}>
      <a href={href}>{node.label}</a>
      {node.children?.length > 0 && <ul>{node.children.map(renderNode)}</ul>}
    </li>
  );
}

export default function MenuRenderer({ menu }: { menu: MenuNode[] }) {
  if (!menu?.length) return null;
  return <ul>{menu.map(renderNode)}</ul>;
}
