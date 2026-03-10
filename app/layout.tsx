import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
    default: "AutosDealer — Tu concesionaria de confianza",
    template: "%s | AutosDealer",
  },
  description:
    "Encontrá el auto de tus sueños. Catálogo de vehículos nuevos y usados con los mejores precios. Contactate con nuestros asesores.",
  openGraph: {
    title: "AutosDealer — Tu concesionaria de confianza",
    description:
      "Encontrá el auto de tus sueños. Catálogo de vehículos nuevos y usados.",
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
      <body>{children}</body>
    </html>
  );
}
