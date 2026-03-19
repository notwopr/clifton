import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { ThemeToggle } from "@/components/ThemeToggle";
import { NavLogo } from "@/components/NavLogo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Clifton — Find & Rank Clinical Trials",
  description:
    "Enter a patient profile and instantly get a ranked list of recruiting clinical trials matched to your eligibility and preferences. Free, private, no account needed.",
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
            <ThemeToggle />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
