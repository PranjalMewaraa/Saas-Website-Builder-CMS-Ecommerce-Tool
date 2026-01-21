import { ReactNode } from "react";
import ContentNav from "./_component/ContentNav";

export default function ContentLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row">
        <main className="flex-1 min-w-0 text-gray-800 bg-white">
          <div className="p-5 md:p-8 lg:p-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
