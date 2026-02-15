import { resolveLayoutStyle, resolveRowLayoutStyle } from "./layout-style";

const TABLET_MAX = 1024;
const MOBILE_MAX = 768;

export function buildResponsiveCss(layout: any) {
  const tabletRules: string[] = [];
  const mobileRules: string[] = [];

  const sections = layout?.sections || [];
  for (const sec of sections) {
    const blocks = sec?.blocks || [];
    for (const b of blocks) {
      // Legacy block responsive support (existing behavior, now generic)
      const legacyResp = b?.style?.responsive;
      if (legacyResp?.tablet) {
        const css = cssFromResolvedStyle(
          `[data-block-id="${b.id}"] > .__inner`,
          resolveLayoutStyle(legacyResp.tablet),
        );
        if (css) tabletRules.push(css);
      }
      if (legacyResp?.mobile) {
        const css = cssFromResolvedStyle(
          `[data-block-id="${b.id}"] > .__inner`,
          resolveLayoutStyle(legacyResp.mobile),
        );
        if (css) mobileRules.push(css);
      }

      if (b?.type !== "Layout/Section") continue;

      // Section style responsive
      const sectionResp = b?.props?.style?.responsive;
      if (sectionResp?.tablet) {
        const css = cssFromResolvedStyle(
          `[data-block-id="${b.id}"] > section`,
          resolveLayoutStyle(sectionResp.tablet),
        );
        if (css) tabletRules.push(css);
      }
      if (sectionResp?.mobile) {
        const css = cssFromResolvedStyle(
          `[data-block-id="${b.id}"] > section`,
          resolveLayoutStyle(sectionResp.mobile),
        );
        if (css) mobileRules.push(css);
      }

      const rows = b?.props?.rows || [];
      for (const row of rows) {
        const rowStyleResp = row?.style?.responsive;
        if (rowStyleResp?.tablet) {
          const css = cssFromResolvedStyle(
            `[data-block-id="${b.id}"] [data-row-id="${row.id}"]`,
            resolveLayoutStyle(rowStyleResp.tablet),
          );
          if (css) tabletRules.push(css);
        }
        if (rowStyleResp?.mobile) {
          const css = cssFromResolvedStyle(
            `[data-block-id="${b.id}"] [data-row-id="${row.id}"]`,
            resolveLayoutStyle(rowStyleResp.mobile),
          );
          if (css) mobileRules.push(css);
        }

        // Row layout responsive (columns/gap/align/justify/display)
        const rowLayoutResp = row?.layout?.responsive;
        if (rowLayoutResp?.tablet) {
          const css = cssFromResolvedStyle(
            `[data-block-id="${b.id}"] [data-row-layout-id="${row.id}"]`,
            resolveRowLayoutStyle(rowLayoutResp.tablet),
          );
          if (css) tabletRules.push(css);
        }
        if (rowLayoutResp?.mobile) {
          const css = cssFromResolvedStyle(
            `[data-block-id="${b.id}"] [data-row-layout-id="${row.id}"]`,
            resolveRowLayoutStyle(rowLayoutResp.mobile),
          );
          if (css) mobileRules.push(css);
        }

        const cols = row?.cols || [];
        for (const col of cols) {
          const colStyleResp = col?.style?.responsive;
          if (colStyleResp?.tablet) {
            const css = cssFromResolvedStyle(
              `[data-block-id="${b.id}"] [data-col-id="${col.id}"]`,
              resolveLayoutStyle(colStyleResp.tablet),
            );
            if (css) tabletRules.push(css);
          }
          if (colStyleResp?.mobile) {
            const css = cssFromResolvedStyle(
              `[data-block-id="${b.id}"] [data-col-id="${col.id}"]`,
              resolveLayoutStyle(colStyleResp.mobile),
            );
            if (css) mobileRules.push(css);
          }
        }
      }
    }
  }

  return buildCssBundle(tabletRules, mobileRules);
}

function buildCssBundle(tabletRules: string[], mobileRules: string[]) {
  const hasTablet = tabletRules.length > 0;
  const hasMobile = mobileRules.length > 0;
  if (!hasTablet && !hasMobile) return "";

  const chunks: string[] = ["/* responsive overrides */"];
  if (hasTablet) {
    chunks.push(`@media (max-width: ${TABLET_MAX}px) {`);
    chunks.push(tabletRules.join("\n"));
    chunks.push("}");
  }
  if (hasMobile) {
    chunks.push(`@media (max-width: ${MOBILE_MAX}px) {`);
    chunks.push(mobileRules.join("\n"));
    chunks.push("}");
  }
  return chunks.join("\n");
}

function cssFromResolvedStyle(
  selector: string,
  styleObj: Record<string, any> | undefined,
) {
  if (!styleObj) return "";
  const decl = styleToDecl(styleObj);
  if (!decl) return "";
  return `${selector} { ${decl} }`;
}

function styleToDecl(styleObj: Record<string, any>) {
  const entries = Object.entries(styleObj).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (!entries.length) return "";
  return entries
    .map(([k, v]) => `${camelToKebab(k)}: ${String(v)} !important;`)
    .join(" ");
}

function camelToKebab(input: string) {
  return input.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}
