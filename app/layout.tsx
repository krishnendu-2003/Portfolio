import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/siteConfig";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Krishnendu Samanta",
  description:
    "Krishnendu Samanta — AI/ML and frontend engineer. CTO & Co-founder at Lumeo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={jetbrainsMono.variable}>
      <body>{children}</body>
    </html>
  );
}
