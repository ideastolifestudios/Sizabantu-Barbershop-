import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sizabantu Barbershop | Premium Grooming & Master Fades",
  description: "Book your session or join the live queue at Sizabantu Barbershop, Midrand. Excellence in grooming since 2022.",
  keywords: ["barbershop", "Midrand", "Klipfontein View", "fade", "haircut", "queue booking"],
  openGraph: {
    title: "Sizabantu Barbershop",
    description: "Premium grooming & master fades in Midrand, Gauteng.",
    url: "https://sizabantubarbershop.co.za",
    siteName: "Sizabantu Barbershop",
    locale: "en_ZA",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
