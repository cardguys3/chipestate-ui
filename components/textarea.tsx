// components/textarea.tsx

import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          'w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm bg-white text-sm text-black focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
