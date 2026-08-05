import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KaarYab Afghanistan — Find Jobs, Internships, Scholarships",
  description:
    "Afghanistan's leading opportunity platform. Discover remote jobs, on-site jobs, internships, scholarships, training, courses, freelance and more.",
  keywords: [
    "jobs afghanistan",
    "remote jobs afghanistan",
    "kabul jobs",
    "scholarships afghanistan",
    "internships afghanistan",
    "kaar yab",
    "کاروب افغانستان",
  ],
  openGraph: {
    title: "KaarYab Afghanistan",
    description: "Find your next opportunity in Afghanistan.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
