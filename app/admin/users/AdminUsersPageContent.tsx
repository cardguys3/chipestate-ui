// ==== FILE: /app/admin/users/AdminUsersPageContent.tsx START ====
'use client'

import { useState } from 'react'
import Filters from './filters'
import { formatPhoneNumber } from './formatPhoneNumber'
import { resendVerification } from './resendVerification'
import { manuallyVerifyEmail } from './manuallyVerifyEmail'
import { toggleApproval } from './toggleApproval'
import { toggleActive } from './toggleActive'
import { filterAndSortUsers } from './filterAndSortUsers'
import { User, Property } from '@/types'

type Props = {
  users: User[]
  properties: Property[]
}

export default function AdminUsersPageContent({ users, properties }: Props) {
  const [filteredUsers, setFilteredUsers] = useState<User[]>(users)

  return (
    <>
      <Filters users={users} properties={properties} onFilterChange={setFilteredUsers} />

      <div className="overflow-x-auto rounded-xl border border-gray-700">
        <table className="min-w-full bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white">
          <thead className="bg-emerald-800 text-white text-left">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">City</th>
              <th className="px-4 py-2">State</th>
              <th className="px-4 py-2">Zip</th>
              <th className="px-4 py-2">Approved</th>
              <th className="px-4 py-2">Active</th>
              <th className="px-4 py-2">Verified</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-700">
                <td className="px-4 py-2">{user.first_name} {user.last_name}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{formatPhoneNumber(user.phone)}</td>
                <td className="px-4 py-2">{user.city}</td>
                <td className="px-4 py-2">{user.state}</td>
                <td className="px-4 py-2">{user.zip}</td>
                <td className="px-4 py-2">{user.is_approved ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">{user.is_active ? 'Yes' : 'No'}</td>
                <td className="px-4 py-2">
                  {user.email_confirmed_at ? (
                    'Yes'
                  ) : (
                    <div className="flex flex-col gap-1">
                      <form action={() => resendVerification(user.id, user.email)}>
                        <button type="submit" className="text-emerald-400 hover:underline text-xs">
                          Resend
                        </button>
                      </form>
                      <form action={() => manuallyVerifyEmail(user.id)}>
                        <button type="submit" className="text-yellow-400 hover:underline text-xs">
                          Override
                        </button>
                      </form>
                    </div>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-col gap-1">
                    <form action={() => toggleApproval(user.id, user.is_approved)}>
                      <button type="submit" className="text-blue-400 hover:underline text-xs">
                        Toggle Approval
                      </button>
                    </form>
                    <form action={() => toggleActive(user.id, user.is_active)}>
                      <button type="submit" className="text-orange-400 hover:underline text-xs">
                        Toggle Active
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
// ==== FILE: /app/admin/users/AdminUsersPageContent.tsx END ====
