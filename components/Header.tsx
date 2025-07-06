'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-blue-900 shadow-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
        <Image
	  src="/logo.png"
	  alt="ChipEstate logo"
	  width={320}
	  height={320}
	  className="w-40 h-auto"  // Tailwind width (6x increase), keeps nav layout intact
	  title="ChipEstate"
	/>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-1 items-center text-base font-medium text-white">
          <Link href="/market" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Market</Link>
          <Link href="/glossary" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Glossary</Link>
          <Link href="/about" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">About</Link>
          <Link href="/contact" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Contact</Link>
          <Link href="/terms" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Terms</Link>
          <Link href="/privacy" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Privacy</Link>
          <Link href="/login" className="px-3 py-1 rounded-md transition-colors duration-200 hover:bg-amber-100 hover:text-blue-900">Login</Link>
          <Link href="/signup" className="ml-4 bg-emerald-600 text-white px-6 py-1.5 rounded-md hover:bg-emerald-700">
            Sign Up
          </Link>
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
          <Link href="/glossary" className="block hover:text-amber-600">Glossary</Link>
          <Link href="/about" className="block hover:text-amber-600">About</Link>
          <Link href="/contact" className="block hover:text-amber-600">Contact</Link>
          <Link href="/terms" className="block hover:text-amber-600">Terms</Link>
          <Link href="/privacy" className="block hover:text-amber-600">Privacy</Link>
          <Link href="/login" className="block hover:text-amber-600">Login</Link>
          <Link href="/signup" className="block bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700">Sign Up</Link>
        </div>
      )}
    </header>
  )
}