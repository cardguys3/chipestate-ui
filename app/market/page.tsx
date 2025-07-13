import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import Image from 'next/image';
import { Suspense } from 'react';
import { Database } from '@/types/supabase';

export const dynamic = 'force-dynamic';

/**
 * Helper to build a new search string with updated sort field / order
 */
function buildSortUrl(searchParams: URLSearchParams, field: string) {
  const currentField = searchParams.get('sort') ?? '';
  const currentOrder = searchParams.get('order') ?? 'asc';
  const newOrder = currentField === field && currentOrder === 'asc' ? 'desc' : 'asc';
  const params = new URLSearchParams(searchParams);
  params.set('sort', field);
  params.set('order', newOrder);
  return `?${params.toString()}`;
}

function formatUsd(n: number | null) {
  if (n === null || n === undefined) return '—';
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function MarketPage({ searchParams }: { searchParams: { [key: string]: string } }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Determine sort field & order from query params
  const sortField = searchParams.sort ?? 'price';
  const sortOrder = (searchParams.order ?? 'asc') === 'desc' ? 'desc' : 'asc';

  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .eq('is_hidden', false)
    .order(sortField, { ascending: sortOrder === 'asc' });

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">Marketplace</h1>
        {error ? (
          <p className="text-red-500">Error loading properties: {error.message}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-blue-800 text-gray-300">
                  {[
                    { key: 'address_line1', label: 'Property' },
                    { key: 'title', label: 'Name' },
                    { key: 'price', label: 'Price' },
                    { key: 'yield', label: 'Yield' },
                    { key: 'cap_rate', label: 'Cap Rate' },
                    { key: 'reserve', label: 'Operating Reserve' },
                    { key: 'market_cap', label: 'Market Cap' },
                    { key: 'chips_sold', label: 'Chips Available' },
                  ].map(({ key, label }) => (
                    <th key={key} className="py-2 px-2">
                      <Link href={buildSortUrl(new URLSearchParams(searchParams as any), key)}>{label}</Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties?.map((p) => {
                  const imgSrc = p.image_url?.startsWith('http')
                    ? p.image_url
                    : `https://${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/property-images/${p.image_url}`;

                  return (
                    <tr key={p.id} className="border-b border-blue-800 hover:bg-blue-900 transition duration-150">
                      <td className="flex items-center gap-3 py-3 pr-4">
                        <Image src={imgSrc || '/placeholder.png'} alt={p.address_line1} width={60} height={60} className="rounded-md object-cover w-16 h-16" unoptimized />
                        <div>
                          <div className="font-semibold">{p.address_line1}</div>
                          <div className="text-gray-400 text-xs">{`${p.city}, ${p.state} ${p.zip}`}</div>
                        </div>
                      </td>
                      <td className="px-2">{p.title || 'Untitled'}</td>
                      <td className="px-2">{formatUsd(p.price)}</td>
                      <td className="px-2">{p.yield ?? 'N/A'}</td>
                      <td className="px-2">{p.cap_rate ?? 'N/A'}</td>
                      <td className="px-2">{formatUsd(p.reserve)} </td>
                      <td className="px-2">{formatUsd(p.market_cap)}</td>
                      <td className="px-2">{p.chips_sold ?? 0}/{p.chips_total ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
