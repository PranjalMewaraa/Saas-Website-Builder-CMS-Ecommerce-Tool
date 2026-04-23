export const DEFAULT_PRODUCT_IMAGE =
  "https://imgs.search.brave.com/GLCxUyWW7lshyjIi8e1QFNPxtjJG3c2S4i0ItSnljVI/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRpYS5pc3RvY2twaG90by5jb20vaWQvMTk4MDI3NjkyNC92ZWN0b3Ivbm8tcGhvdG8tdGh1bWJuYWlsLWdyYXBoaWMtZWxlbWVudC1uby1mb3VuZC1vci1hdmFpbGFibGUtaW1hZ2UtaW4tdGhlLWdhbGxlcnktb3ItYWxidW0tZmxhdC5qcGc_cz02MTJ4NjEyJnc9MCZrPTIwJmM9WkJFM05xZnpJZUhHRFBreXZ1bFV3MTRTYVdmRGoyclp0eWlLdjN0b0l0az0";

export function normalizeImageUrl(url: unknown): string {
  if (typeof url !== "string") return DEFAULT_PRODUCT_IMAGE;
  const raw = url.trim();
  if (!raw) return DEFAULT_PRODUCT_IMAGE;

  let corrected = raw
    .replace(/^https?:\/\/https?:\/\//i, "https://")
    .replace(/^http:\/\/http:\/\//i, "http://")
    .replace(/^(https?:\/\/)+/i, "https://")
    .replace(/^(https?:\/)\/+(?!\/)/i, "https://");

  if (corrected.startsWith("//")) corrected = `https:${corrected}`;
  return corrected;
}

