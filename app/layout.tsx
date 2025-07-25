// /app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ClientWrapper from './ClientWrapper'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChipEstate',
  description: 'The Bitcoin of Fractional Real Estate.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0B1D33] text-white`}>
        <ClientWrapper>
          <Header />
          {/* ✅ Wrap children in <main> to ensure consistent layout and spacing */}
          <main>{children}</main>
          <Footer />
        </ClientWrapper>
      </body>
    </html>
  )
}
