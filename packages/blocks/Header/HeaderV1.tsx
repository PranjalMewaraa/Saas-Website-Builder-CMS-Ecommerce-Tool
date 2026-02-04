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
  __editor?: boolean;
};

export default function HeaderV1({
  menu,
  ctaText,
  ctaHref,
  logoUrl,
  logoAlt,
  contentWidth,
  __editor,
}: Props) {
  const items = menu?.tree ?? [];
  const placeholderItems = [
    { id: "ph-1", label: "Shop", ref: { href: "#" } },
    { id: "ph-2", label: "About", ref: { href: "#" } },
    { id: "ph-3", label: "Contact", ref: { href: "#" } },
  ];
  const navItems = items.length ? items : __editor ? placeholderItems : [];

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
    <header className="w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div
        style={{ maxHeight: "4rem", maxWidth: maxWidth }}
        className="mx-auto px-4 py-3 flex items-center justify-between gap-6"
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

        <nav className="flex items-center gap-6 overflow-x-auto">
          {navItems.map((n) => (
            <Link
              key={n.id}
              href={n.ref?.slug || n.ref?.href || "#"}
              className="text-sm font-medium whitespace-nowrap opacity-80 hover:opacity-100 transition"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {ctaText && ctaHref ? (
          <Link
            href={ctaHref}
            className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium shadow-sm hover:shadow transition"
          >
            {ctaText}
          </Link>
        ) : (
          <div className="w-[1px] h-8 bg-black/10" />
        )}
      </div>
    </header>
  );
}
