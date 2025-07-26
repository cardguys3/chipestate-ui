// /app/admin/badges/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useSupabaseClient, useSession } from '@supabase/auth-helpers-react'
import type { Database } from '@/types/supabase'
import { toast } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

export default function BadgesPage() {
  const supabase = useSupabaseClient<Database>()
  const session = useSession()

  const [catalog, setCatalog] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [selectedUserInfo, setSelectedUserInfo] = useState<any | null>(null)
  const [selectedBadge, setSelectedBadge] = useState('')
  const [loading, setLoading] = useState(false)

    useEffect(() => {
    if (!session?.user?.id) return

    console.log('🔐 Logged in as:', session?.user?.email) // <-- Added for debugging

    const loadBadgesAndUsers = async () => {
      const { data: badgeData, error: badgeError } = await supabase
        .from('badges_catalog')
        .select('*')

      if (badgeError) toast.error('Failed to load badges')
      else setCatalog(badgeData || [])

      const { data: userList, error: userError } = await supabase
        .from('users_extended')
        .select('id, email, first_name, last_name')
        .order('first_name', { ascending: true })

      if (userError) toast.error('Failed to load users')
      else setUsers(userList || [])
    }

    loadBadgesAndUsers()
  }, [session, supabase])


  useEffect(() => {
    if (!selectedUserId) {
      setSelectedUserInfo(null)
      return
    }

    const fetchUserInfo = async () => {
      const { data: chipsData } = await supabase
        .from('chips')
        .select('property_id')
        .eq('user_id', selectedUserId)

      const chipCount = chipsData?.length || 0
      const propertySet = new Set(chipsData?.map(chip => chip.property_id))
      const propertyCount = propertySet.size

      const { data: badgesData } = await supabase
        .from('user_badges')
        .select('badge_key')
        .eq('user_id', selectedUserId)

      const { data: userData } = await supabase
        .from('users_extended')
        .select('email')
        .eq('id', selectedUserId)
        .single()

      setSelectedUserInfo({
        chipCount,
        propertyCount,
        badges: badgesData?.map(b => b.badge_key) || [],
        email: userData?.email || '—'
      })
    }

    fetchUserInfo()
  }, [selectedUserId, supabase])

  const handleAward = async () => {
    if (!selectedUserId || !selectedBadge) {
      toast.error('User and badge are required')
      return
    }

    setLoading(true)

    const { error: badgeErr } = await supabase.from('user_badges').insert({
      id: uuidv4(),
      user_id: selectedUserId,
      badge_key: selectedBadge
    })

    if (badgeErr) {
      toast.error('Could not award badge')
    } else {
      toast.success('Badge awarded!')
      await supabase.from('badge_activity_log').insert({
        user_id: selectedUserId,
        badge_key: selectedBadge,
        triggered_by: 'manual_award'
      })
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-10">
        <section className="bg-white/5 border border-white/10 rounded-xl p-6 shadow">
          <h1 className="text-2xl font-bold mb-6">🎖️ Badge Catalog</h1>
			 {/* 🔁 Reformatted badge grid to show 10 per row, no gray box, green border */}
			<div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-4">
			  {catalog.map(badge => (
				<div key={badge.key} className="flex flex-col items-center text-center">
				  <div className="w-16 h-16 mb-1 rounded-full border-2 border-green-500 bg-transparent flex items-center justify-center">
					<img
					  src={badge.icon_url}
					  alt={badge.name}
					  className="w-14 h-14 object-contain rounded-full"
					  onError={(e) => {
						console.warn('❌ Broken icon:', badge.name, badge.icon_url)
						e.currentTarget.style.display = 'none'
					  }}
					/>
				  </div>
				  <h2 className="text-xs font-medium mt-1">{badge.name}</h2>
				</div>
			  ))}
			</div>
        </section>
  	  <section className="bg-white/5 border border-white/10 rounded-xl p-6 shadow">
	  <h2 className="text-xl font-bold mb-4">🏷️ Manually Award a Badge</h2>

	  {/* Inputs are now side-by-side */}
	  <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
		<div className="flex-1">
		  <label className="block text-sm mb-1">Select User</label>
		  <select
			value={selectedUserId}
			onChange={e => setSelectedUserId(e.target.value)}
			className="w-full rounded px-3 py-2 bg-[#1E2A3C] border border-gray-600 text-white"
		  >
			<option value="">Select a user</option>
			{users.map(user => (
			  <option key={user.id} value={user.id}>
				{user.first_name} {user.last_name} ({user.email})
			  </option>
			))}
		  </select>
		</div>

		<div className="flex-1">
		  <label className="block text-sm mb-1">Select Badge</label>
		  <select
			value={selectedBadge}
			onChange={e => setSelectedBadge(e.target.value)}
			className="w-full rounded px-3 py-2 bg-[#1E2A3C] border border-gray-600 text-white"
		  >
			<option value="">Select a badge</option>
			{catalog.map(badge => (
			  <option key={badge.key} value={badge.key}>
				{badge.name}
			  </option>
			))}
		  </select>
		</div>

		<div className="md:w-auto w-full">
		  <button
			onClick={handleAward}
			disabled={loading}
			className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg w-full md:w-auto shadow"
		  >
			{loading ? 'Awarding…' : 'Award Badge'}
		  </button>
		</div>
	  </div>

	  {selectedUserInfo && (
		<div className="bg-white/10 rounded-lg p-4 mt-4 space-y-2 text-sm">
		  <p><strong>Email:</strong> {selectedUserInfo.email}</p>
		  <p><strong>Chips Owned:</strong> {selectedUserInfo.chipCount}</p>
		  <p><strong>Properties Owned:</strong> {selectedUserInfo.propertyCount}</p>
		  <p><strong>Current Badges:</strong> {selectedUserInfo.badges.length > 0 ? selectedUserInfo.badges.join(', ') : 'None'}</p>
		</div>
	  )}
	</section>		
      </div>
    </main>
  )
}
