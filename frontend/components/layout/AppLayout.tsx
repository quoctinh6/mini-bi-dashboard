"use client";
import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardExample } from '@/components/layout/DashboardExample';
import { DataManagementLayout } from '@/components/layout/DataManagementLayout';
import { useAuth } from '@/lib/AuthContext';
import { LoginPage } from '@/components/layout/LoginPage';
import { PermissionsSettings } from '@/components/layout/PermissionsSettings';

function AppLayoutInner() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0f121b] overflow-hidden font-sans relative flex-col">
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
    <AppLayoutInner />
  );
}
