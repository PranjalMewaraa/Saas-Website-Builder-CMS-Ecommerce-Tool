import Link from "next/link";
import {
  Boxes,
  ClipboardList,
  Layers3,
  PackageCheck,
  SlidersHorizontal,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import OverNav from "../_components/OverNav";

const navItems = [
  { id: "overview", label: "Quick Overview" },
  { id: "category-attributes", label: "Category Fields" },
  { id: "product-variants", label: "Product Variants" },
  { id: "catalog-ops", label: "Stock & Orders" },
  { id: "best-practices", label: "Simple Tips" },
];

function ImagePlaceholder({
  title,
  caption,
}: {
  title: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
        <p className="text-sm font-semibold text-[#1D1D1F]">{title}</p>
      </div>
      <div className="grid aspect-video place-items-center bg-[#F5F5F7] px-6 text-center">
        <p className="text-sm text-[#6E6E73] italic">{caption}</p>
      </div>
    </div>
  );
}

export default function EcommerceDetailsPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FFFFFF] font-sans text-[#1D1D1F] selection:bg-blue-100">
      <OverNav />

      <header className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="relative z-10 max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4 py-1 text-[13px] font-semibold text-[#86868B]">
            <span className="text-[#0071E3]">E-Commerce </span> — Easy Setup
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-[#1D1D1F]">
            Build Your Store
            <br />
            <span className="text-[#86868B]">
              Categories, Variants, Stock, Orders
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-[#86868B] font-medium leading-relaxed">
            Create a store your way. Add custom fields for each category, create
            product variants like size and color, and manage stock and orders in
            one place.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/stores"
              className="group flex items-center gap-1 rounded-full bg-[#1D1D1F] px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-black"
            >
              Setup Store <ChevronRight size={18} className="mt-0.5" />
            </Link>
            <Link
              href="/products/new"
              className="group flex items-center gap-1 text-lg font-medium text-[#0071E3] hover:underline underline-offset-4 transition"
            >
              Create Product
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-6xl px-4 relative">
          <div className="h-[420px] w-full rounded-t-3xl bg-gradient-to-b from-[#F5F5F7] to-white border-x border-t border-gray-200 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden">
            <div className="text-[#86868B] flex flex-col items-center gap-2">
              <Layers3 size={40} className="opacity-20" />
              <p className="text-sm font-medium opacity-40 italic">
                Placeholder: Add screenshot of store setup, category fields,
                product list, and variants
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="w-full bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 rounded-[2.5rem] bg-white p-12 shadow-sm border border-gray-100">
              <Boxes className="mb-6 text-[#0071E3]" size={32} />
              <h3 className="text-3xl font-bold mb-4">
                Each Store Has Its Own Catalog
              </h3>
              <p className="text-[#86868B] text-lg max-w-2xl">
                Brands, categories, fields, and products stay inside one store.
                This keeps your data clean and easy to manage.
              </p>
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-[#F5F5F7] p-4 text-sm text-[#4B5563]">
                  Store
                </div>
                <div className="rounded-xl border border-gray-200 bg-[#F5F5F7] p-4 text-sm text-[#4B5563]">
                  Category + Attributes
                </div>
                <div className="rounded-xl border border-gray-200 bg-[#F5F5F7] p-4 text-sm text-[#4B5563]">
                  Products + Variants
                </div>
              </div>
            </div>

            <div className="md:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-100">
              <Sparkles className="mb-6 text-[#34C759]" size={32} />
              <h3 className="text-2xl font-bold mb-2">Flexible Setup</h3>
              <p className="text-[#86868B]">
                Every category can have different fields. Add only what you
                need.
              </p>
            </div>

            <div className="md:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-100">
              <PackageCheck className="mb-6 text-[#0071E3]" size={32} />
              <h3 className="text-2xl font-bold mb-2">Variant-Ready</h3>
              <p className="text-[#86868B]">
                Add size, color, or storage options with separate SKU, price,
                stock, and image.
              </p>
            </div>

            <div className="md:col-span-8 rounded-[2.5rem] bg-[#1D1D1F] p-12 text-white overflow-hidden relative">
              <h3 className="text-3xl font-bold mb-4 text-white">
                Made for Daily Store Work
              </h3>
              <p className="text-gray-300 text-lg max-w-2xl">
                Stock updates and order status stay linked to products and
                variants, so your team can work without confusion.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-14 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-gray-200 bg-[#F5F5F7] p-4 md:p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#86868B]">
              On This Page
            </p>
            <div className="flex flex-wrap gap-2">
              {navItems.map((item, i) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#4B5563] transition hover:bg-gray-50"
                >
                  {i + 1}. {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white" id="overview">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              How It Works
            </h2>
            <ol className="list-decimal pl-5 space-y-2 text-[#4B5563] text-lg">
              <li>Create a store.</li>
              <li>Add brand or distributor.</li>
              <li>Create categories and add category fields.</li>
              <li>Add products and fill those fields.</li>
              <li>Add variants (size/color/etc.) and variant images.</li>
              <li>Manage stock and orders.</li>
            </ol>
          </div>
          <ImagePlaceholder
            title="Setup Flow Visual"
            caption="Add screenshot: step-by-step flow from store setup to product creation."
          />
        </div>
      </section>

      <section
        className="w-full py-24 px-6 bg-[#F5F5F7]"
        id="category-attributes"
      >
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Category Fields = Full Customization
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-10 text-center">
            This is the most important part. Fields are set per category, so
            each product type can store the right information.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <SlidersHorizontal className="mb-5 text-[#0071E3]" size={30} />
              <h3 className="text-2xl font-bold mb-3">Attribute Types</h3>
              <ul className="grid list-disc gap-2 pl-5 text-[#4B5563] md:grid-cols-2">
                <li>Text</li>
                <li>Textarea</li>
                <li>Select</li>
                <li>Multi-select</li>
                <li>Number</li>
                <li>Boolean</li>
                <li>Color</li>
                <li>Date</li>
              </ul>
            </div>
            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-3">Why This Helps</h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#4B5563]">
                <li>Better filters on storefront.</li>
                <li>Cleaner product detail pages.</li>
                <li>Less messy product data.</li>
                <li>Easier shopping for customers.</li>
              </ol>
            </div>
            <ImagePlaceholder
              title="Category Attribute Builder"
              caption="Add screenshot: category form with custom fields, required toggle, and option list."
            />
            <ImagePlaceholder
              title="Preset Suggestions + Custom Override"
              caption="Add screenshot: suggested fields by store type and custom add/edit controls."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white" id="product-variants">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Product Variants and Images
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-10 text-center">
            Variants let one product have many options while keeping price,
            stock, and images correct for each option.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-[#F5F5F7] p-10 border border-gray-200">
              <h3 className="text-2xl font-bold mb-3">
                What You Can Configure
              </h3>
              <ul className="list-disc pl-5 space-y-2 text-[#4B5563]">
                <li>Variant groups (size, color, storage, etc.)</li>
                <li>Per-variant SKU</li>
                <li>Per-variant stock</li>
                <li>Per-variant price adjustment</li>
                <li>Per-variant image</li>
              </ul>
            </div>
            <ImagePlaceholder
              title="Variant Table Editor"
              caption="Add screenshot: variant table with SKU, stock, price change, and image columns."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-[#F5F5F7]" id="catalog-ops">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-8 text-center">
            Stock and Orders
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-[2rem] bg-white p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Inventory</h3>
              <p className="text-[#86868B]">
                Restock products, update stock, and track low stock.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Order Safety</h3>
              <p className="text-[#86868B]">
                Check stock before confirming order and stop overselling.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 border border-gray-200">
              <h3 className="text-2xl font-bold mb-2">Store Scope</h3>
              <p className="text-[#86868B]">
                Always work in the correct selected store.
              </p>
            </div>
          </div>
          <div className="mt-8">
            <ImagePlaceholder
              title="Ops Dashboard"
              caption="Add screenshot: inventory page and order detail popup with product and customer info."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white" id="best-practices">
        <div className="mx-auto max-w-4xl text-center">
          <ClipboardList className="mx-auto mb-5 text-[#0071E3]" size={34} />
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple Best Practices
          </h2>
          <ul className="mt-8 list-disc space-y-2 pl-5 text-left text-[#4B5563] text-lg">
            <li>Set up category fields before adding many products.</li>
            <li>Use clear and consistent names.</li>
            <li>Mark only truly needed fields as required.</li>
            <li>Check each variant has correct SKU and stock.</li>
            <li>Test filters, product page, cart, and orders.</li>
            <li>Preview first, then publish.</li>
          </ul>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/products"
              className="rounded-full bg-[#0071E3] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#0077ED]"
            >
              Manage Products
            </Link>
            <Link
              href="/manage/inventory"
              className="rounded-full border border-gray-300 px-8 py-3 text-sm font-semibold text-[#1D1D1F] transition hover:bg-gray-50"
            >
              Open Inventory
            </Link>
            <Link
              href="/orders"
              className="rounded-full border border-gray-300 px-8 py-3 text-sm font-semibold text-[#1D1D1F] transition hover:bg-gray-50"
            >
              Open Orders
            </Link>
          </div>
        </div>
      </section>
      <footer className="w-full bg-[#F5F5F7] py-16 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 border-b border-gray-300 pb-8 text-[12px] text-[#86868B] leading-relaxed">
            <p>
              Admin lets you build anything: online shops, personal portfolios,
              blogs, or professional websites — all with drag-and-drop ease and
              safe publishing. Start free today!
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-[12px] text-[#86868B]">
            <p>© 2026 ADMIN SYSTEMS. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 font-medium">
              <button className="hover:text-[#1D1D1F] transition">
                Help Center
              </button>
              <button className="hover:text-[#1D1D1F] transition">
                Pricing
              </button>
              <button className="hover:text-[#1D1D1F] transition">
                Privacy
              </button>
              <button className="hover:text-[#1D1D1F] transition">
                Contact
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
