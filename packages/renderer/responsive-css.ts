export function buildResponsiveCss(layout: any) {
  const rules: string[] = [];

  const blocks = layout?.sections?.flatMap((s: any) => s.blocks || []) || [];
  for (const b of blocks) {
    const resp = b.style?.responsive;
    if (!resp) continue;

    // we only support padding/margin/radius/textColor/bg overlays via CSS vars or direct props later
    // MVP: only padding and textColor/radius. (You can extend fields gradually.)
    if (resp.tablet) rules.push(cssFor("tablet", b.id, resp.tablet));
    if (resp.mobile) rules.push(cssFor("mobile", b.id, resp.mobile));
  }

  if (!rules.length) return "";

  return `
/* responsive overrides */
@media (max-width: 1024px) {
  ${rules
    .filter((r) => r.startsWith("/*tablet*/"))
    .map((r) => r.replace("/*tablet*/", ""))
    .join("\n")}
}
@media (max-width: 768px) {
  ${rules
    .filter((r) => r.startsWith("/*mobile*/"))
    .map((r) => r.replace("/*mobile*/", ""))
    .join("\n")}
}
  `.trim();
}

function cssFor(bp: "tablet" | "mobile", blockId: string, s: any) {
  const sel = `[data-block-id="${blockId}"] > .__inner`; // we’ll add this class in renderer
  const decl: string[] = [];

  if (s.textColor) decl.push(`color: ${s.textColor};`);
  if (typeof s.radius === "number") decl.push(`border-radius: ${s.radius}px;`);

  const pad = s.padding || {};
  if (pad.top != null) decl.push(`padding-top: ${pad.top}px;`);
  if (pad.right != null) decl.push(`padding-right: ${pad.right}px;`);
  if (pad.bottom != null) decl.push(`padding-bottom: ${pad.bottom}px;`);
  if (pad.left != null) decl.push(`padding-left: ${pad.left}px;`);

  if (!decl.length) return "";

  return `/*${bp}*/ ${sel} { ${decl.join(" ")} }`;
}
