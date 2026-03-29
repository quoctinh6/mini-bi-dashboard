import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardExample } from '@/components/layout/DashboardExample';
import { DataManagementLayout } from '@/components/layout/DataManagementLayout';

export function AppLayout() {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  return (
    <div className="flex h-screen w-full bg-[#0f121b] overflow-hidden font-sans">
      <Sidebar 
        className="hidden md:flex shrink-0 z-20 shadow-xl border-r border-[#1C2541]" 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {activeTab === 'dashboard' && (
          // Render inside the full remaining space 
          // We wrap it in a div that fills the area and let DashboardExample handle the rest.
          // Since DashboardExample also renders a Sidebar right now, we should ideally refactor it.
          // But to avoid breaking DashboardExample, we just conditionally render it.
          // Wait, DashboardExample renders its own Sidebar, we need to hide it or refactor it.
          // Let's create an inner component or pass a prop to hide its sidebar.
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
          <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#0f121b]">
             <h2>Chức năng Phân quyền & RLS đang phát triển...</h2>
          </div>
        )}
      </div>
    </div>
  );
}
