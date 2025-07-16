//app dashboard page.tsx
'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/supabase';
import Link from 'next/link';
import { Toaster, toast } from 'react-hot-toast';
import HoldingsChart from '@/components/dashboard/HoldingsChart';
import ChipEarningsChart from '@/components/dashboard/ChipEarningsChart';
import CumulativeGrowthChart from '@/components/dashboard/CumulativeGrowthChart';
import SuggestedProperties from '@/components/dashboard/SuggestedProperties';

export default function DashboardPage() {
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    const checkBadges = async () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return;

      const { data: badgeData, error } = await supabase
        .from('user_badges')
        .select('badge_key')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!error && badgeData) {
        const recentBadges = badgeData.map((b) => b.badge_key);
        setNewBadges(recentBadges);
      }
    };

    checkBadges();
  }, []);

  useEffect(() => {
    if (newBadges.length > 0) {
      newBadges.forEach((badge) => {
        toast.success(
          `🎉 Congratulations! You earned the "${badge
            .replace(/_/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())}" badge!`
        );
      });
      setNewBadges([]);
    }
  }, [newBadges]);

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white p-6">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-6">Your ChipEstate Dashboard</h1>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <HoldingsChart />
        <ChipEarningsChart />
        <CumulativeGrowthChart />
      </div>

      {/* Suggested Properties */}
      <SuggestedProperties />
    </main>
  );
}
