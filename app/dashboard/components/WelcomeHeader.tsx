// /app/dashboard/components/WelcomeHeader.tsx

'use client'

import React from 'react'

type WelcomeHeaderProps = {
  firstName: string
}

const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ firstName }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <h1 className="text-3xl font-bold mb-4 md:mb-0">
        Welcome, {firstName}!
      </h1>
    </div>
  )
}

export default WelcomeHeader
