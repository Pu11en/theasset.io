import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const interDisplay = Inter({
  subsets: ["latin"],
  variable: "--font-inter-display",
  weight: ["700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Asset Studio | Double Your Sales in 90 Days or It's Free",
  description: "The Asset Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do. Trusted by 500+ businesses.",
  keywords: [
    "marketing agency",
    "performance marketing",
    "sales growth",
    "digital marketing",
    "ROI guarantee",
    "lead generation",
    "conversion optimization",
    "content marketing",
    "social media marketing",
    "campaign management",
    "marketing automation",
    "brand strategy",
    "customer acquisition",
    "revenue growth",
    "marketing analytics"
  ],
  authors: [{ name: "The Asset Studio" }],
  creator: "The Asset Studio",
  publisher: "The Asset Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://theassetstudio.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://theassetstudio.com",
    title: "The Asset Studio | Double Your Sales in 90 Days or It's Free",
    description: "The Asset Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do.",
    siteName: "The Asset Studio",
    images: [
      {
        url: "https://theassetstudio.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "The Asset Studio - Performance Marketing Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Asset Studio | Double Your Sales in 90 Days or It's Free",
    description: "The Asset Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do.",
    images: ["https://theassetstudio.com/twitter-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "The Asset Studio",
              "url": "https://theassetstudio.com",
              "logo": "https://theassetstudio.com/logo.png",
              "description": "The Asset Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do. Trusted by 500+ businesses.",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-555-123-4567",
                "contactType": "customer service",
                "availableLanguage": "English"
              },
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "US"
              },
              "sameAs": [
                "https://www.instagram.com/theassetstudio",
                "https://www.linkedin.com/company/the-asset-studio",
                "https://www.facebook.com/theassetstudio"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${interDisplay.variable} ${jetbrainsMono.variable} font-sans antialiased bg-deep-blue text-white`}
      >
        {children}
      </body>
    </html>
  );
}
