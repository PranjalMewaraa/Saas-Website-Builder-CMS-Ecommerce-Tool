export type IndustryKey =
  | "fashion"
  | "shoes"
  | "jewelry"
  | "sports_outdoor"
  | "automotive"
  | "furniture_home"
  | "bags_luggage"
  | "electronics"
  | "mobile_phones"
  | "grocery"
  | "beauty_personal_care"
  | "pharmacy"
  | "home_kitchen"
  | "toys_games"
  | "books"
  | "pet_supplies"
  | "digital_products"
  | "handmade_crafts"
  | "hardware_tools"
  | "generic";

export type Archetype = {
  id: string;
  name: string;
  summary: string;
  details?: {
    typography: string;
    layout: string;
    colorSystem: string;
    ux: string;
    designFocus: string;
  };
};

export type IndustryTaxonomy = {
  key: IndustryKey;
  label: string;
  archetypes: Archetype[];
};

export type IaPageTemplate =
  | "story"
  | "collections"
  | "catalog"
  | "faq"
  | "lookbook"
  | "size_guide"
  | "comparison"
  | "support"
  | "blog";

export type IaPageDefinition = {
  slug: string;
  title: string;
  template: IaPageTemplate;
};

type ArchetypeDetails = NonNullable<Archetype["details"]>;

const DEFAULT_DETAILS: ArchetypeDetails = {
  typography: "Balanced heading + readable body text for strong clarity.",
  layout: "Clean modular sections with clear hierarchy and spacing.",
  colorSystem: "Brand-led neutral base with one strong accent color.",
  ux: "Simple navigation, fast scanning, and clear calls to action.",
  designFocus: "Conversion-first presentation with easy customization.",
};

const ARCHETYPE_DETAILS_BY_ID: Record<string, ArchetypeDetails> = {
  minimalist_muse: {
    typography: "Elegant serif headings with light sans-serif body text.",
    layout: "Editorial asymmetry with generous whitespace and breathing room.",
    colorSystem: "Monochrome neutrals with a subtle premium accent.",
    ux: "Story-led flow with visual chapters and curated pathways.",
    designFocus: "Luxury, premium imagery, and refined product presentation.",
  },
  urban_edge: {
    typography: "Bold uppercase display styles with dense modern sans.",
    layout: "Hard-edged modular blocks and high-contrast segmentation.",
    colorSystem: "Dark base with neon accents for high visual energy.",
    ux: "Fast-paced browsing with drop-focused highlights and urgency.",
    designFocus: "Streetwear attitude, motion, and launch-driven conversion.",
  },
  eco_conscious_collective: {
    typography: "Friendly rounded text styles with natural readability.",
    layout: "Single-column storytelling that transitions into product grids.",
    colorSystem: "Earth tones with calm natural contrast.",
    ux: "Transparency-first shopping with impact-oriented badges.",
    designFocus: "Sustainability, authenticity, and trust signaling.",
  },
  gaming_rig: {
    typography: "Futuristic display headings with compact technical body text.",
    layout: "Dashboard-like containers and compartmentalized product zones.",
    colorSystem: "Dark surfaces with RGB-inspired neon accents.",
    ux: "Spec-heavy comparison and compatibility-focused navigation.",
    designFocus: "Performance, excitement, and technical confidence.",
  },
  trust_first: {
    typography: "Safe, high-legibility typography for broad audiences.",
    layout: "Structured z-pattern sections alternating proof and offer blocks.",
    colorSystem: "Professional blue/neutral palette for credibility.",
    ux: "Proof-driven conversion with testimonials and trust rails.",
    designFocus: "Reliability, clarity, and low-friction decision flow.",
  },
  bento_grid: {
    typography: "Modern sans system with clear heading hierarchy.",
    layout: "Card-based bento composition for high scanability.",
    colorSystem: "Neutral base with sharp accent highlights.",
    ux: "Quick visual parsing with modular content grouping.",
    designFocus: "Versatile modernity and fast setup.",
  },
};

function guessDetails(industry: IndustryKey, archetypeId: string): ArchetypeDetails {
  if (ARCHETYPE_DETAILS_BY_ID[archetypeId]) return ARCHETYPE_DETAILS_BY_ID[archetypeId];

  const id = archetypeId.toLowerCase();
  const byKeyword: Partial<ArchetypeDetails> = {};
  const byIndustry: Partial<ArchetypeDetails> = {
    fashion: {
      typography: "Editorial headline style with modern readable body text.",
      layout: "Lookbook-driven composition with strong visual rhythm.",
      colorSystem: "Brand-led fashion palette with premium contrast.",
      ux: "Collection-first browsing with style-led discovery.",
      designFocus: "Visual storytelling that sells identity and lifestyle.",
    },
    shoes: {
      typography: "Athletic or premium heading tone with clear body hierarchy.",
      layout: "Fit-and-performance friendly layout with strong product focus.",
      colorSystem: "Contrast-forward palette optimized for footwear visuals.",
      ux: "Size, fit, and review clarity to reduce decision friction.",
      designFocus: "Fast comparison between style, comfort, and performance.",
    },
    jewelry: {
      typography: "Elegant display typography with refined supporting text.",
      layout: "Gallery-like sections emphasizing hero product presentation.",
      colorSystem: "Luxury-leaning palette with metallic or gemstone accents.",
      ux: "Trust-first flow highlighting authenticity and craftsmanship.",
      designFocus: "Premium perception with detail-rich visual depth.",
    },
    sports_outdoor: {
      typography: "High-impact headings with quick-scan technical labels.",
      layout: "Action-led modules mixing specs and lifestyle visuals.",
      colorSystem: "Rugged contrast palette for performance confidence.",
      ux: "Condition-based navigation and durability-first buying path.",
      designFocus: "Utility + aspiration balance for outdoor conversion.",
    },
    automotive: {
      typography: "Technical-modern typography with strong hierarchy.",
      layout: "Spec-oriented grids with fitment and compatibility emphasis.",
      colorSystem: "Industrial dark neutrals with high-visibility accents.",
      ux: "Part-selection clarity and trust in fitment decisions.",
      designFocus: "Performance credibility and precision product mapping.",
    },
    furniture_home: {
      typography: "Warm editorial headings with calm readable body text.",
      layout: "Showroom-style sections with room-context storytelling.",
      colorSystem: "Interior-inspired palettes balancing warmth and clarity.",
      ux: "Space-fit and style discovery with guided inspiration.",
      designFocus: "Help users imagine products inside real spaces.",
    },
    bags_luggage: {
      typography: "Travel-lifestyle typography with practical detail text.",
      layout: "Utility modules paired with premium lifestyle imagery.",
      colorSystem: "Material-led tones with strong accent highlights.",
      ux: "Capacity, fit, and use-case-first product navigation.",
      designFocus: "Function-meets-style presentation for quick decisions.",
    },
    electronics: {
      typography: "Modern technical sans hierarchy with compact labels.",
      layout: "Feature storytelling mixed with benchmark/spec modules.",
      colorSystem: "Clean tech neutrals with vivid action accents.",
      ux: "Comparison and compatibility-first buying experience.",
      designFocus: "Translate specs into tangible buying confidence.",
    },
    mobile_phones: {
      typography: "Launch-ready product typography with strong feature hierarchy.",
      layout: "Scroll-led reveal sections and conversion-focused product zones.",
      colorSystem: "Device-led palette with premium contrast behavior.",
      ux: "Model comparison, camera proof, and performance clarity.",
      designFocus: "Make feature differences instantly understandable.",
    },
    grocery: {
      typography: "Friendly high-legibility text optimized for fast repeat shopping.",
      layout: "Dense but organized shelves with quick-add conversion points.",
      colorSystem: "Fresh food-inspired palette with trust-first contrast.",
      ux: "Speed-first list browsing, filtering, and checkout momentum.",
      designFocus: "Reorder efficiency and trust in freshness/quality.",
    },
    beauty_personal_care: {
      typography: "Brand-expressive beauty typography with clear ingredient labels.",
      layout: "Visual-led PDP flow combining proof and aspiration.",
      colorSystem: "Product-mood palette from clinical clean to glamour.",
      ux: "Concern-based discovery and routine-building guidance.",
      designFocus: "Confidence through proof, texture, and outcomes.",
    },
    pharmacy: {
      typography: "Clinical readability with strict information hierarchy.",
      layout: "Clear, calm modules minimizing cognitive load.",
      colorSystem: "Medical trust palette with clean contrast.",
      ux: "Safety-first navigation and straightforward action flow.",
      designFocus: "Clarity, reliability, and compliance-friendly presentation.",
    },
    home_kitchen: {
      typography: "Warm utility typography balancing inspiration and specs.",
      layout: "Recipe/process-led sections with practical comparison blocks.",
      colorSystem: "Home-inspired tones with performance-ready contrast.",
      ux: "Use-case navigation from daily needs to premium tools.",
      designFocus: "Bridge lifestyle aspiration with functional confidence.",
    },
    toys_games: {
      typography: "Playful but readable type pairing for all age groups.",
      layout: "Interactive cards with guided discovery pathways.",
      colorSystem: "Energetic color systems tuned to category mood.",
      ux: "Age/interest-first discovery with quick visual understanding.",
      designFocus: "Drive joy, engagement, and confident gifting decisions.",
    },
    books: {
      typography: "Reading-friendly text rhythm with strong title hierarchy.",
      layout: "Discovery-first catalog flow by mood, genre, or list.",
      colorSystem: "Quiet editorial palette supporting long browse sessions.",
      ux: "Intent-led discovery with series/ranking context.",
      designFocus: "Increase discoverability without overwhelming readers.",
    },
    pet_supplies: {
      typography: "Friendly trust-focused typography for broad households.",
      layout: "Essentials-first layouts with repeat-buy clarity.",
      colorSystem: "Warm approachable tones with reliable contrast.",
      ux: "Pet-type and need-based navigation with low friction.",
      designFocus: "Support repeat purchases and care confidence.",
    },
    digital_products: {
      typography: "Modern conversion typography for offer and value clarity.",
      layout: "Landing-page-first structure with strong CTA zones.",
      colorSystem: "SaaS-style neutral base with vivid call-to-action accents.",
      ux: "Offer-first path with quick trust and outcome framing.",
      designFocus: "Maximize activation from first visit.",
    },
    handmade_crafts: {
      typography: "Artisan-friendly type pairing with human warm tone.",
      layout: "Story + craft process modules around product cards.",
      colorSystem: "Natural textured palette with handmade character.",
      ux: "Maker story and uniqueness-driven discovery flow.",
      designFocus: "Emphasize authenticity and craftsmanship value.",
    },
    hardware_tools: {
      typography: "Utility-focused headings with clear technical labeling.",
      layout: "Specification and compatibility-oriented grid system.",
      colorSystem: "Industrial palette with high-visibility action accents.",
      ux: "Task-first navigation with strong filter and compare behavior.",
      designFocus: "Help users pick the right tool quickly and safely.",
    },
    generic: DEFAULT_DETAILS,
  }[industry] || DEFAULT_DETAILS;

  if (id.includes("dark") || id.includes("neo_gothic") || id.includes("gaming")) {
    byKeyword.colorSystem = "Dark-first palette with bright accents for strong contrast and focus.";
    byKeyword.designFocus = "High-energy visual depth with premium dark-mode aesthetics.";
  }
  if (id.includes("minimal") || id.includes("clean") || id.includes("scandi")) {
    byKeyword.layout = "Open minimalist sections with generous spacing and low clutter.";
    byKeyword.typography = "Calm, readable typography with restrained visual noise.";
  }
  if (id.includes("dashboard") || id.includes("tech") || id.includes("deep")) {
    byKeyword.ux = "Data-forward navigation with comparison, specs, and compatibility clarity.";
  }
  if (id.includes("luxury") || id.includes("heritage") || id.includes("elite")) {
    byKeyword.designFocus = "Premium storytelling and detail-centric product framing.";
  }
  if (id.includes("eco") || id.includes("sustainable")) {
    byKeyword.colorSystem = "Earthy natural palette with soft contrast and organic accents.";
    byKeyword.designFocus = "Sustainability storytelling with transparency and material trust.";
  }
  if (id.includes("retro") || id.includes("vintage")) {
    byKeyword.typography = "Retro-inspired headings with nostalgic supporting text rhythm.";
    byKeyword.colorSystem = "Aged warm tones with character-driven accent colors.";
  }
  if (id.includes("story") || id.includes("editorial")) {
    byKeyword.layout = "Narrative-first section flow with chapter-like progression.";
  }
  if (id.includes("search")) {
    byKeyword.ux = "Search-led IA prioritizing speed and precise discovery.";
  }
  if (id.includes("split")) {
    byKeyword.layout = "Balanced split-screen composition for dual-focus messaging.";
  }
  if (id.includes("bento")) {
    byKeyword.layout = "Card-based bento structure optimized for scanning mixed content.";
  }
  if (id.includes("cinematic") || id.includes("full_bleed")) {
    byKeyword.designFocus = "Immersive full-bleed visuals and emotional storytelling impact.";
  }
  if (id.includes("bold_typographic")) {
    byKeyword.typography = "Statement-heavy display typography with high hierarchy contrast.";
  }
  if (id.includes("organic")) {
    byKeyword.layout = "Fluid curved section transitions with calm pacing.";
  }

  return {
    ...DEFAULT_DETAILS,
    ...byIndustry,
    ...byKeyword,
  };
}

const AI_SITE_TAXONOMY_BASE: IndustryTaxonomy[] = [
  {
    key: "fashion",
    label: "Fashion",
    archetypes: [
      { id: "minimalist_muse", name: "Minimalist Muse", summary: "Premium editorial look with clean white space." },
      { id: "urban_edge", name: "Urban Edge", summary: "Streetwear style with bold dark sections and high contrast." },
      { id: "eco_conscious_collective", name: "Eco-Conscious Collective", summary: "Sustainable brand storytelling with earthy tones." },
      { id: "classic_tailor", name: "Classic Tailor", summary: "Structured formal layout with strong product filters." },
      { id: "candy_shop", name: "Candy Shop", summary: "Fast fashion style with playful colors and dense product browsing." },
      { id: "avant_garde_studio", name: "Avant-Garde Studio", summary: "Experimental art-like layout with dramatic visual mood." },
      { id: "vintage_vault", name: "Vintage Vault", summary: "Retro resale experience with warm, nostalgic style." },
      { id: "sporty_chic", name: "Sporty Chic", summary: "Athleisure style with dynamic movement-led sections." },
      { id: "boho_dreamer", name: "Boho Dreamer", summary: "Soft lifestyle-led flow with airy and artistic sections." },
      { id: "department_powerhouse", name: "Department Powerhouse", summary: "Mass-market high-density catalog with quick navigation." },
    ],
  },
  {
    key: "shoes",
    label: "Shoes",
    archetypes: [
      { id: "sneakerhead_drop", name: "Sneakerhead Drop", summary: "Hype drop design with launch and release energy." },
      { id: "performance_pro", name: "Performance Pro", summary: "Running-focused style with technical buying guidance." },
      { id: "italian_cobbler", name: "Italian Cobbler", summary: "Luxury handmade storytelling with material detail focus." },
      { id: "outdoor_explorer", name: "Outdoor Explorer", summary: "Rugged hiking and durability-first shopping flow." },
      { id: "red_carpet", name: "Red Carpet", summary: "Glamorous occasion-based heels and evening lookbook style." },
      { id: "daily_driver", name: "Daily Driver", summary: "Comfort-first everyday shopping with review-heavy cards." },
      { id: "skate_park", name: "Skate Park", summary: "Raw youth-focused style with zine-like visual energy." },
      { id: "orthopedic_modern", name: "Orthopedic Modern", summary: "Clear health-first, accessibility-oriented shoe shopping." },
      { id: "vegan_tread", name: "Vegan Tread", summary: "Eco-friendly footwear layout with material transparency." },
      { id: "kids_corner", name: "Kids' Corner", summary: "Playful family-focused storefront with easy size discovery." },
    ],
  },
  {
    key: "jewelry",
    label: "Jewelry",
    archetypes: [
      { id: "heritage_house", name: "Heritage House", summary: "High-jewelry luxury with dark gallery presentation." },
      { id: "artisan_studio", name: "Artisan Studio", summary: "Handcrafted jewelry story with textured material visuals." },
      { id: "minimalist_everyday", name: "Minimalist Everyday", summary: "Clean daily-wear jewelry with bright modern grid." },
      { id: "alternative_bride", name: "Alternative Bride", summary: "Custom engagement journey with romantic visual storytelling." },
      { id: "crystal_cosmic", name: "Crystal & Cosmic", summary: "Spiritual gemstone shopping with celestial style." },
      { id: "mens_statement", name: "Men's Statement", summary: "Bold masculine watches and technical spec presentation." },
      { id: "vintage_heirloom", name: "Vintage Heirloom", summary: "Antique catalog with authenticity-first trust cues." },
      { id: "fashion_play", name: "Fashion Play", summary: "Trendy colorful social-first jewelry merchandising." },
      { id: "ethical_diamond", name: "Ethical Diamond", summary: "Lab-grown premium positioning with comparison clarity." },
      { id: "charmed_life", name: "Charmed Life", summary: "Personalized charms flow with playful custom builder feel." },
    ],
  },
  {
    key: "sports_outdoor",
    label: "Sports & Outdoor",
    archetypes: [
      { id: "adrenaline_peak", name: "Adrenaline Peak", summary: "Extreme sports style with immersive action visuals." },
      { id: "wellness_retreat", name: "Wellness Retreat", summary: "Calm wellness-first design for yoga and activewear." },
      { id: "tactical_command", name: "Tactical Command", summary: "Spec-heavy tactical layout for survival and camping gear." },
      { id: "court_king", name: "Court King", summary: "Fast-paced team-sport design with performance cues." },
      { id: "deep_blue", name: "Deep Blue", summary: "Water-sport style with flowing sections and fresh colors." },
      { id: "peloton_power", name: "Peloton Power", summary: "Cycling performance format with metric-focused trust." },
      { id: "backyard_basecamp", name: "Backyard Basecamp", summary: "Family camping look with warm outdoor storytelling." },
      { id: "marathon_hub", name: "Marathoner's Hub", summary: "Runner-focused catalog with performance metric highlights." },
      { id: "street_athlete", name: "Street Athlete", summary: "Urban raw style for skate/BMX movement-heavy brands." },
      { id: "sustainable_scout", name: "Sustainable Scout", summary: "Eco-outdoor style with traceability and material focus." },
    ],
  },
  {
    key: "automotive",
    label: "Automotive",
    archetypes: [
      { id: "garage_pro", name: "Garage Pro", summary: "Performance-first layout with fitment confidence." },
      { id: "showroom_modern", name: "Showroom Modern", summary: "Premium visuals for parts and accessories." },
      { id: "utility_catalog", name: "Utility Catalog", summary: "Search and filter-heavy conversion path." },
    ],
  },
  {
    key: "furniture_home",
    label: "Furniture & Home Decor",
    archetypes: [
      { id: "scandinavian_scandi", name: "Scandinavian Scandi", summary: "Light minimalist showroom with clean room storytelling." },
      { id: "industrial_loft", name: "Industrial Loft", summary: "Urban texture-rich design with material breakdown feel." },
      { id: "mid_century_modern", name: "Mid-Century Modern", summary: "Retro-modern blend with warm editorial product rhythm." },
      { id: "luxe_manor", name: "Luxe Manor", summary: "Traditional luxury interiors with rich premium tone." },
      { id: "boho_chic", name: "Boho Chic", summary: "Eclectic lifestyle style with organic visual flow." },
      { id: "smart_space", name: "Smart Space", summary: "Small-space practical layout with fit/measure emphasis." },
      { id: "artisanal_pottery", name: "Artisanal Pottery", summary: "Handmade texture-focused presentation for craft decor." },
      { id: "coastal_escape", name: "Coastal Escape", summary: "Bright breezy home style with soft coastal visuals." },
      { id: "tech_home", name: "Tech-Home", summary: "Futuristic smart home style with modern visual depth." },
      { id: "kids_kingdom", name: "Kids' Kingdom", summary: "Playful nursery and kids furniture experience." },
    ],
  },
  {
    key: "bags_luggage",
    label: "Bags & Luggage",
    archetypes: [
      { id: "jetset_elite", name: "Jetset Elite", summary: "Luxury travel branding with cinematic premium visuals." },
      { id: "nomad_tech", name: "Nomad Tech", summary: "Commuter backpack layout with technical pocket storytelling." },
      { id: "heritage_carry", name: "Heritage Carry", summary: "Classic leather goods story with timeless visuals." },
      { id: "ultralight_hiker", name: "Ultralight Hiker", summary: "Adventure utility style with weight/performance trust." },
      { id: "street_icon", name: "Street Icon", summary: "Bold youth-focused style with social proof energy." },
      { id: "executive_briefcase", name: "Executive Briefcase", summary: "Professional clean design for business bags." },
      { id: "eco_carrier", name: "Eco-Carrier", summary: "Sustainable bag story with impact-first merchandising." },
      { id: "weekend_wanderer", name: "Weekend Wanderer", summary: "Travel lifestyle merchandising for quick getaways." },
      { id: "haute_couture", name: "Haute Couture", summary: "Exclusive handbag gallery with high-fashion tone." },
      { id: "kids_adventure", name: "Kids' Adventure", summary: "Playful school bag flow with customization vibe." },
    ],
  },
  {
    key: "electronics",
    label: "Electronics",
    archetypes: [
      { id: "silicon_valley", name: "Silicon Valley", summary: "Premium clean tech style with feature storytelling." },
      { id: "gaming_rig", name: "Gaming Rig", summary: "RGB neon dashboard for high-performance products." },
      { id: "audiophile_lounge", name: "Audiophile's Lounge", summary: "Rich sensory design for hi-fi and audio gear." },
      { id: "home_cinema", name: "Home Cinema", summary: "Immersive dark visual experience for TVs and media." },
      { id: "professional_creative", name: "Professional Creative", summary: "Tool-to-result split layout for creators and pros." },
      { id: "smart_home_hub", name: "Smart Home Hub", summary: "Friendly connected-home catalog grouped by room." },
      { id: "vintage_tech", name: "Vintage Tech", summary: "Retro-tech style with transparent condition grading." },
      { id: "mobile_life", name: "Mobile Life", summary: "Accessory-first vibrant catalog with compatibility filters." },
      { id: "deep_tech", name: "Deep Tech", summary: "Data-heavy engineering layout with benchmark focus." },
      { id: "eco_electronics", name: "Eco-Electronics", summary: "Sustainable tech style with repairability messaging." },
    ],
  },
  {
    key: "mobile_phones",
    label: "Mobile Phones",
    archetypes: [
      { id: "flagship_launch", name: "Flagship Launch", summary: "Premium launch experience with cinematic product reveals." },
      { id: "photography_first", name: "Photography First", summary: "Camera-first visual storytelling with sample-led proof." },
      { id: "budget_hero", name: "Budget Hero", summary: "Value-driven layout with clear highlights and trade-in cues." },
      { id: "mobile_gamer", name: "Mobile Gamer", summary: "Dark high-performance dashboard for gaming phones." },
      { id: "enterprise_pro", name: "Enterprise Pro", summary: "Professional productivity layout with security focus." },
      { id: "social_influencer", name: "Social Influencer", summary: "Creator-first vertical feed style with bundles." },
      { id: "sustainability_phone", name: "Sustainability Phone", summary: "Repairable ethical phone story with transparency." },
      { id: "rugged_workhorse", name: "Rugged Workhorse", summary: "Durability-first presentation for tough environments." },
      { id: "minimalist_phone", name: "Minimalist Phone", summary: "Simple distraction-free interface and messaging." },
      { id: "refurbished_market", name: "Refurbished Market", summary: "Trust-first refurbished marketplace style." },
    ],
  },
  {
    key: "grocery",
    label: "Grocery",
    archetypes: [
      { id: "fresh_farm", name: "Fresh Farm", summary: "Organic local produce experience with trust and freshness cues." },
      { id: "hyper_fast", name: "Hyper-Fast", summary: "Ultra-fast convenience grocery with one-tap add flow." },
      { id: "gourmet_pantry", name: "Gourmet Pantry", summary: "Premium food storytelling with recipe-led shopping." },
      { id: "bulk_saver", name: "Bulk Saver", summary: "Value-heavy wholesale style with dense listings." },
      { id: "wellness_lab", name: "Wellness Lab", summary: "Dietary filter-first health shopping experience." },
      { id: "artisan_bakery", name: "Artisan Bakery", summary: "Warm bakery-first flow with recurring order style." },
      { id: "global_spice", name: "Global Spice", summary: "Culture-led colorful grocery organized by region." },
      { id: "eco_refill", name: "Eco-Refill", summary: "Zero-waste style with sustainability impact cues." },
      { id: "family_staples", name: "Family Staples", summary: "Search-first household essentials and trust badges." },
      { id: "meal_kit_prep", name: "Meal Kit Prep", summary: "Instructional meal prep flow with serving controls." },
    ],
  },
  {
    key: "beauty_personal_care",
    label: "Beauty & Personal Care",
    archetypes: [
      { id: "clean_beauty", name: "Clean Beauty", summary: "Soft ingredient-first beauty storefront with purity cues." },
      { id: "clinical_dermatologist", name: "Clinical Dermatologist", summary: "Science-backed skincare with clear evidence style." },
      { id: "glamour_studio", name: "Glamour Studio", summary: "High-gloss makeup style with visual impact." },
      { id: "mens_grooming", name: "Men's Grooming", summary: "Rugged minimal routine-led grooming flow." },
      { id: "genz_vibe", name: "Gen-Z Vibe", summary: "Playful social-first beauty shopping experience." },
      { id: "apothecary", name: "Apothecary", summary: "Herbal old-world visual style with concern-based shopping." },
      { id: "inclusive_glow", name: "Inclusive Glow", summary: "Diverse skin-tone focused beauty presentation." },
      { id: "salon_pro", name: "Salon Pro", summary: "Professional haircare and tool-first split layout." },
      { id: "eco_minimalist", name: "Eco-Minimalist", summary: "Minimal refill and low-waste beauty flow." },
      { id: "fragrance_library", name: "Fragrance Library", summary: "Mood-led perfume browsing with scent storytelling." },
    ],
  },
  {
    key: "pharmacy",
    label: "Pharmacy",
    archetypes: [
      { id: "clinical_care", name: "Clinical Care", summary: "Safe, clear, accessibility-first design." },
      { id: "wellness_plus", name: "Wellness Plus", summary: "Routine and supplement-led catalog." },
      { id: "family_health", name: "Family Health", summary: "Trust-led essentials and quick reorder flow." },
    ],
  },
  {
    key: "home_kitchen",
    label: "Home & Kitchen",
    archetypes: [
      { id: "chefs_atelier", name: "Chef's Atelier", summary: "Professional kitchen tools with spec-focused clarity." },
      { id: "slow_living", name: "Slow Living", summary: "Artisan home storytelling with organic visual flow." },
      { id: "smart_sous_chef", name: "Smart Sous-Chef", summary: "Connected appliance shopping with smart-home cues." },
      { id: "bakers_corner", name: "Baker's Corner", summary: "Whimsical baking-focused merchandising with recipe flow." },
      { id: "caffeine_station", name: "Caffeine Station", summary: "Coffee and tea sensory design with brew guides." },
      { id: "scandi_utility", name: "Scandi-Utility", summary: "Organized storage-focused minimalist utility design." },
      { id: "entertainers_table", name: "Entertainer's Table", summary: "Hosting lookbook style with complete-the-set cues." },
      { id: "eco_kitchen", name: "Eco-Kitchen", summary: "Sustainable kitchen style with material transparency." },
      { id: "family_feast", name: "Family Feast", summary: "High-energy family cooking focus with durable products." },
      { id: "modern_homestead", name: "Modern Homestead", summary: "Traditional tools and how-to knowledge-driven flow." },
    ],
  },
  {
    key: "toys_games",
    label: "Toys & Games",
    archetypes: [
      { id: "preschool_playground", name: "Preschool Playground", summary: "Friendly early-learning toy discovery flow." },
      { id: "tabletop_tavern", name: "Tabletop Tavern", summary: "RPG and board-game depth with mechanic-first filters." },
      { id: "brick_builder", name: "Brick Builder", summary: "Construction toy focus with piece-count guidance." },
      { id: "hobbyist_hangar", name: "Hobbyist Hangar", summary: "Technical hobby model catalog with parts clarity." },
      { id: "action_hero", name: "Action Hero", summary: "Collectible-heavy dramatic toy merchandising." },
      { id: "digital_dojo", name: "Digital Dojo", summary: "Gaming gear with dark futuristic interaction style." },
      { id: "imagination_station", name: "Imagination Station", summary: "Roleplay and doll worlds with storybook feel." },
      { id: "outdoor_adventurer", name: "Outdoor Adventurer", summary: "Active-play layout with power and range indicators." },
      { id: "steam_lab", name: "Steam Lab", summary: "Educational toy layout with subject-first discovery." },
      { id: "retro_arcade", name: "Retro Arcade", summary: "Nostalgic arcade style with playful interaction cues." },
    ],
  },
  {
    key: "books",
    label: "Books",
    archetypes: [
      { id: "cozy_nook", name: "Cozy Nook", summary: "Warm bookstore feel with mood-based reading discovery." },
      { id: "modern_archivist", name: "Modern Archivist", summary: "Clean reference-style book browsing with rich metadata." },
      { id: "graphic_novelty", name: "Graphic Novelty", summary: "Comic and manga-first high-energy panel style." },
      { id: "rare_find", name: "Rare Find", summary: "Museum-like antique and first-edition presentation." },
      { id: "childrens_storybook", name: "Children's Storybook", summary: "Large colorful kid-friendly reading discovery flow." },
      { id: "scifi_portal", name: "Sci-Fi Portal", summary: "Immersive dark genre-focused browsing for fantasy readers." },
      { id: "literary_journal", name: "Literary Journal", summary: "Quiet text-first poetry and literary minimalism." },
      { id: "coffee_table", name: "Coffee Table", summary: "Art and design book showcase with visual-first layout." },
      { id: "bestseller_list", name: "Bestseller List", summary: "Top-list social-proof flow for broad market books." },
      { id: "minimalist_reader", name: "Minimalist Reader", summary: "Digital reading-first clean and functional e-book layout." },
    ],
  },
  {
    key: "pet_supplies",
    label: "Pet Supplies",
    archetypes: [
      { id: "pet_care_club", name: "Pet Care Club", summary: "Trusty essentials and repeat purchase flow." },
      { id: "premium_pet_life", name: "Premium Pet Life", summary: "Lifestyle-led premium catalog." },
      { id: "vet_recommended", name: "Vet Recommended", summary: "Health-forward evidence-based layout." },
    ],
  },
  {
    key: "digital_products",
    label: "Digital Products",
    archetypes: [
      { id: "creator_launchpad", name: "Creator Launchpad", summary: "Fast launch pages for digital offers." },
      { id: "saas_dashboard", name: "SaaS Dashboard", summary: "Utility-first product and pricing focus." },
      { id: "knowledge_hub", name: "Knowledge Hub", summary: "Education funnel with strong content IA." },
    ],
  },
  {
    key: "handmade_crafts",
    label: "Handmade & Crafts",
    archetypes: [
      { id: "artisan_studio_plus", name: "Artisan Studio Plus", summary: "Maker-story with material transparency." },
      { id: "vintage_vault", name: "Vintage Vault", summary: "Collectible-driven warm visual style." },
      { id: "boho_market", name: "Boho Market", summary: "Organic curated catalog for niche products." },
    ],
  },
  {
    key: "hardware_tools",
    label: "Hardware & Tools",
    archetypes: [
      { id: "pro_workbench", name: "Pro Workbench", summary: "Specs and fitment-first buying journey." },
      { id: "contractor_supply", name: "Contractor Supply", summary: "Bulk-friendly high-density catalog UX." },
      { id: "diy_starter", name: "DIY Starter", summary: "Guided beginner-friendly tools discovery." },
    ],
  },
  {
    key: "generic",
    label: "Generic / Universal",
    archetypes: [
      { id: "bento_grid", name: "Bento Grid", summary: "Modular modern layout with clear scan hierarchy." },
      { id: "editorial_magazine", name: "Editorial Magazine", summary: "Narrative-first content and brand authority." },
      { id: "trust_first", name: "Trust-First", summary: "Safe corporate conversion with social proof." },
      { id: "dark_mode_pro", name: "Dark Mode Pro", summary: "Premium dark UI with vibrant visual focus." },
      { id: "split_screen", name: "Split Screen", summary: "Dual-audience or dual-offer structured presentation." },
      { id: "glassmorphism", name: "Glassmorphism", summary: "Layered translucent cards with modern premium vibe." },
      { id: "brutalist_raw", name: "Brutalist Raw", summary: "Bold no-frills style with hard edges and contrast." },
      { id: "soft_neumorphism", name: "Soft Neumorphism", summary: "Soft tactile interface with subtle depth and shadows." },
      { id: "full_bleed_cinematic", name: "Full-Bleed Cinematic", summary: "Immersive image/video-led storytelling sections." },
      { id: "micro_interaction_hub", name: "Micro-Interaction Hub", summary: "Interactive UI with hover motion and engagement cues." },
      { id: "infinite_scroll", name: "Infinite Scroll", summary: "Mobile-first continuous browsing discovery flow." },
      { id: "hand_drawn_artisan", name: "Hand-Drawn Artisan", summary: "Authentic handcrafted visual style with personality." },
      { id: "search_first", name: "Search-First", summary: "Utility-first IA with powerful central search." },
      { id: "neo_gothic_luxury_dark", name: "Neo-Gothic Luxury Dark", summary: "Exclusive luxury dark style with premium scarcity cues." },
      { id: "retro_futurism", name: "Retro-Futurism", summary: "Nostalgic-yet-modern visual identity with character." },
      { id: "saas_dashboard", name: "SaaS Dashboard", summary: "Functional dashboard-style layout focused on control." },
      { id: "organic_fluid", name: "Organic Fluid", summary: "Nature-inspired curved layout with calm transitions." },
      { id: "bold_typographic", name: "Bold Typographic", summary: "Message-first style where typography leads design." },
      { id: "interactive_storybook", name: "Interactive Storybook", summary: "Guided chapter-like journey from problem to solution." },
      { id: "ai_driven_personalizer", name: "AI-Driven Personalizer", summary: "Dynamic recommendation-led homepage structure." },
    ],
  },
];

export const AI_SITE_TAXONOMY: IndustryTaxonomy[] = AI_SITE_TAXONOMY_BASE.map(
  (industry) => ({
    ...industry,
    archetypes: industry.archetypes.map((a) => ({
      ...a,
      details: a.details || guessDetails(industry.key, a.id),
    })),
  }),
);

const IA_BY_INDUSTRY: Record<IndustryKey, IaPageDefinition[]> = {
  fashion: [
    { slug: "/collections", title: "Collections", template: "collections" },
    { slug: "/lookbook", title: "Lookbook", template: "lookbook" },
    { slug: "/size-guide", title: "Size Guide", template: "size_guide" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  shoes: [
    { slug: "/collections", title: "Collections", template: "collections" },
    { slug: "/size-guide", title: "Size & Fit Guide", template: "size_guide" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  jewelry: [
    { slug: "/collections", title: "Collections", template: "collections" },
    { slug: "/our-craft", title: "Our Craft", template: "story" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  sports_outdoor: [
    { slug: "/collections", title: "Shop by Activity", template: "collections" },
    { slug: "/comparison", title: "Gear Comparison", template: "comparison" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  automotive: [
    { slug: "/catalog", title: "Parts Catalog", template: "catalog" },
    { slug: "/comparison", title: "Fitment Comparison", template: "comparison" },
    { slug: "/support", title: "Installation Help", template: "support" },
  ],
  furniture_home: [
    { slug: "/collections", title: "Room Collections", template: "collections" },
    { slug: "/lookbook", title: "Inspiration Gallery", template: "lookbook" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  bags_luggage: [
    { slug: "/collections", title: "Travel Collections", template: "collections" },
    { slug: "/comparison", title: "Compare Sizes", template: "comparison" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  electronics: [
    { slug: "/catalog", title: "Catalog", template: "catalog" },
    { slug: "/comparison", title: "Compare Products", template: "comparison" },
    { slug: "/support", title: "Support", template: "support" },
  ],
  mobile_phones: [
    { slug: "/comparison", title: "Model Comparison", template: "comparison" },
    { slug: "/faq", title: "FAQ", template: "faq" },
    { slug: "/support", title: "Device Support", template: "support" },
  ],
  grocery: [
    { slug: "/collections", title: "Shop by Need", template: "collections" },
    { slug: "/faq", title: "Delivery FAQ", template: "faq" },
    { slug: "/blog", title: "Recipes", template: "blog" },
  ],
  beauty_personal_care: [
    { slug: "/collections", title: "Shop by Concern", template: "collections" },
    { slug: "/comparison", title: "Compare Ingredients", template: "comparison" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  pharmacy: [
    { slug: "/catalog", title: "Health Catalog", template: "catalog" },
    { slug: "/faq", title: "Health FAQ", template: "faq" },
    { slug: "/support", title: "Care Support", template: "support" },
  ],
  home_kitchen: [
    { slug: "/collections", title: "Kitchen Collections", template: "collections" },
    { slug: "/comparison", title: "Compare Tools", template: "comparison" },
    { slug: "/blog", title: "Guides & Recipes", template: "blog" },
  ],
  toys_games: [
    { slug: "/collections", title: "Shop by Age", template: "collections" },
    { slug: "/faq", title: "FAQ", template: "faq" },
    { slug: "/blog", title: "Play Guides", template: "blog" },
  ],
  books: [
    { slug: "/collections", title: "Browse by Genre", template: "collections" },
    { slug: "/blog", title: "Editorial Picks", template: "blog" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  pet_supplies: [
    { slug: "/collections", title: "Shop by Pet", template: "collections" },
    { slug: "/faq", title: "Pet Care FAQ", template: "faq" },
    { slug: "/blog", title: "Pet Care Guides", template: "blog" },
  ],
  digital_products: [
    { slug: "/catalog", title: "All Products", template: "catalog" },
    { slug: "/comparison", title: "Plan Comparison", template: "comparison" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  handmade_crafts: [
    { slug: "/collections", title: "Shop Collections", template: "collections" },
    { slug: "/our-craft", title: "Maker Story", template: "story" },
    { slug: "/faq", title: "FAQ", template: "faq" },
  ],
  hardware_tools: [
    { slug: "/catalog", title: "Tool Catalog", template: "catalog" },
    { slug: "/comparison", title: "Compare Tools", template: "comparison" },
    { slug: "/support", title: "Usage & Safety", template: "support" },
  ],
  generic: [
    { slug: "/collections", title: "Collections", template: "collections" },
    { slug: "/faq", title: "FAQ", template: "faq" },
    { slug: "/blog", title: "Blog", template: "blog" },
  ],
};

const IA_BY_ARCHETYPE: Record<string, IaPageDefinition[]> = {
  editorial_magazine: [{ slug: "/journal", title: "Journal", template: "blog" }],
  trust_first: [{ slug: "/why-us", title: "Why Us", template: "story" }],
  search_first: [{ slug: "/catalog", title: "Catalog", template: "catalog" }],
  flagship_launch: [{ slug: "/launch", title: "Launch Story", template: "story" }],
  department_powerhouse: [{ slug: "/deals", title: "Deals", template: "catalog" }],
};

export function getBaseInformationArchitecture(
  industry: IndustryKey,
  archetype: string,
) {
  const seen = new Set<string>();
  const merged = [...(IA_BY_INDUSTRY[industry] || []), ...(IA_BY_ARCHETYPE[archetype] || [])];
  return merged.filter((p) => {
    if (!p.slug || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  });
}

for (const industry of AI_SITE_TAXONOMY) {
  for (const archetype of industry.archetypes) {
    if (
      !archetype.details?.typography ||
      !archetype.details?.layout ||
      !archetype.details?.colorSystem ||
      !archetype.details?.ux ||
      !archetype.details?.designFocus
    ) {
      throw new Error(
        `Missing taxonomy details for ${industry.key}:${archetype.id}`,
      );
    }
  }
}

export function listIndustries() {
  return AI_SITE_TAXONOMY.map((i) => ({ key: i.key, label: i.label }));
}

export function listArchetypes(industry: IndustryKey) {
  return AI_SITE_TAXONOMY.find((i) => i.key === industry)?.archetypes || [];
}

export function normalizeIndustry(value: string | undefined): IndustryKey {
  const fallback: IndustryKey = "generic";
  if (!value) return fallback;
  return (AI_SITE_TAXONOMY.find((i) => i.key === value)?.key || fallback) as IndustryKey;
}
