import Link from "next/link";
import Image from "next/image";
import { Github, Linkedin, Twitter } from "lucide-react";

type MenuNode = {
  id: string;
  label: string;
  type?: string;
  ref?: { slug?: string; href?: string };
};

type Menu = {
  tree?: MenuNode[];
};

type FooterMenuGroup = {
  menuId: string;
  title?: string;
  textSize?: "xs" | "sm" | "base";
  textStyle?: "normal" | "medium" | "semibold";
};

type Props = {
  menu: Menu | null;
  menus?: Record<string, Menu> | null;
  logoUrl?: string;
  logoAlt?: string;
  contentWidth?: string;
  layout?: "simple" | "multi-column";
  description?: string;
  badgeText?: string;
  badgeStyle?: "pill" | "outline" | "soft" | "glass" | "text" | "tag";
  showSocials?: boolean;
  socialLinks?: string[];
  socialStyle?:
    | "pill"
    | "outline"
    | "soft"
    | "glass"
    | "square"
    | "minimal"
    | "label";
  panelBg?: {
    type?: "none" | "solid" | "gradient";
    color?: string;
    gradient?: { from?: string; to?: string; angle?: number };
  };
  panelBorderColor?: string;
  panelBorderWidth?: number;
  panelRadius?: number;
  panelTextColor?: string;
  menuGroups?: FooterMenuGroup[];
  __editor?: boolean;
  previewQuery?: string;
  footerTemplate?: 1 | 2 | 3 | 4;
};

export default function FooterV1({
  menu,
  menus,
  logoUrl,
  logoAlt,
  contentWidth = "2xl",
  layout = "multi-column",
  description,
  badgeText,
  badgeStyle = "pill",
  showSocials = true,
  socialLinks,
  socialStyle = "pill",
  panelBg,
  panelBorderColor,
  panelBorderWidth,
  panelRadius,
  panelTextColor,
  menuGroups,
  __editor,
  previewQuery,
  footerTemplate = 1,
}: Props) {
  const placeholderItems = defaultPlaceholderItems();
  const normalizedGroups = (menuGroups || [])
    .filter((g) => g?.menuId)
    .map((group, idx) => {
      const tree = menus?.[group.menuId]?.tree || [];
      const fallbackTitle = `Menu ${idx + 1}`;
      return {
        id: `group-${idx}-${group.menuId}`,
        title: group.title?.trim() || fallbackTitle,
        textSize: group.textSize || "sm",
        textStyle: group.textStyle || "normal",
        items: tree.length
          ? tree
          : __editor
            ? placeholderItems.slice(0, 4).map((n, i) => ({
                ...n,
                id: `${group.menuId}-ph-${i}`,
              }))
            : [],
      };
    })
    .filter((g) => g.items.length > 0);

  const fallbackItems = menu?.tree ?? [];
  const fallbackNavItems = fallbackItems.length
    ? fallbackItems
    : __editor
      ? placeholderItems
      : [];
  const fallbackColumnTitles =
    fallbackNavItems.length >= 7
      ? ["Product", "Company", "Legal"]
      : fallbackNavItems.length >= 4
        ? ["Links", "More"]
        : ["Links"];
  const fallbackColumnCount =
    fallbackNavItems.length >= 7
      ? 3
      : fallbackNavItems.length >= 4
        ? 2
        : fallbackNavItems.length
          ? 1
          : 0;
  const fallbackItemsPerColumn = fallbackColumnCount
    ? Math.ceil(fallbackNavItems.length / fallbackColumnCount)
    : 0;
  const fallbackColumns = Array.from(
    { length: fallbackColumnCount },
    (_, idx) => ({
      id: `fallback-${idx}`,
      title: fallbackColumnTitles[idx] || "Links",
      textSize: "sm" as const,
      textStyle: "normal" as const,
      items: fallbackNavItems.slice(
        idx * fallbackItemsPerColumn,
        (idx + 1) * fallbackItemsPerColumn,
      ),
    }),
  );
  const columns = normalizedGroups.length ? normalizedGroups : fallbackColumns;
  const defaultSocials = __editor
    ? ["https://x.com/", "https://github.com/", "https://linkedin.com/"]
    : [];
  const socialUrls = socialLinks?.length ? socialLinks : defaultSocials;
  const socials = socialUrls
    .map((url, idx) => {
      const iconMeta = resolveSocialIcon(url);
      if (!iconMeta) return null;
      return {
        id: `s-${idx}`,
        label: iconMeta.label,
        href: url,
        icon: iconMeta.icon,
      };
    })
    .filter(Boolean) as Array<{
    id: string;
    label: string;
    href: string;
    icon: any;
  }>;
  const brandDescription =
    description || "Building better digital experiences since 2023.";
  const brandBadge = badgeText || "Designed for modern storefronts";
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
              : undefined;
  const resolvedPanelBg: NonNullable<Props["panelBg"]> =
    panelBg && panelBg.type
      ? panelBg
      : {
          type: "gradient",
          gradient: {
            from: "rgba(255,255,255,0.05)",
            to: "rgba(255,255,255,0)",
            angle: 135,
          },
        };

  const panelStyle: React.CSSProperties = {};
  if (resolvedPanelBg.type === "solid" && resolvedPanelBg.color) {
    panelStyle.background = resolvedPanelBg.color;
  }
  if (
    resolvedPanelBg.type === "gradient" &&
    resolvedPanelBg.gradient?.from &&
    resolvedPanelBg.gradient?.to
  ) {
    const angle =
      typeof resolvedPanelBg.gradient.angle === "number"
        ? resolvedPanelBg.gradient.angle
        : 135;
    panelStyle.background = `linear-gradient(${angle}deg, ${resolvedPanelBg.gradient.from}, ${resolvedPanelBg.gradient.to})`;
  }
  if (panelBorderColor || panelBorderWidth) {
    panelStyle.borderStyle = "solid";
    panelStyle.borderColor = panelBorderColor || "rgba(255,255,255,0.1)";
    panelStyle.borderWidth = `${panelBorderWidth ?? 1}px`;
  }
  panelStyle.borderRadius = `${panelRadius ?? 24}px`;
  if (panelTextColor) panelStyle.color = panelTextColor;

  const template = Number(footerTemplate || 1) as 1 | 2 | 3 | 4;

  return (
    <footer className="w-full">
      <div
        className="mx-auto w-full p-6"
        style={maxWidth ? { maxWidth } : undefined}
      >
        {template === 2 ? (
          <div className="px-6 py-12 md:px-10" style={panelStyle}>
            <div className="text-center max-w-3xl mx-auto">
              {logoUrl ? (
                <Link
                  href={appendPreviewQuery("/", previewQuery)}
                  className="inline-flex items-center justify-center mb-4"
                >
                  <Image
                    src={logoUrl}
                    alt={logoAlt || "Logo"}
                    width={180}
                    height={56}
                    className="h-9 w-auto"
                  />
                </Link>
              ) : (
                <div className="text-xl font-semibold mb-3">YourBrand</div>
              )}
              <p className="text-sm leading-6 opacity-80">{brandDescription}</p>
              {brandBadge ? <div className="mt-5">{renderBadge(brandBadge, badgeStyle)}</div> : null}
            </div>
            {columns.length ? (
              <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
                {columns.map((group, idx) => (
                  <div key={`col-t2-${idx}`} className="text-center">
                    <h3
                      className="mb-4 text-xs uppercase tracking-[0.2em] opacity-80"
                      style={resolveTextStyle(group.textStyle)}
                    >
                      {group.title || "Links"}
                    </h3>
                    <ul
                      className="space-y-3"
                      style={resolveTextListStyle(group.textSize, group.textStyle)}
                    >
                      {group.items.map((n) => (
                        <li key={n.id}>
                          <Link
                            href={appendPreviewQuery(
                              n.ref?.slug || n.ref?.href || "#",
                              previewQuery,
                            )}
                            className="transition-opacity hover:opacity-100 opacity-80"
                          >
                            {n.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ) : template === 3 ? (
          <div className="px-6 py-12 md:px-10" style={panelStyle}>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
              <div>
                {logoUrl ? (
                  <Link
                    href={appendPreviewQuery("/", previewQuery)}
                    className="inline-flex items-center mb-4"
                  >
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={180}
                      height={56}
                      className="h-9 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-2xl font-semibold mb-3">YourBrand</div>
                )}
                <p className="text-sm leading-7 opacity-85 max-w-xl">
                  {brandDescription}
                </p>
                {brandBadge ? <div className="mt-6">{renderBadge(brandBadge, badgeStyle)}</div> : null}
              </div>
              <div className="grid grid-cols-2 gap-8">
                {columns.slice(0, 4).map((group, idx) => (
                  <div key={`col-t3-${idx}`}>
                    <h3
                      className="mb-4 text-xs uppercase tracking-[0.2em] opacity-80"
                      style={resolveTextStyle(group.textStyle)}
                    >
                      {group.title || "Links"}
                    </h3>
                    <ul
                      className="space-y-3"
                      style={resolveTextListStyle(group.textSize, group.textStyle)}
                    >
                      {group.items.map((n) => (
                        <li key={n.id}>
                          <Link
                            href={appendPreviewQuery(
                              n.ref?.slug || n.ref?.href || "#",
                              previewQuery,
                            )}
                            className="transition-opacity hover:opacity-100 opacity-80"
                          >
                            {n.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : template === 4 ? (
          <div className="px-6 py-10 md:px-10" style={panelStyle}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-center">
              <div className="md:col-span-1">
                {logoUrl ? (
                  <Link
                    href={appendPreviewQuery("/", previewQuery)}
                    className="inline-flex items-center mb-3"
                  >
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={170}
                      height={52}
                      className="h-8 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-lg font-semibold mb-2">YourBrand</div>
                )}
                <p className="text-sm opacity-80">{brandDescription}</p>
              </div>
              <div className="md:col-span-2">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  {columns.flatMap((g) => g.items).slice(0, 12).map((n) => (
                    <Link
                      key={`flat-${n.id}`}
                      href={appendPreviewQuery(
                        n.ref?.slug || n.ref?.href || "#",
                        previewQuery,
                      )}
                      className="transition-opacity hover:opacity-100 opacity-80"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : layout === "simple" ? (
          <div className="px-6 py-10 md:px-10" style={panelStyle}>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                {logoUrl ? (
                  <Link
                    href={appendPreviewQuery("/", previewQuery)}
                    className="inline-flex items-center"
                  >
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={180}
                      height={56}
                      className="h-9 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-xl font-semibold">YourBrand</div>
                )}
                <p className="max-w-md text-sm leading-6 opacity-80">
                  {brandDescription}
                </p>
              </div>
              {columns.length ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  {columns[0].items.slice(0, 6).map((n) => (
                    <Link
                      key={n.id}
                      href={appendPreviewQuery(
                        n.ref?.slug || n.ref?.href || "#",
                        previewQuery,
                      )}
                      className="transition-opacity hover:opacity-100 opacity-80"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="px-6 py-12 md:px-10" style={panelStyle}>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
              <div className="md:col-span-1">
                {logoUrl ? (
                  <Link
                    href={appendPreviewQuery("/", previewQuery)}
                    className="inline-flex items-center mb-4"
                  >
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={180}
                      height={56}
                      className="h-9 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-xl font-semibold mb-3">YourBrand</div>
                )}
                <p className="text-sm leading-6 opacity-80">
                  {brandDescription}
                </p>
                {brandBadge ? (
                  <div className="mt-6">
                    {renderBadge(brandBadge, badgeStyle)}
                  </div>
                ) : null}
              </div>

              {columns.length ? (
                <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-4">
                  {columns.map((group, idx) => (
                    <div key={`col-${idx}`}>
                      <h3
                        className="mb-4 text-xs uppercase tracking-[0.2em] opacity-80"
                        style={resolveTextStyle(group.textStyle)}
                      >
                        {group.title || "Links"}
                      </h3>
                      <ul
                        className="space-y-3"
                        style={resolveTextListStyle(
                          group.textSize,
                          group.textStyle,
                        )}
                      >
                        {group.items.map((n) => (
                          <li key={n.id}>
                            <Link
                              href={appendPreviewQuery(
                                n.ref?.slug || n.ref?.href || "#",
                                previewQuery,
                              )}
                              className="transition-opacity hover:opacity-100 opacity-80"
                            >
                              {n.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs opacity-70 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Store — All rights reserved.</div>
          {showSocials && socials.length ? (
            <div className="flex flex-wrap gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    className="footer-social"
                    data-style={socialStyle}
                    style={socialButtonStyle(socialStyle)}
                  >
                    <Icon size={16} />
                    {socialStyle === "label" ? (
                      <span style={{ fontSize: 12, fontWeight: 600 }}>
                        {s.label}
                      </span>
                    ) : null}
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
      <style>{`
        .footer-social { transition: all 150ms ease; }
        .footer-social:hover { opacity: 1; }
        .footer-social[data-style="pill"]:hover,
        .footer-social[data-style="soft"]:hover {
          border-color: rgba(255,255,255,0.32);
          background: rgba(255,255,255,0.16);
        }
        .footer-social[data-style="outline"]:hover {
          border-color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.06);
        }
        .footer-social[data-style="glass"]:hover {
          border-color: rgba(255,255,255,0.5);
          background: rgba(255,255,255,0.22);
        }
        .footer-social[data-style="square"]:hover {
          border-color: rgba(255,255,255,0.35);
          background: rgba(255,255,255,0.14);
        }
        .footer-social[data-style="minimal"]:hover {
          opacity: 1;
          transform: translateY(-1px);
        }
        .footer-social[data-style="label"]:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.14);
        }
      `}</style>
    </footer>
  );
}

function defaultPlaceholderItems(): MenuNode[] {
  return [
    { id: "ph-1", label: "Features", ref: { href: "#" } },
    { id: "ph-2", label: "Pricing", ref: { href: "#" } },
    { id: "ph-3", label: "Integrations", ref: { href: "#" } },
    { id: "ph-4", label: "About", ref: { href: "#" } },
    { id: "ph-5", label: "Blog", ref: { href: "#" } },
    { id: "ph-6", label: "Careers", ref: { href: "#" } },
    { id: "ph-7", label: "Privacy", ref: { href: "#" } },
    { id: "ph-8", label: "Terms", ref: { href: "#" } },
    { id: "ph-9", label: "Support", ref: { href: "#" } },
  ];
}

function resolveTextStyle(
  style?: FooterMenuGroup["textStyle"],
): React.CSSProperties {
  if (style === "medium") return { fontWeight: 500 };
  if (style === "semibold") return { fontWeight: 600 };
  return { fontWeight: 400 };
}

function resolveTextListStyle(
  size?: FooterMenuGroup["textSize"],
  style?: FooterMenuGroup["textStyle"],
): React.CSSProperties {
  const fontSize = size === "xs" ? "12px" : size === "base" ? "16px" : "14px";
  return {
    fontSize,
    ...resolveTextStyle(style),
  };
}

function resolveSocialIcon(url: string) {
  if (!url) return null;
  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
  if (host.includes("x.com") || host.includes("twitter.com")) {
    return { icon: Twitter, label: "X / Twitter" };
  }
  if (host.includes("github.com")) {
    return { icon: Github, label: "GitHub" };
  }
  if (host.includes("linkedin.com")) {
    return { icon: Linkedin, label: "LinkedIn" };
  }
  return null;
}

function renderBadge(text: string, style: Props["badgeStyle"]) {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: 600,
  };

  if (style === "text") {
    return (
      <span style={{ ...base, opacity: 0.85, letterSpacing: 0.3 }}>{text}</span>
    );
  }

  if (style === "outline") {
    return (
      <span
        style={{
          ...base,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.22)",
          background: "transparent",
          opacity: 0.95,
        }}
      >
        {text}
      </span>
    );
  }

  if (style === "glass") {
    return (
      <span
        style={{
          ...base,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.25)",
          background: "rgba(255,255,255,0.12)",
        }}
      >
        {text}
      </span>
    );
  }

  if (style === "tag") {
    return (
      <span
        style={{
          ...base,
          padding: "3px 8px",
          borderRadius: 6,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(255,255,255,0.06)",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          fontSize: "10px",
        }}
      >
        {text}
      </span>
    );
  }

  if (style === "soft") {
    return (
      <span
        style={{
          ...base,
          padding: "4px 10px",
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.05)",
          opacity: 0.9,
        }}
      >
        {text}
      </span>
    );
  }

  // pill (default)
  return (
    <span
      style={{
        ...base,
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid rgba(255,255,255,0.12)",
        background: "rgba(255,255,255,0.08)",
        opacity: 0.9,
      }}
    >
      {text}
    </span>
  );
}

function socialButtonStyle(
  style: NonNullable<Props["socialStyle"]>,
): React.CSSProperties {
  const base: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0.45rem",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.06)",
    opacity: 0.85,
    transition: "all 150ms ease",
    textDecoration: "none",
  };

  if (style === "minimal") {
    return {
      ...base,
      border: "none",
      background: "transparent",
      padding: "0.25rem",
      opacity: 0.8,
    };
  }

  if (style === "outline") {
    return {
      ...base,
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.2)",
    };
  }

  if (style === "soft") {
    return {
      ...base,
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.08)",
    };
  }

  if (style === "glass") {
    return {
      ...base,
      background: "rgba(255,255,255,0.12)",
      border: "1px solid rgba(255,255,255,0.25)",
      backdropFilter: "blur(6px)",
    };
  }

  if (style === "square") {
    return {
      ...base,
      borderRadius: 10,
    };
  }

  if (style === "label") {
    return {
      ...base,
      padding: "0.45rem 0.75rem",
      borderRadius: 999,
    };
  }

  // pill default
  return base;
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
