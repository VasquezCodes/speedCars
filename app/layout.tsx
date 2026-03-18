import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "sileo";
import "sileo/styles.css";
import ReferralCapture from "@/components/ReferralCapture";
import Providers from "@/app/providers";

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

export const metadata: Metadata = {
  title: {
    default: "FF Speed Cars — Fort Worth, TX",
    template: "%s | FF Speed Cars",
  },
  description:
    "Encuentra tu próximo vehículo en FF Speed Cars, Fort Worth TX. Autos usados de calidad, precios transparentes y atención personalizada.",
  icons: {
    icon: "/favicon.svg",
    apple: "/logo-nuevo.png",
  },
  openGraph: {
    title: "FF Speed Cars — Fort Worth, TX",
    description:
      "Autos usados de calidad en Fort Worth, TX. Precios transparentes, título limpio y atención personalizada.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${lato.variable} ${carmaxSharp.variable} ${rbRational.variable}`}>
      <body>
        <Providers>
          <Toaster position="top-center" theme="dark" />
          <ReferralCapture />
          {children}
        </Providers>
      </body>
    </html>
  );
}
