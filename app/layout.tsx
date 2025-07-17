// /app/ClientLayout.tsx
'use client'

import { useState, useEffect, useRef } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LoginModal from '@/components/LoginModal'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
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
    <>
      <Header onLoginClick={() => setShowLogin(true)} />
      <main>{children}</main>
      <Footer />
      {showLogin && (
        <div ref={modalRef}>
          <LoginModal onClose={() => setShowLogin(false)} />
        </div>
      )}
    </>
  )
}
