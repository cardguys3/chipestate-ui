// app/admin/occupancy-periods/page.tsx

'use client'

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import { format } from 'date-fns';
import { Input } from '@/components/input';
import { Button } from '@/components/button';

export default function OccupancyPeriodsAdminPage() {
  const [occupancyPeriods, setOccupancyPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('property_occupancy_periods')
        .select('id, property_id, occupancy_start, occupancy_end, tenant_name, lease_type, monthly_rent')
        .order('occupancy_start', { ascending: false });

      if (error) setError(error.message);
      else setOccupancyPeriods(data || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Manage Occupancy Periods</h1>
        {loading && <p>Loading occupancy periods...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && occupancyPeriods.length === 0 && (
          <p className="text-gray-400">No occupancy periods found.</p>
        )}
        <div className="grid gap-4">
          {occupancyPeriods.map((period) => (
            <div
              key={period.id}
              className="p-4 border border-white/10 rounded-xl bg-white/5"
            >
              <p className="text-sm text-gray-300"><strong>Property ID:</strong> {period.property_id}</p>
              <p className="text-sm text-gray-300"><strong>Tenant:</strong> {period.tenant_name || 'N/A'}</p>
              <p className="text-sm text-gray-300"><strong>Lease Type:</strong> {period.lease_type || 'N/A'}</p>
              <p className="text-sm text-gray-300"><strong>Monthly Rent:</strong> ${period.monthly_rent?.toFixed(2) || 'N/A'}</p>
              <p className="text-sm text-gray-300">
                <strong>Start Date:</strong>{' '}
                {period.occupancy_start ? format(new Date(period.occupancy_start), 'yyyy-MM-dd') : 'N/A'}
              </p>
              <p className="text-sm text-gray-300">
                <strong>End Date:</strong>{' '}
                {period.occupancy_end ? format(new Date(period.occupancy_end), 'yyyy-MM-dd') : 'N/A'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
