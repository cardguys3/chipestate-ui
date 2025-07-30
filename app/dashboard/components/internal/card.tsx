// /app/dashboard/components/internal/Card.tsx

import React from 'react';
import classNames from 'classnames';

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={classNames('rounded-2xl shadow-md border border-gray-700 bg-[#142c47] p-4', className)}>
      {children}
    </div>
  );
}

export function CardContent({ children }: { children: React.ReactNode }) {
  return <div className="p-2">{children}</div>;
}
