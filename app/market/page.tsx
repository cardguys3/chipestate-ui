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
  chip_count: number;
  chips_sold: number;
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
        .select('*')
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (!error && data) {
        setProperties(data);
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

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Market</h1>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-gray-800 text-left">
            <tr>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('title')}>Title</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('location')}>Location</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('current_value')}>Value</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('chip_count')}>Chips</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('chips_sold')}>Sold</th>
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
