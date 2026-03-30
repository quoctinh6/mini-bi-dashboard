import * as React from 'react';
import { cn } from '@/lib/utils';
import { Search, Home, Database, Shield, Settings, ChevronRight, ChevronLeft, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth, UserRole } from '@/lib/AuthContext';

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active, onClick, className, isCollapsed, ...props }: NavItemProps & { isCollapsed?: boolean; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors relative',
        active
          ? 'bg-fuchsia-500/10 text-fuchsia-400'
          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100',
        isCollapsed && 'justify-center px-0',
        className
      )}
      {...props}
      title={isCollapsed ? label : undefined}
    >
      <div className={cn("flex items-center gap-3", isCollapsed && "gap-0")}>
        {icon}
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>
      {!isCollapsed && <ChevronRight className="h-4 w-4 opacity-50 group-hover:opacity-100 shrink-0" />}
    </div>
  );
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function Sidebar({ className, activeTab = 'dashboard', onTabChange, ...props }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const { currentUser, logout } = useAuth();

  const ROLE_LABELS: Record<string, string> = {
    director: 'Giám đốc',
    manager: 'Trưởng phòng',
    employee: 'Nhân viên',
    admin: 'Quản trị viên'
  };

  return (
    <div
      className={cn(
        'flex h-screen flex-col gap-6 bg-[#0B0F19] p-4 text-slate-200 border-r border-slate-800 transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20 items-center px-2' : 'w-64',
        className
      )}
      {...props}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 h-6 w-6 flex items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:border-fuchsia-500 transition-all z-20"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Logo */}
      <div className={cn("flex items-center gap-2 px-2 text-xl font-bold tracking-wide overflow-hidden", isCollapsed && "justify-center px-0")}>
        <img src="/Logo Icon.png" alt="Kernel404" className="h-8 w-8 object-contain shrink-0" />
        {!isCollapsed && <span className="truncate">Kernel404</span>}
      </div>

      {/* Search Bar */}
      <div className={cn("relative px-2 w-full", isCollapsed && "px-0 flex justify-center")}>
        <div className={cn(
          "pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center text-slate-500 transition-all",
          isCollapsed ? "left-1/2 -translate-x-1/2" : "left-5"
        )}>
          <Search className="h-4 w-4" />
        </div>
        {!isCollapsed && (
          <input
            type="text"
            placeholder="Tìm kiếm"
            className="h-9 w-full rounded-md border border-slate-800 bg-slate-900/50 pl-9 pr-3 text-sm text-slate-300 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500"
          />
        )}
        {isCollapsed && (
          <div className="h-9 w-9 rounded-md border border-slate-800 bg-slate-900/50 flex items-center justify-center cursor-pointer hover:bg-slate-800 transition-colors" />
        )}
      </div>

      {/* Navigation */}
      <div className={cn("flex flex-1 flex-col gap-1 px-2 w-full", isCollapsed && "px-0 items-center")}>
        <NavItem 
          icon={<Home className="h-4 w-4" />} 
          label="Dashboard" 
          active={activeTab === 'dashboard'} 
          onClick={() => onTabChange?.('dashboard')}
          isCollapsed={isCollapsed} 
        />
        <NavItem 
          icon={<Database className="h-4 w-4" />} 
          label="Nhập liệu" 
          active={activeTab === 'data_entry'}
          onClick={() => onTabChange?.('data_entry')}
          isCollapsed={isCollapsed} 
        />
        
        {!isCollapsed ? (
          <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Cấu hình
          </div>
        ) : (
          <div className="mt-8 mb-2 border-t border-slate-800 w-full" />
        )}
        
        <NavItem 
          icon={<ShieldCheck className="h-4 w-4" />} 
          label="Phân quyền & RLS" 
          active={activeTab === 'permissions'}
          onClick={() => onTabChange?.('permissions')}
          isCollapsed={isCollapsed} 
        />
        
        <NavItem 
          icon={<Settings className="h-4 w-4" />} 
          label="Cài đặt" 
          active={activeTab === 'settings'}
          onClick={() => onTabChange?.('settings')}
          isCollapsed={isCollapsed} 
        />
      </div>

      {/* User Profile */}
      <div className={cn(
        "flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/20 p-3 mt-auto w-full transition-all group/profile",
        isCollapsed ? "p-1.5 justify-center border-none bg-transparent" : "p-3"
      )}>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-fuchsia-200 shrink-0">
            {/* Fallback avatar */}
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-fuchsia-600 to-purple-400 text-xs font-bold text-white shadow-inner">
                {currentUser?.avatar || 'UR'}
            </div>
        </div>
        {!isCollapsed && (
          <>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-slate-200 truncate pr-2" title={currentUser?.name || 'User Role'}>
                {currentUser?.name || 'User Role'}
              </span>
              <span className="text-[11px] text-fuchsia-400/80 uppercase font-medium mt-0.5">
                {currentUser ? ROLE_LABELS[currentUser.role] : 'Admin'}
              </span>
            </div>
            <button 
                onClick={logout}
                title="Đăng xuất"
                className="ml-auto p-1.5 rounded-md text-slate-500 hover:text-white hover:bg-rose-500/20 hover:text-rose-400 transition-colors shrink-0"
            >
                <LogOut className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
