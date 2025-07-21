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
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      const { data, error: userError } = await supabase.auth.getUser()
      if (userError || !data?.user?.id || !data.user.email) {
        console.error('Auth error or missing user:', userError)
        setHydrated(true)
        return
      }

      const userData = { id: data.user.id, email: data.user.email }
      setUser(userData)

      const { data: exists } = await supabase
        .from('users_extended')
        .select('id')
        .eq('id', userData.id)
        .single()

      if (!exists) {
        const { data: buffer } = await supabase
          .from('registration_buffer')
          .select('*')
          .eq('email', userData.email)
          .single()

        if (buffer) {
          const { error: insertError } = await supabase
            .from('users_extended')
            .insert([{
              id: userData.id,
              email: userData.email,
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

          if (!insertError) {
            await supabase.from('registration_buffer').delete().eq('email', userData.email)
          } else {
            console.error('Hydration insert error:', insertError)
            setHydrated(true)
            return
          }
        } else {
          console.warn('No buffer found for user')
          setHydrated(true)
          return
        }
      }

      setHydrated(true)
    }

    init()
  }, [])

  const handleUpload = async () => {
    if (!user?.id || !front || !back) {
      setError('All fields required before submission.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const frontExt = front.name.split('.').pop()
      const backExt = back.name.split('.').pop()
      const frontName = `${user.id}_front.${frontExt}`
      const backName = `${user.id}_back.${backExt}`

      const { error: frontError } = await supabase
        .storage
        .from('licenses')
        .upload(frontName, front, { upsert: true })

      if (frontError) {
        setError('Front upload failed.')
        setLoading(false)
        return
      }

      const { error: backError } = await supabase
        .storage
        .from('licenses')
        .upload(backName, back, { upsert: true })

      if (backError) {
        setError('Back upload failed.')
        setLoading(false)
        return
      }

      const frontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${frontName}`
      const backUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${backName}`

      const { error: updateError } = await supabase
        .from('users_extended')
        .update({
          license_front_url: frontUrl,
          license_back_url: backUrl,
          registration_status: 'pending'
        })
        .eq('id', user.id)

      if (updateError) {
        setError('Database update failed.')
        setLoading(false)
        return
      }

      toast.success('Welcome to ChipEstate! Please confirm your email.')
      router.push('/dashboard')
    } catch (err: any) {
      console.error(err)
      setError('Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-2xl font-bold mb-4 text-center">Identity Verification</h1>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex flex-col items-center">
              <div className="mb-4">
                <label className="block mb-1">Front of Driver’s License</label>
                <label className="block w-64 border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800 cursor-pointer">
                  Choose Image
                  <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>
              <div className="mb-4">
                <label className="block mb-1">Back of Driver’s License</label>
                <label className="block w-64 border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800 cursor-pointer">
                  Choose Image
                  <input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] || null)} className="hidden" />
                </label>
              </div>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleUpload(); }} className="flex justify-center gap-4 mt-4">
              <button type="submit" disabled={loading} className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded text-white border border-emerald-500">
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
