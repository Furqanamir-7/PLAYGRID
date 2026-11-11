import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#09080A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "PLAYGRID — Pakistan's Futsal, Organised.",
  description: "Premier sports tournament management platform for futsal in Pakistan. Live standings, brackets, fixtures, top scorers, and team registrations.",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://playgrid.vercel.app"),
  icons: {
    icon: [
      { url: "/icons/icon.png", type: "image/png" },
      { url: "/favicon.ico" }
    ],
    apple: [
      { url: "/icons/icon.png", sizes: "180x180", type: "image/png" }
    ],
  },
  openGraph: {
    title: "PLAYGRID — Pakistan's Futsal, Organised.",
    description: "Premier sports tournament management platform for futsal in Pakistan. Live standings, brackets, fixtures, and registrations.",
    url: "https://playgrid.vercel.app",
    siteName: "PLAYGRID",
    images: [
      {
        url: "/brand/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "PLAYGRID - Pakistan's Futsal, Organised.",
      },
    ],
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PLAYGRID — Pakistan's Futsal, Organised.",
    description: "Premier sports tournament management platform for futsal in Pakistan.",
    images: ["/brand/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col selection:bg-[var(--plum-500)] selection:text-white">
        {children}
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
