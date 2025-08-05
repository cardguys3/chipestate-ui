// File: /app/dashboard/components/PerformanceCards.tsx

'use client'

import React from 'react'
import { Chip, Property } from '@/types'  // Fixed import path from '../types' to '@/types'

interface PerformanceCardsProps {
  netWorth: number
  totalPayout: number
  totalEarnings: number
  properties: Property[]
  chips: Chip[]
}

// ==== BLOCK: Performance Stats Cards – Grid START ====

const PerformanceCards: React.FC<PerformanceCardsProps> = ({
  netWorth,
  totalPayout,
  totalEarnings,
  properties,
  chips,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="text-sm text-gray-400">Net Worth</div>
        <div className="text-2xl font-bold">${netWorth.toFixed(2)}</div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="text-sm text-gray-400">Chip Earnings (selected)</div>
        <div className="text-2xl font-bold">${totalPayout.toFixed(2)}</div>
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="text-sm text-gray-400">All-Time Earnings</div>
        <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
      </div>

      <div className="relative group bg-gray-800 rounded-xl p-4">
        <div className="text-sm text-gray-400">Properties Owned</div>
        <div className="text-2xl font-bold cursor-pointer">{properties.length}</div>

        {/* Tooltip / flyout list of property titles */}
        {properties.length > 0 && (
          <div className="absolute z-10 left-0 top-full mt-2 w-64 bg-[#1E2A3C] border border-emerald-500 text-sm text-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="font-semibold text-emerald-400 mb-1">Your Properties:</p>
            <ul className="list-disc pl-5 space-y-1 max-h-48 overflow-y-auto">
              {properties.slice(0, 10).map((p) => (
                <li key={p.id} className="text-white">{p.title}</li>
              ))}
            </ul>
            {properties.length > 10 && (
              <p className="mt-2 text-gray-400 italic">+ {properties.length - 10} more…</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-4">
        <div className="text-sm text-gray-400">Total Chips</div>
        <div className="text-2xl font-bold">{chips.length}</div>
      </div>
    </div>
  )
}

// ==== BLOCK: Performance Stats Cards – Grid END ====

export default PerformanceCards
