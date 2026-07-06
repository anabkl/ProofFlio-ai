import type { Metadata } from "next";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofFolio AI",
  description:
    "Turn real project evidence into a source-backed professional portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#05070d] text-white">
        <LocaleProvider>{children}</LocaleProvider>
      </body>
    </html>
  );
}
