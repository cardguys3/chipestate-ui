import React from 'react'
import { toggleApproval } from './toggleApproval'
import { toggleActive } from './toggleActive'
import { filterAndSortUsers } from './filterAndSortUsers'
import type { User, Property } from '@/types/index'
import { formatPhoneNumber } from './formatPhoneNumber'
import { resendVerification } from './resendVerification'
import { manuallyVerifyEmail } from './manuallyVerifyEmail'

// ==== BLOCK: AdminUsersPageContent Component ====
type SimplifiedProperty = {
  id: string
  title: string
}

type Props = {
  users: User[]
  properties: SimplifiedProperty[]
}


export default function AdminUsersPageContent({ users, properties }: Props) {
  const sortedUsers = filterAndSortUsers(users)

  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full text-sm">
        <thead>
          <tr className="bg-gray-800 text-white">
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Email</th>
            <th className="px-4 py-2">Phone</th>
            <th className="px-4 py-2">City</th>
            <th className="px-4 py-2">State</th>
            <th className="px-4 py-2">Zip</th>
            <th className="px-4 py-2">Approved</th>
            <th className="px-4 py-2">Active</th>
            <th className="px-4 py-2">Email Verified</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map((user) => (
            <tr key={user.id} className="border-b border-gray-700">
              <td className="px-4 py-2">{user.first_name} {user.last_name}</td>
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{formatPhoneNumber(user.phone ?? null)}</td>
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
                    <form action="/api/resend-verification" method="POST">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="email" value={user.email} />
                      <button type="submit" className="text-emerald-400 hover:underline text-xs">
                        Resend
                      </button>
                    </form>
                    <form action="/api/manual-verify" method="POST">
                      <input type="hidden" name="userId" value={user.id} />
                      <button type="submit" className="text-yellow-400 hover:underline text-xs">
                        Override
                      </button>
                    </form>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
// ==== END BLOCK: AdminUsersPageContent Component ====
