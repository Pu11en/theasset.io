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
  keywords: ["marketing agency", "performance marketing", "sales growth", "digital marketing", "ROI guarantee"],
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
  },
  twitter: {
    card: "summary_large_image",
    title: "The Asset Studio | Double Your Sales in 90 Days or It's Free",
    description: "The Asset Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do.",
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
      <body
        className={`${inter.variable} ${interDisplay.variable} ${jetbrainsMono.variable} font-sans antialiased bg-deep-blue text-white`}
      >
        {children}
      </body>
    </html>
  );
}
