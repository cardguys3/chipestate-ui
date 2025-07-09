// Updated Edit Property Page with Zillow deep link integration

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
  const [managers, setManagers] = useState<any[]>([])

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

    const fetchManagers = async () => {
      const { data } = await supabase.from('property_managers').select('id, name')
      setManagers(data || [])
    }

    fetchProperty()
    fetchManagers()
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
    const { error: updateError } = await supabase.from('properties').update({
      ...form,
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
      </div>

      {/* rest of the form remains unchanged */}
      {/* ... */}
    </main>
  )
}
