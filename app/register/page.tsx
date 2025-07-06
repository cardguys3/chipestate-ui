'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    dob: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: ''
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const { error: dbError } = await supabase.from('users_extended').insert({
      id: data.user?.id,
      email: form.email,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      phone: form.phone,
      dob: form.dob,
      address_line1: form.address_line1,
      address_line2: form.address_line2,
      city: form.city,
      state: form.state,
      zip: form.zip,
    })

    if (dbError) {
      setError("Signup succeeded, but failed to save profile: " + dbError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Create Your ChipEstate Account</h1>
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-lg shadow">

        {[
          ['First Name', 'first_name'],
          ['Middle Name', 'middle_name'],
          ['Last Name', 'last_name'],
          ['Email Address', 'email', 'email'],
          ['Phone Number', 'phone'],
          ['Password', 'password', 'password'],
          ['Confirm Password', 'confirmPassword', 'password'],
          ['Date of Birth', 'dob', 'date'],
          ['Address Line 1', 'address_line1'],
          ['Address Line 2', 'address_line2'],
          ['City', 'city'],
          ['State', 'state'],
          ['Zip Code', 'zip']
        ].map(([label, name, type = 'text']) => (
          <div key={name as string}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              type={type}
              name={name as string}
              value={(form as any)[name as string]}
              onChange={handleChange}
              required={!['middle_name', 'address_line2'].includes(name as string)}
              className="w-full border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-emerald-400 focus:border-emerald-400"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-emerald-600 text-white font-semibold py-2 rounded hover:bg-emerald-700 transition"
        >
          Register
        </button>
      </form>
    </main>
  )
}
