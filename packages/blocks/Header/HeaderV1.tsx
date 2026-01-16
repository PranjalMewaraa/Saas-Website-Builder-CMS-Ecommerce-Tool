import Link from "next/link";
import Image from "next/image";

type MenuNode = {
  id: string;
  label: string;
  ref?: { slug?: string; href?: string };
  children?: MenuNode[];
};

function MenuItem({ node }: { node: MenuNode }) {
  const href = node.ref?.slug || node.ref?.href || "#";

  return (
    <li className="relative group">
      <Link href={href} className="px-2 py-1 block">
        {node.label}
      </Link>

      {node.children?.length ? (
        <ul className="absolute left-0 top-full bg-white border shadow hidden group-hover:block min-w-[180px]">
          {node.children.map((c) => (
            <MenuItem key={c.id} node={c} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export default function HeaderV1({
  menu,
  ctaText,
  ctaHref,
  logoUrl,
  logoAlt,
}: any) {
  const items = menu?.tree || [];

  return (
    <header className="border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={logoAlt || "Logo"}
              width={120}
              height={40}
            />
          ) : (
            <b>Site</b>
          )}
        </Link>

        <ul className="flex gap-4">
          {items.map((n: MenuNode) => (
            <MenuItem key={n.id} node={n} />
          ))}
        </ul>

        {ctaText && ctaHref && (
          <Link
            href={ctaHref}
            className="bg-black text-white px-3 py-2 rounded"
          >
            {ctaText}
          </Link>
        )}
      </div>
    </header>
  );
}
