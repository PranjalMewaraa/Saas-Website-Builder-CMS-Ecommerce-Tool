import React from "react";

type Crumb = { label: string; href?: string };

type Props = {
  path?: string;
  homeLabel?: string;
  homeHref?: string;
  separator?: string;
  rootPath?: string;
  showRoot?: boolean;
  trail?: Crumb[];
};

function humanize(segment: string) {
  const raw = decodeURIComponent(segment);
  return raw
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export default function BreadcrumbsV1(props: Props) {
  const path = (props.path || "/").replace(/\/+$/, "") || "/";
  const homeHref = props.homeHref || props.rootPath || "/";
  const separator = props.separator || "/";

  let crumbs: Crumb[];
  if (Array.isArray(props.trail) && props.trail.length) {
    crumbs = props.trail;
  } else {
    const parts = path.split("/").filter(Boolean);
    let href = "";
    crumbs = parts.map((seg, i) => {
      href = `${href}/${seg}`;
      return {
        label: humanize(seg),
        href: i < parts.length - 1 ? href : undefined,
      };
    });
  }

  const items: Crumb[] = [];
  if (props.showRoot !== false) {
    items.push({ label: props.homeLabel || "Home", href: homeHref });
  }
  items.push(...crumbs);

  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {c.href && !last ? (
                <a href={c.href} className="hover:underline">
                  {c.label}
                </a>
              ) : (
                <span className={last ? "text-slate-900 font-medium" : ""}>
                  {c.label}
                </span>
              )}
              {!last ? (
                <span aria-hidden="true" className="text-slate-400">
                  {separator}
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
