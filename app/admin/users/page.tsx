import { type CookieOptions, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';

import { Database } from '@/types/supabase';

function formatDate(date: string | null): string {
  if (!date) return '—';
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? '—' : parsed.toLocaleDateString();
}

export const dynamic = 'force-dynamic'; // ensure fresh data & avoid cache

export default async function AdminUsersPage() {
  // ENV sanity‑check – throws early instead of crashing Vercel at runtime
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY env variables.');
  }

  /**
   * @see https://supabase.com/docs/guides/auth/server-side/nextjs – SSR client requires
   * a cookie wrapper with get / set / remove so that auth refresh logic can run
   */
const cookieStore = cookies();
const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
  cookies: {
    get: (name: string) => {
      const cookie = cookieStore.get(name);
      return cookie?.value;
    },
    set: () => {
      // no-op: not needed on server read
    },
    remove: () => {
      // no-op: not needed on server read
    },
  },
});

  const { data: users, error } = await supabase
    .from('users_extended')
    .select('id, email, first_name, last_name, res_state, created_at');

  if (error) {
    console.error('[AdminUsersPage] Supabase fetch error:', error);
    return (
      <main className="p-6">
        <p className="text-red-600 text-xl">Failed to fetch users: {error.message}</p>
      </main>
    );
  }

  if (!users || users.length === 0) {
    return (
      <main className="p-6">
        <p className="text-lg">No users found.</p>
      </main>
    );
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Users</h1>
        <Link
          href="/admin/users/add-user"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
        >
          + Add User
        </Link>
      </div>

      <table className="w-full border border-gray-700 rounded-lg overflow-hidden text-sm">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800 text-left">
            <th className="p-2 font-semibold">Name</th>
            <th className="p-2 font-semibold">Email</th>
            <th className="p-2 font-semibold">State</th>
            <th className="p-2 font-semibold">Created&nbsp;At</th>
            <th className="p-2 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(({ id, email = '—', first_name = '', last_name = '', res_state = '—', created_at }) => {
            const name = `${first_name} ${last_name}`.trim() || '—';

            return (
              <tr key={id} className="border-t border-gray-700">
                <td className="p-2">
                  <Link
                    href={`/admin/users/${id}/edit-user`}
                    className="text-blue-500 hover:underline"
                  >
                    {name}
                  </Link>
                </td>
                <td className="p-2">{email}</td>
                <td className="p-2">{res_state}</td>
                <td className="p-2 whitespace-nowrap">{formatDate(created_at)}</td>
                <td className="p-2 space-x-3">
                  <Link
                    href={`/admin/users/${id}/edit-user`}
                    className="text-blue-500 hover:underline"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    className="text-green-500 hover:underline"
                    onClick={() => console.log(`Approve ${id}`)}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="text-red-500 hover:underline"
                    onClick={() => console.log(`Deny ${id}`)}
                  >
                    Deny
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
}
