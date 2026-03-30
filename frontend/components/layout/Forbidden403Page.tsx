import React from 'react';
import { ShieldAlert, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/AuthContext';

interface Forbidden403PageProps {
  onGoHome: () => void;
}

export function Forbidden403Page({ onGoHome }: Forbidden403PageProps) {
  const { stopImpersonation, originalAdminUser } = useAuth();
  
  return (
    <div className="flex h-[100%] w-full items-center justify-center bg-[#0B0F19] text-slate-200 relative overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.03] pointer-events-none">
        <div className="w-full h-full bg-red-500 blur-[100px] rounded-full"></div>
      </div>

      <div className="z-10 flex flex-col items-center text-center px-6 max-w-lg">
        <div className="h-24 w-24 rounded-full bg-red-500/10 flex items-center justify-center mb-8 border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)] relative">
            <ShieldAlert className="h-10 w-10 text-red-500 relative z-10" />
            <div className="absolute inset-0 border-2 border-red-500/30 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">403 Forbidden</h1>
        <h2 className="text-xl font-medium text-red-400 mb-6">Truy cập bị từ chối</h2>
        
        <p className="text-slate-400 mb-10 leading-relaxed text-[15px]">
          Rất tiếc, bạn không có quyền xem dữ liệu của khu vực này! Hệ thống Row-Level Security (RLS) đã tự động chặn truy cập để bảo vệ dữ liệu.
        </p>

        <div className="flex gap-4">
            <Button onClick={onGoHome} className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 h-11 px-6 shadow-none">
              <Home className="h-4 w-4 mr-2" />
              Về trang chủ
            </Button>
            
            {originalAdminUser && (
               <Button onClick={stopImpersonation} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white h-11 px-6">
                 Thoát chế độ xem thử
               </Button>
            )}
        </div>
      </div>
    </div>
  );
}
