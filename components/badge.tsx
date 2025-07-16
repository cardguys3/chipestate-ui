// components/badge.tsx
import React from "react";
import classNames from "classnames";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className, ...props }) => {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full bg-emerald-700 px-3 py-1 text-sm font-semibold text-white shadow",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
