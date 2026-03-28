import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Calendar } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative inline-flex items-center">
        {icon && (
          <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
            {icon}
          </div>
        )}
        <select
          className={cn(
            'h-9 w-full appearance-none rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-50',
            icon ? 'pl-9' : '',
            'pr-8', // space for trailing chevron
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute right-3 flex items-center text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
