import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Paintbrush,
  ShoppingCart,
  ShieldCheck,
  ArrowRight,
  PlayCircle,
  Zap,
  Layers,
  Globe,
  ChevronRight,
  History,
  Layout,
  BookOpen,
  Briefcase,
} from "lucide-react";
import OverNav from "./_components/OverNav";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FFFFFF] font-sans text-[#1D1D1F] selection:bg-blue-100">
      {/* --- Navigation --- */}
      <OverNav />

      {/* --- Hero Section --- */}
      <header className="relative flex min-h-[95vh] w-full flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="relative z-10 max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4 py-1 text-[13px] font-semibold text-[#86868B]">
            <span className="text-[#0071E3]">New V2.0</span> — Build Anything
            Easily
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-[#1D1D1F]">
            Create Your Dream Website <br />
            <span className="text-[#86868B]">No Code Required</span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-[#86868B] font-medium leading-relaxed">
            Whether it's an online store, personal portfolio, professional
            showcase, informational site, or beautiful blog — drag, drop,
            customize, and launch in hours. Perfect for creators, small
            businesses, freelancers, and anyone who wants a stunning site
            without hiring developers.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <button className="group flex items-center gap-1 rounded-full bg-[#1D1D1F] px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-black">
              Start Free Trial <ChevronRight size={18} className="mt-0.5" />
            </button>
            <button className="group flex items-center gap-1 text-lg font-medium text-[#0071E3] hover:underline underline-offset-4 transition">
              Watch Quick Demo <ArrowRight size={20} className="ml-2" />
            </button>
          </div>
        </div>

        <div className="mt-20 w-full max-w-6xl px-4 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 bg-white border border-gray-200 px-6 py-2 rounded-full shadow-xl z-20 flex items-center gap-3 animate-bounce">
            <History size={16} className="text-blue-600" />
            <span className="text-sm font-semibold">
              Preview Everything Safely — Publish When You're Ready
            </span>
          </div>
          <div className="h-[450px] w-full rounded-t-3xl bg-gradient-to-b from-[#F5F5F7] to-white border-x border-t border-gray-200 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden">
            <div className="text-[#86868B] flex flex-col items-center gap-2">
              <Layers size={40} className="opacity-20" />
              <p className="text-sm font-medium opacity-40 italic">
                Simple Drag-and-Drop Builder
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* --- Bento Grid --- */}
      <section className="w-full bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8 rounded-[2.5rem] bg-white p-12 shadow-sm border border-gray-100 flex flex-col justify-between overflow-hidden relative">
              <div>
                <h3 className="text-3xl font-bold mb-4">Drag-and-Drop Magic</h3>
                <p className="text-[#86868B] text-lg max-w-md">
                  Build any page — store, portfolio, blog, or business site —
                  with easy sections, rows, and columns. Looks perfect on mobile
                  and desktop automatically.
                </p>
              </div>
              <div className="mt-12 flex gap-4 overflow-hidden opacity-40">
                <div className="h-40 w-1/3 bg-[#F5F5F7] rounded-xl border border-gray-200 shrink-0" />
                <div className="h-40 w-1/3 bg-[#F5F5F7] rounded-xl border border-gray-200 shrink-0" />
                <div className="h-40 w-1/3 bg-[#F5F5F7] rounded-xl border border-gray-200 shrink-0" />
              </div>
            </div>

            <div className="md:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-100 flex flex-col">
              <History className="mb-6 text-[#34C759]" size={32} />
              <h3 className="text-2xl font-bold mb-2">Edit Without Worry</h3>
              <p className="text-[#86868B]">
                Work in a private preview. See changes live only when you
                publish — perfect for portfolios, blogs, or stores.
              </p>
            </div>

            <div className="md:col-span-4 rounded-[2.5rem] bg-white p-10 shadow-sm border border-gray-100 flex flex-col">
              <ShoppingCart className="mb-6 text-[#0071E3]" size={32} />
              <h3 className="text-2xl font-bold mb-2">Sell Online Easily</h3>
              <p className="text-[#86868B]">
                Add products, variants, photos & prices in minutes — start
                selling without complicated setup.
              </p>
            </div>

            <div className="md:col-span-8 rounded-[2.5rem] bg-[#1D1D1F] p-12 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4 text-white">
                  One Tool for Everything
                </h3>
                <p className="text-gray-400 text-lg max-w-md">
                  Build your shop, personal portfolio, professional site, or
                  blog — all from the same simple dashboard. Grow at your pace.
                </p>
              </div>
              <Globe
                className="absolute -bottom-10 -right-10 text-white/5"
                size={300}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --- New Section: Easy Inventory & Order Management --- */}
      <section className="w-full py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Easy Inventory & Order Management
          </h2>
          <p className="text-xl text-[#86868B] max-w-3xl mx-auto mb-12">
            When you're ready to sell, everything stays simple. Track stock, see
            orders, update status — no spreadsheets or complicated tools needed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gray-50 p-6">
                <h3 className="text-2xl font-bold mb-3">
                  Manage Orders at a Glance
                </h3>
                <p className="text-[#86868B] mb-4">
                  View all orders, customer details, payment status, and
                  delivery — update with one click.
                </p>
              </div>
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {/* Placeholder for dashboard visual - in real use: <Image src="..." alt="Order dashboard" fill className="object-cover" /> */}
                <p className="text-gray-500 italic">
                  Clean order dashboard example
                </p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <div className="bg-gray-50 p-6">
                <h3 className="text-2xl font-bold mb-3">
                  Simple Inventory Tracking
                </h3>
                <p className="text-[#86868B] mb-4">
                  Add stock levels, get low-stock alerts, handle variants
                  (sizes/colors) — keep selling without running out.
                </p>
              </div>
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                <p className="text-gray-500 italic">Inventory view example</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Feature List --- */}
      <section className="w-full py-32 px-6 bg-[#F5F5F7]">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Built for What You Need
            </h2>
            <p className="mt-4 text-xl text-[#86868B]">
              No-code tools that make any site type beautiful and functional.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-10">
            <div className="flex gap-6">
              <ShoppingCart
                size={40}
                className="text-[#0071E3] flex-shrink-0"
              />
              <div>
                <h3 className="text-2xl font-bold mb-2">Online Store</h3>
                <p className="text-[#86868B]">
                  Products, variants, payments, shipping — ready to sell fast.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <Briefcase size={40} className="text-[#0071E3] flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Portfolio & Showcase
                </h3>
                <p className="text-[#86868B]">
                  Stunning galleries, project pages, client testimonials —
                  impress visitors.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <BookOpen size={40} className="text-[#0071E3] flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">Blog & Articles</h3>
                <p className="text-[#86868B]">
                  Easy post editor, categories, SEO — share your story or
                  knowledge.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <Layout size={40} className="text-[#0071E3] flex-shrink-0" />
              <div>
                <h3 className="text-2xl font-bold mb-2">
                  Business / Info Sites
                </h3>
                <p className="text-[#86868B]">
                  Services, about, contact forms, maps — look professional
                  instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Final CTA --- */}
      <section className="w-full py-32 px-6 bg-white">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-8 text-5xl font-bold tracking-tight sm:text-7xl">
            Ready to Build Your Site? <br /> Store, Portfolio, Blog — All Easy.
          </h2>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <button className="rounded-full bg-[#0071E3] px-10 py-4 text-lg font-semibold text-white transition hover:bg-[#0077ED] active:scale-95">
              Start Building Free
            </button>
            <button className="rounded-full border border-gray-300 px-10 py-4 text-lg font-semibold text-[#1D1D1F] transition hover:bg-gray-50 active:scale-95">
              Watch Quick Demo
            </button>
          </div>
          <p className="mt-8 text-[#86868B] font-medium">
            Get your website live fast — beautiful, mobile-ready, and completely
            yours.
          </p>
        </div>
      </section>

      {/* --- Footer --- */}
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
