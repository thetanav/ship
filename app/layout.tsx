import type { Metadata } from "next";
import "./globals.css";
import { siteUrl } from "@/lib/config";

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
      <body>{children}</body>
    </html>
  );
}
