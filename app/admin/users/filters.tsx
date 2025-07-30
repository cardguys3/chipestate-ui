// ==== FILE: /app/admin/users/filters.tsx START ====
'use client'

import { useState, useEffect } from 'react'
import { Property, User } from '@/types'
import { formatPhoneNumber } from './formatPhoneNumber'

type FiltersProps = {
  users: User[]
  properties: Property[]
  onFilterChange: (filtered: User[]) => void
}

export default function Filters({ users, properties, onFilterChange }: FiltersProps) {
  const [activeOnly, setActiveOnly] = useState(false)
  const [approvedOnly, setApprovedOnly] = useState(false)
  const [unverifiedOnly, setUnverifiedOnly] = useState(false)

  useEffect(() => {
    let filtered = [...users]
    if (activeOnly) {
      filtered = filtered.filter((user) => user.is_active)
    }
    if (approvedOnly) {
      filtered = filtered.filter((user) => user.is_approved)
    }
    if (unverifiedOnly) {
      filtered = filtered.filter((user) => !user.email_confirmed_at)
    }
    onFilterChange(filtered)
  }, [activeOnly, approvedOnly, unverifiedOnly, users, onFilterChange])

  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl mb-4 border border-emerald-500">
      <h2 className="text-lg font-bold text-emerald-400 mb-2">Filters</h2>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="form-checkbox text-emerald-600"
            checked={activeOnly}
            onChange={(e) => setActiveOnly(e.target.checked)}
          />
          <span className="text-sm">Active Users Only</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="form-checkbox text-emerald-600"
            checked={approvedOnly}
            onChange={(e) => setApprovedOnly(e.target.checked)}
          />
          <span className="text-sm">Approved Users Only</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            className="form-checkbox text-emerald-600"
            checked={unverifiedOnly}
            onChange={(e) => setUnverifiedOnly(e.target.checked)}
          />
          <span className="text-sm">Unverified Email Only</span>
        </label>
      </div>
    </div>
  )
}
// ==== FILE: /app/admin/users/filters.tsx END ====
