"use client";

import { useEffect, useMemo, useState } from "react";

type DocNode = {
  id: string;
  title: string;
  content: string;
  subsections: DocNode[];
};

type DocsData = {
  title: string;
  sections: DocNode[];
};

function flatten(
  nodes: DocNode[],
  depth = 0,
): Array<DocNode & { depth: number }> {
  const out: Array<DocNode & { depth: number }> = [];
  for (const node of nodes) {
    out.push({ ...node, depth });
    out.push(...flatten(node.subsections || [], depth + 1));
  }
  return out;
}

function SectionContent({ text }: { text: string }) {
  const lines = text.split("\n");
  const blocks: Array<
    | { type: "p"; text: string }
    | { type: "label"; text: string }
    | { type: "ul"; items: string[] }
    | { type: "ol"; items: string[] }
  > = [];
  let forcedListMode: null | "ol" | "ul" = null;

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i] ?? "";
    const line = raw.trim();
    if (!line) {
      i++;
      continue;
    }

    const next = (lines[i + 1] ?? "").trim();
    const isLabel =
      /:$/.test(line) && (/^- /.test(next) || /^\d+\.\s+/.test(next));
    if (isLabel) {
      const label = line.replace(/:$/, "");
      blocks.push({ type: "label", text: label });
      const lower = label.toLowerCase();
      if (lower === "steps") forcedListMode = "ol";
      else if (lower === "pointers") forcedListMode = "ul";
      else forcedListMode = null;
      i++;
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^- /.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^- /, ""));
        i++;
      }
      blocks.push({ type: forcedListMode || "ul", items });
      forcedListMode = null;
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test((lines[i] ?? "").trim())) {
        items.push((lines[i] ?? "").trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: forcedListMode || "ol", items });
      forcedListMode = null;
      continue;
    }

    const para: string[] = [line];
    i++;
    while (i < lines.length) {
      const l = (lines[i] ?? "").trim();
      if (!l || /^- /.test(l) || /^\d+\.\s+/.test(l) || /:$/.test(l)) break;
      para.push(l);
      i++;
    }
    blocks.push({ type: "p", text: para.join(" ") });
    forcedListMode = null;
  }

  return (
    <div className="space-y-4 text-sm leading-7 text-gray-700">
      {blocks.map((b, idx) => {
        if (b.type === "label") {
          const displayText =
            b.text.toLowerCase() === "pointers" ? "Please note" : b.text;
          return (
            <h5 key={idx} className="text-sm font-semibold text-gray-900 mt-2">
              {displayText}
            </h5>
          );
        }
        if (b.type === "ul") {
          return (
            <ul key={idx} className="list-disc pl-5 space-y-1">
              {b.items.map((item, n) => (
                <li key={n}>{item}</li>
              ))}
            </ul>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={idx} className="list-decimal pl-5 space-y-1">
              {b.items.map((item, n) => (
                <li key={n}>{item}</li>
              ))}
            </ol>
          );
        }
        return <p key={idx}>{b.text}</p>;
      })}
    </div>
  );
}

function DocSection({ node, level = 2 }: { node: DocNode; level?: number }) {
  const HeadingTag = (level === 2 ? "h2" : level === 3 ? "h3" : "h4") as
    | "h2"
    | "h3"
    | "h4";
  const headingClass =
    level === 2
      ? "text-2xl font-semibold tracking-tight text-gray-900"
      : level === 3
        ? "text-xl font-semibold text-gray-900"
        : "text-lg font-semibold text-gray-900";

  return (
    <section id={node.id} className="scroll-mt-24 space-y-4">
      <HeadingTag className={headingClass}>{node.title}</HeadingTag>
      {node.content ? <SectionContent text={node.content} /> : null}
      {node.subsections?.length ? (
        <div className="space-y-10 pt-2">
          {node.subsections.map((sub) => (
            <DocSection
              key={sub.id}
              node={sub}
              level={Math.min(level + 1, 4)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

export default function DocsClient({ data }: { data: DocsData }) {
  const anchors = useMemo(() => flatten(data.sections || []), [data.sections]);
  const [activeId, setActiveId] = useState<string>(anchors[0]?.id || "");

  useEffect(() => {
    if (!anchors.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -65% 0px",
        threshold: [0.1, 0.3, 0.6],
      },
    );

    for (const a of anchors) {
      const el = document.getElementById(a.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [anchors]);

  return (
    <div className="min-h-[90vh] pt-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {data.title || "Documentation"}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Product docs with section tracker and in-page progress.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 self-start">
            <div className="max-h-[calc(100vh-4rem)] overflow-auto rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sections
              </div>
              <nav className="space-y-1">
                {anchors.map((a) => {
                  const active = activeId === a.id;
                  return (
                    <a
                      key={a.id}
                      href={`#${a.id}`}
                      className={`block rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-indigo-50 text-indigo-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50"
                      }`}
                      style={{ marginLeft: `${a.depth * 12}px` }}
                    >
                      {a.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="space-y-14">
              {data.sections?.map((section) => (
                <DocSection key={section.id} node={section} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
