import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AddUserPage() {
  return (
    <main className="min-h-screen bg-blue-950 text-white p-6">
      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Add New User</h1>

        <form action="/admin/users/add/submit" method="POST" className="bg-blue-900 p-6 rounded-lg shadow-lg space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <input name="email" type="email" required className="w-full p-2 rounded bg-blue-800 text-white" />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block mb-1 font-semibold">First Name</label>
              <input name="first_name" type="text" required className="w-full p-2 rounded bg-blue-800 text-white" />
            </div>
            <div className="flex-1">
              <label className="block mb-1 font-semibold">Last Name</label>
              <input name="last_name" type="text" required className="w-full p-2 rounded bg-blue-800 text-white" />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Phone</label>
            <input name="phone" type="text" className="w-full p-2 rounded bg-blue-800 text-white" />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Date of Birth</label>
            <input name="dob" type="date" className="w-full p-2 rounded bg-blue-800 text-white" />
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded">
              Add User
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}
