'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function CheckoutPage() {
  const { id } = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const qty = parseInt(searchParams.get('qty') || '1')
  const [property, setProperty] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProperty = async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error loading property:', error.message)
      } else {
        setProperty(data)
      }

      setLoading(false)
    }

    fetchProperty()
  }, [id])

  const handlePaymentSuccess = async () => {
    const user = await supabase.auth.getUser()
    const user_id = user.data.user?.id
    if (!user_id) return alert('User not authenticated')

    const response = await fetch('/api/assign-chips', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property_id: id, user_id, quantity: qty })
    })

    if (response.ok) {
      alert('Payment successful and chips assigned!')
      router.push('/dashboard')
    } else {
      alert('Payment processed but chip assignment failed.')
    }
  }

  if (loading) return <main className="min-h-screen bg-[#0B1D33] text-white p-8">Loading...</main>
  if (!property) return <main className="min-h-screen bg-[#0B1D33] text-white p-8">Property not found.</main>

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-8">
      <div className="max-w-2xl mx-auto border border-gray-700 rounded-xl p-6">
        <h1 className="text-2xl font-bold mb-4">Checkout: {property.title}</h1>

        <p className="mb-2">You're purchasing <strong>{qty}</strong> chip{qty > 1 ? 's' : ''} at <strong>$50</strong> each.</p>
        <p className="mb-4">Total: <strong>${qty * 50}</strong></p>

        <div className="bg-white rounded-lg p-4 text-black">
          <PayPalScriptProvider options={{ clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!, currency: 'USD' }}>
            <PayPalButtons
              style={{ layout: 'vertical' }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: (qty * 50).toString()
                    }
                  }]
                })
              }}
              onApprove={async (data, actions) => {
                const result = await actions.order?.capture()
                if (result?.status === 'COMPLETED') {
                  await handlePaymentSuccess()
                } else {
                  alert('Payment not completed.')
                }
              }}
              onError={(err) => {
                console.error('PayPal Error:', err)
                alert('An error occurred with PayPal.')
              }}
            />
          </PayPalScriptProvider>
        </div>
      </div>
    </main>
  )
}
