// File: app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'


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
  const [sameAsResidential, setSameAsResidential] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSameAsResidential = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setSameAsResidential(checked)

    if (checked) {
      setFormData((prev) => ({
        ...prev,
        mail_address_line1: prev.res_address_line1,
        mail_address_line2: prev.res_address_line2,
        mail_city: prev.res_city,
        mail_state: prev.res_state,
        mail_zip: prev.res_zip,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError(null)

  const { email, password, ...profileData } = formData

  // Sign up user
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  console.log('Signup error:', signUpError)
  console.log('Signup data:', signUpData)

  if (signUpError || !signUpData.user) {
    setError(signUpError?.message || 'Registration failed.')
    return
  }

  // ✅ Define adminSupabase before use
  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this is set in Vercel → Project Settings → Environment Variables
  )

  // ✅ Now call upsert and then log
  const { error: bufferError } = await adminSupabase
    .from('registration_buffer')
    .upsert({
      email,
      ...profileData,
    })

  if (bufferError) {
    console.error('Upsert failed:', bufferError)
    setError(bufferError.message)
    return
  } else {
    console.log('Upsert succeeded')
  }

router.push(`/register/license?email=${encodeURIComponent(email)}`)
}


  return (
    <main className="min-h-screen bg-blue-950 text-white p-6 flex flex-col justify-between">
      <div>
        {/* Step Graphic */}
        <div className="mb-6 text-sm font-medium text-center text-gray-300 border border-emerald-700 px-3 py-1 rounded w-fit mx-auto">
          <div className="flex justify-center items-center gap-4">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white text-xs flex items-center justify-center">1</div>
              <span className="mt-1">Info</span>
            </div>
            <div className="h-px w-8 bg-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-gray-500 text-white text-xs flex items-center justify-center">2</div>
              <span className="mt-1">Verify</span>
            </div>
          </div>
        </div>

        <h1 className="text-xl font-bold mb-4 text-center">Step 1: Personal Info</h1>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl text-sm border border-emerald-700 p-6 rounded mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <input name="first_name" placeholder="First Name" onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
            <input name="middle_name" placeholder="Middle Name" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
            <input name="last_name" placeholder="Last Name" onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
            <input name="phone" placeholder="Mobile Phone" onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
          
		  <div className="col-span-2 flex gap-3 items-end">
		  <div className="flex items-center space-x-2 mb-4">
			<label htmlFor="dob" className="text-sm font-medium text-white whitespace-nowrap">
			  Date of Birth
			</label>
			<input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} required  className="p-2 border border-emerald-600 rounded bg-blue-900" />
		  </div>
		  <input type="email" id="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
		</div>
            <input name="password" placeholder="Password" type="password" onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
          </div>
		  
          <p className="text-xs text-gray-400">
            {"Password must be 10–72 characters and include at least one uppercase letter, one lowercase letter, one number, and one special character. These are the special characters !@#$%^&*()_+-=[]{};':\"|<>?,./`~."}
          </p>

          <fieldset className="border border-blue-700 p-4 rounded">
            <legend className="text-base font-semibold">Residential Address (optional)</legend>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input name="res_address_line1" placeholder="Address Line 1" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="res_address_line2" placeholder="Address Line 2" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="res_city" placeholder="City" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="res_state" placeholder="State" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="res_zip" placeholder="Zip Code" onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
            </div>
          </fieldset>

          <fieldset className="border border-blue-700 p-4 rounded">
            <legend className="text-base font-semibold">Mailing Address <span className="text-red-400">*</span></legend>
            <label className="flex items-center mb-3 text-sm">
              <input type="checkbox" checked={sameAsResidential} onChange={handleSameAsResidential} className="mr-2" />
              Mailing address is the same as residential
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <input name="mail_address_line1" placeholder="Address Line 1" value={formData.mail_address_line1} onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="mail_address_line2" placeholder="Address Line 2" value={formData.mail_address_line2} onChange={handleChange} className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="mail_city" placeholder="City" value={formData.mail_city} onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="mail_state" placeholder="State" value={formData.mail_state} onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
              <input name="mail_zip" placeholder="Zip Code" value={formData.mail_zip} onChange={handleChange} required className="p-2 border border-emerald-600 rounded bg-blue-900" />
            </div>
          </fieldset>

          {error && <p className="text-red-400">{error}</p>}

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-gray-500 rounded hover:bg-gray-800">
              Back
            </button>
            <button type="submit" className="px-4 py-2 border border-emerald-500 text-emerald-400 rounded hover:bg-emerald-600 hover:text-white transition">
			  Next
			</button>
          </div>
        </form>
      </div>

      <div className="text-center text-xs text-gray-400 mt-10">
        Step 1 of 2
      </div>
    </main>
  )
}
