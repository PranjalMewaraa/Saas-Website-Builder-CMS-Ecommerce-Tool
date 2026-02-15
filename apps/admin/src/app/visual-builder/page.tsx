import Link from "next/link";
import { ChevronRight, Layout, Layers, SlidersHorizontal } from "lucide-react";
import OverNav from "../_components/OverNav";

function Placeholder({ label, note }: { label: string; note: string }) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-white">
      <div className="bg-gray-50 p-5 border-b border-gray-200">
        <h3 className="text-xl font-bold">{label}</h3>
        <p className="mt-1 text-sm text-[#86868B]">{note}</p>
      </div>
      <div className="aspect-video bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 italic text-sm px-4 text-center">
          Replace with screenshot:
          <br />
          {note}
        </p>
      </div>
    </div>
  );
}

export default function VisualBuilderPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-[#FFFFFF] font-sans text-[#1D1D1F] selection:bg-blue-100">
      <OverNav />

      <header className="relative flex min-h-[90vh] w-full flex-col items-center justify-center overflow-hidden px-6 pt-20 text-center">
        <div className="relative z-10 max-w-5xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F5F5F7] px-4 py-1 text-[13px] font-semibold text-[#86868B]">
            <span className="text-[#0071E3]">Visual Builder</span> — Website
            Design System
          </div>
          <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl text-[#1D1D1F]">
            Build Stunning Pages <br />
            <span className="text-[#86868B]">Without Writing Code</span>
          </h1>
          <p className="mx-auto mb-10 max-w-3xl text-xl text-[#86868B] font-medium leading-relaxed">
            Create full page layouts using sections, rows, columns, and atomic
            blocks. Customize everything from layout behavior to typography and
            interactions through a structured inspector workflow.
          </p>
          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/content/pages"
              className="group flex items-center gap-1 rounded-full bg-[#1D1D1F] px-8 py-3.5 text-lg font-semibold text-white transition hover:bg-black"
            >
              Open Visual Builder <ChevronRight size={18} className="mt-0.5" />
            </Link>
            <Link
              href="/docs"
              className="group flex items-center gap-1 text-lg font-medium text-[#0071E3] hover:underline underline-offset-4 transition"
            >
              Read Documentation
            </Link>
          </div>
        </div>

        <div className="mt-16 w-full max-w-6xl px-4 relative">
          <div className="h-[420px] w-full rounded-t-3xl bg-gradient-to-b from-[#F5F5F7] to-white border-x border-t border-gray-200 shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden">
            <div className="text-[#86868B] flex flex-col items-center gap-2">
              <Layers size={44} className="opacity-30" />
              <p className="text-sm font-medium opacity-60 italic">
                Placeholder: Full Builder UI Screenshot (canvas + inspector +
                block dialog)
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="w-full bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 text-center">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              What It Is and How It Works
            </h2>
            <p className="mt-4 text-xl text-[#86868B] max-w-3xl mx-auto">
              Visual Builder follows a structured composition model for speed,
              design consistency, and publish-safe editing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100">
              <Layout className="mb-5 text-[#0071E3]" size={30} />
              <h3 className="text-2xl font-bold mb-2">Structure First</h3>
              <p className="text-[#86868B]">
                Start with Section &gt; Row &gt; Column hierarchy. Build clean
                layout flow before styling details.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100">
              <Layers className="mb-5 text-[#0071E3]" size={30} />
              <h3 className="text-2xl font-bold mb-2">Add Content Blocks</h3>
              <p className="text-[#86868B]">
                Insert atomic blocks like text, image, video, button, form,
                icon, and group for reusable mini-components.
              </p>
            </div>
            <div className="rounded-[2rem] bg-white p-8 shadow-sm border border-gray-100">
              <SlidersHorizontal className="mb-5 text-[#0071E3]" size={30} />
              <h3 className="text-2xl font-bold mb-2">
                Customize in Inspector
              </h3>
              <p className="text-[#86868B]">
                Edit layout, spacing, typography, color, border, background, and
                advanced options with context-aware controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Layout/Section Block Deep Dive
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-12 text-center">
            The Layout/Section block is the core visual architecture system. It
            gives complete control across section shell, row arrangement, column
            composition, and atomic content.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Placeholder
              label="Section Layer"
              note="Show section selected on canvas with outer spacing + background settings in inspector."
            />
            <Placeholder
              label="Row Layer"
              note="Show row preset selector and manual flex/grid controls with gap/justify/align fields."
            />
            <Placeholder
              label="Column Layer"
              note="Show column layout controls and add atomic button appearing only on hover."
            />
            <Placeholder
              label="Atomic Layer"
              note="Show text/image/button blocks inside a column and inline controls for edit/reorder/delete."
            />
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Inspector: Full Customization Control
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-12 text-center">
            Inspector groups options so teams can edit quickly without
            confusion. Layout options appear first, and only relevant controls
            are shown based on selected node and display mode.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Inspector Groups</h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#86868B]">
                <li>
                  Layout (display, grid/flex, alignment, size constraints)
                </li>
                <li>Content/Props (text, media source, links, bindings)</li>
                <li>Spacing (margin, padding, gaps with unit-aware inputs)</li>
                <li>Typography (semantic tags, size, weight, line-height)</li>
                <li>Color & Border (text/bg/border/radius/opacity)</li>
                <li>Background (solid, gradient, image, video + overlay)</li>
                <li>Advanced (effects, z-index, overflow)</li>
              </ol>
            </div>
            <Placeholder
              label="Inspector Close-up"
              note="Show accordion groups open/close behavior and context-aware fields (grid fields only in grid mode)."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
            Practical Workflow for Teams
          </h2>
          <p className="text-xl text-[#86868B] max-w-3xl mx-auto mb-10">
            Use this sequence for high-quality pages with minimal rework.
          </p>
          <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200 bg-[#F5F5F7] p-8 text-left">
            <ol className="list-decimal pl-5 space-y-3 text-[#4B5563] text-lg">
              <li>Choose page intent and create structure with sections.</li>
              <li>
                Add rows/columns using presets, then switch to manual if needed.
              </li>
              <li>Insert atomic blocks and bind menus/forms/products.</li>
              <li>
                Style using inspector groups in order: layout to content to
                style.
              </li>
              <li>Validate responsive behavior and preview route flow.</li>
              <li>Publish snapshot after final QA.</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="w-full bg-[#F5F5F7] py-24 px-6">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Menus, Theme, and Global Experience
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-12 text-center">
            Visual Builder works with your global content systems. Menus control
            navigation structure, and Theme controls default colors, typography,
            and brand feel across all pages.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Menu Integration</h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#86868B]">
                <li>Create menus from the Menus module.</li>
                <li>Bind menu in Header/Footer block props.</li>
                <li>Use multiple footer menu groups with custom titles.</li>
                <li>Keep menu links synced when page slugs change.</li>
              </ol>
            </div>
            <div className="rounded-[2rem] bg-white p-10 shadow-sm border border-gray-100">
              <h3 className="text-2xl font-bold mb-4">Theme Integration</h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#86868B]">
                <li>Set brand colors and typography in Theme editor.</li>
                <li>Use theme defaults as baseline for new blocks.</li>
                <li>Apply local overrides only where section-specific.</li>
                <li>Preview theme impact before publishing snapshot.</li>
              </ol>
            </div>
            <Placeholder
              label="Menu Binding Example"
              note="Show Header/Footer inspector where menu is selected from dropdown and reflected on canvas."
            />
            <Placeholder
              label="Theme Application Example"
              note="Show theme color picker and resulting text/button defaults applied in visual builder."
            />
          </div>
        </div>
      </section>

      <section className="w-full py-24 px-6 bg-white">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6 text-center">
            Template Blocks You Can Start With
          </h2>
          <p className="text-xl text-[#86868B] max-w-4xl mx-auto mb-12 text-center">
            You can build from scratch, or start from prebuilt template blocks
            and then customize in inspector. This speeds up delivery while
            preserving full design control.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-[2rem] bg-[#F5F5F7] p-10 border border-gray-200">
              <h3 className="text-2xl font-bold mb-4">
                Common Template Blocks
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#6B7280]">
                <li>Hero (multiple presets/variants)</li>
                <li>Header (menu + CTA variants)</li>
                <li>Footer (multi-column, social, menu groups)</li>
                <li>Product Grid and Product Detail sections</li>
                <li>CTA sections and feature grids</li>
                <li>
                  Testimonials, FAQ/Accordion, forms, policy content blocks
                </li>
              </ol>
            </div>
            <div className="rounded-[2rem] bg-[#F5F5F7] p-10 border border-gray-200">
              <h3 className="text-2xl font-bold mb-4">
                How Templates Are Used
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-[#6B7280]">
                <li>Open Add New Block dialog.</li>
                <li>Choose category and template block.</li>
                <li>Apply preset and auto-fill default props.</li>
                <li>Customize content/style in inspector.</li>
                <li>Duplicate and adapt for fast page assembly.</li>
              </ol>
            </div>
            <Placeholder
              label="Template Picker Dialog"
              note="Show Add New Block dialog with categories, search, and block thumbnails (Hero/Footer/Header/Product Grid)."
            />
            <Placeholder
              label="Template to Final Output"
              note="Show side-by-side: selected template block and customized final section in canvas."
            />
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
