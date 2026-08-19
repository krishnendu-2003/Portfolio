import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { SITE_URL } from "@/lib/siteConfig";

// Runs before hydration so a returning visitor's saved wallpaper applies
// before first paint — otherwise there's a flash of the default teal.
const WALLPAPER_PREPAINT_SCRIPT = `
try {
  var raw = localStorage.getItem("portfolio:wallpaper:v1");
  if (raw) document.documentElement.setAttribute("data-wallpaper", JSON.parse(raw));
} catch (e) {}
`;

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
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <head>
        <Script id="wallpaper-prepaint" strategy="beforeInteractive">
          {WALLPAPER_PREPAINT_SCRIPT}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
