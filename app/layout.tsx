import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "ship",
  description: "Pastebin for AI-generated apps.",
  metadataBase: new URL(siteUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto min-h-screen max-w-2xl px-6 py-16">
          <nav className="flex gap-3 opacity-60">
            <Link href="/" prefetch className="underline underline-offset-2">
              ship
            </Link>
            <Link href="/docs" prefetch className="underline underline-offset-2">
              docs
            </Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
