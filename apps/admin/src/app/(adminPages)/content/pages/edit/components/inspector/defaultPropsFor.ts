// Single source of truth for a block's initial props when it is added to
// the canvas. Shared by the edit and home page editors. "Hero" is aliased
// to the "Hero/V1" defaults because the home palette adds bare "Hero".
export function defaultPropsFor(type: string): Record<string, any> {
  if (type === "Header/V1")
    return {
      menuId: "menu_main",
      layout: "three-col",
      menuGap: 24,
      actionGap: 8,
      ctaText: "Shop",
      ctaHref: "/products",
      ctaSecondaryText: "Learn more",
      ctaSecondaryHref: "/about",
      contentWidth: "xl",
    };
  if (type === "Footer/V1")
    return {
      menuId: "menu_footer",
      menuGroups: [
        {
          menuId: "menu_footer",
          title: "Links",
          textSize: "sm",
          textStyle: "normal",
        },
      ],
      layout: "multi-column",
      menuColumnGap: 32,
      menuLinkGapX: 24,
      description: "Building better digital experiences since 2023.",
      badgeText: "Designed for modern storefronts",
      showSocials: true,
      socialLinks: [],
    };
  if (type === "Hero/V1" || type === "Hero")
    return {
      heroPreset: "Basic",
      variant: "basic",
      headline: "Headline",
      subhead: "Subhead",
      ctaText: "Browse",
      ctaHref: "/products",
      secondaryCtaText: "",
      secondaryCtaHref: "",
      align: "left",
      contentWidth: "xl",
      minHeight: 520,
      bg: {
        type: "none",
        color: "#0f172a",
        overlayColor: "#000000",
        overlayOpacity: 0.45,
        imageAssetId: "",
        imageAlt: "",
        videoAssetId: "",
        posterAssetId: "",
        videoAutoplay: true,
        videoMuted: true,
        videoLoop: true,
        videoControls: false,
        videoPreload: "metadata",
      },
    };

  if (type === "ProductGrid/V1")
    return {
      title: "Featured Products",
      limit: 8,
      detailPathPrefix: "/products",
      cardVariant: "default",
    };
  if (type === "ProductList/V1")
    return {
      title: "All Products",
      subtitle: "Browse products with clean filters and fast results.",
      limit: 12,
      showFilters: true,
      showSearch: true,
      detailPathPrefix: "/products",
      titleAlign: "left",
      sectionPadding: "normal",
      sectionBg: "",
      gridCols: "3",
      gridGap: "normal",
      sidebarPosition: "left",
      filterStyle: "card",
      filterSticky: true,
      cardVariant: "default",
    };
  if (type === "ProductDetail/V1")
    return {
      showRelated: true,
      relatedLimit: 4,
      detailPathPrefix: "/products",
      relatedCardVariant: "default",
    };
  if (type === "CartPage/V1")
    return {
      title: "Your cart",
      emptyTitle: "Your cart is empty",
      emptyCtaText: "Browse products",
      emptyCtaHref: "/products",
      checkoutText: "Checkout",
      checkoutMode: "create-order",
      checkoutHref: "/checkout",
    };
  if (type === "CartSummary/V1")
    return {
      title: "Summary",
      checkoutText: "Checkout",
      checkoutHref: "/checkout",
    };
  if (type === "AddToCart/V1")
    return {
      productId: "",
      title: "Product",
      priceCents: 12900,
      image: "",
      buttonText: "Add to cart",
      variant: "default",
      size: "md",
      showTitle: false,
      showPrice: false,
      showImage: false,
      fullWidth: true,
      badgeText: "",
      noteText: "",
      accentColor: "",
      textColor: "",
      surfaceColor: "",
      radius: 10,
      quantity: 1,
    };
  if (type === "Form/V1")
    return { formId: "", title: "Contact us", submitText: "Send" };

  if (type === "Utility/Spacer") return { height: 40 };
  if (type === "Utility/Divider")
    return { thickness: 1, color: "#e5e7eb", marginY: 20 };
  if (type === "Utility/RichText")
    return {
      html: `<h2>Tell your story with clarity</h2><p>Use this rich text block to explain value, build trust, and guide customers to action.</p><ul><li>Clear headline and supporting copy</li><li>Use bullets to improve scan-ability</li><li>Add links for key next steps</li></ul><blockquote>Tip: keep paragraphs short and specific for better conversion.</blockquote>`,
    };
  if (type === "BannerCTA/V1")
    return {
      title: "Title",
      subtitle: "Subtitle",
      buttonText: "Click Here",
      buttonHref: "/",
      align: "center",
    };
  if (type === "FeatureGrid/V1")
    return {
      title: "Section title here",
      features: [
        {
          title: "Lightning Fast Performance",
          description:
            "Built for speed. Pages load in under a second, giving your users the best experience possible.",
        },
        {
          title: "Fully Responsive Design",
          description:
            "Looks perfect on every device — mobile, tablet, desktop — no compromises.",
        },
        {
          title: "Easy Customization",
          description:
            "Change colors, fonts, spacing, and layout with simple Tailwind classes or your own CSS.",
        },
        {
          title: "SEO Optimized",
          description:
            "Clean semantic HTML, fast load times, and meta tags ready to help you rank higher.",
        },
        {
          title: "Dark Mode Ready",
          description:
            "Built-in support for dark mode — just toggle your system preference.",
        },
        {
          title: "Regular Updates",
          description:
            "Continuously improved with new components, patterns, and best practices.",
        },
      ],
    };
  if (type === "Testimonial/V1")
    return {
      title: "Section Title Here",
      testimonials: [
        {
          quote:
            "This product completely changed how we approach our workflow. Highly recommended!",
          name: "Sarah Chen",
          role: "Product Designer at TechCorp",
        },
        {
          quote:
            "The best investment we've made this year. Support is outstanding.",
          name: "Michael Reyes",
          role: "CTO at StartupX",
        },
        {
          quote: "Intuitive, fast, and reliable. Exactly what we needed.",
          name: "Priya Sharma",
          role: "Marketing Lead at Growthify",
        },
      ],
    };
  if (type === "ProductHighlight/V1")
    return {
      title: "Product Title",
      description: "Product Description",
      image: "Pick an Image",
      ctaText: "Button Text",
      ctaHref: "Button Link",
      price: "500",
    };
  if (type === "PricingTable/V1")
    return {
      title: "Title Here",
      plans: [
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
        {
          name: "Product Title",
          feature: "Product Description",
          ctaText: "Button Text",
          ctaHref: "Button Link",
          price: "500",
        },
      ],
    };
  if (type === "StatsCounter/V1")
    return {
      stats: [
        { value: "99.9%", label: "Uptime" },
        { value: "500K+", label: "API Calls Daily" },
        { value: "2.3s", label: "Avg Response Time" },
        { value: "120K+", label: "Deployments" },
      ],
    };
  if (type === "LogosCloud/V1")
    return {
      title: "Your Title here",
      logos: [],
    };
  if (type === "NewsletterSignup/V1")
    return {
      title: "Your Title here",
      subtitle: "Subtitle Here",
    };
  if (type === "FAQAccordion/V1")
    return {
      title: "Frequently Asked Questions",
      subtitle: "Everything customers ask before buying.",
      items: [
        {
          question: "How long does shipping take?",
          answer: "Delivery usually takes 3-7 business days.",
        },
        {
          question: "Can I return an item?",
          answer: "Yes, returns are supported within 7 days.",
        },
      ],
    };
  if (type === "CategoryGrid/V1")
    return {
      title: "Shop by Category",
      subtitle: "Pick a category to explore products.",
      categories: [
        { title: "T-Shirts", href: "/products?category=t-shirts" },
        { title: "Jeans", href: "/products?category=jeans" },
        { title: "Footwear", href: "/products?category=footwear" },
        { title: "Accessories", href: "/products?category=accessories" },
      ],
    };
  if (type === "BrandGrid/V1")
    return {
      title: "Shop by Brand",
      subtitle: "Browse your trusted brands.",
      ctaText: "View all brands",
      ctaHref: "/brands",
      gap: 16,
      brands: [
        { name: "Urban Co", href: "#", logo: "" },
        { name: "Nova Fit", href: "#", logo: "" },
        { name: "Northline", href: "#", logo: "" },
      ],
    };
  if (type === "BestSellers/V1")
    return {
      title: "Best Sellers",
      subtitle: "Top products customers are buying right now.",
      products: [
        { title: "Premium Hoodie", price: "₹1,999", href: "#" },
        { title: "Everyday Sneakers", price: "₹2,499", href: "#" },
        { title: "Classic Denim", price: "₹1,799", href: "#" },
      ],
    };
  if (type === "MegaMenu/V1")
    return {
      title: "Explore",
      subtitle: "Navigate your catalog quickly.",
      columns: 4,
      ctaText: "View all products",
      ctaHref: "/products",
      showSearch: true,
      searchPlaceholder: "Search products, collections, brands...",
      sections: [
        {
          title: "New Arrivals",
          links: [
            { label: "Latest Drop", href: "/products", badge: "New" },
            { label: "Trending", href: "/products?sort=newest" },
          ],
        },
        {
          title: "Collections",
          links: [
            { label: "Summer", href: "/products?collection=summer" },
            { label: "Essentials", href: "/products?collection=essentials" },
          ],
        },
      ],
      promo: {
        title: "Weekend Drop",
        description: "Up to 40% off selected items.",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        ctaText: "Shop Offer",
        ctaHref: "/products",
      },
    };
  if (type === "StoreLocator/V1")
    return {
      title: "Find a store near you",
      subtitle: "See address, contact and opening hours.",
      searchPlaceholder: "Search city or area",
      showMap: true,
      ctaText: "Contact support",
      ctaHref: "/contact",
      stores: [
        {
          name: "Flagship Store",
          badge: "Open",
          address: "21 Market Street",
          city: "Mumbai",
          state: "MH",
          phone: "+91 90000 00001",
          email: "flagship@example.com",
          hours: "Mon-Sat 10 AM - 9 PM",
          mapUrl: "https://maps.google.com/?q=Mumbai",
        },
      ],
    };
  if (type === "BundleOffer/V1")
    return {
      title: "Bundle and save more",
      subtitle: "Get instant discount when buying together.",
      currency: "INR",
      discountType: "percent",
      discountValue: 10,
      ctaText: "Buy bundle",
      ctaHref: "/cart",
      note: "Discount applies at checkout.",
      items: [
        { name: "Classic Tee", qty: 1, price: 899, image: "" },
        { name: "Athletic Jogger", qty: 1, price: 1499, image: "" },
        { name: "Everyday Cap", qty: 1, price: 499, image: "" },
      ],
    };
  if (type === "BentoGrid/V1")
    return {
      title: "Why customers choose us",
      subtitle: "Designed for clarity, speed, and conversion.",
      items: [
        {
          title: "Built for conversion",
          description: "High-impact layout patterns optimized for ecommerce.",
          badge: "Growth",
          size: "lg",
          href: "#",
        },
        {
          title: "Fast checkout flow",
          description: "Reduced friction from product page to order completion.",
          badge: "Speed",
          size: "sm",
          href: "#",
        },
        {
          title: "Content + commerce",
          description: "Blend storytelling and catalog blocks in one page.",
          badge: "Flexible",
          size: "sm",
          href: "#",
        },
      ],
    };
  if (type === "BeforeAfterSlider/V1")
    return {
      title: "See the transformation",
      subtitle: "Drag the slider to compare before and after.",
      beforeImageAssetId: "",
      afterImageAssetId: "",
      beforeLabel: "Before",
      afterLabel: "After",
      height: 420,
    };
  if (type === "StickyPromoBar/V1")
    return {
      text: "Free shipping on orders above ₹999",
      ctaText: "Shop Now",
      ctaHref: "/products",
      position: "top",
      align: "center",
      offsetX: 12,
      offsetY: 8,
      radius: 12,
      maxWidth: "1152px",
      dismissible: false,
      theme: "dark",
    };
  if (type === "TestimonialCarousel/V1")
    return {
      title: "Loved by growing brands",
      subtitle: "Real stories from teams using this builder.",
      autoplayMs: 5000,
      testimonials: [
        {
          quote: "The builder helped us launch our store in days, not weeks.",
          name: "Aarav Shah",
          role: "Founder, Northline",
          rating: 5,
        },
        {
          quote: "Visual editing is clean and fast. We ship pages much quicker now.",
          name: "Riya Mehta",
          role: "Marketing Lead, Nova Fit",
          rating: 5,
        },
      ],
    };
  if (type === "ComparisonTable/V1")
    return {
      title: "Compare plans",
      subtitle: "Find the right plan for your stage of growth.",
      columns: ["Starter", "Growth", "Scale"],
      rows: [
        { feature: "Monthly Projects", values: ["5", "25", "Unlimited"] },
        { feature: "Team Members", values: ["1", "5", "Unlimited"] },
        { feature: "Custom Domain", values: ["No", "Yes", "Yes"] },
      ],
    };
  if (type === "MarqueeStrip/V1")
    return {
      items: ["Free Shipping", "Easy Returns", "Secure Checkout", "24x7 Support"],
      speedSec: 30,
      pauseOnHover: true,
      itemGap: 24,
    };
  if (type === "SpotlightCards/V1")
    return {
      title: "Why Choose Us",
      subtitle: "Everything built to improve conversion.",
      cards: [
        { title: "Fast Setup", description: "Go live quickly with visual blocks.", icon: "⚡", href: "#" },
        { title: "Design Flexibility", description: "Customize every section deeply.", icon: "🎨", href: "#" },
        { title: "Commerce Ready", description: "Catalog, cart, and checkout included.", icon: "🛒", href: "#" },
      ],
    };
  if (type === "ProcessTimeline/V1")
    return {
      title: "How It Works",
      subtitle: "A simple three-step process.",
      steps: [
        { title: "Create Site", description: "Setup your store and theme." },
        { title: "Build Pages", description: "Compose sections and blocks." },
        { title: "Launch", description: "Publish and track growth." },
      ],
    };
  if (type === "MediaGalleryMasonry/V1")
    return {
      title: "Gallery",
      subtitle: "Showcase your brand visuals.",
      columns: 3,
      items: [{}, {}, {}, {}, {}],
    };
  if (type === "VideoHeroLite/V1")
    return {
      title: "Build and launch faster",
      subtitle: "Modern pages with visual control.",
      ctaText: "Get Started",
      ctaHref: "/",
      minHeight: 520,
      overlayOpacity: 0.45,
      videoAssetId: "",
      videoUrl: "",
      posterAssetId: "",
      posterUrl: "",
    };
  if (type === "KPIRibbon/V1")
    return {
      items: [
        { value: "120K+", label: "Orders Processed", icon: "📦" },
        { value: "99.9%", label: "Platform Uptime", icon: "⚡" },
        { value: "4.8/5", label: "Customer Rating", icon: "⭐" },
        { value: "24/7", label: "Support", icon: "💬" },
      ],
    };
  if (type === "InteractiveTabs/V1")
    return {
      title: "Explore",
      subtitle: "Keep content organized in tabs.",
      tabs: [
        { label: "Overview", title: "Overview", content: "Explain your core value." },
        { label: "Features", title: "Features", content: "List key capabilities." },
        { label: "Use Cases", title: "Use Cases", content: "Show who it is for." },
      ],
    };
  if (type === "FloatingCTA/V1")
    return {
      text: "Need help choosing?",
      buttonText: "Talk to us",
      buttonHref: "/contact",
      position: "bottom-right",
    };
  if (type === "ContentSplitShowcase/V1")
    return {
      title: "Build beautiful pages with confidence",
      subtitle: "Combine storytelling and commerce in one clean layout.",
      bullets: ["Visual editor", "Reusable blocks", "Store-ready flow"],
      ctaText: "Get Started",
      ctaHref: "/",
      reverse: false,
      mediaUrl: "",
      mediaAlt: "",
    };
  if (type === "SocialProofTicker/V1")
    return {
      items: [
        "A customer from Mumbai just purchased Premium Hoodie",
        "45 people bought in the last 24 hours",
        "Rated 4.8/5 by 1200+ customers",
      ],
      speedSec: 35,
      itemGap: 24,
    };
  if (type === "Layout/Section")
    return {
      style: {
        display: "flex",
        justify: "center",
      },
      rows: [],
    };
  return {};
}
