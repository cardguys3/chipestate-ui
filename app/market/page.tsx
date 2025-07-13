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
  occupied: boolean;
  annual_rent: number;
  reserve_balance: number;
  manager_name: string;
}

export default function MarketPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortField, setSortField] = useState<string>('current_value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id, title, current_value, total_chips, chips_available, city, state, 
          occupied, annual_rent, reserve_balance, manager_name
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (!error && data) {
        const transformed = data.map((p) => ({
          id: p.id,
          title: p.title,
          current_value: p.current_value || 0,
          total_chips: p.total_chips,
          chips_available: p.chips_available,
          occupied: p.occupied || false,
          annual_rent: p.annual_rent || 0,
          reserve_balance: p.reserve_balance || 0,
          manager_name: p.manager_name || '',
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
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

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
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('total_chips')}>Chips</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('chips_available')}>Available</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('occupied')}>Occupied</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('annual_rent')}>Annual Rent</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('reserve_balance')}>Reserve</th>
              <th className="p-3 font-semibold cursor-pointer" onClick={() => toggleSort('manager_name')}>Manager</th>
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
                <td className="p-3">{p.occupied ? 'Yes' : 'No'}</td>
                <td className="p-3">{formatCurrency(p.annual_rent)}</td>
                <td className="p-3">{formatCurrency(p.reserve_balance)}</td>
                <td className="p-3">{p.manager_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
