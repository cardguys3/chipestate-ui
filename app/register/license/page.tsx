'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Suspense } from 'react'
import { toast } from 'react-hot-toast'

function LicenseForm() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState<boolean>(false)
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const hydrateProfile = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user || !user.email || !user.id) {
        toast.error('Session expired. Please log in again.')
        router.push('/login')
        return
      }

      setUserId(user.id)

      const { data: exists } = await supabase
        .from('users_extended')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!exists) {
        const { data: buffer } = await supabase
          .from('registration_buffer')
          .select('*')
          .eq('email', user.email)
          .single()

        if (buffer) {
          const { error: insertError } = await supabase
            .from('users_extended')
            .insert([{
              id: user.id,
              email: user.email,
              first_name: buffer.first_name,
              middle_name: buffer.middle_name,
              last_name: buffer.last_name,
              phone: buffer.phone,
              dob: buffer.dob,
              res_address_line1: buffer.res_address_line1,
              res_address_line2: buffer.res_address_line2,
              res_city: buffer.res_city,
              res_state: buffer.res_state,
              res_zip: buffer.res_zip,
              mail_address_line1: buffer.mail_address_line1,
              mail_address_line2: buffer.mail_address_line2,
              mail_city: buffer.mail_city,
              mail_state: buffer.mail_state,
              mail_zip: buffer.mail_zip,
            }])

          if (insertError) {
            toast.error('Failed to save user.')
            return
          }

          await supabase.from('registration_buffer').delete().eq('email', user.email)
        } else {
          toast.error('No registration buffer found.')
          return
        }
      }

      setHydrated(true)
    }

    hydrateProfile()
  }, [supabase, router])

  const handleUpload = async () => {
    if (!userId) {
      toast.error('Session expired. Please log in again.')
      router.push('/login')
      return
    }

    if (!front || !back) {
      setError('Please upload both front and back images or skip this step.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const fileExtFront = front.name.split('.').pop()
      const fileNameFront = `${userId}_front.${fileExtFront}`
      const filePathFront = `${fileNameFront}`

      const fileExtBack = back.name.split('.').pop()
      const fileNameBack = `${userId}_back.${fileExtBack}`
      const filePathBack = `${fileNameBack}`

      const { error: frontError } = await supabase.storage
        .from('licenses')
        .upload(filePathFront, front, { upsert: true })

      if (frontError) {
        setError('Front upload failed.')
        setLoading(false)
        return
      }

      const { error: backError } = await supabase.storage
        .from('licenses')
        .upload(filePathBack, back, { upsert: true })

      if (backError) {
        setError('Back upload failed.')
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
          registration_status: 'pending'
        })
        .eq('id', userId)

      if (updateError) {
        setError('Could not save license info.')
        setLoading(false)
        return
      }

      toast.success('Verification submitted!')
      router.push('/dashboard')
    } catch (err) {
      console.error(err)
      setError('Unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  const skipUpload = async () => {
    if (!userId) {
      toast.error('Session expired. Please log in again.')
      router.push('/login')
      return
    }

    const { error } = await supabase
      .from('users_extended')
      .update({ registration_status: 'pending' })
      .eq('id', userId)

    if (error) {
      toast.error('Could not skip registration.')
      return
    }

    toast.success('Skipped verification. Welcome!')
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

            <p className="mb-4 text-sm text-emerald-300 max-w-2xl mx-auto border border-emerald-700 p-4 rounded text-center">
              To comply with U.S. regulations requiring identity verification, fractional real estate owners must provide proof of U.S. citizenship.
              You may skip this step now, but you cannot purchase chips until verified.
            </p>

            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

            <div className="flex justify-center">
              <div>
                <label className="block mb-1">Front of Driver’s License or State ID</label>
                <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFront(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {front && (
                  <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                    <span className="truncate">{front.name}</span>
                    <button type="button" onClick={() => setFront(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">×</button>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <div>
                <label className="block mb-1">Back of Driver’s License or State ID</label>
                <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setBack(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                </label>
                {back && (
                  <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                    <span className="truncate">{back.name}</span>
                    <button type="button" onClick={() => setBack(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">×</button>
                  </div>
                )}
              </div>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                await handleUpload()
              }}
              className="flex flex-wrap justify-center gap-3 pt-4"
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

          <div className="text-center text-xs text-gray-400 mt-10">Step 2 of 2</div>
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
