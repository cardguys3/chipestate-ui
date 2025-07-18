'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Suspense } from 'react'
import { toast } from 'react-hot-toast'

function LicenseForm() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id')

  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  // 🔁 STEP 3: Migrate from registration_buffer to users_extended
  
  //begin lag error
 const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null)

useEffect(() => {
  const hydrateProfile = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user || !user.email || !user.id) return

    // ✅ store the Supabase auth user.id
    setSupabaseUserId(user.id)

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

        if (!insertError) {
          await supabase.from('registration_buffer').delete().eq('email', user.email)
        } else {
          console.error('Hydration insert error:', insertError)
        }
      }
    }
  }

  hydrateProfile()
}, [supabase])
// end lag error
  const handleUpload = async () => {
    if (!userId || !front || !back) {
      setError('Please select both front and back images to continue.')
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
        console.error('Front upload error:', frontError)
        setError('Upload failed for front image. Please try again or contact support.')
        setLoading(false)
        return
      }

      const { error: backError } = await supabase.storage
        .from('licenses')
        .upload(filePathBack, back, { upsert: true })

      if (backError) {
        console.error('Back upload error:', backError)
        setError('Upload failed for back image. Please try again or contact support.')
        setLoading(false)
        return
      }

      const frontUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${filePathFront}`
      const backUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/licenses/${filePathBack}`
//fix here for submit button issue to dashboard
      const { error: updateError } = await supabase
        .from('users_extended')
        .update({
          license_front_url: frontUrl,
          license_back_url: backUrl,
          registration_status: 'pending'
        })
        .eq('id', userId)

      if (updateError) {
        console.error('DB update error:', updateError)
        setError('Could not save license info to your profile. Please try again.')
        setLoading(false)
        return
      }

      toast.success('Welcome to ChipEstate! Please confirm your email to activate your account.')
      console.log('Redirecting to dashboard...')
      router.push('/dashboard')

	  
// end fix for submit button issue to dashboard
    } catch (err: any) {
      console.error('Unexpected upload error:', err)
      setError('Something went wrong. Please check your internet connection or contact support.')
    } finally {
      setLoading(false)
    }
  }

  const skipUpload = () => {
    toast.success('Registration complete. License upload skipped.')
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6 flex flex-col justify-between">
      <div>
        {/* Progress Graphic */}
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
          To comply with U.S. regulations which require identity verification, fractional real estate owners are required to supply proof of US citizenship. 
		  You may skip this step for now, but you will not be able to purchase chips until verification is complete.
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="max-w-lg mx-auto space-y-6">
          {/* Front Upload */}
          <div>
            <label className="block mb-1">Front of Driver’s License or State ID Card</label>
            <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
              Choose Image
              <input
                type="file"
                accept="image/*"
                multiple={false}
                onChange={(e) => setFront(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {front && (
              <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                <span className="truncate">{front.name}</span>
                <button
                  type="button"
                  onClick={() => setFront(null)}
                  className="ml-2 text-red-400 hover:text-red-600 font-bold"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Back Upload */}
          <div>
            <label className="block mb-1">Back of Driver’s License or State ID Card</label>
            <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
              Choose Image
              <input type="file" accept="image/*" multiple={false} onChange={(e) => setBack(e.target.files?.[0] || null)} className="hidden" />
            </label>
            {back && (
              <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
                <span className="truncate">{back.name}</span>
                <button type="button" onClick={() => setBack(null)} className="ml-2 text-red-400 hover:text-red-600 font-bold">
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            <button onClick={() => router.back()} className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-800">
              Back
            </button>
            <button onClick={skipUpload} className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-900">
              Skip License Step
            </button>
            <button onClick={handleUpload} disabled={loading} className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded shadow text-white border border-emerald-500">
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Step indicator */}
      <div className="text-center text-xs text-gray-400 mt-10">
        Step 2 of 2
      </div>
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
