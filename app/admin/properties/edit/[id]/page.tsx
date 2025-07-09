'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Switch } from '@headlessui/react'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const propertyTypes = ['Residential', 'Commercial']
const subTypes: { [key: string]: string[] } = {
  Residential: ['Single Family', 'Multi Family', 'Townhouse', 'Condo'],
  Commercial: ['Office', 'Retail', 'Warehouse', 'Industrial']
}

function generateZillowUrl(address_line1: string, city: string, state: string, zip: string) {
  const clean = (str: string) => encodeURIComponent(str.trim().replace(/\s+/g, '-'))
  return `https://www.zillow.com/homes/${clean(address_line1)}-${clean(city)}-${clean(state)}-${zip}_rb/`
}

export default function EditPropertyPage() {
  const router = useRouter()
  const { id } = useParams()
  const [form, setForm] = useState<any>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newImageUrl, setNewImageUrl] = useState('')

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
        setImageUrls(data.image_urls || [])
      }
    }

    fetchProperty()
  }, [id])

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setUploading(true)

    for (const file of files) {
      const fileName = `${Date.now()}-${file.name}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file, { upsert: true })

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('property-images').getPublicUrl(filePath)
        const newUrl = publicUrlData?.publicUrl
        if (newUrl) setImageUrls(prev => [...prev, newUrl])
      }
    }

    setUploading(false)
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const handleImageDelete = (url: string) => {
    setImageUrls(prev => prev.filter(u => u !== url))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { manager_id, ...formToSave } = form
    const { error: updateError } = await supabase.from('properties').update({
      ...formToSave,
      purchase_price: Number(form.purchase_price),
      current_value: Number(form.current_value),
      total_chips: Number(form.total_chips),
      chips_available: Number(form.chips_available),
      reserve_balance: Number(form.reserve_balance),
      image_urls: imageUrls,
    }).eq('id', id)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/admin/properties')
    }
  }

  if (!form) return <p className="p-6 text-white">Loading...</p>

  const zillowUrl = generateZillowUrl(form.address_line1 || '', form.city || '', form.state || '', form.zip || '')

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white px-8 py-10">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="mb-4">
        <a
          href={zillowUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-400 underline hover:text-blue-600"
        >
          View Zestimate on Zillow ↗
        </a>
        <button
          type="button"
          onClick={async () => {
            const full = `${form.address_line1} ${form.city} ${form.state} ${form.zip}`
            const res = await fetch(`/api/zestimate?address=${encodeURIComponent(full)}`)
            const json = await res.json()
            if (json.zestimate) {
              setForm((prev: typeof form) => ({ ...prev, current_value: json.zestimate.replace(/[^0-9.]/g, '') }))
              alert(`Zestimate: ${json.zestimate}`)
            } else {
              alert('Zestimate not found')
            }
          }}
          className="ml-4 text-sm text-emerald-400 underline hover:text-emerald-600"
        >
          Auto-fill Zestimate
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#1e2a3c] p-6 rounded-lg border border-gray-700 shadow-md space-y-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            'title', 'address_line1', 'address_line2', 'city', 'state', 'zip',
            'property_type', 'sub_type', 'purchase_price', 'current_value',
            'total_chips', 'chips_available', 'reserve_balance'
          ].map(field => (
            <div key={field} className="flex flex-col">
              <label htmlFor={field} className="mb-1 text-sm text-gray-300">
                {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </label>
              <input
                id={field}
                name={field}
                value={form[field] || ''}
                onChange={handleChange}
                className="p-2 rounded bg-[#102134] border border-gray-600 w-full text-right"
                inputMode={
                  ['purchase_price', 'current_value', 'total_chips', 'chips_available', 'reserve_balance'].includes(field)
                    ? 'decimal'
                    : 'text'
                }
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {['occupied', 'is_active', 'is_hidden'].map(field => (
            <div key={field} className="flex items-center gap-4">
              <span className="text-sm capitalize">{field.replace(/_/g, ' ')}</span>
              <Switch
                checked={form[field]}
                onChange={(value) => setForm((prev: typeof form) => ({ ...prev, [field]: value }))}
                className={`${form[field] ? 'bg-emerald-600' : 'bg-gray-600'} relative inline-flex h-6 w-11 items-center rounded-full transition`}
              >
                <span
                  className={`${form[field] ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform bg-white rounded-full transition`}
                />
              </Switch>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Upload Images</label>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="bg-[#102134] p-2 rounded border border-gray-600" />
          {uploading && <p className="text-sm text-gray-400 mt-1">Uploading...</p>}

          <div className="flex mt-4 gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Add image URL manually"
              className="flex-1 p-2 rounded bg-[#102134] border border-gray-600 text-white"
            />
            <button type="button" onClick={handleAddImageUrl} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white">
              Add URL
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <img src={url} alt="Property Image" className="w-32 h-24 rounded border border-gray-600 object-cover" />
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...imageUrls]
                    newUrls[idx] = e.target.value
                    setImageUrls(newUrls)
                  }}
                  className="flex-1 p-2 rounded bg-[#102134] border border-gray-600 text-white"
                />
                <button type="button" onClick={() => handleImageDelete(url)} className="text-red-400 hover:text-red-600">Remove</button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-6 gap-4">
          <button type="submit" className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded w-1/2">
            Save Changes
          </button>
          <button type="button" onClick={() => router.push('/admin/properties')} className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded w-1/2">
            Cancel Changes
          </button>
        </div>
      </form>
    </main>
  )
}
