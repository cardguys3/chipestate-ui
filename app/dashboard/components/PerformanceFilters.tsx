// /app/dashboard/components/PerformanceFilters.tsx

'use client'

import React from 'react'
import { Chip, Property } from '../types'

interface PerformanceFiltersProps {
  properties: Property[]
  chips: Chip[]
  months: string[]
  selectedProps: string[]
  setSelectedProps: React.Dispatch<React.SetStateAction<string[]>>
  selectedChips: string[]
  setSelectedChips: React.Dispatch<React.SetStateAction<string[]>>
  monthIndexes: [number, number]
  setMonthIndexes: React.Dispatch<React.SetStateAction<[number, number]>>
}

// ==== BLOCK: Performance Filters – Wrapper START ====

const PerformanceFilters: React.FC<PerformanceFiltersProps> = ({
  properties,
  chips,
  months,
  selectedProps,
  setSelectedProps,
  selectedChips,
  setSelectedChips,
  monthIndexes,
  setMonthIndexes,
}) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4 items-end">
      {/* ==== BLOCK: Performance Filter – Property Multi-Select START ==== */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-400">Property</label>
        <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
          {properties.map((p) => (
            <label key={p.id} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={selectedProps.includes(p.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedProps([...selectedProps, p.id])
                  } else {
                    setSelectedProps(selectedProps.filter((id) => id !== p.id))
                  }
                }}
              />
              <span>{p.title}</span>
            </label>
          ))}
        </div>
      </div>
      {/* ==== BLOCK: Performance Filter – Property Multi-Select END ==== */}

      {/* ==== BLOCK: Performance Filter – Chip Multi-Select START ==== */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-400">Chip</label>
        <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
          {chips.map((chip) => {
            const propTitle = properties.find((p) => p.id === chip.property_id)?.title || 'Unknown'
            const label = `${chip.serial} - ${propTitle}`
            return (
              <label key={chip.id} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  checked={selectedChips.includes(chip.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedChips([...selectedChips, chip.id])
                    } else {
                      setSelectedChips(selectedChips.filter((id) => id !== chip.id))
                    }
                  }}
                />
                <span>{label}</span>
              </label>
            )
          })}
        </div>
      </div>
      {/* ==== BLOCK: Performance Filter – Chip Multi-Select END ==== */}

      {/* ==== BLOCK: Performance Filter – Month Multi-Select START ==== */}
      <div className="flex flex-col">
        <label className="text-sm text-gray-400">Date (Month)</label>
        <div className="bg-[#1E2A3C] border border-emerald-600 rounded-md p-2 max-h-36 overflow-y-auto text-sm text-white">
          {months.map((month, idx) => (
            <label key={month} className="flex items-center space-x-2 mb-1">
              <input
                type="checkbox"
                checked={idx >= monthIndexes[0] && idx <= monthIndexes[1]}
                onChange={(e) => {
                  let start = monthIndexes[0]
                  let end = monthIndexes[1]

                  if (e.target.checked) {
                    start = Math.min(start, idx)
                    end = Math.max(end, idx)
                  } else {
                    if (idx === start && idx === end)
                      return setMonthIndexes([0, months.length - 1])
                    else if (idx === start) start++
                    else if (idx === end) end--
                  }

                  setMonthIndexes([start, end])
                }}
              />
              <span>{month}</span>
            </label>
          ))}
        </div>
      </div>
      {/* ==== BLOCK: Performance Filter – Month Multi-Select END ==== */}
    </div>
  )
}

// ==== BLOCK: Performance Filters – Wrapper END ====

export default PerformanceFilters
