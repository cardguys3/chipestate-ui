import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/supabase'

export default function LicenseUploadPage() {
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

    const { data: frontUpload, error: frontError } = await supabase.storage
      .from('licenses')
      .upload(filePathFront, front, { upsert: true })

    const { data: backUpload, error: backError } = await supabase.storage
      .from('licenses')
      .upload(filePathBack, back, { upsert: true })

    if (frontError || backError) {
      setError('Failed to upload license images')
      setLoading(false)
      return
    }

    const frontUrl = `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/licenses/${filePathFront}`
    const backUrl = `https://ajburehyunbvpuhnyjbo.supabase.co/storage/v1/object/public/licenses/${filePathBack}`

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
    <main className="min-h-screen bg-blue-950 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Upload Your Driver's License</h1>
      <p className="mb-2 text-sm text-emerald-300">
        To comply with U.S. regulations and ensure identity verification, we require a front and back image of your U.S. driver's license. You may skip this step for now, but you will not be able to purchase chips until verification is complete.
      </p>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <div className="mb-4">
        <label className="block mb-1">Front of License</label>
        <input type="file" accept="image/*" onChange={(e) => setFront(e.target.files?.[0] || null)} />
      </div>
      <div className="mb-4">
        <label className="block mb-1">Back of License</label>
        <input type="file" accept="image/*" onChange={(e) => setBack(e.target.files?.[0] || null)} />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          disabled={loading}
          className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded text-white"
        >
          {loading ? 'Uploading...' : 'Submit License'}
        </button>
        <button
          onClick={skipUpload}
          className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded text-white"
        >
          Skip for Now
        </button>
      </div>
    </main>
  )
}
