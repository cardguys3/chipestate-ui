// ✅ FILE: /components/dashboard/Chart.tsx

'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function Chart({ title, data }: { title: string; data: number[] }) {
  const chartData = data.map((value, index) => ({
    month: `M${index + 1}`,
    value,
  }))

  return (
    <div className="bg-[#0B1D33] border border-white/10 p-4 rounded shadow">
      <h3 className="text-white text-sm font-semibold mb-2">{title}</h3>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c3e50" />
            <XAxis dataKey="month" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip />
            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
