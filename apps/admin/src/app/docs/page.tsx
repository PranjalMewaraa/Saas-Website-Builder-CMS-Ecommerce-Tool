import Link from "next/link";
import DocsClient from "./DocsClient";
import docsData from "./docs-content.json";
import OverNav from "../_components/OverNav";

export default function DocsPage() {
  return (
    <div className="flex flex-col items-center">
      <OverNav />
      <DocsClient data={docsData as any} />
    </div>
  );
}
