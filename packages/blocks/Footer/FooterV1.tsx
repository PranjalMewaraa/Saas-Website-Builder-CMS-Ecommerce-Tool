import Link from "next/link";

type MenuNode = {
  id: string;
  label: string;
  type?: string;
  ref?: { slug?: string; href?: string };
};

type Menu = {
  tree?: MenuNode[];
};

type Props = {
  menu: Menu | null;
};

export default function FooterV1({ menu }: Props) {
  const items = menu?.tree ?? [];

  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-3">
        <div className="text-sm opacity-75">
          © {new Date().getFullYear()} Store
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.ref?.slug || n.ref?.href || "#"}
              className="text-sm opacity-90 hover:opacity-100"
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
