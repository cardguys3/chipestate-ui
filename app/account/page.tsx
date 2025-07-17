'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import toast, { Toaster } from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

const isEqual = (a: any, b: any) => JSON.stringify(a) === JSON.stringify(b)

export default function AccountPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [originalProfile, setOriginalProfile] = useState<any>(null)
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
          setOriginalProfile(data)
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

  const handleCancel = () => {
    setProfile(originalProfile)
  }

  const handleSave = async () => {
    toast.dismiss();
    if (!isEqual(profile, originalProfile)) {
      toast.loading('Saving changes...')
      const { error } = await supabase
        .from('users_extended')
        .update(profile)
        .eq('id', profile.id)

      if (error) {
        toast.dismiss();
        toast.error(`Save failed: ${error.message}`);
        console.error('Error saving profile:', error.message)
      } else {
        toast.dismiss();
        toast.success('Profile updated successfully.');
        setOriginalProfile(profile)
      }
    }
  }

  if (!profile) return <div className="text-white p-6">Loading...</div>

  return (
    <>
      <Toaster position="top-right" />
      <main className="bg-[#0c1a2c] min-h-screen text-white p-6">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-white border border-red-500 hover:bg-red-600 bg-red-500 px-4 py-2 rounded transition"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <h1 className="text-3xl font-bold mb-6">Account Details</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'first_name', 'middle_name', 'last_name', 'email', 'phone', 'dob',
            'res_address_line1', 'res_address_line2', 'res_city', 'res_state', 'res_zip',
            'mail_address_line1', 'mail_address_line2', 'mail_city', 'mail_state', 'mail_zip'
          ].map((field) => (
            <div key={field}>
              <label className="block text-sm mb-1 capitalize">
                {field.replace(/_/g, ' ')}
              </label>
              <input
                name={field}
                type={field === 'dob' ? 'date' : 'text'}
                value={profile[field] || ''}
                onChange={handleChange}
                disabled={['email', 'dob', 'license_front_url', 'license_back_url'].includes(field)}
                className={`w-full p-2 rounded border border-white/20 bg-white/10 ${
                  ['email', 'dob', 'license_front_url', 'license_back_url'].includes(field)
                    ? 'bg-gray-700'
                    : 'bg-gray-800'
                } text-white`}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={showPassword ? 'your-password' : '********'}
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
          <button
            onClick={handleSave}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            onClick={handleCancel}
            className="border border-gray-400 px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => router.push('/forgot-password')}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded border border-white/20"
          >
            Change Password
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          To update any non-editable fields (such as email or verified identity details), please contact ChipEstate Support.
        </p>
      </main>
    </>
  )
}
