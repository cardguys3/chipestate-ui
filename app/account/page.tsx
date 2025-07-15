// this is the user's account page

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [editMode, setEditMode] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data, error } = await supabase
          .from('users_extended')
          .select('*')
          .eq('id', user.id)
          .single()

        if (!error) {
          setProfile(data)
        } else {
          console.error('Error loading user profile:', error.message)
        }
      }
    }

    loadUser()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev: any) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSave = async () => {
    const { error } = await supabase
      .from('users_extended')
      .update(profile)
      .eq('id', profile.id)

    if (error) {
      console.error('Error saving profile:', error.message)
    } else {
      setEditMode(false)
    }
  }

  if (!profile) return <div className="text-white p-6">Loading...</div>

  return (
    <main className="bg-[#0c1a2c] min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6">Account Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">First Name</label>
          <input
            name="first_name"
            value={profile.first_name || ''}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Last Name</label>
          <input
            name="last_name"
            value={profile.last_name || ''}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            name="email"
            value={profile.email || ''}
            disabled
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Phone</label>
          <input
            name="phone"
            value={profile.phone || ''}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Date of Birth</label>
          <input
            name="dob"
            type="date"
            value={profile.dob || ''}
            onChange={handleChange}
            disabled={!editMode}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Current Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            value="********"
            readOnly
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="text-sm text-emerald-400 mt-1"
          >
            {showPassword ? 'Hide' : 'Show'} Password
          </button>
        </div>
      </div>

      <div className="mt-6 flex gap-4">
        {editMode ? (
          <>
            <button
              onClick={handleSave}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditMode(false)}
              className="border border-gray-400 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setEditMode(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        )}

        <button
          onClick={() => router.push('/forgot-password')}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
      </div>
    </main>
  )
}