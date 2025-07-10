'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    dob: '',
    res_address_line1: '',
    res_address_line2: '',
    res_city: '',
    res_state: '',
    res_zip: '',
    mail_address_line1: '',
    mail_address_line2: '',
    mail_city: '',
    mail_state: '',
    mail_zip: '',
  })

  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const { email, password, ...profileData } = formData

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError || !signUpData.user) {
      setError(signUpError?.message || 'Registration failed.')
      return
    }

    const { error: profileError } = await supabase.from('users_extended').insert({
      id: signUpData.user.id,
      email,
      ...profileData,
    })

    if (profileError) {
      setError(profileError.message)
    } else {
      router.push(`/register/license?user_id=${signUpData.user.id}`)
    }
  }

  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div className="grid grid-cols-2 gap-4">
          <input name="first_name" placeholder="First Name" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          <input name="middle_name" placeholder="Middle Name" onChange={handleChange} className="p-2 rounded bg-blue-900" />
          <input name="last_name" placeholder="Last Name" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          <input name="phone" placeholder="Phone" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          <input name="dob" type="date" placeholder="Date of Birth" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          <input name="email" placeholder="Email" type="email" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          <input name="password" placeholder="Password" type="password" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
        </div>

        <fieldset className="border border-blue-700 p-4 rounded">
          <legend className="text-lg font-semibold">Residential Address</legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <input name="res_address_line1" placeholder="Address Line 1" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="res_address_line2" placeholder="Address Line 2" onChange={handleChange} className="p-2 rounded bg-blue-900" />
            <input name="res_city" placeholder="City" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="res_state" placeholder="State" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="res_zip" placeholder="Zip Code" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          </div>
        </fieldset>

        <fieldset className="border border-blue-700 p-4 rounded">
          <legend className="text-lg font-semibold">Mailing Address</legend>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <input name="mail_address_line1" placeholder="Address Line 1" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="mail_address_line2" placeholder="Address Line 2" onChange={handleChange} className="p-2 rounded bg-blue-900" />
            <input name="mail_city" placeholder="City" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="mail_state" placeholder="State" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
            <input name="mail_zip" placeholder="Zip Code" onChange={handleChange} required className="p-2 rounded bg-blue-900" />
          </div>
        </fieldset>

        {error && <p className="text-red-400">{error}</p>}
        <button type="submit" className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded shadow text-white font-semibold">
          Register
        </button>
      </form>
    </main>
  )
}
