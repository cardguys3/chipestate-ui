// File: app/register/license/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { Suspense } from 'react'
import { toast } from 'react-hot-toast'

function LicenseForm() {
  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const router = useRouter()
  const [hydrated, setHydrated] = useState(false)
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const hydrate = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      const user = session?.user

      if (!user || error) {
        console.warn('Hydration failed or no session:', error)
        setHydrated(true)
        return
      }

      const { data: exists } = await supabase
        .from('users_extended')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!exists && user.email) {
        const { data: buffer } = await supabase
          .from('registration_buffer')
          .select('*')
          .eq('email', user.email)
          .single()

        if (buffer) {
          const { error: insertError } = await supabase
            .from('users_extended')
            .insert([{ id: user.id, email: user.email, ...buffer }])

          if (!insertError) {
            await supabase.from('registration_buffer').delete().eq('email', user.email)
          }
        }
      }

      setHydrated(true)
    }

    hydrate()
  }, [])

  const handleUpload = async () => {
    setError('')
    setLoading(true)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      const user = session?.user

      if (sessionError || !user?.id) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }

      if (!front || !back) {
        setError('Please upload both front and back images or skip this step.')
        setLoading(false)
        return
      }

      const fileExtFront = front.name.split('.').pop()
      const fileExtBack = back.name.split('.').pop()
      const filePathFront = `${user.id}_front.${fileExtFront}`
      const filePathBack = `${user.id}_back.${fileExtBack}`

      const { error: frontError } = await supabase.storage
        .from('licenses')
        .upload(filePathFront, front, { upsert: true })

      if (frontError) {
        setError('Upload failed for front image.')
        setLoading(false)
        return
      }

      const { error: backError } = await supabase.storage
        .from('licenses')
        .upload(filePathBack, back, { upsert: true })

      if (backError) {
        setError('Upload failed for back image.')
        setLoading(false)
        return
      }

      const frontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${filePathFront}`
      const backUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${filePathBack}`

      const { error: updateError } = await supabase
        .from('users_extended')
        .update({
          license_front_url: frontUrl,
          license_back_url: backUrl,
          registration_status: 'pending',
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Could not save license info. Please try again.')
        setLoading(false)
        return
      }

      toast.success('Welcome to ChipEstate! Please confirm your email to activate your account.')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Upload exception:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const skipUpload = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user
    if (!user?.id) {
      toast.error('Session error: please log in again.')
      router.push('/')
      return
    }

    await supabase
      .from('users_extended')
      .update({ registration_status: 'pending' })
      .eq('id', user.id)

    toast.success('Registration complete. License upload skipped.')
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6 flex flex-col justify-between">
      {!hydrated ? (
        <div className="flex flex-col items-center justify-center flex-1">
          <p className="text-yellow-300 text-center">Loading user session...</p>
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
              You may skip this step for now, but you won’t be able to purchase chips until verification is complete.
            </p>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            <div className="flex flex-col items-center mb-4">
              <label className="mb-1">Front of Driver’s License or State ID</label>
              <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                Choose Image
                <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {front && (
                <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                  <span className="truncate">{front.name}</span>
                  <button onClick={() => setFront(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center mb-4">
              <label className="mb-1">Back of Driver’s License or State ID</label>
              <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                Choose Image
                <input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] || null)} className="hidden" />
              </label>
              {back && (
                <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                  <span className="truncate">{back.name}</span>
                  <button onClick={() => setBack(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">×</button>
                </div>
              )}
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await handleUpload()
              }}
              className="flex justify-center gap-3 pt-4"
            >
              <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-800">
                Back
              </button>
              <button type="button" onClick={skipUpload} className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-900">
                Skip License Step
              </button>
              <button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded shadow text-white border border-emerald-500">
                {loading ? 'Uploading...' : 'Submit'}
              </button>
            </form>
          </div>

          <div className="text-center text-xs text-gray-400 mt-10">Step 2 of 3</div>
        </>
      )}
    </main>
  )
}

export default function LicenseUploadPage() {
  return (
    <Suspense fallback={<p className="text-white p-4">Loading license form...</p>}>
      <LicenseForm />
    </Suspense>
  )
}
