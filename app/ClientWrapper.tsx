// /app/ClientWrapper.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import LoginModal from '@/components/LoginModal'

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [showLogin, setShowLogin] = useState(false)

  const modalRef = useRef<HTMLDivElement | null>(null)

  // Watch for click outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
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

  // Listen globally for open modal event
  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true)
    window.addEventListener('open-login', handleOpenLogin)
    return () => window.removeEventListener('open-login', handleOpenLogin)
  }, [])

  return (
    <>
      {children}
      {showLogin && (
        <div ref={modalRef}>
          <LoginModal onClose={() => setShowLogin(false)} />
        </div>
      )}
    </>
  )
}
