'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export default function LicenseUploadPage() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()

  const [userId, setUserId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState<boolean>(false)
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const hydrate = async () => {
      const { data, error } = await supabase.auth.getUser()
      if (error || !data?.user) {
        setError('Session expired. Please log in again.')
        return
      }

      setUserId(data.user.id)

      // Create users_extended row if needed
      const { data: exists } = await supabase
        .from('users_extended')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (!exists && data.user.email) {
        const { data: buffer } = await supabase
          .from('registration_buffer')
          .select('*')
          .eq('email', data.user.email)
          .single()

        if (buffer) {
          const { id: _bID, email: _bEmail, ...safeFields } = buffer
          await supabase.from('users_extended').insert([
            { id: data.user.id, email: data.user.email, ...safeFields }
          ])
          await supabase.from('registration_buffer').delete().eq('email', data.user.email)
        }
      }

      setHydrated(true)
    }

    hydrate()
  }, [])

  const handleSubmit = async () => {
    if (!userId) {
      setError('Session expired. Please log in again.')
      return
    }

    if (!front || !back) {
      setError('Please upload both front and back images.')
      return
    }

    setLoading(true)
    setError('')

    const frontExt = front.name.split('.').pop()
    const backExt = back.name.split('.').pop()

    const frontPath = `${userId}_front.${frontExt}`
    const backPath = `${userId}_back.${backExt}`

    const { error: fErr } = await supabase.storage.from('licenses').upload(frontPath, front, {
      upsert: true
    })
    if (fErr) {
      setError('Failed to upload front image.')
      setLoading(false)
      return
    }

    const { error: bErr } = await supabase.storage.from('licenses').upload(backPath, back, {
      upsert: true
    })
    if (bErr) {
      setError('Failed to upload back image.')
      setLoading(false)
      return
    }

    const frontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${frontPath}`
    const backUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${backPath}`

    const { error: updateErr } = await supabase
      .from('users_extended')
      .update({
        license_front_url: frontUrl,
        license_back_url: backUrl,
        registration_status: 'pending'
      })
      .eq('id', userId)

    if (updateErr) {
      setError('Failed to save license data.')
      setLoading(false)
      return
    }

    toast.success('License submitted. Registration complete!')
    router.push('/dashboard')
  }

  const handleSkip = async () => {
    if (!userId) {
      setError('Session expired. Please log in again.')
      return
    }

    await supabase
      .from('users_extended')
      .update({ registration_status: 'pending' })
      .eq('id', userId)

    toast.success('You skipped license upload. You can complete it later.')
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6 flex flex-col justify-between">
      {!hydrated ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <p className="text-yellow-300 text-center">Loading session...</p>
        </div>
      ) : (
        <>
          <div className="max-w-xl mx-auto border border-emerald-800 rounded-lg p-6 bg-blue-900 shadow-lg">
            <div className="mb-6 text-sm font-medium text-center text-gray-300 border border-emerald-700 px-4 py-2 rounded w-fit mx-auto">
              <div className="flex justify-center items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">1</div>
                  <span className="mt-1">Info</span>
                </div>
                <div className="h-px w-8 bg-gray-400" />
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">2</div>
                  <span className="mt-1">Verify</span>
                </div>
              </div>
            </div>

            <h1 className="text-2xl font-bold mb-4 text-center">Identity Verification</h1>
            <p className="mb-4 text-sm text-emerald-300 border border-emerald-700 p-4 rounded text-center">
              To comply with U.S. regulations, fractional real estate owners must verify their identity.
              You may skip this step, but cannot buy chips until verification is complete.
            </p>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            <div className="flex flex-col items-center mb-4">
              <label className="mb-1">Front of Driver’s License</label>
              <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                Choose Front Image
                <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {front && (
                <div className="mt-2 w-64 text-sm flex items-center justify-between bg-blue-900 border border-blue-700 rounded px-3 py-2">
                  <span className="truncate">{front.name}</span>
                  <button onClick={() => setFront(null)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center mb-4">
              <label className="mb-1">Back of Driver’s License</label>
              <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                Choose Back Image
                <input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {back && (
                <div className="mt-2 w-64 text-sm flex items-center justify-between bg-blue-900 border border-blue-700 rounded px-3 py-2">
                  <span className="truncate">{back.name}</span>
                  <button onClick={() => setBack(null)} className="text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3 pt-4">
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-800">
                Back
              </button>
              <button type="button" onClick={handleSkip} className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-900">
                Skip License
              </button>
              <button onClick={handleSubmit} disabled={loading} className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded shadow text-white border border-emerald-500">
                {loading ? 'Uploading...' : 'Submit'}
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-400 mt-10">Step 2 of 2</div>
        </>
      )}
    </main>
  )
}
