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

type Props = {
  menu: Menu | null;
  logoUrl?: string;
  logoAlt?: string;
  contentWidth?: string;
  layout?: "simple" | "multi-column";
  description?: string;
  badgeText?: string;
  showSocials?: boolean;
  socialLinks?: string[];
  __editor?: boolean;
};

export default function FooterV1({
  menu,
  logoUrl,
  logoAlt,
  contentWidth,
  layout = "multi-column",
  description,
  badgeText,
  showSocials = true,
  socialLinks,
  __editor,
}: Props) {
  const items = menu?.tree ?? [];
  const placeholderItems = [
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
  const navItems = items.length ? items : __editor ? placeholderItems : [];
  const columnTitles =
    navItems.length >= 7
      ? ["Product", "Company", "Legal"]
      : navItems.length >= 4
        ? ["Links", "More"]
        : ["Links"];
  const columnCount =
    navItems.length >= 7
      ? 3
      : navItems.length >= 4
        ? 2
        : navItems.length
          ? 1
          : 0;
  const itemsPerColumn = columnCount
    ? Math.ceil(navItems.length / columnCount)
    : 0;
  const columns = Array.from({ length: columnCount }, (_, idx) =>
    navItems.slice(idx * itemsPerColumn, (idx + 1) * itemsPerColumn),
  );
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
    .filter(Boolean) as Array<{ id: string; label: string; href: string; icon: any }>;
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
              : "1280px";
  return (
    <footer className="bg-slate-950 text-slate-400">
      <div
        className="mx-auto max-w-7xl px-6 pt-16 pb-8 lg:px-8"
        style={{ maxWidth: maxWidth }}
      >
        {layout === "simple" ? (
          <div className="rounded-3xl  bg-gradient-to-br from-white/5 via-white/0 to-white/0 px-6 py-10 md:px-10">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-3">
                {logoUrl ? (
                  <Link href="/" className="inline-flex items-center">
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={180}
                      height={56}
                      className="h-9 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-xl font-semibold text-white">
                    YourBrand
                  </div>
                )}
                <p className="max-w-md text-sm leading-6 text-slate-400">
                  {brandDescription}
                </p>
              </div>
              {navItems.length ? (
                <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
                  {navItems.slice(0, 6).map((n) => (
                    <Link
                      key={n.id}
                      href={n.ref?.slug || n.ref?.href || "#"}
                      className="transition-colors hover:text-white"
                    >
                      {n.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl  bg-gradient-to-br from-white/5 via-white/0 to-white/0 px-6 py-12 md:px-10">
            <div className="grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-8">
              <div className="md:col-span-1">
                {logoUrl ? (
                  <Link href="/" className="inline-flex items-center mb-4">
                    <Image
                      src={logoUrl}
                      alt={logoAlt || "Logo"}
                      width={180}
                      height={56}
                      className="h-9 w-auto"
                    />
                  </Link>
                ) : (
                  <div className="text-xl font-semibold text-white mb-3">
                    YourBrand
                  </div>
                )}
                <p className="text-sm leading-6 text-slate-400">
                  {brandDescription}
                </p>
                {brandBadge ? (
                  <div className="mt-6 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {brandBadge}
                  </div>
                ) : null}
              </div>

              {columns.length ? (
                <div className="grid grid-cols-2 gap-8 md:col-span-3 md:grid-cols-3">
                  {columns.map((group, idx) => (
                    <div key={`col-${idx}`}>
                      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {columnTitles[idx] || "Links"}
                      </h3>
                      <ul className="space-y-3 text-sm">
                        {group.map((n) => (
                          <li key={n.id}>
                            <Link
                              href={n.ref?.slug || n.ref?.href || "#"}
                              className="transition-colors hover:text-white"
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

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Store — All rights reserved.</div>
          {showSocials && socials.length ? (
            <div className="flex gap-3">
              {socials.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.id}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:border-white/30 hover:text-white"
                    aria-label={s.label}
                    title={s.label}
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
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
