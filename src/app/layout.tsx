import type { Metadata } from "next";
import { Fraunces, Newsreader, IBM_Plex_Mono } from "next/font/google";
import { GardenRouteIllustration } from "./components/GardenRouteIllustration";
import "./globals.css";

/* Warm "digital garden" type system (Designer spec):
   headings Fraunces (display serif), body Newsreader (editorial
   serif), meta + nav + tags IBM Plex Mono. */
const body = Newsreader({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  style: ["normal", "italic"],
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500"],
});

const SITE_URL = "https://kp-singh.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "KP, Crypto-native builder & ecosystem operator",
  description:
    "Ex-finance, self-taught Solidity builder, Base & Farcaster ecosystem operator. I host the Spaces, run the builders' nights, and ship live mini-apps.",
  keywords: [
    "KP",
    "kpx",
    "DevRel",
    "Developer Advocate",
    "Ecosystem",
    "Base",
    "Farcaster",
    "web3",
    "Solidity",
  ],
  authors: [{ name: "KP" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "KP, Crypto-native builder & ecosystem operator",
    description:
      "Ex-finance to self-taught Solidity builder to Base & Farcaster ecosystem operator. Host, builder, community OG.",
    siteName: "KP",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "KP, crypto-native builder and ecosystem operator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KP, Crypto-native builder & ecosystem operator",
    description:
      "Ex-finance to self-taught Solidity builder to Base & Farcaster ecosystem operator.",
    creator: "@KP2kpx",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${body.variable} ${display.variable} ${mono.variable}`}>
        <GardenRouteIllustration />
        {children}
      </body>
    </html>
  );
}
