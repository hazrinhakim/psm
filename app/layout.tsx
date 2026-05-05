import type { Metadata } from "next"
import { Manrope } from "next/font/google"
import { AuthSessionRecovery } from "@/components/auth/AuthSessionRecovery"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "ICAMS | PDT Kampar",
  description: "ICT Assets Management System PDT Kampar",
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
          <AuthSessionRecovery />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
