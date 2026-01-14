import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { RouteLoadingOverlay } from "@/components/ui/route-loading-overlay"
import "./globals.css"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "ICAMS | PDT Kampar",
  description: "ICT Assets Management System PDT Kampar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
    <body
      className={`${poppins.variable} antialiased`}
      style={{
        background:
          "linear-gradient(126deg, rgba(176,176,176,1) 0%, rgba(255,255,255,1) 100%)",
      }}
    >
      {children}
      <Toaster />
      <RouteLoadingOverlay />
    </body>
  </html>
  );
}
