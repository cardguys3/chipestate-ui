'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { v4 as uuidv4 } from 'uuid'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const residentialSubtypes = ['Single Family', 'Multi-Family', 'Townhouse', 'Condo']
const commercialSubtypes = ['Office', 'Retail', 'Industrial', 'Mixed-Use']

function SortableImage({ url, index, onRemove }: { url: string; index: number; onRemove: (idx: number) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: url })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative">
      <img src={url} alt="Preview" className="w-24 h-16 object-cover rounded border" />
      <button type="button" onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs">×</button>
    </div>
  )
}


export default function NewPropertyPage() {
  const [form, setForm] = useState<any>({})
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageInputUrl, setImageInputUrl] = useState('')
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setForm((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleDrop = (e: any) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
    setImageFiles(prev => [...prev, ...files])
  }

  const handleImageInputChange = (e: any) => {
    setImageFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  const handleImageUrlAdd = () => {
    if (imageInputUrl) {
      setImageUrls(prev => [...prev, imageInputUrl])
      setImageInputUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (active.id !== over.id) {
      const oldIndex = imageUrls.indexOf(active.id)
      const newIndex = imageUrls.indexOf(over.id)
      setImageUrls((items) => arrayMove(items, oldIndex, newIndex))
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const uploadedUrls: string[] = [...imageUrls]
    for (const file of imageFiles) {
      const filename = `images/${uuidv4()}-${file.name}`
      const { data, error } = await supabase.storage.from('property-images').upload(filename, file)
      if (error) {
        console.error('Upload error:', error.message)
        continue
      }
      uploadedUrls.push(data.path)
    }

    const mainImage = uploadedUrls[0] || null

    const { data: insertedProperties, error } = await supabase
      .from('properties')
      .insert([{ ...form, image_url: mainImage, image_urls: uploadedUrls }])
      .select()

    if (error || !insertedProperties || insertedProperties.length === 0) {
      console.error('Property creation failed:', error)
      return
    }

    const propertyId = insertedProperties[0].id
    const chipCount = parseInt(form.chips)

    const chipRows = Array.from({ length: chipCount }, (_, index) => ({
      id: uuidv4(),
      property_id: propertyId,
      chip_number: index + 1,
      created_at: new Date().toISOString(),
    }))

    const { error: chipError } = await supabase.from('chips').insert(chipRows)
    if (chipError) {
      console.error('Chip creation failed:', chipError.message)
    }

    router.push('/admin/properties')
  }

  const handleCancel = () => {
    router.push('/admin/properties')
  }

  return (
    <div className="min-h-screen bg-[#0a2540] text-white px-6 py-8">
      <div className="max-w-2xl mx-auto bg-[#102a4d] p-8 rounded border border-gray-500 shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Add New Property</h1>
        <form onSubmit={handleSubmit} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} className="space-y-5">
          {/* Property Name */}
          <div>
            <label className="block mb-1 font-medium">Property Name <span className="text-red-500">*</span></label>
            <input type="text" name="name" required onChange={handleChange} className="w-full p-2 text-white bg-[#0a2540] border border-gray-500 rounded" />
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 font-medium">Address <span className="text-red-500">*</span></label>
            <input type="text" name="address" required onChange={handleChange} className="w-full p-2 text-white bg-[#0a2540] border border-gray-500 rounded" />
          </div>

          {/* Property Type and Subtype */}
          <div>
            <label className="block mb-1 font-medium">Property Type <span className="text-red-500">*</span></label>
            <select name="type" required onChange={handleChange} className="w-full p-2 bg-[#0a2540] text-white border border-gray-500 rounded">
              <option value="" disabled>Select Type</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          {(form.type === 'Residential' || form.type === 'Commercial') && (
            <div>
              <label className="block mb-1 font-medium">Subtype <span className="text-red-500">*</span></label>
              <select name="subtype" required onChange={handleChange} className="w-full p-2 bg-[#0a2540] text-white border border-gray-500 rounded">
                <option value="" disabled>Select Subtype</option>
                {(form.type === 'Residential' ? residentialSubtypes : commercialSubtypes).map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          )}

          {/* Property Price */}
          <div>
            <label className="block mb-1 font-medium">Property Price <span className="text-red-500">*</span></label>
            <input type="number" name="price" required onChange={handleChange} className="w-full p-2 text-white bg-[#0a2540] border border-gray-500 rounded" />
          </div>

          {/* Chips */}
          <div>
            <label className="block mb-1 font-medium">Number of Chips <span className="text-red-500">*</span></label>
            <input type="number" name="chips" required onChange={handleChange} className="w-full p-2 text-white bg-[#0a2540] border border-gray-500 rounded" />
          </div>

          {/* Drag & Drop Image Upload + URL */}
          <div>
            <label className="block mb-2 font-medium">Upload Images</label>
            <input type="file" accept="image/*" multiple onChange={handleImageInputChange} className="mb-2" />
            <div className="flex items-center gap-2 mb-4">
              <input type="text" placeholder="Image URL" value={imageInputUrl} onChange={(e) => setImageInputUrl(e.target.value)} className="flex-1 p-2 bg-[#0a2540] border border-gray-500 rounded text-white" />
              <button type="button" onClick={handleImageUrlAdd} className="bg-blue-600 px-3 py-1 rounded">Add</button>
            </div>
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={imageUrls} strategy={verticalListSortingStrategy}>
                <div className="flex gap-3 flex-wrap">
                  {imageUrls.map((url, index) => (
                    <SortableImage key={url} url={url} index={index} onRemove={handleRemoveImage} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <button type="button" onClick={handleCancel} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Cancel</button>
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded">Save Property</button>
          </div>
        </form>
      </div>
    </div>
  )
}
