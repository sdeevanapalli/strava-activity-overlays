import type { Metadata } from "next";
import { Bebas_Neue, Inter, Nunito, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-space-mono",
  weight: ["400", "700"],
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas-neue",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Strava Activity Overlays",
  description: "Create beautiful transparent PNG overlays from your Strava activities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} ${inter.variable} ${spaceGrotesk.variable} ${spaceMono.variable} ${bebasNeue.variable} bg-[#F5F5F5] text-[#111111]`}>
        {children}
      </body>
    </html>
  );
}
