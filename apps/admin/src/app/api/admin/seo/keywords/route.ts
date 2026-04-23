import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { text } = await req.json();

  const words = text
    .toLowerCase()
    .split(/\W+/)
    .filter((w: string | any[]) => w.length > 4);
  const freq: any = {};

  words.forEach((w: string | number) => (freq[w] = (freq[w] || 0) + 1));

  const suggestions = Object.entries(freq)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 10)
    .map(([w]) => w);

  return NextResponse.json({ ok: true, keywords: suggestions });
}
