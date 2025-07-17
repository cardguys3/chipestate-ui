//app/market/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import Link from 'next/link';

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
  roi: number;
  reserve_percent: number;
}

export default function MarketPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [sortField, setSortField] = useState<keyof Property>('current_value');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data: propertyData, error } = await supabase
        .from('properties')
        .select(`
          id, title, current_value, total_chips, chips_available, city, state,
          occupied, reserve_balance, manager_name
        `)
        .eq('is_active', true)
        .eq('is_hidden', false);

      if (error || !propertyData) {
        console.error('Error loading properties:', error?.message);
        return;
      }

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

      const transformed = propertyData.map((p) => {
        const annualRent = rentMap[p.id] || 0;
        const currentValue = p.current_value || 0;
        const reserveBalance = p.reserve_balance || 0;
        const reservePercent = currentValue > 0 ? (reserveBalance / currentValue) * 100 : 0;
        const roi = currentValue > 0 ? (annualRent / currentValue) * 100 : 0;

        return {
          id: p.id,
          title: p.title,
          current_value: currentValue,
          total_chips: p.total_chips,
          chips_available: p.chips_available,
          occupied: p.occupied || false,
          annual_rent: annualRent,
          reserve_balance: reserveBalance,
          manager_name: p.manager_name || '',
          location: `${p.city || ''}, ${p.state || ''}`.replace(/^, |, $/g, '').trim(),
          roi,
          reserve_percent: reservePercent,
        };
      });

      const sorted = [...transformed].sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        return sortDirection === 'asc'
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      });

      setProperties(sorted);
    };

    fetchData();
  }, [sortField, sortDirection]);

  const toggleSort = (field: keyof Property) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;
  const sortArrow = (field: keyof Property) =>
    sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '';

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <h1 className="text-2xl font-bold mb-6">ChipEstate Market</h1>
      <div className="overflow-x-auto">
        <table className="w-full table-auto text-sm border-collapse">
          <thead className="bg-white/5">
            <tr className="text-left border-b border-blue-800">
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('title')}>Property {sortArrow('title')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('location')}>Location {sortArrow('location')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('current_value')}>Value {sortArrow('current_value')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('chips_available')}>Chips Available {sortArrow('chips_available')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('occupied')}>Occupied {sortArrow('occupied')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('annual_rent')}>Annual Rent {sortArrow('annual_rent')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('roi')}>ROI {sortArrow('roi')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('reserve_percent')}>Reserve {sortArrow('reserve_percent')}</th>
              <th className="p-3 cursor-pointer" onClick={() => toggleSort('manager_name')}>Manager {sortArrow('manager_name')}</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-b border-blue-900 hover:bg-blue-900/30">
                <td className="p-3">
                  <Link href={`/property/${p.id}`} className="text-blue-400 hover:underline">
                    {p.title}
                  </Link>
                </td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{formatCurrency(p.current_value)}</td>
                <td className="p-3">{p.chips_available} / {p.total_chips}</td>
                <td className="p-3">{p.occupied ? '✅' : '❌'}</td>
                <td className="p-3">{formatCurrency(p.annual_rent)}</td>
                <td className="p-3">{formatPercent(p.roi)}</td>
                <td className="p-3">{formatPercent(p.reserve_percent)}</td>
                <td className="p-3">{p.manager_name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
