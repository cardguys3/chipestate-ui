// /app/dashboard/components/DashboardWrapper.tsx

'use client'

import React from 'react'

interface DashboardWrapperProps {
  children: React.ReactNode
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ children }) => {
  // ==== BLOCK: Dashboard Wrapper START ====
  return (
    <main className="min-h-screen bg-[#0e1a2b] text-white p-8">
      <div className="container mx-auto">
        {children}
      </div>
    </main>
  )
  // ==== BLOCK: Dashboard Wrapper END ====
}

export default DashboardWrapper
