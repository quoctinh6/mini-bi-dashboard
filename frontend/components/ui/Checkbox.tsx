import * as React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className={cn('relative flex items-center justify-center', className)}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-[4px] border border-slate-700 bg-transparent transition-all peer-focus-visible:ring-1 peer-focus-visible:ring-purple-500',
            'peer-checked:border-purple-500 peer-checked:bg-purple-600',
            'cursor-pointer'
          )}
          onClick={() => onCheckedChange?.(!checked)}
        >
          {checked && <Check className="h-3 w-3 stroke-[3] text-white" />}
        </div>
      </div>
    );
  }
);
Checkbox.displayName = 'Checkbox';
