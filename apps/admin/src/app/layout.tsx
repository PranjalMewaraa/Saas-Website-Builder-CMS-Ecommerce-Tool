import "./globals.css";
import Providers from "./providers";
import ShellGate from "./(adminPages)/shell/ShellGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen h-full bg-neutral-50 text-gray-950 ">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
