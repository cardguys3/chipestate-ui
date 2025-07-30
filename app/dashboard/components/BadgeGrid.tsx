// /app/dashboard/components/BadgeGrid.tsx

'use client'

import React from 'react'
import Image from 'next/image'
import { UserBadge } from '../types'

// ==== BLOCK: Badge Section START ====
interface BadgeGridProps {
  userBadges: UserBadge[]
}

const BadgeGrid: React.FC<BadgeGridProps> = ({ userBadges }) => {
  if (!userBadges?.length) return null

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-3">Badges Earned</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {userBadges.map((badge) => (
          <div
            key={badge.key}
            className="bg-[#1E2A3C] border border-emerald-600 rounded-lg p-3 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 relative mb-2">
              <Image
                src={badge.icon_url}
                alt={badge.name}
                layout="fill"
                objectFit="contain"
                className="rounded"
              />
            </div>
            <div className="font-medium text-white">{badge.name}</div>
            <div className="text-sm text-gray-400">{badge.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BadgeGrid
// ==== BLOCK: Badge Section END ====
