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
      className="prose max-w-none"
      dangerouslySetInnerHTML={{ __html: html || "" }}
    />
  );
}
