import "./globals.css";
import Providers from "./providers";
import ShellGate from "./shell/ShellGate";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-gray-950 ">
        <Providers>
          <ShellGate>{children}</ShellGate>
        </Providers>
      </body>
    </html>
  );
}
