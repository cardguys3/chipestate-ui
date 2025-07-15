'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'
import { Suspense } from 'react'

function LicenseForm() {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userId = searchParams.get('user_id')

  const [front, setFront] = useState<File | null>(null)
  const [back, setBack] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const handleUpload = async () => {
    if (!userId || !front || !back) {
      setError('Please select both front and back images')
      return
    }

    setLoading(true)

    const fileExtFront = front.name.split('.').pop()
    const fileNameFront = `${userId}_front.${fileExtFront}`
    const filePathFront = `${fileNameFront}`

    const fileExtBack = back.name.split('.').pop()
    const fileNameBack = `${userId}_back.${fileExtBack}`
    const filePathBack = `${fileNameBack}`

    const { error: frontError } = await supabase.storage
      .from('licenses')
      .upload(filePathFront, front, { upsert: true })

    const { error: backError } = await supabase.storage
      .from('licenses')
      .upload(filePathBack, back, { upsert: true })

    if (frontError || backError) {
      setError('Failed to upload license images')
      setLoading(false)
      return
    }

    const baseUrl = `https://szzglzcddjrnrtguwjsc.supabase.co/storage/v1/object/public/licenses`
    const frontUrl = `${baseUrl}/${filePathFront}`
    const backUrl = `${baseUrl}/${filePathBack}`

    const { error: updateError } = await supabase
      .from('users_extended')
      .update({ license_front_url: frontUrl, license_back_url: backUrl })
      .eq('id', userId)

    if (updateError) {
      setError('Failed to save license URLs')
      setLoading(false)
      return
    }

    router.push('/register/success')
  }

  const skipUpload = () => {
    router.push('/register/success?skipped=true')
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
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
            <span className="mt-1">License</span>
          </div>
          <div className="h-px w-8 bg-gray-400" />
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">3</div>
            <span className="mt-1">Chips</span>
          </div>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-center">Identity Verification</h1>

      <p className="mb-4 text-sm text-emerald-300 max-w-2xl mx-auto border border-emerald-700 p-4 rounded text-center">
        To comply with U.S. regulations which require identity verification, fractional real estate owners are required to supply proof of US citizenship. You may skip this step for now, but you will not be able to purchase chips until verification is complete.
      </p>

      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="max-w-lg mx-auto space-y-6">
        {/* Front Upload */}
        <div>
          <label className="block mb-1">Front of Driver’s License or State issued ID Card</label>
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
          <label className="block mb-1">Back of Driver’s License or State issued ID Card</label>
          <label className="block w-64 cursor-pointer border border-emerald-600 px-4 py-2 text-center rounded bg-blue-900 hover:bg-blue-800">
            Choose Image
            <input
              type="file"
              accept="image/*"
              multiple={false}
              onChange={(e) => setBack(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          {back && (
            <div className="flex items-center justify-between mt-2 text-sm bg-blue-900 px-3 py-2 rounded border border-blue-700 w-64">
              <span className="truncate">{back.name}</span>
              <button
                type="button"
                onClick={() => setBack(null)}
                className="ml-2 text-red-400 hover:text-red-600 font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3 pt-4">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-800"
          >
            Back
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-red-500 text-red-400 rounded hover:bg-red-900"
          >
            Cancel
          </button>
          <button
            onClick={skipUpload}
            className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded hover:bg-yellow-900"
          >
            Skip License Step
          </button>
          <button
            onClick={handleUpload}
            disabled={loading}
            className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded shadow text-white border border-emerald-500"
          >
            {loading ? 'Uploading...' : 'Submit License'}
          </button>
        </div>
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
