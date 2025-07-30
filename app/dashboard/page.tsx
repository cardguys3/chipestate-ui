// /app/dashboard/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createClient } from '@/app/utils/supabase/server';
import WelcomeHeader from './components/WelcomeHeader';
import PerformanceStats from './components/PerformanceStats';
import PerformanceFilters from './components/PerformanceFilters';
import DashboardCharts from './components/DashboardCharts';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const supabase = createClient();
  const user = session?.user;

  if (!user) return <div className="text-white p-8">Unauthorized</div>;

  const { data: extendedUser } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', user.id)
    .single();

  const firstName = extendedUser?.first_name || 'Sharer';

  // Fetch all data needed by child components
  const [{ data: properties = [] }, { data: chips = [] }, { data: earnings = [] }] =
    await Promise.all([
      supabase.from('properties').select('*').eq('user_id', user.id),
      supabase.from('chips').select('*').eq('user_id', user.id),
      supabase.from('chip_earnings').select('*').eq('user_id', user.id),
    ]);

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <WelcomeHeader firstName={firstName} />
      <PerformanceStats
        properties={properties}
        chips={chips}
        earnings={earnings}
      />
      <PerformanceFilters
        properties={properties}
        chips={chips}
        earnings={earnings}
      />
      <DashboardCharts
        properties={properties}
        chips={chips}
        earnings={earnings}
      />
    </main>
  );
}
