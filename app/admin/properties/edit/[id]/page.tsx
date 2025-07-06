'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function EditPropertyPage() {
  const router = useRouter()
  const { id } = useParams()
  const supabase = useSupabaseClient()
  const session = useSession()

  const [form, setForm] = useState<any>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchProperty = async () => {
      const { data, error } = await supabase.from('properties').select('*').eq('id', id).single()
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

    const { error: uploadError } = await supabase.storage.from('property-images').upload(filePath, file)
    if (uploadError) {
      alert('Upload failed: ' + uploadError.message)
      setUploading(false)
      return
    }

    const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(filePath)
    setImageUrl(publicUrlData?.publicUrl || null)
    setForm({ ...form, image_url: publicUrlData?.publicUrl })
    setUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error: updateError } = await supabase.from('properties').update({
      ...form,
      purchase_price: Number(form.purchase_price),
      current_value: Number(form.current_value),
      total_chips: Number(form.total_chips),
      chips_available: Number(form.chips_available),
      reserve_balance: Number(form.reserve_balance),
      image_url: imageUrl,
    }).eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/admin/properties')
    }
  }

  if (!form) return <p className="p-6">Loading...</p>

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Edit Property</h1>
      {error && <p className="text-red-600 mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <input name="title" value={form.title} onChange={handleChange} className="input" placeholder="Title" />
        <input name="address_line1" value={form.address_line1} onChange={handleChange} className="input" placeholder="Address Line 1" />
        <input name="address_line2" value={form.address_line2} onChange={handleChange} className="input" placeholder="Address Line 2" />
        <div className="grid grid-cols-3 gap-4">
          <input name="city" value={form.city} onChange={handleChange} className="input" placeholder="City" />
          <input name="state" value={form.state} onChange={handleChange} className="input" placeholder="State" />
          <input name="zip" value={form.zip} onChange={handleChange} className="input" placeholder="Zip" />
        </div>
        <input name="property_type" value={form.property_type} onChange={handleChange} className="input" placeholder="Property Type" />
        <input name="sub_type" value={form.sub_type} onChange={handleChange} className="input" placeholder="Sub-type" />
        <div className="grid grid-cols-2 gap-4">
          <input name="purchase_price" value={form.purchase_price} onChange={handleChange} className="input" placeholder="Purchase Price" />
          <input name="current_value" value={form.current_value} onChange={handleChange} className="input" placeholder="Current Value" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <input name="total_chips" value={form.total_chips} onChange={handleChange} className="input" placeholder="Total Chips" />
          <input name="chips_available" value={form.chips_available} onChange={handleChange} className="input" placeholder="Chips Available" />
        </div>
        <input name="manager_name" value={form.manager_name} onChange={handleChange} className="input" placeholder="Manager Name" />
        <input name="reserve_balance" value={form.reserve_balance} onChange={handleChange} className="input" placeholder="Reserve Balance" />
        <label className="flex items-center gap-2">
          <input type="checkbox" name="occupied" checked={form.occupied} onChange={handleChange} />
          Occupied?
        </label>

        <div>
          <label className="block mb-1 text-sm font-semibold">Update Property Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
          {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 rounded w-full max-w-xs" />}
        </div>

        <button type="submit" className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-800 w-full">
          Save Changes
        </button>
      </form>
    </main>
  )
}
