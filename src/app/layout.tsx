import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Footer } from "@/components/layout/Footer";
import { DisclaimerBanner } from "@/components/common/DisclaimerBanner";
import { QuickBookingConcierge } from "@/components/common/QuickBookingConcierge";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Homie Drives — Mobile-First Car Rentals | Delhi NCR",
  description:
    "Affordable, flexible self-drive car rentals in Delhi NCR from ₹2,499 to ₹24,999/day. City cruisers, executive sedans, and supercar experiences with doorstep delivery and same pickup/return hubs.",
  icons: {
    icon: "/homie.drives.png",
    apple: "/homie.drives.png",
  },
  keywords: [
    "Car rental Delhi NCR",
    "Self drive cars Gurgaon",
    "Luxury car hire Noida",
    "Affordable car rental Delhi",
    "Homie Drives",
    "Long term car lease Delhi",
  ],
};

export const viewport: Viewport = {
  themeColor: "#50644E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} font-sans`}>
      <body className="min-h-screen bg-[#F3F6F1] text-[#172016] flex flex-col antialiased selection:bg-[#D4E0D1] selection:text-[#172016]">
        <DisclaimerBanner />
        <Navbar />
        <main className="flex-1 pb-20 md:pb-0">{children}</main>
        <QuickBookingConcierge />
        <Footer />
        <BottomNav />
      </body>
    </html>
  );
}
