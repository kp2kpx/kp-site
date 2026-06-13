import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = "https://kp-singh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "K.P. Singh — Crypto-native builder & ecosystem operator",
  description:
    "Ex-finance, self-taught Solidity builder, Base & Farcaster ecosystem operator. I host the Spaces, run the builders' nights, and ship live mini-apps.",
  keywords: [
    "K.P. Singh",
    "kpx",
    "DevRel",
    "Developer Advocate",
    "Ecosystem",
    "Base",
    "Farcaster",
    "web3",
    "Solidity",
  ],
  authors: [{ name: "K.P. Singh" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "K.P. Singh — Crypto-native builder & ecosystem operator",
    description:
      "Ex-finance → self-taught Solidity builder → Base & Farcaster ecosystem operator. Host, builder, community OG.",
    siteName: "K.P. Singh",
  },
  twitter: {
    card: "summary_large_image",
    title: "K.P. Singh — Crypto-native builder & ecosystem operator",
    description:
      "Ex-finance → self-taught Solidity builder → Base & Farcaster ecosystem operator.",
    creator: "@KP2kpx",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
