//chip listing page

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/supabase'
import { Input } from '@/components/input'
import { Button } from '@/components/button'
import toast, { Toaster } from 'react-hot-toast'

export default function ListChipPage() {
  const router = useRouter()
  const params = useParams()
  const chipId = params?.chipId as string

  const [chip, setChip] = useState<any>(null)
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchChip = async () => {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data, error } = await supabase
        .from('chips_view')
        .select('*')
        .eq('id', chipId)
        .single()

      if (error || !data) {
        toast.error('Chip not found.')
        return
      }

      setChip(data)
    }

    if (chipId) fetchChip()
  }, [chipId])

  const handleSubmit = async () => {
    const askingPrice = parseFloat(price)
    if (!askingPrice || askingPrice <= 0) {
      toast.error('Enter a valid asking price')
      return
    }

    setLoading(true)
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (!user || authError) {
      toast.error('Not authorized')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('chip_listings').insert({
      chip_id: chipId,
      seller_id: user.id,
      asking_price: askingPrice,
      status: 'open'
    })

    setLoading(false)

    if (error) {
      toast.error('Failed to list chip')
    } else {
      toast.success('Chip listed successfully')
      setTimeout(() => router.push('/trade'), 1000)
    }
  }

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <Toaster position="top-right" />
      <h1 className="text-3xl font-bold mb-6">List Chip for Sale</h1>
      {!chip ? (
        <p>Loading chip details...</p>
      ) : (
        <div className="max-w-xl space-y-4">
          <p>
            <strong>Serial:</strong> {chip.serial}
          </p>
          <p>
            <strong>Property:</strong> {chip.property_title || 'Unknown'}
          </p>
          <Input
            type="number"
            placeholder="Enter asking price ($USD)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Listing...' : 'Confirm Listing'}
          </Button>
        </div>
      )}
    </main>
  )
}
