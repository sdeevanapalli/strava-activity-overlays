import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
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
      <body className={`${nunito.variable} ${inter.variable} bg-[#0F0F0F] text-white`}>
        {children}
      </body>
    </html>
  );
}
