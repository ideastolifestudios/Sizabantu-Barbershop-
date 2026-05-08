import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// ─── Fonts ────────────────────────────────────────────────────────────────
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

// ─── Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL("https://sizabantubarbershop.co.za"),
  title: {
    default: "Sizabantu Barbershop | Premium Grooming & Master Fades | Midrand",
    template: "%s | Sizabantu Barbershop",
  },
  description:
    "Book your session online or join the live queue at Sizabantu Barbershop — premium grooming, master fades & precision cuts in Klipfontein View, Midrand, Gauteng. Open Tue–Sun 09:00–18:00.",
  keywords: [
    "barbershop Midrand",
    "barber Klipfontein View",
    "fade haircut Gauteng",
    "barbershop near me",
    "master barber Midrand",
    "book barber online",
    "Sizabantu Barbershop",
    "haircut Johannesburg",
  ],
  authors: [{ name: "Sizabantu Barbershop" }],
  creator: "Sizabantu Barbershop",
  publisher: "Sizabantu Barbershop",

  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://sizabantubarbershop.co.za",
    siteName: "Sizabantu Barbershop",
    title: "Sizabantu Barbershop | Premium Grooming & Master Fades",
    description:
      "Premium grooming & master fades in Midrand, Gauteng. Book online or join the live queue.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sizabantu Barbershop — Premium Grooming in Midrand",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Sizabantu Barbershop",
    description: "Premium grooming & master fades in Midrand, Gauteng.",
    images: ["/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },

  alternates: { canonical: "https://sizabantubarbershop.co.za" },

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  verification: {
    // Add your Google Search Console verification token here
    // google: "your-verification-token",
  },
};

// ─── LocalBusiness JSON-LD ────────────────────────────────────────────────
const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "HairSalon",
  "@id": "https://sizabantubarbershop.co.za/#business",
  name: "Sizabantu Barbershop",
  description:
    "Premium grooming and master fades in Klipfontein View, Midrand. Serving Gauteng since 2022.",
  url: "https://sizabantubarbershop.co.za",
  telephone: "+27607246829",
  email: "sizabantubarbershop.co.za",
  foundingDate: "2022",
  priceRange: "R30–R110",
  currenciesAccepted: "ZAR",
  paymentAccepted: "Cash, Card",
  address: {
    "@type": "PostalAddress",
    streetAddress: "644 Nancy Ndamase Street",
    addressLocality: "Klipfontein View",
    addressRegion: "Gauteng",
    addressCountry: "ZA",
    postalCode: "1685",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -25.9917,
    longitude: 28.1277,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  hasMap: "https://maps.google.com/?q=Klipfontein+View+644+Nancy+Ndamase+Street+Midrand",
  sameAs: ["https://www.instagram.com/sizabantubarbershop"],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5.0",
    reviewCount: "1200",
    bestRating: "5",
    worstRating: "1",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Barbershop Services",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fade" }, price: "50", priceCurrency: "ZAR" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Brush Cut" }, price: "35", priceCurrency: "ZAR" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Chiskop" }, price: "30", priceCurrency: "ZAR" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Razor Blade" }, price: "60", priceCurrency: "ZAR" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Fade & Shave" }, price: "60", priceCurrency: "ZAR" },
    ],
  },
};

// FAQ Schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I book an appointment at Sizabantu Barbershop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can book online at sizabantubarbershop.co.za or walk in and join our live digital queue. Walk-ins are welcome during business hours (Tue–Sun, 09:00–18:00).",
      },
    },
    {
      "@type": "Question",
      name: "Where is Sizabantu Barbershop located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We are located at 644 Nancy Ndamase Street, Klipfontein View, Midrand, Gauteng, South Africa.",
      },
    },
    {
      "@type": "Question",
      name: "What are your opening hours?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We are open Tuesday to Sunday from 09:00 to 18:00, including public holidays. We are closed on Mondays.",
      },
    },
    {
      "@type": "Question",
      name: "What is the Magic Stamp loyalty program?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Every completed haircut earns you one stamp. Collect 5 stamps for a free cap, and 10 stamps for a free haircut. Your stamps are tracked digitally.",
      },
    },
    {
      "@type": "Question",
      name: "How much does a fade cost at Sizabantu Barbershop?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A precision fade starts at R50. A fade with beard shave is R60, and a fade with graphic design is also R60. View the full price list on our website.",
      },
    },
  ],
};

// ─── Root Layout ──────────────────────────────────────────────────────────
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* LocalBusiness structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        {/* FAQ structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
        {/* Theme colour for mobile browsers */}
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="bg-szb-black text-szb-cream font-syne antialiased">
        {children}
      </body>
    </html>
  );
}
