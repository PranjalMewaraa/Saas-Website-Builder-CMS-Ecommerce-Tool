"use client";

export default function ProductDetailVisualStub() {
  return (
    <section className="py-8">
      <div className="mx-auto px-4 max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-100 aspect-[4/5]" />
          <div className="space-y-4">
            <div className="text-sm text-slate-500">Products / Sample</div>
            <div className="h-8 w-3/4 rounded bg-slate-200" />
            <div className="h-5 w-32 rounded bg-slate-200" />
            <div className="h-20 w-full rounded bg-slate-100" />
            <div className="h-10 w-40 rounded bg-slate-900" />
          </div>
        </div>
      </div>
    </section>
  );
}
