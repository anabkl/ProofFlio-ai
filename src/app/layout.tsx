import type { Metadata } from "next";
import { MotionConfig } from "framer-motion";
import { LocaleProvider } from "@/components/locale-provider";
import { ThemeProvider, themeNoFlashScript } from "@/components/theme/theme-provider";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
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
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeNoFlashScript }} />
      </head>
      <body className="min-h-full bg-background text-foreground">
        <MotionConfig reducedMotion="user">
          <ThemeProvider>
            <LocaleProvider>{children}</LocaleProvider>
          </ThemeProvider>
        </MotionConfig>
      </body>
    </html>
  );
}
