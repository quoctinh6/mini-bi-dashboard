import React, { useState, useMemo } from 'react';
import { useAuth, UserRole, RegionScope } from '@/lib/AuthContext';
import { ShieldCheck, Eye, Search, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<UserRole, string> = {
  director: 'Giám đốc',
  manager: 'Trưởng phòng',
  employee: 'Nhân viên'
};

const REGION_LABELS: Record<RegionScope, string> = {
  national: 'Toàn quốc',
  north: 'Miền Bắc',
  central: 'Miền Trung',
  south: 'Miền Nam'
};

export function PermissionsSettings() {
  const { allUsers, updateUserRole, impersonate, currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track users that need their scope updated (changed to manager without a specific region)
  const [needsScopeUpdate, setNeedsScopeUpdate] = useState<Set<string>>(new Set());

  const handleRoleChange = (userId: string, newRole: UserRole, currentScope: RegionScope[]) => {
    let newScope = currentScope;
    
    // Auto-adjust scope logic
    if (newRole === 'director' && !currentScope.includes('national')) {
      newScope = ['national'];
      
      // Remove from needs update if they were in it
      setNeedsScopeUpdate(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } else if (newRole === 'manager') {
      if (currentScope.includes('national') || currentScope.length === 0) {
        // If changing to manager but they have 'national' or no scope, warn them and clear 'national'
        newScope = currentScope.filter(s => s !== 'national');
        
        // Add to needs update alert
        setNeedsScopeUpdate(prev => new Set(prev).add(userId));
      }
    }
    
    updateUserRole(userId, newRole, newScope);
  };

  const handleScopeChange = (userId: string, scope: RegionScope, userRole: UserRole, currentScope: RegionScope[]) => {
    let newScope = [...currentScope];
    
    if (scope === 'national') {
      newScope = ['national'];
    } else {
      newScope = newScope.filter(s => s !== 'national');
      if (newScope.includes(scope)) {
        newScope = newScope.filter(s => s !== scope);
      } else {
        newScope.push(scope);
      }
    }
    
    // Clear the alert if they finally selected at least one region
    if (newScope.length > 0 && needsScopeUpdate.has(userId)) {
      setNeedsScopeUpdate(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
    
    updateUserRole(userId, userRole, newScope);
  };

  // --- Pagination Logic ---
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset page when filtering
  const filteredUsers = useMemo(() => {
    setCurrentPage(1);
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const currentUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex-1 flex flex-col items-start justify-start p-10 bg-[#0B0F19] text-slate-200 overflow-y-auto">
      <div className="mb-8 w-full flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-fuchsia-500" />
              <h1 className="text-3xl font-semibold text-white tracking-tight">Phân quyền & RLS</h1>
           </div>
           <p className="text-sm text-slate-400 mt-2 max-w-2xl">
             Quản lý vai trò (Role) và thiết lập bảo mật cấp dòng (Row-Level Security) cho từng tài khoản. 
             Giám đốc có thể xem toàn quốc, trong khi Trưởng phòng sẽ bị giới hạn ở các khu vực được chỉ định.
           </p>
        </div>
        
        <div className="relative w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
           <input 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-colors"
             placeholder="Tìm kiếm người dùng..."
           />
        </div>
      </div>
      
      <div className="w-full bg-[#0f121b] border border-slate-800 rounded-xl shadow-lg overflow-hidden">
         <table className="w-full text-left border-collapse">
            <thead>
               <tr className="border-b border-slate-800 bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò (Role)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Phạm vi dữ liệu (RLS Scope)</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
               {currentUsers.length === 0 ? (
                 <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Không tìm thấy dữ liệu phù hợp.
                    </td>
                 </tr>
               ) : currentUsers.map(user => {
                 const isPulsing = needsScopeUpdate.has(user.id);
                 const isMe = currentUser?.id === user.id;

                 return (
                   <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-purple-400 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                               {user.avatar}
                            </div>
                            <div>
                               <div className="font-medium text-slate-200">
                                 {user.name}
                                 {isMe && <span className="ml-2 text-[10px] uppercase bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full ring-1 ring-fuchsia-500/30">Bạn</span>}
                               </div>
                               <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                            </div>
                         </div>
                      </td>
                      
                      <td className="px-6 py-4">
                         <select 
                            disabled={isMe}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole, user.dataScope)}
                            className="bg-slate-900 border border-slate-700 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-fuchsia-500 disabled:opacity-50"
                         >
                            {Object.entries(ROLE_LABELS).map(([key, label]) => (
                               <option key={key} value={key}>{label}</option>
                            ))}
                         </select>
                      </td>
                      
                      <td className="px-6 py-4">
                         <div className={cn(
                            "flex flex-wrap gap-2 p-1.5 rounded-lg border",
                            isPulsing 
                               ? "border-red-500/60 bg-red-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse" 
                               : "border-transparent"
                         )}>
                            {Object.entries(REGION_LABELS).map(([scope, label]) => {
                               const scopeTyped = scope as RegionScope;
                               const isSelected = user.dataScope.includes(scopeTyped);
                               return (
                                 <button
                                   key={scopeTyped}
                                   disabled={user.role === 'director' || isMe}
                                   onClick={() => handleScopeChange(user.id, scopeTyped, user.role, user.dataScope)}
                                   className={cn(
                                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                                      isSelected
                                         ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-900/20"
                                         : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                                      (user.role === 'director' || isMe) && "opacity-60 cursor-not-allowed"
                                   )}
                                 >
                                   {label}
                                 </button>
                               );
                            })}
                            
                            {isPulsing && (
                               <div className="flex items-center text-xs text-red-400 ml-1">
                                  <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                  Vui lòng chọn khu vực!
                               </div>
                            )}
                         </div>
                      </td>
                      
                      <td className="px-6 py-4">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            Hoạt động
                         </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right">
                         <button 
                            disabled={isMe}
                            onClick={() => impersonate(user)}
                            title={`Xem trang Dashboard với quyền của ${user.name}`}
                            className="inline-flex items-center justify-center h-8 w-8 rounded bg-slate-800 text-slate-400 hover:text-white hover:bg-fuchsia-600 transition-colors disabled:opacity-30 disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                         >
                            <Eye className="h-4 w-4" />
                         </button>
                      </td>
                   </tr>
                 );
               })}
            </tbody>
         </table>

         {/* Pagination Header / Footer */}
         <div className="flex items-center justify-between px-6 py-4 bg-slate-900/40 border-t border-slate-800">
            <div className="text-xs text-slate-500">
              Hiển thị <span className="font-semibold text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-slate-300">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> trên tổng số <span className="font-semibold text-slate-300">{filteredUsers.length}</span> tài khoản
            </div>
            
            <div className="flex items-center gap-2">
               <button 
                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                 disabled={currentPage === 1}
                 className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-colors border border-slate-700"
                 title="Trang trước"
               >
                 <ChevronLeft className="h-4 w-4" />
               </button>
               
               <div className="flex items-center gap-1">
                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        "h-6 min-w-[24px] rounded text-xs font-medium transition-colors border flex items-center justify-center",
                        currentPage === page 
                          ? "bg-fuchsia-600 border-fuchsia-500 text-white" 
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {page}
                    </button>
                 ))}
               </div>

               <button 
                 onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                 disabled={currentPage === totalPages}
                 className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-colors border border-slate-700"
                 title="Trang sau"
               >
                 <ChevronRight className="h-4 w-4" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
