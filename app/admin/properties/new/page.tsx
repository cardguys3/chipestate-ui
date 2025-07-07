'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const residentialSubtypes = [
  'Single Family',
  'Condo',
  'Townhome',
  'Mobile Home',
  'Vacation Rental',
  'Vacant Lot'
]

const commercialSubtypes = [
  'Office Space',
  'Retail',
  'Hospitality',
  'Special Purpose',
  'Industrial',
  'Vacation Rental',
  'Vacant Lot'
]

export default function AddPropertyPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    property_type: 'residential',
    sub_type: '',
    purchase_price: '',
    current_value: '',
    total_chips: '',
    chips_available: '',
    manager_name: '',
    reserve_balance: '',
    occupied: false,
  })

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })

    if (name === 'property_type') {
      setForm((prev) => ({
        ...prev,
        property_type: value,
        sub_type: '', // reset subtype
      }))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(filePath)
    setImageUrl(publicUrlData?.publicUrl || null)
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error: insertError } = await supabase.from('properties').insert({
      ...form,
      purchase_price: Number(form.purchase_price),
      current_value: Number(form.current_value),
      total_chips: Number(form.total_chips),
      chips_available: Number(form.chips_available),
      reserve_balance: Number(form.reserve_balance),
      image_url: imageUrl,
    })

    if (insertError) {
      setError(insertError.message)
    } else {
      router.push('/admin/properties')
    }
  }

  const subtypeOptions =
    form.property_type === 'commercial' ? commercialSubtypes : residentialSubtypes

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Add New Property</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <input name="title" placeholder="Property Title" onChange={handleChange} required className="input" />
        <input name="address_line1" placeholder="Address Line 1" onChange={handleChange} required className="input" />
        <input name="address_line2" placeholder="Address Line 2" onChange={handleChange} className="input" />
        <div className="grid grid-cols-3 gap-4">
          <input name="city" placeholder="City" onChange={handleChange} required className="input" />
          <input name="state" placeholder="State" onChange={handleChange} required className="input" />
          <input name="zip" placeholder="Zip" onChange={handleChange} required className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <select
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
          </select>
          <select
            name="sub_type"
            value={form.sub_type}
            onChange={handleChange}
            required
            className="input"
          >
            <option value="">Select Subtype</option>
            {subtypeOptions.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="purchase_price" placeholder="Purchase Price" onChange={handleChange} required className="input" />
          <input name="current_value" placeholder="Current Value" onChange={handleChange} required className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="total_chips" placeholder="Total Chips" onChange={handleChange} required className="input" />
          <input name="chips_available" placeholder="Chips Available" onChange={handleChange} required className="input" />
        </div>
        <input name="manager_name" placeholder="Property Manager" onChange={handleChange} className="input" />
        <input name="reserve_balance" placeholder="Reserve Balance" onChange={handleChange} className="input" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="occupied" onChange={handleChange} />
          Occupied?
        </label>

        <div className="mb-4">
          <label className="block mb-1 text-sm font-semibold">Upload Property Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p className="text-sm text-gray-500 mt-2">Uploading...</p>}
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-3 w-full max-w-xs rounded" />}
        </div>

        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 w-full">
          Save Property
        </button>
      </form>
    </main>
  )
}
