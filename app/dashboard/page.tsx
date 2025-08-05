// File: /app/dashboard/page.tsx

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/authOptions'
import { createClient } from '@/utils/supabase/server'
import WelcomeHeader from './components/WelcomeHeader'
import PerformanceStats from './components/PerformanceStats'
import DashboardCharts from './components/DashboardCharts'
import { Property, Chip, MonthlyPayout } from '@/types'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return <div className="text-white p-8">Unauthorized</div>

  const userId = session.user.id
  if (!userId) return <div className="text-white p-8">Unauthorized - No user ID</div>

  // Await createClient() because it returns a Promise
  const supabase = await createClient()

  const { data: extendedUser } = await supabase
    .from('users_extended')
    .select('*')
    .eq('id', userId)
    .single()

  const firstName = extendedUser?.first_name || 'Sharer'

  const [
    { data: propertiesData },
    { data: chipsData },
    { data: earningsData },
  ] = await Promise.all([
    supabase.from('properties').select('*').eq('user_id', userId),
    supabase.from('chips').select('*').eq('user_id', userId),
    supabase.from('chip_earnings').select('*').eq('user_id', userId),
  ])

  const properties: Property[] = propertiesData ?? []
  const chips: Chip[] = chipsData ?? []
  const earnings: MonthlyPayout[] = earningsData ?? []

  // Dummy values for DashboardCharts props to satisfy types
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May']
  const selectedChips = chips.map(c => c.id)
  const selectedProps = properties.map(p => p.id)
  const monthIndexes = Array.from(months.keys())

  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <WelcomeHeader firstName={firstName} />
      <PerformanceStats properties={properties} chips={chips} earnings={earnings} />
      <DashboardCharts
        properties={properties}
        chips={chips}
        earningsData={earnings}
        selectedChips={selectedChips}
        selectedProps={selectedProps}
        months={months}
        monthIndexes={monthIndexes}
      />
    </main>
  )
}
