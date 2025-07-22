// /app/ClientWrapper.tsx

'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { Database } from '@/types/supabase'
import LoginModal from '@/components/LoginModal'

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const modalRef = useRef<HTMLDivElement | null>(null)

  // 👇 Supabase session hydration
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        console.warn('⚠️ No Supabase session found.')
      }
      setReady(true)
    })
  }, [])

  // 👇 Close login modal on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  // 👇 Listen for custom "open-login" event
  useEffect(() => {
    const handleOpenLogin = () => setShowLogin(true)
    window.addEventListener('open-login', handleOpenLogin)
    return () => window.removeEventListener('open-login', handleOpenLogin)
  }, [])

  if (!ready) return null

  return (
    <SessionContextProvider supabaseClient={supabase}>
      <>
        {children}
        {showLogin && (
          <div ref={modalRef}>
            <LoginModal onClose={() => setShowLogin(false)} />
          </div>
        )}
      </>
    </SessionContextProvider>
  )
}
