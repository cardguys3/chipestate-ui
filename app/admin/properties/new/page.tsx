'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

const residentialSubtypes = ['Single Family', 'Multi-Family', 'Townhouse', 'Condo']
const commercialSubtypes = ['Office', 'Retail', 'Industrial', 'Mixed-Use']

export default function NewPropertyPage() {
  const [form, setForm] = useState<any>({})
  const [imageFile, setImageFile] = useState<File | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: any) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    let imageUrl = null
    if (imageFile) {
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(`images/${imageFile.name}`, imageFile, {
          cacheControl: '3600',
          upsert: true,
        })
      if (error) {
        console.error('Upload failed:', error.message)
      } else {
        imageUrl = data?.path
      }
    }

    await supabase.from('properties').insert([{ ...form, image_url: imageUrl }])
    router.push('/admin/properties')
  }

  const handleCancel = () => {
    router.push('/admin/properties')
  }

  return (
    <div className="min-h-screen bg-[#0a2540] text-white px-6 py-8">
      <div className="max-w-2xl mx-auto bg-[#102a4d] p-8 rounded shadow">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">
              Property Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              onChange={handleChange}
              className="w-full p-2 text-black rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="address"
              required
              onChange={handleChange}
              className="w-full p-2 text-black rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              required
              onChange={handleChange}
              className="w-full p-2 text-black rounded"
            >
              <option value="">Select Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>

          {form.type === 'Residential' && (
            <div>
              <label className="block mb-1 font-medium">
                Subtype <span className="text-red-500">*</span>
              </label>
              <select
                name="subtype"
                required
                onChange={handleChange}
                className="w-full p-2 text-black rounded"
              >
                <option value="">Select Subtype</option>
                {residentialSubtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype}
                  </option>
                ))}
              </select>
            </div>
          )}

          {form.type === 'Commercial' && (
            <div>
              <label className="block mb-1 font-medium">
                Subtype <span className="text-red-500">*</span>
              </label>
              <select
                name="subtype"
                required
                onChange={handleChange}
                className="w-full p-2 text-black rounded"
              >
                <option value="">Select Subtype</option>
                {commercialSubtypes.map((subtype) => (
                  <option key={subtype} value={subtype}>
                    {subtype}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-1 font-medium">
              Property Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="price"
              required
              onChange={handleChange}
              className="w-full p-2 text-black rounded"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Number of Chips <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="chips"
              required
              onChange={handleChange}
              className="w-full p-2 text-black rounded"
            />
          </div>

          <div>
            <label className="block mb-2 font-medium">
              Upload Property Image <span className="text-red-500">*</span>
            </label>
            <label className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded cursor-pointer inline-block text-center">
              Choose Image
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded"
            >
              Save Property
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
