'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dynamic from 'next/dynamic'

const LoginModal = dynamic(() => import('./LoginModal'), { ssr: false })

const ADMIN_EMAILS = ['mark@chipestate.com', 'cardguys3@gmail.com']

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const isAdmin = userEmail && ADMIN_EMAILS.includes(userEmail)

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUserEmail(data.user?.email ?? null)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/' // Refresh to homepage after logout
  }

  return (
    <>
      <header className="bg-blue-900 shadow-md sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="ChipEstate logo"
              width={320}
              height={320}
              className="w-40 h-auto"
              title="ChipEstate"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-1 items-center text-base font-medium text-white">
            <Link href="/market" className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900">Market</Link>
            <Link href="/dashboard" className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900">Dashboard</Link>
            <Link href="/glossary" className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900">Glossary</Link>
            <Link href="/about" className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900">About</Link>
           
            {userEmail ? (
              <>
                {isAdmin && (
                  <Link href="/admin" className="px-3 py-1 rounded-md transition hover:bg-yellow-300 text-amber-200 hover:text-blue-900">Admin</Link>
                )}
                <button onClick={handleLogout} className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900">
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLogin(true)}
                  className="px-3 py-1 rounded-md transition hover:bg-amber-100 hover:text-blue-900"
                >
                  Login
                </button>
                <Link href="/register" className="ml-4 bg-emerald-600 text-white px-6 py-1.5 rounded-md hover:bg-emerald-700">Sign Up</Link>
              </>
            )}
          </nav>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white text-xl focus:outline-none">
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-2 bg-blue-900 text-white shadow">
            <Link href="/market" className="block hover:text-amber-600">Market</Link>
            <Link href="/dashboard" className="block hover:text-amber-600">Dashboard</Link>
            <Link href="/glossary" className="block hover:text-amber-600">Glossary</Link>
            <Link href="/about" className="block hover:text-amber-600">About</Link>

            {userEmail ? (
              <>
                {isAdmin && <Link href="/admin" className="block hover:text-yellow-400">Admin</Link>}
                <button onClick={handleLogout} className="block text-left w-full hover:text-amber-600">Log Out</button>
              </>
            ) : (
              <>
                <button onClick={() => setShowLogin(true)} className="block text-left w-full hover:text-amber-600">Login</button>
                <Link href="/register" className="block bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Sign Up</Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* Login Modal */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  )
}
