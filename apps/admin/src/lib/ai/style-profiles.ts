import type { IndustryKey } from "./site-taxonomy";

export type StyleProfile = {
  heading: string;
  body: string;
  palette: {
    primary: string;
    accent: string;
    surface: string;
    text: string;
  };
  heroTone: string;
};

const FALLBACK_PROFILE: StyleProfile = {
  heading: "system-ui",
  body: "system-ui",
  palette: {
    primary: "#111827",
    accent: "#2563eb",
    surface: "#ffffff",
    text: "#0f172a",
  },
  heroTone: "clean modern",
};

const INDUSTRY_BASE: Record<IndustryKey, StyleProfile> = {
  fashion: {
    heading: "Playfair Display",
    body: "Lato",
    palette: {
      primary: "#111111",
      accent: "#c9a227",
      surface: "#f7f5f2",
      text: "#1f1f1f",
    },
    heroTone: "editorial and premium",
  },
  shoes: {
    heading: "Oswald",
    body: "Inter",
    palette: {
      primary: "#0f172a",
      accent: "#f97316",
      surface: "#ffffff",
      text: "#0f172a",
    },
    heroTone: "performance-focused and energetic",
  },
  jewelry: {
    heading: "Cormorant Garamond",
    body: "Montserrat",
    palette: {
      primary: "#0f172a",
      accent: "#d4af37",
      surface: "#ffffff",
      text: "#111827",
    },
    heroTone: "luxury gallery",
  },
  sports_outdoor: {
    heading: "Bebas Neue",
    body: "Inter",
    palette: {
      primary: "#111827",
      accent: "#f97316",
      surface: "#f8fafc",
      text: "#0f172a",
    },
    heroTone: "rugged and adrenaline",
  },
  automotive: {
    heading: "Rajdhani",
    body: "Inter",
    palette: {
      primary: "#111827",
      accent: "#ef4444",
      surface: "#f8fafc",
      text: "#0f172a",
    },
    heroTone: "performance and utility",
  },
  furniture_home: {
    heading: "Inter",
    body: "Inter",
    palette: {
      primary: "#334155",
      accent: "#a16207",
      surface: "#f8fafc",
      text: "#1f2937",
    },
    heroTone: "showroom-inspired and calm",
  },
  bags_luggage: {
    heading: "Cormorant Garamond",
    body: "Inter",
    palette: {
      primary: "#1e293b",
      accent: "#3b82f6",
      surface: "#f8fafc",
      text: "#111827",
    },
    heroTone: "travel-ready and polished",
  },
  electronics: {
    heading: "Inter",
    body: "Inter",
    palette: {
      primary: "#0f172a",
      accent: "#2563eb",
      surface: "#ffffff",
      text: "#0f172a",
    },
    heroTone: "sleek and high-tech",
  },
  mobile_phones: {
    heading: "Inter",
    body: "Inter",
    palette: {
      primary: "#0f172a",
      accent: "#7c3aed",
      surface: "#ffffff",
      text: "#111827",
    },
    heroTone: "flagship launch style",
  },
  grocery: {
    heading: "Lora",
    body: "Open Sans",
    palette: {
      primary: "#14532d",
      accent: "#ea580c",
      surface: "#f8fafc",
      text: "#1f2937",
    },
    heroTone: "fresh and trustworthy",
  },
  beauty_personal_care: {
    heading: "Playfair Display",
    body: "Lato",
    palette: {
      primary: "#111827",
      accent: "#db2777",
      surface: "#fff7fb",
      text: "#1f2937",
    },
    heroTone: "clean beauty studio",
  },
  pharmacy: {
    heading: "Inter",
    body: "Inter",
    palette: {
      primary: "#0f172a",
      accent: "#0284c7",
      surface: "#f8fafc",
      text: "#111827",
    },
    heroTone: "clinical and trust-first",
  },
  home_kitchen: {
    heading: "Baskerville",
    body: "Inter",
    palette: {
      primary: "#334155",
      accent: "#b45309",
      surface: "#fffdf7",
      text: "#1f2937",
    },
    heroTone: "warm utility and inspiration",
  },
  toys_games: {
    heading: "Fredoka",
    body: "Quicksand",
    palette: {
      primary: "#1d4ed8",
      accent: "#f59e0b",
      surface: "#ffffff",
      text: "#0f172a",
    },
    heroTone: "playful and colorful",
  },
  books: {
    heading: "Crimson Text",
    body: "Inter",
    palette: {
      primary: "#334155",
      accent: "#9f1239",
      surface: "#fffdf7",
      text: "#1f2937",
    },
    heroTone: "cozy and discovery-first",
  },
  pet_supplies: {
    heading: "Poppins",
    body: "Inter",
    palette: {
      primary: "#1e3a8a",
      accent: "#f59e0b",
      surface: "#ffffff",
      text: "#111827",
    },
    heroTone: "friendly and trust-driven",
  },
  digital_products: {
    heading: "Inter",
    body: "Inter",
    palette: {
      primary: "#0f172a",
      accent: "#7c3aed",
      surface: "#ffffff",
      text: "#111827",
    },
    heroTone: "conversion-focused and modern",
  },
  handmade_crafts: {
    heading: "Lora",
    body: "Open Sans",
    palette: {
      primary: "#7c2d12",
      accent: "#b45309",
      surface: "#fffaf0",
      text: "#1f2937",
    },
    heroTone: "artisan and warm",
  },
  hardware_tools: {
    heading: "Oswald",
    body: "Inter",
    palette: {
      primary: "#111827",
      accent: "#ea580c",
      surface: "#f8fafc",
      text: "#0f172a",
    },
    heroTone: "practical and spec-driven",
  },
  generic: FALLBACK_PROFILE,
};

export function getStyleProfile(industry: IndustryKey) {
  return INDUSTRY_BASE[industry] || FALLBACK_PROFILE;
}
