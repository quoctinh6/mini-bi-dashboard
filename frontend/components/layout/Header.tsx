import * as React from 'react';
import { cn } from '@/lib/utils';
import { Bell, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface HeaderProps extends React.HTMLAttributes<HTMLHeadElement> {
  title: string;
  subtitle?: string;
  onExport?: () => void;
  onCreateReport?: () => void;
}

export function Header({
  title,
  subtitle,
  onExport,
  onCreateReport,
  className,
  ...props
}: HeaderProps) {
  return (
    <header
      className={cn('flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-8', className)}
      {...props}
    >
      <div>
        <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
        {subtitle && <p className="text-xs mt-1 text-slate-400">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          {/* Notification dot */}
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_0_2px_#0f121b]" />
        </button>

        <Button variant="secondary" onClick={onExport} className="h-9 px-3">
          Xuất PDF <Download className="ml-2 h-4 w-4" />
        </Button>

        <Button variant="default" onClick={onCreateReport} className="h-9 px-4">
          Tạo báo cáo
        </Button>
      </div>
    </header>
  );
}
