// app/login/page.tsx

'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { toast } from 'react-hot-toast'

const ADMIN_EMAILS = ['mark@chipestate.com', 'cardguys3@gmail.com']

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'magic' | 'admin'>('magic')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    if (data.user && ADMIN_EMAILS.includes(data.user.email || '')) {
      router.push('/admin')
    } else {
      setError('Access denied: not an admin')
      await supabase.auth.signOut()
    }

    setLoading(false)
  }

  const handleMagicLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (error) {
      setError('Failed to send magic link')
    } else {
      toast.success('Magic link sent to your email')
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={mode === 'admin' ? handleAdminLogin : handleMagicLogin}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md"
      >
        <h1 className="text-xl font-semibold mb-4 text-center">
          {mode === 'admin' ? 'Admin Login' : 'Login with Magic Link'}
        </h1>

        {error && <p className="text-red-600 mb-3 text-center">{error}</p>}

        <label className="block mb-4">
          <span className="text-sm">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border px-3 py-2 rounded mt-1"
            required
            autoComplete="email"
          />
        </label>

        {mode === 'admin' && (
          <label className="block mb-4">
            <span className="text-sm">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
              required
              autoComplete="current-password"
            />
          </label>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition"
        >
          {loading
            ? 'Submitting...'
            : mode === 'admin'
            ? 'Login as Admin'
            : 'Send Magic Link'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'admin' ? 'magic' : 'admin')
            setError(null)
            setPassword('')
          }}
          className="mt-4 w-full text-sm text-blue-600 hover:underline text-center"
        >
          {mode === 'admin'
            ? 'Use Magic Link instead'
            : 'Admin? Use Email + Password'}
        </button>
      </form>
    </main>
  )
}
