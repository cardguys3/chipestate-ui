'use client'

import { analyticsData } from '@/lib/analyticsData'
import { Bar, Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend)

export default function AdminAnalyticsPage() {
  const { months, userRegistrations, propertiesAdded, chipsSold, totals } = analyticsData

  return (
    <main className="min-h-screen bg-[#0B1D33] text-white px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-10">
        <h1 className="text-3xl font-bold text-emerald-400">Site Analytics</h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <StatCard label="Total Users" value={totals.users} />
          <StatCard label="Verified Users" value={totals.verifiedUsers} />
          <StatCard label="Properties" value={totals.properties} />
          <StatCard label="Chips Sold" value={totals.chipsSold} />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ChartBlock title="User Registrations">
            <Line
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'New Users',
                    data: userRegistrations,
                    borderColor: '#34d399',
                    backgroundColor: '#34d39966',
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }}
            />
          </ChartBlock>

          <ChartBlock title="Properties Added">
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'New Properties',
                    data: propertiesAdded,
                    backgroundColor: '#60a5fa',
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }}
            />
          </ChartBlock>

          <ChartBlock title="Chips Sold">
            <Bar
              data={{
                labels: months,
                datasets: [
                  {
                    label: 'Chips Sold',
                    data: chipsSold,
                    backgroundColor: '#facc15',
                  },
                ],
              }}
              options={{ responsive: true, plugins: { legend: { labels: { color: 'white' } } }, scales: { x: { ticks: { color: 'white' } }, y: { ticks: { color: 'white' } } } }}
            />
          </ChartBlock>
        </div>
      </div>
    </main>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-white/5 p-4 border border-white/10">
      <div className="text-sm text-gray-300 mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
    </div>
  )
}

function ChartBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white mb-2">{title}</h2>
      {children}
    </div>
  )
}
