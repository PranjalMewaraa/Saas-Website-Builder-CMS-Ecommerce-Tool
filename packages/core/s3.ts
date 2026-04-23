import { S3Client } from "@aws-sdk/client-s3";

const endpointRaw = process.env.S3_ENDPOINT || process.env.S3_ENDPOINT2;
const region =
  process.env.S3_REGION || inferRegion(endpointRaw) || "eu-north-1";
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;

if (!endpointRaw) throw new Error("Missing S3_ENDPOINT");
if (!accessKeyId) throw new Error("Missing S3_ACCESS_KEY");
if (!secretAccessKey) throw new Error("Missing S3_SECRET_KEY");

const finalEndpoint = /^https?:\/\//i.test(endpointRaw)
  ? endpointRaw
  : `https://${endpointRaw}`;

export const s3 = new S3Client({
  region,
  endpoint: finalEndpoint,
  credentials: { accessKeyId, secretAccessKey },
});

function inferRegion(endpoint?: string) {
  if (!endpoint) return "";
  const clean = endpoint.replace(/^https?:\/\//i, "").toLowerCase();
  // AWS patterns:
  // - s3.eu-north-1.amazonaws.com
  // - <bucket>.s3.eu-north-1.amazonaws.com
  const match = clean.match(/(?:^|\\.)s3[.-]([a-z0-9-]+)\\.amazonaws\\.com$/);
  if (match?.[1]) return match[1];
  return "";
}
