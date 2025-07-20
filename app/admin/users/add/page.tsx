// File: app/admin/users/add/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabaseClient'

export default function AddUserPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    email: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    phone: '',
    dob: '',
    license_front_url: '',
    license_back_url: '',
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
    is_approved: false,
    is_active: true,
    registration_status: '',
  })

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { error } = await supabase.from('users_extended').insert({
      id: uuidv4(),
      ...form,
    })

    if (!error) {
      router.push('/admin/users')
    } else {
      alert('Error creating user: ' + error.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <div className="max-w-6xl mx-auto border border-white/20 rounded-xl p-6 space-y-6">
        <h1 className="text-3xl font-bold">Add New User</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input name="email" type="email" required placeholder="Email" value={form.email} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="first_name" placeholder="First Name" value={form.first_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="middle_name" placeholder="Middle Name" value={form.middle_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="last_name" placeholder="Last Name" value={form.last_name} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="dob" type="date" placeholder="DOB" value={form.dob} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input name="license_front_url" placeholder="License Front URL" value={form.license_front_url} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="license_back_url" placeholder="License Back URL" value={form.license_back_url} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          </div>

          <h2 className="text-lg font-semibold mt-4">Residential Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input name="res_address_line1" placeholder="Address Line 1" value={form.res_address_line1} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="res_address_line2" placeholder="Address Line 2" value={form.res_address_line2} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="res_city" placeholder="City" value={form.res_city} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="res_state" placeholder="State" value={form.res_state} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="res_zip" placeholder="Zip" value={form.res_zip} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          </div>

          <h2 className="text-lg font-semibold mt-4">Mailing Address</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <input name="mail_address_line1" placeholder="Address Line 1" value={form.mail_address_line1} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="mail_address_line2" placeholder="Address Line 2" value={form.mail_address_line2} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="mail_city" placeholder="City" value={form.mail_city} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="mail_state" placeholder="State" value={form.mail_state} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <input name="mail_zip" placeholder="Zip" value={form.mail_zip} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <input name="registration_status" placeholder="Registration Status" value={form.registration_status} onChange={handleChange} className="p-2 rounded bg-[#0B1D33] border border-gray-600" />
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_approved" checked={form.is_approved} onChange={handleChange} />
              <span>Approved</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              <span>Active</span>
            </label>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded"
            >
              Add User
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/users')}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
