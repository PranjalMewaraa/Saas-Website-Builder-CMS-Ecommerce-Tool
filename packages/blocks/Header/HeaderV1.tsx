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
  ctaText?: string;
  ctaHref?: string;

  logoUrl?: string;
  logoAlt?: string;
};

export default function HeaderV1({
  menu,
  ctaText,
  ctaHref,
  logoUrl,
  logoAlt,
}: Props) {
  const items = menu?.tree ?? [];
  console.log("Header menu items:", menu);
  return (
    <header>
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-4">
        {logoUrl ? (
          <Link href="/" className="flex items-center gap-2">
            <Image
              src={logoUrl}
              alt={logoAlt || "Logo"}
              width={140}
              height={40}
              className="h-8 w-auto"
              priority
            />
          </Link>
        ) : (
          <Link href="/" className="font-semibold">
            Store
          </Link>
        )}

        <nav className="flex items-center gap-4 overflow-x-auto">
          {items.map((n) => (
            <Link
              key={n.id}
              href={n.ref?.slug || n.ref?.href || "#"}
              className="text-sm whitespace-nowrap opacity-90 hover:opacity-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {ctaText && ctaHref ? (
          <Link
            href={ctaHref}
            className="px-3 py-2 rounded bg-black text-white text-sm"
          >
            {ctaText}
          </Link>
        ) : (
          <div className="w-[1px]" />
        )}
      </div>
    </header>
  );
}
