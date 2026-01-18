"use client";

export default function ProductGridVisualStub(props: any) {
  const count = props.limit || 6;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 p-4 border rounded bg-white/70">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="border rounded p-3 text-sm text-center bg-gray-50"
        >
          <div className="h-24 bg-gray-200 rounded mb-2" />
          <div className="font-medium">Sample Product {i + 1}</div>
          <div className="text-xs text-gray-500">$19.99</div>
        </div>
      ))}
    </div>
  );
}
