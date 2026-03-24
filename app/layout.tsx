import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sileo";
import "sileo/styles.css";
import ReferralCapture from "@/components/ReferralCapture";
import Providers from "@/app/providers";
import { Analytics } from "@vercel/analytics/next";

const lato = localFont({
  src: [
    { path: "../public/fonts/lato-v16-latin-regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/lato-v16-latin-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
});

const carmaxSharp = localFont({
  src: "../public/fonts/CarMaxSharpSansDisp-Bold.woff2",
  weight: "700",
  variable: "--font-carmax-sharp",
  display: "swap",
});

const rbRational = localFont({
  src: "../public/fonts/RBRationalNeueCondensed-Bold.woff2",
  weight: "700",
  variable: "--font-rb-rational",
  display: "swap",
});

const SITE_URL = "https://ffspeedcars.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FF Speed Cars — Used Cars Fort Worth, TX",
    template: "%s | FF Speed Cars",
  },
  description:
    "Buy quality used cars in Fort Worth, TX. FF Speed Cars offers transparent pricing, clean titles, and personalized service. Browse our inventory today.",
  keywords: [
    "used cars Fort Worth TX",
    "autos usados Fort Worth",
    "used cars near me",
    "buy used car Texas",
    "carros usados Fort Worth",
    "FF Speed Cars",
    "used SUV Fort Worth",
    "used trucks Fort Worth",
    "pre-owned vehicles Texas",
    "affordable cars Fort Worth",
  ],
  authors: [{ name: "FF Speed Cars" }],
  creator: "FF Speed Cars",
  publisher: "FF Speed Cars",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: SITE_URL,
  },
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-nuevo.png",
  },
  openGraph: {
    title: "FF Speed Cars — Used Cars Fort Worth, TX",
    description:
      "Quality used cars in Fort Worth, TX. Transparent pricing, clean titles, and personalized service.",
    url: SITE_URL,
    siteName: "FF Speed Cars",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FF Speed Cars — Used Cars Fort Worth TX",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FF Speed Cars — Used Cars Fort Worth, TX",
    description:
      "Quality used cars in Fort Worth, TX. Transparent pricing, clean titles, and personalized service.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: "FF Speed Cars",
    description: "Quality used cars in Fort Worth, TX. Transparent pricing and personalized service.",
    url: SITE_URL,
    telephone: "+1-817-000-0000",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Fort Worth",
      addressRegion: "TX",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 32.7555,
      longitude: -97.3308,
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "09:00", closes: "18:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "16:00" },
    ],
    priceRange: "$$",
    image: `${SITE_URL}/logo-nuevo.png`,
    sameAs: [],
  };

  return (
    <html lang="en" className={`${lato.variable} ${carmaxSharp.variable} ${rbRational.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <Providers>
          <Toaster position="top-center" theme="dark" />
          <ReferralCapture />
          {children}
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
