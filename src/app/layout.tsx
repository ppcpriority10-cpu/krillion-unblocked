import type { Metadata, Viewport } from "next";
import { Crimson_Text, Nunito, Press_Start_2P, Silkscreen, Space_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { SITE } from "@/lib/site";

const crimson = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

/** Chunky arcade pixel font — game logos (KRILLION, NOILLIRK). */
const pixelLogo = Press_Start_2P({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pixel",
  display: "swap",
});

/** Small pixel UI font — buttons, tabs, HUD chips. */
const pixelUi = Silkscreen({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-pixel-ui",
  display: "swap",
});

/** Terminal mono — question cards, inputs, depth numbers. */
const gameMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-game-mono",
  display: "swap",
});

/** Clean rounded sans — the v23 Krillion UI font (modern, not pixel). */
const gameUi = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-game-ui",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Krillion Unblocked — Free Daily Browser Games",
    template: "%s",
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "krillion unblocked",
    "daily games",
    "free browser games",
    "word games",
    "daily puzzle",
    "noillirk",
    "word hunt",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    url: SITE.url,
    title: "Krillion Unblocked — Free Daily Browser Games",
    description: SITE.description,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Krillion Unblocked — free daily browser games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Krillion Unblocked — Free Daily Browser Games",
    description: SITE.description,
  },
};

export const viewport: Viewport = {
  themeColor: "#faf6ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${crimson.variable} ${pixelLogo.variable} ${pixelUi.variable} ${gameMono.variable} ${gameUi.variable}`}
    >
      <body className="antialiased">
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
