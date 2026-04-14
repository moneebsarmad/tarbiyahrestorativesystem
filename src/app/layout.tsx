import type { Metadata } from "next";
import {
  Amiri,
  DM_Sans,
  Lora,
  Noto_Naskh_Arabic
} from "next/font/google";

import { ThemeProvider } from "@/components/providers/theme-provider";

import "./globals.css";

const displayFont = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"]
});

const bodyFont = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"]
});

const arabicFont = Amiri({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "700"]
});

const arabicUiFont = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic-ui",
  weight: ["400", "700"]
});

export const metadata: Metadata = {
  title: "Restorative Tarbiyah System",
  description:
    "Phase 0 scaffold for Brighter Horizons Academy's restorative tarbiyah web application."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} ${arabicFont.variable} ${arabicUiFont.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
