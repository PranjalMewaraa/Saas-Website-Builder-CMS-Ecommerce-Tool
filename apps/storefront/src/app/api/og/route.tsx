import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") || "";

  return new ImageResponse(
    <div
      style={{
        fontSize: 64,
        background: "#111",
        color: "#fff",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {title}
    </div>,
    { width: 1200, height: 630 },
  );
}
