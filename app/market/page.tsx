'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';

interface Property {
  id: string;
  title: string;
  location: string;
  current_value: number;
  total_chips: number;
  chips_available: number;
  created_at: string;
}

export default function MarketPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, current_value, total_chips, chips_available, created_at, city, state')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (!error && data) {
        const transformed = data.map((p) => ({
          id: p.id,
          title: p.title,
          current_value: p.current_value || 0,
          total_chips: p.total_chips,
          chips_available: p.chips_available,
          created_at: p.created_at || '',
          location: `${p.city || ''}, ${p.state || ''}`.replace(/^, |, $/g, '').trim(),
        }));
        setProperties(transformed);
      }
    };

    fetchData();
  }, [sortField, sortDirection]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  const totalValue = properties.reduce((sum, p) => sum + (p.current_value || 0), 0);
  const totalChips = properties.reduce((sum, p) => sum + (p.total_chips || 0), 0);
  const totalAvailable = properties.reduce((sum, p) => sum + (p.chips_available || 0), 0);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Market</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-sm uppercase text-gray-400">Total Property Value</h2>
          <p className="text-xl font-bold">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-sm uppercase text-gray-400">Total Chips</h2>
          <p className="text-xl font-bold">{totalChips.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow text-white">
          <h2 className="text-sm uppercase text-gray-400">Chips Available</h2>
          <p className="text-xl font-bold">{totalAvailable.toLocaleString()}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('title')}>Title</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('location')}>Location</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('current_value')}>Value</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('total_chips')}>Chips</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('chips_available')}>Available</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('created_at')}>Created</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t border-gray-700">
                <td className="p-3">
                  <Link href={`/market/${p.id}`} className="text-blue-500 hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{formatCurrency(p.current_value)}</td>
                <td className="p-3">{p.total_chips}</td>
                <td className="p-3">{p.chips_available}</td>
                <td className="p-3 whitespace-nowrap">{new Date(p.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
