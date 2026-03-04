import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nano Banana Intelligence Pipeline",
  description: "Next-generation multimodal image generation and analysis platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/imagetracerjs/1.2.6/imagetracer_v1.2.6.js" strategy="lazyOnload" />
        <Script src="https://cdn.jsdelivr.net/gh/jseidelin/exif-js/exif.js" strategy="lazyOnload" />
        {children}
      </body>
    </html>
  );
}
