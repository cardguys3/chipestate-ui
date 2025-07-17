//LoginModal
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

const ADMIN_EMAILS = ['mark@chipestate.com', 'cardguys3@gmail.com']

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Invalid credentials')
      setLoading(false)
      return
    }

    if (data.user) {
      onClose()

      const isAdmin = ADMIN_EMAILS.includes(data.user.email || '')
      const redirectPath = isAdmin ? '/admin' : '/dashboard'

      router.push(redirectPath)
      window.location.reload()
    } else {
      setError('Unexpected login issue')
    }

    setLoading(false)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-black/60 z-50 flex justify-center items-center">
      <div className="bg-[#0c1a2c] text-white w-full max-w-md p-6 rounded-lg relative shadow-xl border border-white/10">
        <button
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-2xl"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-4 text-center">Login</h2>

        {error && <p className="text-red-400 mb-3 text-center">{error}</p>}

        <form onSubmit={handleLogin}>
          <label className="block mb-3">
            <span className="text-sm">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-white/20 bg-white/10 text-white px-3 py-2 rounded mt-1"
              required
            />
          </label>

          <label className="block mb-4">
            <span className="text-sm">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-white/20 bg-white/10 text-white px-3 py-2 rounded mt-1"
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded border border-white/20 shadow-md transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          <a href="/forgot-password" className="text-blue-400 hover:underline">
            Login assistance
          </a>
        </p>
      </div>
    </div>
  )
}
