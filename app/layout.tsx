import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import Header from "@/components/Header"      // ✅ import Header
import Footer from "@/components/Footer"      // ✅ optional Footer

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ChipEstate",
  description: "Invest in fractional real estate.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1D33] text-white`}
      >
        <Header />                 {/* ✅ Display the header on all pages */}
        <main>{children}</main>
        <Footer />                 {/* ✅ Optional: shared footer if you have one */}
      </body>
    </html>
  )
}
