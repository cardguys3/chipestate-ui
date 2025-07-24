// app/admin/users/[id]/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '—'
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  return match ? `(${match[1]}) ${match[2]}-${match[3]}` : phone
}

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [chips, setChips] = useState<any[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError('Invalid user ID.')
      return
    }

    const fetchUserData = async () => {
      const [userRes, chipsRes] = await Promise.all([
        supabase.from('users_extended').select('*').eq('id', id).single(),
        supabase.from('chips_view').select('*').eq('user_id', id)
      ])

      if (userRes.error || !userRes.data) {
        console.error('Error loading user:', userRes.error)
        setError('User not found.')
        return
      }

      setUser(userRes.data)
      setChips(chipsRes.data || [])
    }

    fetchUserData()
  }, [id])

  const updateUserField = async (field: string, value: any, statusType: string, statusLabel: string) => {
    if (!id) return
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    const { error } = await supabase
      .from('users_extended')
      .update({ [field]: value })
      .eq('id', id)

    if (!error) {
      await supabase.from('status_change_log').insert({
        entity_type: 'user',
        entity_id: id,
        status_type: statusType,
        status: statusLabel,
        changed_by: adminId
      })

      const { data } = await supabase.from('users_extended').select('*').eq('id', id).single()
      setUser(data)
    }
  }

  const resendVerification = async () => {
    if (!user?.email) return
    const { data: { session } } = await supabase.auth.getSession()
    const adminId = session?.user?.id ?? null

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: { emailRedirectTo: 'https://chipestate.com/dashboard' }
    })

    if (!error) {
      await supabase.from('status_change_log').insert({
        entity_type: 'user',
        entity_id: user.id,
        status: 'resent',
        status_type: 'email_verification',
        changed_by: adminId
      })
      alert('Verification email resent.')
    } else {
      alert('Failed to resend verification.')
    }
  }

  const toggleManualVerify = async () => {
    const newValue = user.email_confirmed_at ? null : new Date().toISOString()
    const label = newValue ? 'manual_override' : 'manual_unverify'
    await updateUserField('email_confirmed_at', newValue, 'email_verification', label)
    alert(newValue ? 'Email manually marked as verified.' : 'Email verification removed.')
  }

  const chipCount = chips.length
  const chipSummary = [...new Set(chips.map(c => c.property_title))]

  if (error) return <div className="min-h-screen p-10 text-red-500">{error}</div>
  if (!user) return <div className="min-h-screen p-10 text-white">Loading user...</div>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-3xl font-bold">{user.first_name}'s User Details</h1>
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/admin/users/${user.id}/edit-user`}
              className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded"
            >
              Edit User
            </Link>
            <button
              onClick={() =>
                updateUserField('is_approved', !user.is_approved, 'approval', user.is_approved ? 'not_approved' : 'approved')
              }
              className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded"
            >
              {user.is_approved ? 'Deny Approval' : 'Approve User'}
            </button>
            <button
              onClick={() =>
                updateUserField('is_active', !user.is_active, 'active', user.is_active ? 'inactive' : 'active')
              }
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
            >
              {user.is_active ? 'Deactivate Account' : 'Activate Account'}
            </button>
          </div>
        </div>

        {/* Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white/5 p-6 rounded-xl border border-white/10">
          <div>
            <p><strong>Name:</strong> {user.first_name} {user.middle_name} {user.last_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Phone:</strong> {formatPhoneNumber(user.phone)}</p>
            <p><strong>DOB:</strong> {user.dob}</p>
            <p><strong>Sign-up Date:</strong> {new Date(user.created_at).toLocaleString()}</p>
            <p><strong>Email Verified:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
          </div>
          <div>
            <p className="font-semibold mb-1">Residential Address:</p>
            <p>{user.res_address_line1}</p>
            {user.res_address_line2 && <p>{user.res_address_line2}</p>}
            <p>{user.res_city}, {user.res_state} {user.res_zip}</p>

            <p className="mt-4 font-semibold mb-1">Mailing Address:</p>
            <p>{user.mail_address_line1}</p>
            {user.mail_address_line2 && <p>{user.mail_address_line2}</p>}
            <p>{user.mail_city}, {user.mail_state} {user.mail_zip}</p>
          </div>
        </div>

        {/* Admin Controls */}
        <div className="flex flex-wrap gap-4">
          <button onClick={resendVerification} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded">
            Resend Verification Email
          </button>
          <button onClick={toggleManualVerify} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded">
            {user.email_confirmed_at ? 'Undo Verification' : 'Mark Email Verified'}
          </button>
        </div>

        {/* License Images */}
        <div>
          <h2 className="text-xl font-bold mb-4">Uploaded ID Images</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="mb-1">Driver's License - Front</p>
              {user.license_front_url ? (
                <img src={user.license_front_url} alt="DL Front" className="rounded border border-gray-700 w-full" />
              ) : (
                <p className="text-gray-400 italic">Not uploaded</p>
              )}
            </div>
            <div>
              <p className="mb-1">Driver's License - Back</p>
              {user.license_back_url ? (
                <img src={user.license_back_url} alt="DL Back" className="rounded border border-gray-700 w-full" />
              ) : (
                <p className="text-gray-400 italic">Not uploaded</p>
              )}
            </div>
          </div>
        </div>

        {/* Chip Summary */}
        <div>
          <h2 className="text-xl font-bold mb-4">Chip Ownership Summary</h2>
          <p className="mb-2"><strong>Total Chips Owned:</strong> {chipCount}</p>
          {chipSummary.length > 0 ? (
            <ul className="list-disc list-inside text-white/90">
              {chipSummary.map((title, idx) => (
                <li key={idx}>{title}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 italic">No chips currently owned.</p>
          )}
        </div>

        {/* Future: Property History */}
        <div>
          <h2 className="text-xl font-bold mt-10 mb-2">Associated Properties</h2>
          <p className="text-gray-400 italic">Feature coming soon: past and present property associations.</p>
        </div>
      </div>
    </main>
  )
}
