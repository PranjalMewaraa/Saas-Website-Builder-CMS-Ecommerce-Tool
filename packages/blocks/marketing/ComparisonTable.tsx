import React from "react";

const defaultColumns = ["Starter", "Growth", "Scale"];
const defaultRows = [
  { feature: "Monthly Projects", values: ["5", "25", "Unlimited"] },
  { feature: "Team Members", values: ["1", "5", "Unlimited"] },
  { feature: "Custom Domain", values: ["No", "Yes", "Yes"] },
  { feature: "Priority Support", values: ["No", "No", "Yes"] },
];

export default function ComparisonTableV1(props: any) {
  const {
    title,
    subtitle,
    contentWidth,
    highlightColumn = -1,
    columns = defaultColumns,
    rows = defaultRows,
  } = props || {};

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
              : "1100px";

  return (
    <section className="w-full bg-white py-16">
      <div className="mx-auto px-6" style={{ maxWidth }}>
        {title ? (
          <h2 className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {subtitle ? <p className="mt-2 text-sm text-slate-600">{subtitle}</p> : null}

        <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="min-w-full border-collapse text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Feature</th>
                {columns.map((c: string, i: number) => (
                  <th
                    key={`${c}-${i}`}
                    className={`px-4 py-3 text-left font-semibold ${
                      i === Number(highlightColumn)
                        ? "bg-blue-50 text-blue-800"
                        : "text-slate-700"
                    }`}
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r: any, i: number) => (
                <tr key={`${r.feature || "row"}-${i}`} className="border-t border-slate-200">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.feature}</td>
                  {columns.map((_: string, idx: number) => (
                    <td
                      key={`${i}-${idx}`}
                      className={`px-4 py-3 ${
                        idx === Number(highlightColumn)
                          ? "bg-blue-50 text-blue-900 font-medium"
                          : "text-slate-600"
                      }`}
                    >
                      {Array.isArray(r.values) ? r.values[idx] || "-" : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
