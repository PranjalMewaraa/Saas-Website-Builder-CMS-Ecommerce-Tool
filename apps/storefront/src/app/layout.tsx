import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { headers } from "next/headers";
import { getSiteByHandle, getMongoDb } from "@acme/db-mongo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

async function resolveSite() {
  const h = headers();
  const host = (await h).get("host")?.split(":")[0];

  const db = await getMongoDb();
  const sites = db.collection("sites");

  const site =
    (await sites.findOne({
      $or: [
        { primary_domain: host },
        { domains: host },
        { "domains.host": host },
      ],
    })) || null;

  if (site) return site;

  return getSiteByHandle(process.env.DEFAULT_SITE_HANDLE || "demo-site");
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
