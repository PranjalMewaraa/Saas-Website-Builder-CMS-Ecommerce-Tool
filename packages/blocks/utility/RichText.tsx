"use client";

export type RichTextProps = {
  html?: string;
};

const DEFAULT_RICH_TEXT_HTML = `<h2>Tell your story with clarity</h2><p>Use this rich text block to explain value, build trust, and guide customers to action.</p><ul><li>Clear headline and supporting copy</li><li>Use bullets to improve scan-ability</li><li>Add links for key next steps</li></ul><blockquote>Tip: keep paragraphs short and specific for better conversion.</blockquote>`;

export const RichTextDefaults: RichTextProps = {
  html: DEFAULT_RICH_TEXT_HTML,
};

export function RichText({ html }: RichTextProps) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mt-0 prose-h2:text-3xl prose-h3:text-2xl prose-p:leading-7 prose-p:text-slate-700 prose-li:text-slate-700 prose-ul:my-4 prose-ul:pl-5 prose-blockquote:border-l-slate-300 prose-blockquote:text-slate-600 prose-a:font-medium prose-a:text-slate-900 prose-a:underline prose-a:underline-offset-4"
      dangerouslySetInnerHTML={{ __html: html || DEFAULT_RICH_TEXT_HTML }}
    />
  );
}
