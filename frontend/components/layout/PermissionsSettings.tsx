"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth, UserRole } from '@/lib/AuthContext';
import { ShieldCheck, Search, ChevronLeft, ChevronRight, Plus, MapPin, Loader2, X, Edit2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { userServices, masterDataServices } from '@/services/apiService';

const ROLE_LABELS: Record<string, string> = {
  DIRECTOR: 'Giám đốc',
  MANAGER: 'Trưởng phòng',
  EMPLOYEE: 'Nhân viên',
  ADMIN: 'Quản trị viên'
};

interface UserData {
  id: number;
  username: string;
  fullName: string;
  email: string | null;
  role: string;
  isActive: boolean;
  regions: { id: number; code: string; name: string }[];
}

interface RegionData {
  id: number;
  code: string;
  name: string;
}

export function PermissionsSettings() {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [allUsers, setAllUsers] = useState<UserData[]>([]);
  const [allRegions, setAllRegions] = useState<RegionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Modal State ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    roleName: '',
    isActive: true,
    regionIds: [] as number[],
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [userRes, regionRes] = await Promise.all([
        userServices.getUsers(),
        masterDataServices.getRegions()
      ]);
      if (userRes.success) setAllUsers(userRes.data);
      if (regionRes.success) setAllRegions(regionRes.data);
    } catch (error) {
      console.error('Failed to load permissions data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Filter roles for creation based on current user ---
  const creatableRoles = useMemo(() => {
    if (currentUser?.role === 'ADMIN' || currentUser?.role === 'DIRECTOR') {
      return ['MANAGER', 'EMPLOYEE'];
    }
    if (currentUser?.role === 'MANAGER') {
      return ['EMPLOYEE'];
    }
    return [];
  }, [currentUser]);

  // --- Handle Creation / Update ---
  const handleSubmitAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserId && (!formData.username || !formData.password || !formData.roleName)) return;
    
    try {
      setIsSubmitting(true);
      let res;
      if (editUserId) {
        res = await userServices.updatePermissions(editUserId, {
          roleName: formData.roleName,
          regionIds: formData.regionIds,
          isActive: formData.isActive
        });
      } else {
        res = await userServices.createUser(formData);
      }
      
      if (res.success) {
        closeModal();
        fetchData(); // Refresh list
      } else {
        alert(res.message || 'Có lỗi xảy ra!');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi kết nối tới server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreateModal = () => {
    setEditUserId(null);
    setFormData({ username: '', password: '', fullName: '', email: '', roleName: '', regionIds: [], isActive: true });
    setShowCreateModal(true);
  };

  const openEditModal = (user: UserData) => {
    setEditUserId(user.id);
    setFormData({ 
      username: user.username, 
      password: '', // won't update password here
      fullName: user.fullName || '', 
      email: user.email || '', 
      roleName: user.role, 
      isActive: user.isActive,
      regionIds: user.regions.map(r => r.id) 
    });
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditUserId(null);
  };

  const toggleRegionSelection = (regionId: number) => {
    setFormData(prev => ({
      ...prev,
      regionIds: prev.regionIds.includes(regionId) 
        ? prev.regionIds.filter(id => id !== regionId)
        : [...prev.regionIds, regionId]
    }));
  };

  // --- Pagination Logic ---
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      (u.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
      (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const currentUsers = filteredUsers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="flex-1 flex flex-col items-start justify-start p-10 bg-[#0B0F19] text-slate-200 overflow-y-auto relative">
      <div className="mb-8 w-full flex justify-between items-end">
        <div>
           <div className="flex items-center gap-3">
              <ShieldCheck className="h-8 w-8 text-fuchsia-500" />
              <h1 className="text-3xl font-semibold text-white tracking-tight">Phân quyền & Tài khoản</h1>
           </div>
           <p className="text-sm text-slate-400 mt-2 max-w-2xl">
             Quản lý phân cấp tài khoản và giới hạn khu vực xem (RLS). Giám đốc có thể tạo Trưởng phòng, Trưởng phòng tạo được Nhân viên trong khu vực của mình.
           </p>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700/50 rounded-lg text-sm focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-colors"
                placeholder="Tìm kiếm người dùng..."
              />
           </div>
           
           {creatableRoles.length > 0 && (
             <button
               onClick={openCreateModal}
               className="flex items-center gap-2 px-4 py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-fuchsia-500/20"
             >
               <Plus className="h-4 w-4" /> Tạo Tài khoản
             </button>
           )}
        </div>
      </div>
      
      {/* Table Section */}
      <div className="w-full bg-[#0f121b] border border-slate-800 rounded-xl shadow-lg overflow-hidden flex flex-col min-h-[400px]">
         {isLoading ? (
           <div className="flex-1 flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
           </div>
         ) : (
           <>
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-slate-800 bg-slate-900/50">
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tài khoản</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Vai trò</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Khu vực phụ trách (RLS)</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Trạng thái</th>
                      <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Thao tác</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                   {currentUsers.length === 0 ? (
                     <tr>
                        <td colSpan={4} className="py-12 text-center text-slate-500">
                          Không tìm thấy tài khoản nào phù hợp.
                        </td>
                     </tr>
                   ) : currentUsers.map(user => {
                     const isMe = currentUser?.id === user.id;
                     return (
                       <tr key={user.id} className="hover:bg-slate-800/20 transition-colors">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-fuchsia-600 to-indigo-500 flex items-center justify-center text-sm font-bold text-white shadow-inner uppercase">
                                   {user.username.slice(0,2)}
                                </div>
                                <div>
                                   <div className="font-medium text-slate-200">
                                     {user.fullName || user.username}
                                     {isMe && <span className="ml-2 text-[10px] uppercase bg-fuchsia-500/20 text-fuchsia-400 px-2 py-0.5 rounded-full ring-1 ring-fuchsia-500/30">Bạn</span>}
                                   </div>
                                   <div className="text-xs text-slate-500 mt-0.5">{user.username}</div>
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className={cn(
                               "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border",
                               user.role === 'DIRECTOR' || user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                               user.role === 'MANAGER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                               'bg-slate-800 text-slate-300 border-slate-700'
                             )}>
                               {ROLE_LABELS[user.role] || user.role}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex flex-wrap gap-1.5">
                               {user.role === 'DIRECTOR' || user.role === 'ADMIN' ? (
                                 <span className="inline-flex items-center gap-1 text-xs text-fuchsia-400 bg-fuchsia-500/10 px-2.5 py-1 rounded-md border border-fuchsia-500/20">
                                    <MapPin className="h-3 w-3" /> Toàn quốc
                                 </span>
                               ) : user.regions.length > 0 ? (
                                 user.regions.map(r => (
                                   <span key={r.id} className="inline-flex items-center gap-1 text-xs text-slate-300 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                                      {r.name}
                                   </span>
                                 ))
                               ) : (
                                 <span className="text-xs text-slate-500 italic">Chưa phân vùng</span>
                               )}
                             </div>
                          </td>
                          <td className="px-6 py-4">
                             <span className={cn(
                               "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                               user.isActive ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                             )}>
                                <span className={cn("h-1.5 w-1.5 rounded-full", user.isActive ? "bg-emerald-500" : "bg-red-500")}></span>
                                {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                             {!isMe && (currentUser?.role === 'ADMIN' || currentUser?.role === 'DIRECTOR') && (
                               <button 
                                 onClick={() => openEditModal(user)}
                                 className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors inline-block"
                                 title="Chỉnh sửa quyền"
                               >
                                 <Edit2 className="h-4 w-4" />
                               </button>
                             )}
                          </td>
                       </tr>
                     );
                   })}
                </tbody>
             </table>
             
             {/* Pagination Footer */}
             {totalPages > 1 && (
               <div className="mt-auto flex items-center justify-between px-6 py-4 bg-slate-900/40 border-t border-slate-800">
                 <div className="text-xs text-slate-500">
                   Hiển thị <span className="font-semibold text-slate-300">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> - <span className="font-semibold text-slate-300">{Math.min(currentPage * ITEMS_PER_PAGE, filteredUsers.length)}</span> / <span className="font-semibold text-slate-300">{filteredUsers.length}</span>
                 </div>
                 
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-colors border border-slate-700"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-slate-400 mx-2">{currentPage} / {totalPages}</span>
                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400 disabled:cursor-not-allowed transition-colors border border-slate-700"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                 </div>
               </div>
             )}
           </>
         )}
      </div>

      {/* --- CREATE ACCOUNT MODAL --- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0f121b] border border-slate-700 rounded-2xl w-[500px] shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
              <h2 className="text-lg font-semibold text-white">{editUserId ? 'Chỉnh sửa Phân quyền' : 'Tạo tài khoản mới'}</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitAccount} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Tên đăng nhập *</label>
                  <input required disabled={!!editUserId} value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500 disabled:opacity-50" placeholder="user123" />
                </div>
                {!editUserId && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400">Mật khẩu *</label>
                    <input required type="password" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500" placeholder="••••••••" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-400">Họ và tên</label>
                <input disabled={!!editUserId} value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500 disabled:opacity-50" placeholder="Nguyễn Văn A" />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-400">Vai trò (Role) *</label>
                  <select required value={formData.roleName} onChange={e=>setFormData({...formData, roleName: e.target.value, regionIds: []})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500">
                    <option value="" disabled>--- Chọn vai trò ---</option>
                    {creatableRoles.map(role => (
                      <option key={role} value={role}>{ROLE_LABELS[role]}</option>
                    ))}
                  </select>
                </div>
                {editUserId && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-slate-400">Trạng thái *</label>
                    <select required value={formData.isActive ? '1' : '0'} onChange={e=>setFormData({...formData, isActive: e.target.value === '1'})} className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-fuchsia-500">
                      <option value="1">Hoạt động</option>
                      <option value="0">Tạm khóa</option>
                    </select>
                  </div>
                )}
              </div>

              {(currentUser?.role === 'DIRECTOR' || currentUser?.role === 'ADMIN') && formData.roleName !== '' && (
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-medium text-slate-400">Phân quyền Vùng (RLS)</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    {allRegions.map(region => (
                      <label key={region.id} className="flex items-center gap-2 p-2 rounded-lg border border-slate-700 bg-slate-900 cursor-pointer hover:bg-slate-800 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={formData.regionIds.includes(region.id)}
                          onChange={() => toggleRegionSelection(region.id)}
                          className="rounded border-slate-600 bg-slate-800 text-fuchsia-500 focus:ring-fuchsia-500 focus:ring-offset-slate-900"
                        />
                        <span className="text-sm text-slate-300">{region.name}</span>
                      </label>
                    ))}
                  </div>
                  <span className="text-[11px] text-amber-500 mt-1">* Trưởng phòng và Nhân viên phụ lục sẽ chỉ xem được dữ liệu của vùng được chọn ở trên.</span>
                </div>
              )}

              {currentUser?.role === 'MANAGER' && (
                 <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                   <p className="text-xs text-blue-400">Nhân viên mới sẽ tự động được gán vào khu vực ranh giới mà bạn đang quản lý (Kế thừa RLS).</p>
                 </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors">Hủy</button>
                <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-5 py-2 bg-fuchsia-600 hover:bg-fuchsia-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {editUserId ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
