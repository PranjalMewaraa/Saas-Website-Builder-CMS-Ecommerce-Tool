import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { getSiteByHandle, getMongoDb } from "@acme/db-mongo";
import { reportVitals } from "./_component/webVital";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function resolveSite() {
  const h = await headers();

  const handle = h.get("x-site-handle");
  const host = h.get("x-site-host") || (h.get("host") || "").split(":")[0];

  const db = await getMongoDb();
  const sites = db.collection("sites");

  if (handle) {
    const site = await sites.findOne({ handle });
    if (site) return site;
  }

  const parts = host.split(".");
  if (parts.length >= 3) {
    const site = await sites.findOne({ handle: parts[0] });
    if (site) return site;
  }

  return getSiteByHandle(process.env.DEFAULT_SITE_HANDLE || "pranjal-site");
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await resolveSite();

  return {
    title: site?.name || "Website",
    description: site?.description || "Powered by Acme SaaS",

    other: site?.google_verification
      ? {
          "google-site-verification": site.google_verification,
        }
      : {},
  };
}
export function reportWebVitals(metric: any) {
  reportVitals(metric);
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
