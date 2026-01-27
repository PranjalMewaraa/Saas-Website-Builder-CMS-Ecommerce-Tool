import React from "react";

export default function NewsletterSignupV1({ title, subtitle }: any) {
  return (
    <section className="py-20 bg-gray-100">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{subtitle}</p>

        <form className="flex gap-2">
          <input
            type="email"
            required
            placeholder="Enter your email"
            className="flex-1 border rounded px-3 py-2"
          />
          <button className="bg-black text-white px-4 rounded">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  );
}
