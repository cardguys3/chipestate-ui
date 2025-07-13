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

      const { data: propertyData, error } = await supabase
        .from('properties')
        .select(`
          id, title, current_value, total_chips, chips_available, city, state, 
          occupied, reserve_balance, manager_name
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });

      if (!error && propertyData) {
        const propertyIds = propertyData.map((p) => p.id);

        const { data: rentData } = await supabase
          .from('property_transactions')
          .select('property_id, amount')
          .eq('type', 'rent')
          .in('property_id', propertyIds);

        const rentMap: Record<string, number> = {};
        rentData?.forEach((r) => {
          rentMap[r.property_id] = (rentMap[r.property_id] || 0) + Number(r.amount);
        });

        const transformed = propertyData.map((p) => ({
          id: p.id,
          title: p.title,
          current_value: p.current_value || 0,
          total_chips: p.total_chips,
          chips_available: p.chips_available,
          occupied: p.occupied || false,
          annual_rent: rentMap[p.id] || 0,
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

  const formatCurrency = (value: number) => `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Market</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((p) => (
          <div key={p.id} className="bg-gray-900 text-white p-4 rounded-xl shadow-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">
              <Link href={`/market/${p.id}`} className="hover:underline text-blue-400">{p.title}</Link>
            </h2>
            <p className="text-sm text-gray-300 mb-1">{p.location}</p>
            <p className="mb-1">💰 <strong>{formatCurrency(p.current_value)}</strong> Property Value</p>
            <p className="mb-1">🏷️ <strong>{p.total_chips - p.chips_available}/{p.total_chips}</strong> Chips Sold</p>
            <p className="mb-1">🏠 {p.occupied ? 'Occupied ✅' : 'Vacant ❌'}</p>
            <p className="mb-1">📈 <strong>{formatCurrency(p.annual_rent)}</strong> Annual Rent</p>
            <p className="mb-1">💼 Manager: {p.manager_name || 'Unknown'}</p>
            <p className="mb-1">💵 Reserve Balance: {formatCurrency(p.reserve_balance)}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
