// components/label.tsx

import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={clsx(
        'block text-sm font-medium text-white mb-1',
        className
      )}
      {...props}
    />
  );
}
