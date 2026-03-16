import type { Metadata } from "next";
import { DM_Sans, Literata } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const literata = Literata({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BookLeaf - Author Support Portal",
  description: "Support ticket system for BookLeaf publishing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${literata.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
