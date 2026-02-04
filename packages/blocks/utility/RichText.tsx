"use client";

export type RichTextProps = {
  html?: string;
};

export const RichTextDefaults: RichTextProps = {
  html: `<h2>Your heading</h2><p>Your paragraph text here.</p>`,
};

export function RichText({ html }: RichTextProps) {
  return (
    <div
      className="prose prose-slate max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:font-medium prose-a:text-slate-900 prose-a:underline-offset-4"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
