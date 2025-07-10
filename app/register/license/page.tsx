'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LicenseUploadPage() {
  const supabase = createClient()
  const router = useRouter()
  const [frontFile, setFrontFile] = useState<File | null>(null)
  const [backFile, setBackFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleUpload = async () => {
    if (!frontFile || !backFile) {
      setError('Please upload both front and back of your driver’s license.')
      return
    }

    setUploading(true)
    setError(null)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      setError('Could not fetch user.')
      setUploading(false)
      return
    }

    const frontPath = `licenses/${user.id}/front-${Date.now()}`
    const backPath = `licenses/${user.id}/back-${Date.now()}`

    const { error: frontErr } = await supabase.storage.from('licenses').upload(frontPath, frontFile)
    const { error: backErr } = await supabase.storage.from('licenses').upload(backPath, backFile)

    if (frontErr || backErr) {
      setError('Failed to upload license images.')
      setUploading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('users_extended')
      .update({
        license_front_url: frontPath,
        license_back_url: backPath,
      })
      .eq('id', user.id)

    if (updateError) {
      setError('Failed to link uploaded files to your account.')
      setUploading(false)
      return
    }

    router.push('/register/funding')
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Step 2 of 3: Verify Your Identity</h1>
        <p className="mb-6">
          To comply with U.S. law and protect your account, we require a valid driver’s license. This helps us verify that you are a real person
          and eligible to purchase fractional property shares. Your information is encrypted and securely stored.
        </p>

        <div className="mb-4">
          <label className="block mb-1">Front of License</label>
          <input type="file" accept="image/*" onChange={(e) => setFrontFile(e.target.files?.[0] || null)} className="text-white" />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Back of License</label>
          <input type="file" accept="image/*" onChange={(e) => setBackFile(e.target.files?.[0] || null)} className="text-white" />
        </div>

        {error && <p className="text-red-400 mb-4">{error}</p>}

        <button
          onClick={handleUpload}
          disabled={uploading}
          className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded text-white font-semibold"
        >
          {uploading ? 'Uploading...' : 'Continue to Step 3'}
        </button>
      </div>
    </main>
  )
}
