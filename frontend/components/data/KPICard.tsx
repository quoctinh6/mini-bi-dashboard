import * as React from 'react';
import { cn } from '@/lib/utils';
import { MoreHorizontal, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { NumberDisplay } from '@/components/ui/NumberDisplay';

interface KPICardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  unit?: string;
  trend: number; // Percentage like 28.4 or -12.6
  trendDirection?: 'up' | 'down';
}

export function KPICard({
  title,
  value,
  unit,
  trend,
  trendDirection,
  className,
  ...props
}: KPICardProps) {
  // Determine direction if not explicitly provided
  const isUp = trendDirection === 'up' || (trendDirection === undefined && trend >= 0);
  
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <button className="text-slate-500 hover:text-slate-300">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline gap-3">
        <NumberDisplay value={value} unit={unit} className="text-3xl text-white" />
        
        {/* Trend Badge */}
        <Badge variant={isUp ? 'success' : 'destructive'} className="h-5 px-1.5">
          {Math.abs(trend)}%
          {isUp ? (
            <ArrowUpRight className="ml-0.5 h-3 w-3" />
          ) : (
            <ArrowDownRight className="ml-0.5 h-3 w-3" />
          )}
        </Badge>
      </div>
    </div>
  );
}
