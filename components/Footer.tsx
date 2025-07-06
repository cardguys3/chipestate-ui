import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-blue-900 text-white px-4 py-10 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Empty column where branding used to be */}
        <div></div>

        {/* Copyright - now in center */}
        <div className="text-sm text-center text-gray-300 order-2 sm:order-none">
          &copy; {new Date().getFullYear()} ChipEstate. All rights reserved.
        </div>

        {/* Navigation links - now right-aligned */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 text-sm">
          <Link href="/about" className="hover:text-amber-400">About</Link>
          <Link href="/contact" className="hover:text-amber-400">Contact</Link>
          <Link href="/glossary" className="hover:text-amber-400">Glossary</Link>
          <Link href="/terms" className="hover:text-amber-400">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-400">Privacy</Link>
        </div>
      </div>
    </footer>
  )
}
