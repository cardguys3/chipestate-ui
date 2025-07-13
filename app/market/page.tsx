import Link from 'next/link';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

interface Property {
  id: string;
  title: string;
  location: string;
  current_value: number;
  chip_count: number;
  chips_sold: number;
  created_at: string;
}

export const dynamic = 'force-dynamic';

interface MarketPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function MarketPage({ searchParams }: MarketPageProps) {
  const cookieStore = cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: () => cookieStore,
  });

  const sortField = (typeof searchParams?.sort === 'string' && searchParams.sort) || 'created_at';
  const sortDirection = (typeof searchParams?.dir === 'string' && searchParams.dir === 'asc') ? 'asc' : 'desc';

  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order(sortField, { ascending: sortDirection === 'asc' });

  const toggleUrl = (field: string) => {
    const newDir = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    return `?sort=${field}&dir=${newDir}`;
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Market</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('title')} className="hover:underline">Title</Link>
              </th>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('location')} className="hover:underline">Location</Link>
              </th>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('current_value')} className="hover:underline">Value</Link>
              </th>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('chip_count')} className="hover:underline">Chips</Link>
              </th>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('chips_sold')} className="hover:underline">Sold</Link>
              </th>
              <th className="p-3 font-semibold">
                <Link href={toggleUrl('created_at')} className="hover:underline">Created</Link>
              </th>
            </tr>
          </thead>
          <tbody>
            {properties?.map((p) => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="p-3">
                  <Link href={`/market/${p.id}`} className="text-blue-500 hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{formatCurrency(p.current_value)}</td>
                <td className="p-3">{p.chip_count}</td>
                <td className="p-3">{p.chips_sold}</td>
                <td className="p-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
