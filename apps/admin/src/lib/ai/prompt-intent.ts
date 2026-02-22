export type PromptIntent = {
  wantsVideo: boolean;
  wantsCountdown: boolean;
  wantsTestimonials: boolean;
  wantsComparison: boolean;
  wantsPremiumTone: boolean;
  wantsDiscountFocus: boolean;
};

const VIDEO_TERMS = ["video", "cinematic", "reel", "motion"];
const COUNTDOWN_TERMS = ["countdown", "drop", "launch", "limited", "flash sale"];
const TESTIMONIAL_TERMS = ["testimonial", "reviews", "social proof", "trusted by"];
const COMPARISON_TERMS = ["compare", "comparison", "vs", "difference"];
const PREMIUM_TERMS = ["luxury", "premium", "high-end", "exclusive"];
const DISCOUNT_TERMS = ["discount", "offer", "sale", "coupon", "off"];

function hasAny(text: string, terms: string[]) {
  return terms.some((t) => text.includes(t));
}

export function inferPromptIntent(raw: string): PromptIntent {
  const text = String(raw || "").toLowerCase();
  return {
    wantsVideo: hasAny(text, VIDEO_TERMS),
    wantsCountdown: hasAny(text, COUNTDOWN_TERMS),
    wantsTestimonials: hasAny(text, TESTIMONIAL_TERMS),
    wantsComparison: hasAny(text, COMPARISON_TERMS),
    wantsPremiumTone: hasAny(text, PREMIUM_TERMS),
    wantsDiscountFocus: hasAny(text, DISCOUNT_TERMS),
  };
}

