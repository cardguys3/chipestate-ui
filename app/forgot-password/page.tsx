'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://chipestate.com/reset-password'
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-xl font-semibold text-blue-800 mb-4 text-center">Reset Your Password</h1>

        {sent ? (
          <p className="text-green-600 text-center">Password reset email sent to <strong>{email}</strong>.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-600 text-sm">{error}</p>}

            <label className="block">
              <span className="text-sm text-gray-700">Email Address</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-emerald-400"
              />
            </label>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
            >
              Send Reset Link
            </button>
          </form>
        )}
      </div>
    </main>
  )
}
