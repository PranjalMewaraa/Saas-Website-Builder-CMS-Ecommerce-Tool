import React from "react";

export default function LayoutSection() {
  return (
    <div className="border border-dashed border-gray-300 p-6 rounded-lg">
      <div className="text-sm font-medium text-gray-600">
        Layout Section
      </div>
      <div className="text-xs text-gray-400 mt-1">
        This block is rendered by the layout engine.
      </div>
    </div>
  );
}

