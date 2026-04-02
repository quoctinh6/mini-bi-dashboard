"use client";
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
      <div className="flex items-center gap-3">
        <img src="/Logo Icon.png" alt="Logo" className="h-9 w-9 object-contain" />
        <div>
          <h1 className="text-2xl font-bold text-slate-100">{title}</h1>
          {subtitle && <p className="text-xs mt-1 text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-4">
  
      </div>
    </header>
  );
}
