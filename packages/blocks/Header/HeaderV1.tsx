import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";

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
  siteName?: string;
  layout?: "three-col" | "two-col" | "two-col-nav-cta";
  ctaText?: string;
  ctaHref?: string;
  ctaIcon?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  ctaSecondaryIcon?: string;
  ctaTertiaryText?: string;
  ctaTertiaryHref?: string;
  ctaTertiaryIcon?: string;
  contentWidth: string;
  logoUrl?: string;
  logoAlt?: string;
  __editor?: boolean;
  previewQuery?: string;
};

export default function HeaderV1({
  menu,
  siteName,
  layout = "three-col",
  ctaText,
  ctaHref,
  ctaIcon,
  ctaSecondaryText,
  ctaSecondaryHref,
  ctaSecondaryIcon,
  ctaTertiaryText,
  ctaTertiaryHref,
  ctaTertiaryIcon,
  logoUrl,
  logoAlt,
  contentWidth,
  __editor,
  previewQuery,
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

  const logoNode = logoUrl ? (
    <Link
      href={appendPreviewQuery("/", previewQuery)}
      className="flex items-center gap-2"
    >
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
    <Link
      href={appendPreviewQuery("/", previewQuery)}
      className="font-semibold"
    >
      {siteName || logoAlt || "Site"}
    </Link>
  );

  const navNode = (
    <nav className="flex items-center gap-6 overflow-x-auto">
      {navItems.map((n) => (
        <Link
          key={n.id}
          href={appendPreviewQuery(
            n.ref?.slug || n.ref?.href || "#",
            previewQuery,
          )}
          className="text-sm font-medium whitespace-nowrap opacity-80 hover:opacity-100 transition"
        >
          {n.label}
        </Link>
      ))}
    </nav>
  );

  const primaryIcon = getIcon(ctaIcon);
  const secondaryIcon = getIcon(ctaSecondaryIcon);
  const tertiaryIcon = getIcon(ctaTertiaryIcon);

  const hasAnyCta =
    (ctaText && ctaHref) ||
    (ctaSecondaryText && ctaSecondaryHref) ||
    (ctaTertiaryText && ctaTertiaryHref) ||
    (ctaIcon && ctaHref) ||
    (ctaSecondaryIcon && ctaSecondaryHref) ||
    (ctaTertiaryIcon && ctaTertiaryHref);

  const ctaNode = hasAnyCta ? (
    <div className="flex items-center gap-2">
      {ctaTertiaryHref && (ctaTertiaryText || tertiaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaTertiaryHref, previewQuery)}
          className="px-3 py-2 rounded-full text-sm font-medium text-black/70 hover:text-black transition"
        >
          {tertiaryIcon ? (
            <tertiaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaTertiaryText ? (
            <span className={tertiaryIcon ? "ml-2" : ""}>
              {ctaTertiaryText}
            </span>
          ) : null}
        </Link>
      ) : null}
      {ctaSecondaryHref && (ctaSecondaryText || secondaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaSecondaryHref, previewQuery)}
          className="px-4 py-2 rounded-full border border-black/15 text-sm font-medium hover:border-black/25 transition"
        >
          {secondaryIcon ? (
            <secondaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaSecondaryText ? (
            <span className={secondaryIcon ? "ml-2" : ""}>
              {ctaSecondaryText}
            </span>
          ) : null}
        </Link>
      ) : null}
      {ctaHref && (ctaText || primaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaHref, previewQuery)}
          className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium shadow-sm hover:shadow transition"
        >
          {primaryIcon ? (
            <primaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaText ? (
            <span className={primaryIcon ? "ml-2" : ""}>{ctaText}</span>
          ) : null}
        </Link>
      ) : null}
    </div>
  ) : (
    <div className="w-[1px] h-8 bg-black/10" />
  );

  return (
    <header className="w-full border-b border-black/10 bg-white/70 backdrop-blur">
      <div
        style={{ maxHeight: "4rem", maxWidth: maxWidth }}
        className={`mx-auto px-4 py-3 ${
          layout === "stacked"
            ? "flex flex-col gap-3"
            : "flex items-center justify-between gap-6"
        }`}
      >
        {layout === "two-col" ? (
          <>
            <div className="flex items-center gap-6">
              {logoNode}
              {navNode}
            </div>
            {ctaNode}
          </>
        ) : layout === "two-col-nav-cta" ? (
          <>
            {logoNode}
            <div className="flex items-center gap-6">
              {navNode}
              {ctaNode}
            </div>
          </>
        ) : (
          <>
            {logoNode}
            {navNode}
            {ctaNode}
          </>
        )}
      </div>
    </header>
  );
}

function appendPreviewQuery(href: string, previewQuery?: string) {
  if (!previewQuery) return href;
  if (
    !href ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return href;
  }
  const [base, hash] = href.split("#");
  const [path, query] = base.split("?");
  const params = new URLSearchParams(query || "");
  const extra = new URLSearchParams(previewQuery);
  extra.forEach((value, key) => {
    if (!params.get(key)) params.set(key, value);
  });
  const qs = params.toString();
  const joined = `${path}${qs ? `?${qs}` : ""}`;
  return hash ? `${joined}#${hash}` : joined;
}

function getIcon(name?: string) {
  if (!name) return null;
  const icon = (Icons as any)[name];
  return typeof icon === "function" ? icon : null;
}
