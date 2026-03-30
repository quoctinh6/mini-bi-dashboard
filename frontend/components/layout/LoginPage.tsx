import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setStatusText('Đang tải không gian làm việc của bạn...');
    
    // Simulate loading RLS data
    await new Promise(r => setTimeout(r, 1500));
    
    await login(email);
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#0B0F19] font-sans text-slate-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0f121b] p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-fuchsia-600/10 blur-3xl pointer-events-none"></div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 h-64 animate-in fade-in duration-500">
            <Loader2 className="h-10 w-10 animate-spin text-fuchsia-500 mb-6" />
            <h2 className="text-lg font-medium text-slate-200">{statusText}</h2>
            <p className="text-sm text-slate-400 mt-2 text-center">Đang thiết lập quyền truy cập và dữ liệu khu vực...</p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center mb-8">
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-fuchsia-600 to-purple-600 flex items-center justify-center p-3 mb-4 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
                <img src="/Logo Icon.png" alt="Logo" className="h-full w-full object-contain mix-blend-screen" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">Kernel404 BI</h1>
              <p className="text-sm text-slate-400 mt-1">Hệ thống phân tích dữ liệu thông minh</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-400 ml-1">Tài khoản</label>
                 <input 
                    type="text" 
                    placeholder="Email đăng nhập (thử gõ 'manager')"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
              </div>

              <div className="space-y-1">
                 <label className="text-xs font-medium text-slate-400 ml-1">Mật khẩu</label>
                 <input 
                    type="password" 
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/50 px-4 py-3 text-sm text-slate-200 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500 transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                 />
              </div>

              <button 
                 type="submit"
                 disabled={!email}
                 className="w-full mt-4 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 text-sm font-semibold text-white transition-colors flex justify-center items-center shadow-[0_0_15px_rgba(217,70,239,0.3)]"
              >
                Đăng nhập
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
