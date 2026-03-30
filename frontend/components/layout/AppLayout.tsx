import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardExample } from '@/components/layout/DashboardExample';
import { DataManagementLayout } from '@/components/layout/DataManagementLayout';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import { LoginPage } from '@/components/layout/LoginPage';
import { PermissionsSettings } from '@/components/layout/PermissionsSettings';
import { ShieldAlert, X } from 'lucide-react';

function AppLayoutInner() {
  const { currentUser, originalAdminUser, stopImpersonation } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  // Force active tab to dashboard if original user impersonates someone else
  React.useEffect(() => {
    if (originalAdminUser && activeTab === 'permissions') {
      setActiveTab('dashboard');
    }
  }, [originalAdminUser, activeTab]);

  return (
    <div className="flex h-screen w-full bg-[#0f121b] overflow-hidden font-sans relative flex-col">
      
      {/* Impersonation Banner */}
      {originalAdminUser && (
         <div className="flex items-center justify-between bg-fuchsia-600 px-4 py-2 text-white font-medium text-sm shadow-md z-50">
            <div className="flex items-center gap-2">
               <ShieldAlert className="h-4 w-4" />
               Bạn đang xem trang ứng với quyền hạn của <span className="font-bold underline cursor-help" title={`Role: ${currentUser.role}`}>{currentUser.name} ({currentUser.email})</span>. Các dữ liệu đã bị lọc theo RLS.
            </div>
            <button 
               onClick={stopImpersonation} 
               className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-full transition-colors font-semibold"
            >
               Thoát xem thử <X className="h-4 w-4" />
            </button>
         </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar 
          className="hidden md:flex shrink-0 z-20 shadow-xl border-r border-[#1C2541]" 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {activeTab === 'dashboard' && (
            <div className="w-full h-full relative z-0">
               <DashboardExample hideSidebar={true} />
            </div>
          )}

          {activeTab === 'data_entry' && (
            <div className="w-full h-full relative z-0 bg-[#0A1128]">
               <DataManagementLayout hideSidebar={true} />
            </div>
          )}
          
          {activeTab === 'permissions' && (
            <PermissionsSettings />
          )}

          {activeTab === 'settings' && (
             <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#0f121b]">
                <h2>Màn hình Cài đặt chung đang xây dựng...</h2>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <AuthProvider>
      <AppLayoutInner />
    </AuthProvider>
  );
}
