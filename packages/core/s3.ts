import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT || "s3.eu-north-1.amazonaws.com";
const region = process.env.S3_REGION || "eu-north-1";
const accessKeyId = process.env.S3_ACCESS_KEY || "AKIAR5ZDIYOW4AII3W3D";
const secretAccessKey =
  process.env.S3_SECRET_KEY || "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";

if (!endpoint) throw new Error("Missing S3_ENDPOINT");
if (!accessKeyId) throw new Error("Missing S3_ACCESS_KEY");
if (!secretAccessKey) throw new Error("Missing S3_SECRET_KEY");

export const s3 = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});
