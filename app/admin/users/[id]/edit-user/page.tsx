import { createServerComponentClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import Link from 'next/link';

interface PageProps {
  params: { id: string };
}

export default async function Page({ params }: PageProps) {
  const supabase = createServerComponentClient<Database>({ cookies });

  const { data: user, error } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error) {
    console.error('Error fetching user:', error.message);
    return <div className="p-4 text-red-600">Error loading user data.</div>;
  }

  if (!user) {
    return <div className="p-4 text-red-600">User not found.</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Edit User: {user.first_name} {user.last_name}
      </h1>
      <div className="space-y-2">
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Phone:</strong> {user.phone}</div>
        <div><strong>DOB:</strong> {user.dob}</div>
        <div><strong>Residential Address:</strong> {user.res_address_line1} {user.res_address_line2}, {user.res_city}, {user.res_state} {user.res_zip}</div>
        <div><strong>Mailing Address:</strong> {user.mail_address_line1} {user.mail_address_line2}, {user.mail_city}, {user.mail_state} {user.mail_zip}</div>
        <div><strong>Approved:</strong> {user.is_approved ? 'Yes' : 'No'}</div>
      </div>
      <Link href="/admin/users" className="mt-4 inline-block text-blue-500 hover:underline">
        ← Back to Users
      </Link>
    </div>
  );
}
