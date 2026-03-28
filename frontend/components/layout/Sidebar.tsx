import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Home, Database, Shield, Settings, ChevronRight } from 'lucide-react';

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active, className, ...props }: NavItemProps) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-fuchsia-500/10 text-fuchsia-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span>{label}</span>
      </div>
      <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100" />
    </div>
  );
}

export function Sidebar({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex h-screen w-64 flex-col gap-6 bg-[#0B0F19] p-4 text-slate-200 border-r border-slate-800', className)}
      {...props}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 text-xl font-bold tracking-wide">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-blue-500">
            <div className="h-3 w-3 rounded-full bg-white shadow-sm" />
        </div>
        Kernel404
      </div>

      {/* Search Bar */}
      <div className="relative px-2">
        <div className="pointer-events-none absolute left-5 top-1/2 flex -translate-y-1/2 items-center text-slate-500">
          <Search className="h-4 w-4" />
        </div>
        <input
          type="text"
          placeholder="Tìm kiếm"
          className="h-9 w-full rounded-md border border-slate-800 bg-slate-900/50 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
        />
      </div>

      {/* Navigation */}
      <div className="flex flex-1 flex-col gap-1 px-2">
        <NavItem icon={<Home className="h-4 w-4" />} label="Dashboard" active />
        <NavItem icon={<Database className="h-4 w-4" />} label="Dữ liệu thô" />
        <NavItem icon={<Shield className="h-4 w-4" />} label="Phân quyền & RLS" />
        
        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Cấu hình
        </div>
        <NavItem icon={<Settings className="h-4 w-4" />} label="Cài đặt" />
      </div>

      {/* User Profile */}
      <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/20 p-3 mt-auto">
        <div className="h-9 w-9 overflow-hidden rounded-full bg-fuchsia-200">
            {/* Fallback avatar */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-purple-400 text-xs font-bold text-white">
                UR
            </div>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-200">User Role</span>
          <span className="text-xs text-slate-500">Admin</span>
        </div>
        <ChevronRight className="ml-auto h-4 w-4 text-slate-500" />
      </div>
    </div>
  );
}
