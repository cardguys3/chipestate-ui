// file: app/admin/badges/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { v4 as uuidv4 } from 'uuid'
import { toast } from 'react-hot-toast'

const BadgesPage = () => {
  const supabase = createClientComponentClient<Database>()
  const [catalog, setCatalog] = useState<any[]>([])
  const [userEmail, setUserEmail] = useState('')
  const [selectedBadge, setSelectedBadge] = useState('')
  const [loading, setLoading] = useState(false)

  // Load badge catalog
  useEffect(() => {
    const loadBadges = async () => {
      const { data, error } = await supabase.from('badges_catalog').select('*')
      if (error) {
        toast.error('Failed to load badges')
      } else {
        setCatalog(data)
      }
    }
    loadBadges()
  }, [])

  // Manual badge award handler
  const handleAward = async () => {
    if (!userEmail || !selectedBadge) return toast.error('Email and badge are required')
    setLoading(true)

    const { data: user, error: userError } = await supabase
      .from('users_extended')
      .select('id')
      .eq('email', userEmail.toLowerCase())
      .single()

    if (userError || !user) {
      toast.error('User not found')
      setLoading(false)
      return
    }

    const badgeKey = selectedBadge

    // Insert into user_badges
    const { error: badgeErr } = await supabase.from('user_badges').insert({
      id: uuidv4(),
      user_id: user.id,
      badge_key: badgeKey,
    })

    if (badgeErr) {
      toast.error('Could not award badge')
    } else {
      toast.success('Badge awarded!')

      // Insert into activity log
      await supabase.from('badge_activity_log').insert({
        user_id: user.id,
        badge_key: badgeKey,
        triggered_by: 'manual_award',
      })
    }
    setLoading(false)
  }

  return (
    <main className="p-6 bg-dark text-white min-h-screen">
      <h1 className="text-3xl font-bold mb-6">🏅 Badge Catalog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
        {catalog.map(badge => (
          <div
            key={badge.key}
            className="bg-white/5 p-4 rounded-xl border border-white/10 shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">{badge.name}</h2>
              <span className="text-xs bg-emerald-700 px-2 py-1 rounded-full uppercase">
                {badge.category || 'General'}
              </span>
            </div>
            <p className="text-sm mb-3">{badge.description}</p>
            <p className="text-sm text-yellow-400">Points: {badge.points}</p>
            <img
              src={badge.icon_url}
              alt={badge.name}
              className="mt-3 h-12 w-12 object-contain"
            />
          </div>
        ))}
      </div>

      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
        <h2 className="text-2xl font-bold mb-4">🎯 Manually Award a Badge</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm mb-1">User Email</label>
            <input
              type="email"
              value={userEmail}
              onChange={e => setUserEmail(e.target.value)}
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-600 text-white"
              placeholder="example@domain.com"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Select Badge</label>
            <select
              value={selectedBadge}
              onChange={e => setSelectedBadge(e.target.value)}
              className="w-full rounded px-3 py-2 bg-gray-800 border border-gray-600 text-white"
            >
              <option value="">Select a badge</option>
              {catalog.map(b => (
                <option key={b.key} value={b.key}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleAward}
              disabled={loading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow-md w-full"
            >
              {loading ? 'Awarding…' : 'Award Badge'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default BadgesPage
