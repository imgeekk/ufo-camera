import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FLIR Image Converter",
  description: "Convert images to FLIR/thermal imaging style",

  openGraph: {
    title: "UFO Camera",
    description: "A fun project to convert regular images into FLIR/thermal imaging style",
    url: "https://ufo-ir-img.vercel.app/",
    siteName: "UAP img converter",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Preview image description",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "UAP img converter",
    description: "Convert images to FLIR/thermal imaging style",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
