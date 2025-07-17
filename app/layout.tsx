// /app/layout.tsx
'use client'

import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState, useEffect, useRef } from 'react'
import LoginModal from '@/components/LoginModal'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ChipEstate',
  description: 'Invest in fractional real estate.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [showLogin, setShowLogin] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setShowLogin(false)
      }
    }

    if (showLogin) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLogin])

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1D33] text-white`}
      >
        <Header onLoginClick={() => setShowLogin(true)} />
        <main>{children}</main>
        <Footer />
        {showLogin && (
          <div ref={modalRef}>
            <LoginModal onClose={() => setShowLogin(false)} />
          </div>
        )}
      </body>
    </html>
  )
}
