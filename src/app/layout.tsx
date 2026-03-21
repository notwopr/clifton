import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeRandomizer } from "@/components/ThemeRandomizer";
import { NavLogo } from "@/components/NavLogo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clifton — Find & Rank Clinical Trials",
  description:
    "Enter a patient profile and instantly get a ranked list of recruiting clinical trials matched to your eligibility and preferences. Free, open source, and no tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <header className="border-b sticky top-0 z-50 bg-background/95 backdrop-blur">
          <div className="container max-w-5xl mx-auto px-4 h-32 flex items-end pb-3 justify-between">
            <NavLogo />
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">Each AI search costs ~$0.03 to run.</p>
                  <p className="text-xs text-foreground">Help keep Clifton&apos;s tusks shiny.</p>
                </div>
                <a
                  href="https://ko-fi.com/notwopr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shrink-0"
                >
                  Donate
                </a>
              </div>
              <ThemeRandomizer />
              <ThemeToggle />
            </div>
          </div>
        </header>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
