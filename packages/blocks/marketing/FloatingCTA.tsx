import React from "react";

export default function FloatingCTAV1(props: any) {
  const {
    text = "Need help choosing?",
    buttonText = "Talk to us",
    buttonHref = "/contact",
    position = "bottom-right",
  } = props || {};

  const posClass = position === "bottom-left" ? "left-4" : "right-4";

  return (
    <section className={`fixed bottom-4 ${posClass} z-40`}>
      <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-lg">
        <span className="text-xs text-slate-700">{text}</span>
        <a
          href={buttonHref || "#"}
          className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
        >
          {buttonText}
        </a>
      </div>
    </section>
  );
}
