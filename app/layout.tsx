import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "pplab",
  description: "A private lab of personal tools and the things they make.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        <header className="px-6 pt-12 text-center sm:pt-16">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            pplab
          </Link>
        </header>
        {children}
      </body>
    </html>
  );
}
