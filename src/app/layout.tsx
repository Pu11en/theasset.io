import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ASSET Marketing Studio | Double Your Sales in 90 Days or It's Free",
  description: "ASSET Marketing Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do. Trusted by 500+ businesses.",
  keywords: ["marketing agency", "performance marketing", "sales growth", "digital marketing", "ROI guarantee"],
  authors: [{ name: "ASSET Marketing Studio" }],
  creator: "ASSET Marketing Studio",
  publisher: "ASSET Marketing Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://assetmarketing.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://assetmarketing.com",
    title: "ASSET Marketing Studio | Double Your Sales in 90 Days or It's Free",
    description: "ASSET Marketing Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do.",
    siteName: "ASSET Marketing Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "ASSET Marketing Studio | Double Your Sales in 90 Days or It's Free",
    description: "ASSET Marketing Studio builds 90-day performance campaigns that deliver measurable results. Double your sales in 90 days or we work for free until you do.",
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
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
