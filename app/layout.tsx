import type { Metadata, Viewport } from "next"
import { Manrope } from "next/font/google"
import { AuthSessionRecovery } from "@/components/auth/AuthSessionRecovery"
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt"
import { PwaRegistrar } from "@/components/pwa/PwaRegistrar"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  applicationName: "ICAMS",
  title: "ICAMS | PDT Kampar",
  description: "ICT Assets Management System PDT Kampar",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ICAMS",
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  themeColor: "#4f6b95",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} bg-background text-foreground antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <PwaRegistrar />
          <PwaInstallPrompt />
          <AuthSessionRecovery />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
