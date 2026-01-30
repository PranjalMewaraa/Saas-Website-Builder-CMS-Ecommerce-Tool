import { S3Client } from "@aws-sdk/client-s3";

const endpoint = process.env.S3_ENDPOINT2;
const region = process.env.S3_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY;
const secretAccessKey = process.env.S3_SECRET_KEY;

if (!endpoint) throw new Error("Missing S3_ENDPOINT");
if (!accessKeyId) throw new Error("Missing S3_ACCESS_KEY");
if (!secretAccessKey) throw new Error("Missing S3_SECRET_KEY");
console.log(endpoint, accessKeyId, secretAccessKey);
const finalEndpoint = `https://${endpoint}`;
export const s3 = new S3Client({
  region,
  endpoint,
  credentials: { accessKeyId, secretAccessKey },
});
