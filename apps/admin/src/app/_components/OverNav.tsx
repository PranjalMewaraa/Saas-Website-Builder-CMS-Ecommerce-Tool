import Link from "next/link";
import React from "react";

const OverNav = () => {
  return (
    <nav className="fixed top-0 z-100 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Link
          href={"/"}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="h-5 w-5 rounded-md bg-[#1D1D1F]" />
          <span className="text-lg font-semibold tracking-tight uppercase">
            Admin
          </span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-[12px] font-medium text-[#1D1D1F]/80">
          <Link href={"/docs"} className="hover:text-blue-600 transition">
            Documentation
          </Link>
          <Link
            href={"/visual-builder"}
            className="hover:text-blue-600 transition"
          >
            Visual Builder
          </Link>
          <Link href={"/ecomm-details"} className="hover:text-blue-600 transition">
            Ecommerce Details
          </Link>
          <button className="hover:text-blue-600 transition">Support</button>
        </div>
        <Link
          href="/content"
          className="rounded-full bg-[#0071E3] px-4 py-1.5 text-[12px] font-medium text-white transition hover:bg-[#0077ED] active:scale-95"
        >
          Start Free
        </Link>
      </div>
    </nav>
  );
};

export default OverNav;
