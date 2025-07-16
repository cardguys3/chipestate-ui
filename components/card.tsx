// components/card.tsx
import React from "react";
import classNames from "classnames";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={classNames(
        "rounded-2xl border border-white/20 bg-white/5 p-4 shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};