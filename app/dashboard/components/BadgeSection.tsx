// /app/dashboard/components/BadgeSection.tsx

'use client'

import React from 'react'
import { BadgeWithIcon } from '@/types'
import Image from 'next/image'

interface BadgeSectionProps {
  badges: BadgeWithIcon[]
}

const BadgeSection: React.FC<BadgeSectionProps> = ({ badges }) => {
  // ==== BLOCK: Badge Section START ====
  return (
    <section className="bg-[#1E2A3C] rounded-xl p-6 shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-4 text-emerald-400">Badges Earned</h2>

      {badges.length === 0 ? (
        <p className="text-gray-400">You haven’t earned any badges yet. Start participating to earn some!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {badges.map((badge) => (
            <div
              key={badge.key}
              className="flex flex-col items-center bg-gray-800 p-4 rounded-lg border border-emerald-500"
            >
              <Image
                src={badge.icon_url}
                alt={badge.name}
                width={64}
                height={64}
                className="mb-2"
              />
              <h3 className="text-lg font-semibold text-white">{badge.name}</h3>
              <p className="text-sm text-gray-300 text-center">{badge.description}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
  // ==== BLOCK: Badge Section END ====
}

export default BadgeSection
