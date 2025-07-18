// File: app/admin/users/page.tsx
'use server';

import { createClient } from '@supabase/supabase-js'; // ✅ FIXED: moved out of the function
import { cookies } from 'next/headers';
import Link from 'next/link';

import { Database } from '@/types/supabase';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default async function AdminUsersPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: users, error } = await supabase
    .from('users_extended')
    .select('id, email, first_name, last_name, res_state, created_at')
    .order('created_at', { ascending: false });

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <Link
          href="/admin/users/add-user"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl shadow"
        >
          + Add User
        </Link>
      </div>

      {error ? (
        <div className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded">
          <strong>Error:</strong> {error.message}
        </div>
      ) : !users || users.length === 0 ? (
        <p className="text-lg text-white">No users found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 dark:bg-gray-800 text-left">
              <tr>
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Email</th>
                <th className="p-3 font-semibold">State</th>
                <th className="p-3 font-semibold whitespace-nowrap">Created</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const name = `${u.first_name ?? ''} ${u.last_name ?? ''}`.trim() || '—';
                return (
                  <tr key={u.id} className="border-t border-gray-700">
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${u.id}/edit-user`}
                        className="text-blue-500 hover:underline"
                      >
                        {name}
                      </Link>
                    </td>
                    <td className="p-3">{u.email ?? '—'}</td>
                    <td className="p-3">{u.res_state ?? '—'}</td>
                    <td className="p-3 whitespace-nowrap">{formatDate(u.created_at)}</td>
                    <td className="p-3">
                      <Link
                        href={`/admin/users/${u.id}/edit-user`}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
