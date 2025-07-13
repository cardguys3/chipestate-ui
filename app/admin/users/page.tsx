
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
}

export default async function AdminUsersPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase env vars missing');
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Configuration error</h1>
        <p className="text-white">Supabase environment variables are not set.</p>
      </main>
    );
  }

  let users: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    res_state: string | null;
    created_at: string | null;
  }[] = [];
  let errorMessage = '';

  try {
    const cookieStore = cookies();

    const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get: (name: string) => cookieStore.get(name)?.value,
        set: () => {},
        remove: () => {},
      },
    });

    const { data, error } = await supabase
      .from('users_extended')
      .select('id, email, first_name, last_name, res_state, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[AdminUsersPage] Supabase error:', error.message);
      errorMessage = error.message;
    } else {
      users = data ?? [];
    }
  } catch (err: any) {
    console.error('[AdminUsersPage] Unexpected error:', err);
    errorMessage = err?.message || 'Unexpected error occurred.';
  }

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

      {errorMessage ? (
        <div className="text-red-500 bg-red-100 dark:bg-red-900 p-4 rounded">
          <strong>Error:</strong> {errorMessage}
        </div>
      ) : users.length === 0 ? (
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
                    <td className="p-3 space-x-2">
                      <Link
                        href={`/admin/users/${u.id}/edit-user`}
                        className="text-blue-500 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        className="text-green-600 hover:underline"
                        onClick={() => console.log(`Approve ${u.id}`)}
                      >
                        Approve
                      </button>
                      <button
                        className="text-red-600 hover:underline"
                        onClick={() => console.log(`Deny ${u.id}`)}
                      >
                        Deny
                      </button>
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
