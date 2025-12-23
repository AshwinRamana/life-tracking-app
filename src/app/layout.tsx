import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Momentum",
  description: "Daily life tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} antialiased bg-gray-100 flex justify-center h-screen overflow-hidden`}>
        {/* Mobile Container Simulation */}
        <div className="w-full max-w-[430px] bg-white shadow-2xl h-full relative flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto scrollbar-hide pb-24">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
