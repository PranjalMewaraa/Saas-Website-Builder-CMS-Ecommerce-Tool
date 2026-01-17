import Link from "next/link";
import Image from "next/image";

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
  logoUrl?: string;
  logoAlt?: string;
};

export default function FooterV1({ menu, logoUrl, logoAlt }: Props) {
  const items = menu?.tree ?? [];
  console.log("Footer items:", menu);
  return (
    <footer>
      <div className="mx-auto max-w-6xl px-4 py-8 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          {logoUrl ? (
            <Link href="/" className="flex items-center">
              <Image
                src={logoUrl}
                alt={logoAlt || "Logo"}
                width={160}
                height={48}
                className="h-8 w-auto"
              />
            </Link>
          ) : (
            <div className="text-sm opacity-75">
              © {new Date().getFullYear()} Store
            </div>
          )}

          <div className="text-sm opacity-75">
            © {new Date().getFullYear()} Store
          </div>
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
