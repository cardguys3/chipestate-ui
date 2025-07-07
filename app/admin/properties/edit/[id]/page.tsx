'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function EditPropertyPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load property.')
      } else {
        setForm(data)
        setImageUrl(data.image_url)
      }
    }

    fetchProperty()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(filePath, file)

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filePath)

    setImageUrl(publicUrlData?.publicUrl || null)
    setForm({ ...form, image_url: publicUrlData?.publicUrl })
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        ...form,
        purchase_price: Number(form.purchase_price),
        current_value: Number(form.current_value),
        total_chips: Number(form.total_chips),
        chips_available: Number(form.chips_available),
        reserve_balance: Number(form.reserve_balance),
        image_url: imageUrl,
      })
      .eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/admin/properties')
    }
  }

  if (!form) return <p className="p-6 text-white">Loading...</p>

  return (
    <main className="min-h-screen bg-[#0e1a2b] p-6 max-w-3xl mx-auto text-white">
      <h1 className="text-2xl font-bold mb-4">Edit Property</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1e2a3c] p-6 rounded-lg border border-gray-700 shadow-md">
        {[
          { name: 'title', label: 'Title*' },
          { name: 'address_line1', label: 'Address Line 1*' },
          { name: 'address_line2', label: 'Address Line 2' },
          { name: 'city', label: 'City*' },
          { name: 'state', label: 'State*' },
          { name: 'zip', label: 'Zip*' },
          { name: 'property_type', label: 'Property Type*' },
          { name: 'sub_type', label: 'Sub-type*' },
          { name: 'purchase_price', label: 'Purchase Price*' },
          { name: 'current_value', label: 'Current Value*' },
          { name: 'total_chips', label: 'Total Chips*' },
          { name: 'chips_available', label: 'Chips Available*' },
          { name: 'manager_name', label: 'Manager Name*' },
          { name: 'reserve_balance', label: 'Reserve Balance*' },
        ].map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium mb-1">{field.label}</label>
            <input
              name={field.name}
              value={form[field.name]}
              onChange={handleChange}
              className="w-full p-2 rounded bg-[#102134] border border-gray-600 text-white"
              required={field.label.includes('*')}
            />
          </div>
        ))}

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="occupied"
            checked={form.occupied}
            onChange={handleChange}
            className="accent-blue-500"
          />
          Occupied?
        </label>

        <div className="mt-4">
          <label className="block mb-1 text-sm font-semibold">Property Image</label>
          <label className="cursor-pointer inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white">
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          {imageUrl && (
            <img src={imageUrl} alt="Preview" className="mt-2 rounded border border-gray-600 w-full max-w-xs" />
          )}
        </div>

        <div className="flex justify-between pt-4 gap-4">
          <button
            type="submit"
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded w-1/2"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/properties')}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded w-1/2"
          >
            Cancel Changes
          </button>
        </div>
      </form>
    </main>
  )
}
