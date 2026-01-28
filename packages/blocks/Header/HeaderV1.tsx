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
  contentWidth: string;
  logoUrl?: string;
  logoAlt?: string;
};

export default function HeaderV1({
  menu,
  ctaText,
  ctaHref,
  logoUrl,
  logoAlt,
  contentWidth,
}: Props) {
  const items = menu?.tree ?? [];

  const maxWidth =
    contentWidth === "sm"
      ? "640px"
      : contentWidth === "md"
        ? "768px"
        : contentWidth === "lg"
          ? "1024px"
          : contentWidth === "xl"
            ? "1280px"
            : contentWidth === "2xl"
              ? "1536px"
              : "1280px";

  return (
    <header className="w-full">
      <div
        style={{ maxHeight: "4rem", maxWidth: maxWidth }}
        className="mx-auto  px-4 py-3 flex items-center justify-between gap-4"
      >
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
