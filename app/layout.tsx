import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-montserrat",
  display: "swap",
});

// Nexa (fuente de marca) para titulares. Ficheros en app/fonts/.
const nexa = localFont({
  src: [
    { path: "./fonts/NexaLight.woff2", weight: "300", style: "normal" },
    { path: "./fonts/NexaBold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-nexa",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cine de Verano · ÚNIO Madrid",
  description:
    "La programación del cine de verano de ÚNIO Madrid. Consulta la cartelera y vota tus películas favoritas.",
  applicationName: "Cine de Verano ÚNIO",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cine ÚNIO",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserrat.variable} ${nexa.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink-soft">{children}</body>
    </html>
  );
}
