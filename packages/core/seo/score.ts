export type SeoScore = {
  score: number;
  issues: string[];
};

export function scoreSeo(meta: {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
}): SeoScore {
  let score = 100;
  const issues: string[] = [];

  if (!meta.title || meta.title.length < 10) {
    score -= 20;
    issues.push("Title missing or too short");
  }

  if (!meta.description || meta.description.length < 50) {
    score -= 20;
    issues.push("Description missing or too short");
  }

  if (!meta.canonical) {
    score -= 10;
    issues.push("Canonical URL missing");
  }

  if (!meta.ogImage) {
    score -= 10;
    issues.push("OG image missing");
  }

  return { score: Math.max(score, 0), issues };
}
