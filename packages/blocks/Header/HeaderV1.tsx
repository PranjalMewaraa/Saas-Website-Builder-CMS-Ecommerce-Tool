import Link from "next/link";
import Image from "next/image";
import * as Icons from "lucide-react";

type MenuNode = {
  id: string;
  label: string;
  type?: string;
  ref?: { slug?: string; href?: string };
  children?: MenuNode[];
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
};

type Menu = {
  tree?: MenuNode[];
};

type Props = {
  menu: Menu | null;
  siteName?: string;
  layout?:
    | "three-col"
    | "two-col"
    | "two-col-nav-cta"
    | "centered-nav"
    | "split-nav"
    | "logo-cta";
  ctaText?: string;
  ctaHref?: string;
  ctaIcon?: string;
  ctaSecondaryText?: string;
  ctaSecondaryHref?: string;
  ctaSecondaryIcon?: string;
  ctaTertiaryText?: string;
  ctaTertiaryHref?: string;
  ctaTertiaryIcon?: string;
  menuGap?: number;
  actionGap?: number;
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
  menuGap = 24,
  actionGap = 8,
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
    contentWidth === "auto"
      ? ""
      : contentWidth === "sm"
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
    <nav
      className="flex min-w-0 items-center overflow-visible"
      style={{ gap: `${Math.max(0, Number(menuGap || 24))}px` }}
    >
      {navItems.map((n) => renderNavItem(n, previewQuery, !!__editor))}
    </nav>
  );

  const PrimaryIcon = getIcon(ctaIcon);
  const SecondaryIcon = getIcon(ctaSecondaryIcon);
  const TertiaryIcon = getIcon(ctaTertiaryIcon);

  const hasAnyCta =
    (ctaText && ctaHref) ||
    (ctaSecondaryText && ctaSecondaryHref) ||
    (ctaTertiaryText && ctaTertiaryHref) ||
    (PrimaryIcon && ctaHref) ||
    (SecondaryIcon && ctaSecondaryHref) ||
    (TertiaryIcon && ctaTertiaryHref);

  const ctaNode = hasAnyCta ? (
    <div
      className="flex items-center"
      style={{ gap: `${Math.max(0, Number(actionGap || 8))}px` }}
    >
      {ctaTertiaryHref && (ctaTertiaryText || TertiaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaTertiaryHref, previewQuery)}
          className="px-3 py-2 rounded-full text-sm font-medium text-black/70 hover:text-black transition"
        >
          {TertiaryIcon ? (
            <TertiaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaTertiaryText ? (
            <span className={TertiaryIcon ? "ml-2" : ""}>
              {ctaTertiaryText}
            </span>
          ) : null}
        </Link>
      ) : null}
      {ctaSecondaryHref && (ctaSecondaryText || SecondaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaSecondaryHref, previewQuery)}
          className="px-4 py-2 rounded-full border border-black/15 text-sm font-medium hover:border-black/25 transition"
        >
          {SecondaryIcon ? (
            <SecondaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaSecondaryText ? (
            <span className={SecondaryIcon ? "ml-2" : ""}>
              {ctaSecondaryText}
            </span>
          ) : null}
        </Link>
      ) : null}
      {ctaHref && (ctaText || PrimaryIcon) ? (
        <Link
          href={appendPreviewQuery(ctaHref, previewQuery)}
          className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium shadow-sm hover:shadow transition"
        >
          {PrimaryIcon ? (
            <PrimaryIcon className="h-4 w-4 inline-block" />
          ) : null}
          {ctaText ? (
            <span className={PrimaryIcon ? "ml-2" : ""}>{ctaText}</span>
          ) : null}
        </Link>
      ) : null}
    </div>
  ) : (
    <div className="w-[1px] h-8 bg-black/10" />
  );

  return (
    <header className="relative z-[120] isolate w-full !overflow-visible border-b border-black/10 bg-white/70 backdrop-blur">
      <div
        style={{ maxWidth: maxWidth }}
        className="relative mx-auto flex items-center justify-between gap-6 !overflow-visible px-4 py-3"
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
        ) : layout === "centered-nav" ? (
          <>
            <div className="w-40 flex items-center">{logoNode}</div>
            <div className="flex-1 flex justify-center">{navNode}</div>
            <div className="w-40 flex justify-end">{ctaNode}</div>
          </>
        ) : layout === "split-nav" ? (
          <>
            <div className="flex items-center gap-5">
              {logoNode}
              <nav
                className="hidden min-w-0 lg:flex items-center overflow-visible"
                style={{ gap: `${Math.max(0, Number(menuGap || 24))}px` }}
              >
                {navItems.slice(0, Math.ceil(navItems.length / 2)).map((n) => (
                  renderNavItem(n, previewQuery, !!__editor)
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <nav
                className="hidden min-w-0 lg:flex items-center overflow-visible"
                style={{ gap: `${Math.max(0, Number(menuGap || 24))}px` }}
              >
                {navItems.slice(Math.ceil(navItems.length / 2)).map((n) => (
                  renderNavItem(n, previewQuery, !!__editor)
                ))}
              </nav>
              {ctaNode}
            </div>
          </>
        ) : layout === "logo-cta" ? (
          <>
            {logoNode}
            {ctaNode}
          </>
        ) : (
          <>
            {logoNode}
            {navNode}
            {ctaNode}
          </>
        )}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .mega-item:hover > .mega-panel {
              visibility: visible !important;
              opacity: 1 !important;
              pointer-events: auto !important;
            }
          `,
        }}
      />
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

function renderNavItem(
  n: MenuNode,
  previewQuery?: string,
  __editor?: boolean,
) {
  const href = appendPreviewQuery(n.ref?.slug || n.ref?.href || "#", previewQuery);
  const mega = n.mega;
  const showMega = !!mega?.enabled;
  const columns = Math.max(1, Math.min(6, Number(mega?.columns || 3)));
  const sections =
    mega?.sections && mega.sections.length
      ? mega.sections
      : n.children?.length
        ? [
            {
              title: n.label,
              links: n.children.map((c) => ({
                label: c.label,
                href: c.ref?.slug || c.ref?.href || "#",
              })),
            },
          ]
        : [];

  if (!showMega) {
    return (
      <Link
        key={n.id}
        href={href}
        className="text-sm font-medium whitespace-nowrap opacity-80 hover:opacity-100 transition"
      >
        {n.label}
      </Link>
    );
  }

  return (
    <div key={n.id} className="mega-item relative -my-2 py-2">
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-sm font-medium whitespace-nowrap opacity-90 hover:opacity-100 transition"
      >
        <span>{n.label}</span>
        <Icons.ChevronDown className="h-3.5 w-3.5 opacity-70" />
      </Link>
      <div
        className={`mega-panel fixed left-1/2 top-[68px] z-[140] w-[min(96vw,1200px)] -translate-x-1/2 ${
          __editor ? "hidden" : ""
        }`}
        style={
          __editor
            ? undefined
            : {
                visibility: "hidden",
                opacity: 0,
                pointerEvents: "none",
                transition: "opacity 180ms ease",
              }
        }
      >
        <div className="pt-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
            <div
              className="grid gap-4"
              style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
            >
              {sections.map((section, sIdx) => (
                <div key={`${section.title || "section"}-${sIdx}`}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {section.title || `Section ${sIdx + 1}`}
                  </div>
                  <div className="mt-2 space-y-1">
                    {(section.links || []).map((link: any, lIdx) => (
                      <Link
                        key={`${link.label || "link"}-${lIdx}`}
                        href={appendPreviewQuery(
                          link.ref?.slug || link.ref?.href || link.href || "#",
                          previewQuery,
                        )}
                        className="block rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        {link.label || `Link ${lIdx + 1}`}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
