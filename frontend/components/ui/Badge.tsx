import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 focus:ring-offset-slate-900',
  {
    variants: {
      variant: {
        default:
          'bg-slate-800 text-slate-100 hover:bg-slate-700',
        success:
          'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20',
        destructive:
          'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20',
        outline:
          'text-slate-300 border border-slate-700',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
