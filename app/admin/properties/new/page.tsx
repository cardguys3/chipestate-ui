// Add Property Page with drag/drop, URL input, delete images, and property fields

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AddPropertyPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zip, setZip] = useState('')
  const [addressLine2, setAddressLine2] = useState('')
  const [reservePct, setReservePct] = useState('')
  const [propertyManagerId, setPropertyManagerId] = useState('')
  const [isOccupied, setIsOccupied] = useState(false)
  const [isHidden, setIsHidden] = useState(false)
  const [isActive, setIsActive] = useState(true)
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const files = [...e.dataTransfer.files].filter(f => f.type.startsWith('image/'))
    setImageFiles(prev => [...prev, ...files])
  }

  const handleImageUpload = async () => {
    const urls: string[] = []
    setUploading(true)

    for (const file of imageFiles) {
      const fileName = `${uuidv4()}-${file.name}`
      const { data, error } = await supabase.storage.from('property-images').upload(fileName, file)
      if (!error) {
        urls.push(fileName)
      }
    }

    setUploading(false)
    return urls
  }

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls(prev => [...prev, newImageUrl.trim()])
      setNewImageUrl('')
    }
  }

  const removeImage = (index: number, source: 'upload' | 'url') => {
    if (source === 'upload') {
      setImageFiles(prev => prev.filter((_, i) => i !== index))
    } else {
      setImageUrls(prev => prev.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async () => {
    const uploadedImagePaths = await handleImageUpload()
    const combinedImageUrls = [...uploadedImagePaths, ...imageUrls]
    const primaryImage = combinedImageUrls[0] || ''

    const { error } = await supabase.from('properties').insert({
      title,
      description,
      purchase_price: Number(purchasePrice),
      city,
      state,
      zip,
      address_line2: addressLine2,
      reserve_percentage: Number(reservePct),
      property_manager_id: propertyManagerId || null,
      property_occupied: isOccupied,
      is_hidden: isHidden,
      is_active: isActive,
      image_url: primaryImage,
      image_urls: combinedImageUrls
    })

    if (!error) router.push('/admin/properties')
    else console.error('Error saving property:', error.message)
  }

  return (
    <main className="bg-[#0B1D33] text-white min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <h1 className="text-2xl font-bold mb-4">Add New Property</h1>

        <input type="text" placeholder="Title" className="w-full p-2 text-black" value={title} onChange={e => setTitle(e.target.value)} />
        <textarea placeholder="Description" className="w-full p-2 text-black" value={description} onChange={e => setDescription(e.target.value)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input type="number" placeholder="Purchase Price" className="p-2 text-black" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} />
          <input type="number" placeholder="Reserve %" className="p-2 text-black" value={reservePct} onChange={e => setReservePct(e.target.value)} />
          <input type="text" placeholder="City" className="p-2 text-black" value={city} onChange={e => setCity(e.target.value)} />
          <input type="text" placeholder="State" className="p-2 text-black" value={state} onChange={e => setState(e.target.value)} />
          <input type="text" placeholder="ZIP" className="p-2 text-black" value={zip} onChange={e => setZip(e.target.value)} />
          <input type="text" placeholder="Address Line 2" className="p-2 text-black" value={addressLine2} onChange={e => setAddressLine2(e.target.value)} />
        </div>

        <input type="text" placeholder="Property Manager ID" className="w-full p-2 text-black" value={propertyManagerId} onChange={e => setPropertyManagerId(e.target.value)} />

        <div className="flex items-center gap-4">
          <label><input type="checkbox" checked={isOccupied} onChange={e => setIsOccupied(e.target.checked)} /> Occupied</label>
          <label><input type="checkbox" checked={isHidden} onChange={e => setIsHidden(e.target.checked)} /> Hidden</label>
          <label><input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} /> Active</label>
        </div>

        <div onDrop={handleImageDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed p-4 rounded text-center">
          Drag & drop images here
        </div>

        <div className="flex flex-wrap gap-2">
          {imageFiles.map((file, index) => (
            <div key={index} className="relative">
              <img src={URL.createObjectURL(file)} className="w-24 h-24 object-cover rounded" />
              <button onClick={() => removeImage(index, 'upload')} className="absolute top-0 right-0 text-red-500">✕</button>
            </div>
          ))}

          {imageUrls.map((url, index) => (
            <div key={index} className="relative">
              <img src={url} className="w-24 h-24 object-cover rounded" />
              <button onClick={() => removeImage(index, 'url')} className="absolute top-0 right-0 text-red-500">✕</button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input type="text" className="flex-1 p-2 text-black" placeholder="Paste image URL" value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} />
          <button onClick={handleAddImageUrl} className="bg-emerald-600 px-4 py-2 rounded">Add URL</button>
        </div>

        <button disabled={uploading} onClick={handleSubmit} className="bg-blue-600 px-6 py-2 rounded font-bold">
          {uploading ? 'Uploading...' : 'Save Property'}
        </button>
      </div>
    </main>
  )
}