//app dashboard page.tsx
'use client'

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';

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
  const [newBadges, setNewBadges] = useState<string[]>([]);

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

  useEffect(() => {
    if (newBadges.length > 0) {
      newBadges.forEach(badge => {
        toast.success(`🎉 Congratulations! You earned the "${badge.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}" badge!`);
      });
      setNewBadges([]);
    }
  }, [newBadges]);

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">ChipEstate Market</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm border-collapse">
          <thead className="bg-white/5">
            <tr className="text-left border-b border-blue-800">
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('title')}>Property</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('location')}>Location</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('current_value')}>Property Value</th>
              <th className="p-3">Chips Sold</th>
              <th className="p-3">Occupancy</th>
              <th className="p-3">Annual Rent</th>
              <th className="p-3">Manager</th>
              <th className="p-3">Reserve</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-blue-900 hover:bg-blue-900/30">
                <td className="p-3">
                  <Link href={`/market/${p.id}`} className="text-blue-400 hover:underline">{p.title}</Link>
                </td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{formatCurrency(p.current_value)}</td>
                <td className="p-3">{p.total_chips - p.chips_available}/{p.total_chips}</td>
                <td className="p-3">{p.occupied ? '✅' : '❌'}</td>
                <td className="p-3">{formatCurrency(p.annual_rent)}</td>
                <td className="p-3">{p.manager_name || 'Unknown'}</td>
                <td className="p-3">{formatCurrency(p.reserve_balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
