'use client'

import Link from 'next/link'

export default function AdminAnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-20 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full text-center space-y-6">
        <h1 className="text-4xl font-bold text-emerald-400">Site Analytics</h1>
        <p className="text-lg text-gray-300">
          View detailed real-time analytics for ChipEstate directly on Vercel.
        </p>
        <Link
          href="https://vercel.com/marks-projects-e28460ed/chipestate-ui-ilsp/analytics"
          target="_blank"
          className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
        >
          Go to Vercel Analytics
        </Link>
      </div>
    </main>
  )
}
