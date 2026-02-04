import React from "react";
import { getSnapshotById } from "@acme/db-mongo";
import { resolveSite, normalizePath } from "./page";

function parseAttrs(tag: string) {
  const attrs: Record<string, string> = {};
  const re = /([a-zA-Z0-9:-]+)\s*=\s*"([^"]*)"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tag))) {
    attrs[m[1]] = m[2];
  }
  const re2 = /([a-zA-Z0-9:-]+)\s*=\s*'([^']*)'/g;
  while ((m = re2.exec(tag))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function parseCustomHead(html: string) {
  const tags: React.ReactElement[] = [];

  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  metaTags.forEach((t, i) => {
    const attrs = parseAttrs(t);
    tags.push(<meta key={`meta-${i}`} {...attrs} />);
  });

  const linkTags = html.match(/<link\b[^>]*>/gi) || [];
  linkTags.forEach((t, i) => {
    const attrs = parseAttrs(t);
    tags.push(<link key={`link-${i}`} {...attrs} />);
  });

  const scriptTags = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
  scriptTags.forEach((t, i) => {
    const attrs = parseAttrs(t);
    const body = t.replace(/<script\b[^>]*>/i, "").replace(/<\/script>/i, "");
    if (attrs.src) {
      tags.push(<script key={`script-${i}`} {...attrs} />);
    } else {
      tags.push(
        <script
          key={`script-${i}`}
          {...attrs}
          dangerouslySetInnerHTML={{ __html: body }}
        />,
      );
    }
  });

  // If there are stray tags, we ignore them for safety.
  return tags;
}

export default async function Head({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const path = normalizePath(resolvedParams.slug);

  const site = await resolveSite();
  if (!site?.published_snapshot_id) return null;

  const snapshot = await getSnapshotById(site.published_snapshot_id);
  if (!snapshot) return null;

  const page = snapshot.pages?.[path] || null;
  const siteHtml = snapshot.site_seo?.customHeadHtml || "";
  const pageHtml = page?.seo?.customHeadHtml || "";
  const html = `${siteHtml}\n${pageHtml}`.trim();
  if (!html) return null;

  return <>{parseCustomHead(html)}</>;
}
