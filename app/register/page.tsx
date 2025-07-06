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

    // Password check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    // Create Supabase auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // Insert into users_extended
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

    router.push('/dashboard') // Or show confirmation screen
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-blue-900 mb-4">Create Your ChipEstate Account</h1>
      {error && <div className="text-red-600 mb-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="first_name" placeholder="First Name" onChange={handleChange} required className="input" />
          <input name="middle_name" placeholder="Middle Name" onChange={handleChange} className="input" />
          <input name="last_name" placeholder="Last Name" onChange={handleChange} required className="input" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="email" type="email" placeholder="Email" onChange={handleChange} required className="input" />
          <input name="phone" placeholder="Phone" onChange={handleChange} required className="input" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input name="password" type="password" placeholder="Password" onChange={handleChange} required className="input" />
          <input name="confirmPassword" type="password" placeholder="Confirm Password" onChange={handleChange} required className="input" />
        </div>
        <input name="dob" type="date" placeholder="Date of Birth" onChange={handleChange} required className="input" />
        <input name="address_line1" placeholder="Address Line 1" onChange={handleChange} required className="input" />
        <input name="address_line2" placeholder="Address Line 2" onChange={handleChange} className="input" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input name="city" placeholder="City" onChange={handleChange} required className="input" />
          <input name="state" placeholder="State" onChange={handleChange} required className="input" />
          <input name="zip" placeholder="Zip Code" onChange={handleChange} required className="input" />
        </div>
        <button type="submit" className="bg-emerald-600 text-white px-6 py-2 rounded hover:bg-emerald-700 w-full">
          Register
        </button>
      </form>
    </main>
  )
}
