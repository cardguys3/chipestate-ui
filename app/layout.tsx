// /app/layout.tsx

import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'

const inter = Inter({
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChipEstate',
  description: 'Invest in fractional real estate.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0B1D33] text-white`}>
        <Header />
        {children}
        <Footer />
        <LoginModal onClose={() => {}} />
      </body>
    </html>
  )
}
