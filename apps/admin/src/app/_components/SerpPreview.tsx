export default function SerpPreview({ title, description, url }: any) {
  return (
    <div className="border p-3 bg-white max-w-xl">
      <div className="text-blue-700 text-lg">{title || "Title"}</div>
      <div className="text-green-700 text-sm">{url}</div>
      <div className="text-gray-700 text-sm">{description}</div>
    </div>
  );
}
