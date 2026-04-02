"use client";
import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Download, Plus, Bell, Loader2, Cloud, FileSpreadsheet, X, Settings2 } from 'lucide-react';
import { DataManagementTable, DataRecord } from '@/components/data/DataManagementTable';
import { ExportModal, ExportConfig } from '@/components/data/ExportModal';
import { dataServices, masterDataServices } from '@/services/apiService';
import { useTotalTransactions } from '@/hooks/useTransactions';
import { useQueryClient } from '@tanstack/react-query';

export function DataManagementLayout({ hideSidebar }: { hideSidebar?: boolean }) {
  const queryClient = useQueryClient();
  
  // ── React Query ──
  // Fetch total global records
  const { data: totalRecords, isFetching: isFetchingTotal } = useTotalTransactions();
  
  // ── Form State (Add / Edit) ──
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  
  const [formData, setFormData] = React.useState({
    orderDate: new Date().toISOString().split('T')[0],
    revenue: '',
    quantity: '1',
    cost: '',
    provinceId: '',
    categoryId: '',
    departmentId: ''
  });
  
  // ── Sync / Upload State ──
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isApiConfigOpen, setIsApiConfigOpen] = React.useState(false);
  const [apiUrl, setApiUrl] = React.useState('https://erp.kernel404.dev/api/v1/sync');

  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploadReport, setUploadReport] = React.useState<any>(null); 
  
  // ── Export State ──
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);
  
  // ── Master Data State ──
  const [provinces, setProvinces] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [regions, setRegions] = React.useState<any[]>([]);
  const [departments, setDepartments] = React.useState<any[]>([]);

  React.useEffect(() => {
    // Fetch master data for the entry form
    Promise.all([
      masterDataServices.getProvinces(),
      masterDataServices.getCategories(),
      masterDataServices.getRegions(),
      masterDataServices.getDepartments()
    ]).then(([provRes, catRes, regRes, depthRes]) => {
      setProvinces(provRes.data || []);
      setCategories(catRes.data || []);
      setRegions(regRes.data || []);
      setDepartments(depthRes.data || []);
      
      resetForm(provRes.data, catRes.data, depthRes.data);
    }).catch(err => console.error("Failed to load master data", err));
  }, []);

  const resetForm = (provs = provinces, cats = categories, deps = departments) => {
      setEditId(null);
      setFormData({
         orderDate: new Date().toISOString().split('T')[0],
         revenue: '',
         quantity: '1',
         cost: '',
         provinceId: provs?.[0]?.id || '',
         categoryId: cats?.[0]?.id || '',
         departmentId: deps?.[0]?.id || ''
      });
  };

  const invalidateData = () => {
     queryClient.invalidateQueries({ queryKey: ['transactions'] });
  };

  const [currentFilters, setCurrentFilters] = React.useState<any>({});

  const handleStartExport = async (config: ExportConfig) => {
    try {
      setIsSyncing(true);
      
      // 1. Optional Sync (with robustness)
      if (config.syncFirst) {
        try {
          await dataServices.syncApiData();
          invalidateData();
        } catch (syncErr: any) {
          console.warn("Sync API skipped or failed:", syncErr.message);
          // Don't throw, just continue to export as requested
        }
      }

      // 2. Build Query Params for Export
      const params: any = {
        startDate: config.startDate,
        endDate: config.endDate,
        region: config.region === 'All' ? undefined : config.region,
        category: config.category === 'All' ? undefined : config.category,
        province: config.province === 'All' ? undefined : config.province,
        columns: config.columns.join(',')
      };

      // 3. Trigger Download
      const blob = await dataServices.exportTransactions(params);
      
      // Check if blob is actually an error JSON
      if (blob.type === 'application/json') {
          const text = await blob.text();
          const errorData = JSON.parse(text);
          throw new Error(errorData.message || 'Lỗi từ máy chủ khi xuất dữ liệu');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      // Use .csv extension now
      link.setAttribute('download', `data_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setIsExportModalOpen(false);
    } catch (err: any) {
      alert("Lỗi xuất file: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setIsUploading(true);
      const res = await dataServices.uploadData(file);
      if (res.success) {
        setUploadReport(res.summary);
        invalidateData();
      } else {
        alert("Lỗi tải file: " + res.message);
      }
    } catch (err: any) {
      alert("Lỗi không mong muốn: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApiSync = async () => {
    if (!apiUrl) return alert("Vui lòng nhập Link API");
    setIsApiConfigOpen(false);
    
    try {
      setIsSyncing(true);
      const res = await dataServices.syncApiData();
      if (res.success) {
        alert(res.message + `\nĐã nhận ${res.summary.totalInserted} bản ghi.`);
        invalidateData();
      } else {
        alert("Lỗi kết nối API: " + res.message);
      }
    } catch (err: any) {
      alert("Lỗi kết nối API: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSyncing(false);
    }
  };

  const openEditModal = (record: DataRecord) => {
      const raw = record.raw;
      setEditId(record.id);
      setFormData({
         orderDate: new Date(raw.orderDate).toISOString().split('T')[0],
         revenue: raw.revenue,
         quantity: raw.quantity || '1',
         cost: raw.cost || '',
         provinceId: raw.provinceId || provinces[0]?.id,
         categoryId: raw.categoryId || categories[0]?.id,
         departmentId: raw.departmentId || departments[0]?.id
      });
      setIsModalOpen(true);
  };

  const openAddModal = () => {
      resetForm();
      setIsModalOpen(true);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editId) {
         res = await dataServices.updateManualEntry(editId, formData);
      } else {
         res = await dataServices.createManualEntry(formData);
      }
      
      if (res.success) {
        setIsModalOpen(false);
        invalidateData();
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert("Lỗi quá trình lưu: " + err.message);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A1128] text-slate-200 font-sans">
      {!hideSidebar && <Sidebar className="w-[260px] border-r border-[#1C2541] bg-[#0A1128]" />}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="flex h-[100px] shrink-0 items-center justify-between px-10 bg-transparent">
          <div className="flex flex-col justify-center">
            <h1 className="text-[26px] font-semibold text-white tracking-tight leading-loose flex items-center gap-3">
               Quản lí dữ liệu
            </h1>
            <p className="text-[13px] font-normal text-slate-400">Hệ thống phân tích giao dịch Server-Side</p>
          </div>
          
          <div className="flex items-center space-x-6">
             <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#1C2541]/80 hover:bg-[#1C2541] transition">
                 <Bell className="h-[18px] w-[18px] text-slate-300" strokeWidth={2.5}/>
                 <span className="absolute top-[8px] right-[10px] h-[5px] w-[5px] rounded-full bg-red-500"></span>
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 pb-10 flex flex-col">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 mb-4 mt-2">
            
            <input 
              type="file" 
              accept=".csv, .xlsx, .xls"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange} 
            />
            
            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="flex items-center space-x-3 px-5 py-[14px] rounded-xl border border-indigo-500/30 bg-[#151b36] hover:bg-[#1A2244] transition-colors shadow-sm disabled:opacity-50"
            >
               <div className="bg-[#8A4CFF] rounded-full p-[4px] flex items-center justify-center">
                 {isUploading ? <Loader2 className="h-[13px] w-[13px] text-white animate-spin" /> : <FileSpreadsheet className="h-[13px] w-[13px] text-white" strokeWidth={3} />}
               </div>
               <span className="font-semibold text-[14.5px] text-slate-100">{isUploading ? 'Đang Upload...' : 'Import ETL (CSV/Excel)'}</span>
            </button>

            <button 
                onClick={() => setIsApiConfigOpen(true)}
                disabled={isSyncing}
                className="flex items-center space-x-3 px-5 py-[14px] rounded-xl border border-emerald-500/30 bg-[#0A221C] hover:bg-[#0D2F28] transition-colors shadow-sm disabled:opacity-50"
            >
               <div className="bg-emerald-500 rounded-full p-[4px] flex items-center justify-center">
                 {isSyncing ? <Loader2 className="h-[13px] w-[13px] text-white animate-spin" /> : <Settings2 className="h-[13px] w-[13px] text-white" strokeWidth={3} />}
               </div>
               <span className="font-semibold text-[14.5px] text-emerald-100">{isSyncing ? 'Đang đồng bộ...' : 'Kết nối API ERP'}</span>
            </button>

            <button 
                onClick={openAddModal}
                className="flex items-center space-x-3 px-5 py-[14px] rounded-xl border border-blue-500/30 bg-[#0E2045] hover:bg-[#102552] transition-colors shadow-sm ml-auto"
            >
               <div className="bg-[#0f62fe] rounded-full p-[4px] flex items-center justify-center">
                 <Plus className="h-[13px] w-[13px] text-white" strokeWidth={3} />
               </div>
               <span className="font-semibold text-[14.5px] text-slate-100">Thêm giao dịch</span>
            </button>
          </div>
          
          <div className="flex-1 min-h-0">
             <DataManagementTable 
                onEdit={openEditModal} 
                onDelete={(id) => alert('Delete ' + id)}
                onExportClick={() => setIsExportModalOpen(true)}
                onFilterChange={setCurrentFilters} 
                categories={categories}
                regions={regions}
                className="shadow-2xl border-[#1C2541] rounded-2xl" 
             />
          </div>

          <ExportModal 
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={handleStartExport}
            isLoading={isSyncing}
            categories={categories}
            regions={regions}
            provinces={provinces}
            initialFilters={currentFilters}
          />
        </main>

        {/* ── API Config Modal ── */}
        {isApiConfigOpen && (
             <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#0A1128] border border-[#1C2541] w-[450px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-[#1C2541]">
                        <h2 className="text-lg font-semibold text-emerald-400">Cấu hình API Đồng Bộ</h2>
                        <button onClick={() => setIsApiConfigOpen(false)} className="text-slate-400 hover:text-white transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 bg-[#0D1530]">
                         <p className="text-sm text-slate-400 mb-4">Nhập đường dẫn Webhook / API Endpoint của hệ thống ERP để lấy dữ liệu tự động (ví dụ minh họa).</p>
                         
                         <label className="block text-xs font-semibold text-slate-300 mb-2">Endpoint URL</label>
                         <input 
                            type="text" 
                            className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-emerald-500 mb-6"
                            value={apiUrl}
                            onChange={(e) => setApiUrl(e.target.value)}
                         />

                         <div className="flex justify-end gap-3">
                             <button onClick={() => setIsApiConfigOpen(false)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:bg-[#1C2541] hover:text-white transition">Huỷ</button>
                             <button onClick={handleApiSync} className="px-5 py-2 flex items-center space-x-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition shadow-lg shadow-emerald-500/20">
                                <Cloud className="h-4 w-4" />
                                <span>Tiến hành Đồng bộ</span>
                             </button>
                         </div>
                    </div>
                </div>
            </div>
        )}

        {/* ── ETL Upload Report Modal ── */}
        {uploadReport && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#0A1128] border border-[#1C2541] w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="bg-emerald-600/30 p-4 border-b border-emerald-500/30 text-center flex flex-col items-center">
                        <div className="bg-emerald-500 rounded-full p-2 mb-2">
                           <FileSpreadsheet className="h-6 w-6 text-white" />
                        </div>
                        <h2 className="text-emerald-400 text-lg font-bold">Import Thành Công</h2>
                    </div>
                    <div className="p-6 text-slate-300 bg-[#0D1530]">
                        <ul className="space-y-3 mb-6">
                            <li className="flex justify-between border-b border-slate-700/50 pb-2">
                                <span>Tổng số dòng đọc được:</span>
                                <span className="font-bold text-white tracking-widest">{uploadReport.totalRows}</span>
                            </li>
                            <li className="flex justify-between border-b border-slate-700/50 pb-2">
                                <span>Lỗi dữ liệu (đã bỏ qua):</span>
                                <span className="font-bold text-red-500 tracking-widest">{uploadReport.failedRows || 0}</span>
                            </li>
                        </ul>
                        <button 
                            type="button"
                            onClick={() => setUploadReport(null)}
                            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white font-medium transition"
                        >
                            Đóng báo cáo (OK)
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* ── Manual Entry / Edit Form Modal ── */}
        {isModalOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="bg-[#0A1128] border border-[#1C2541] w-[500px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-[#1C2541]">
                        <h2 className="text-lg font-semibold text-white">
                           {editId ? 'Sửa Giao Dịch' : 'Thêm Giao Dịch Mới'}
                        </h2>
                        <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="p-6 bg-[#0D1530]">
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1.5 font-medium">Ngày giao dịch</label>
                                    <input 
                                       type="date" required 
                                       className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                                       value={formData.orderDate}
                                       onChange={e => setFormData({...formData, orderDate: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1.5 font-medium">Doanh thu (VND)</label>
                                    <input 
                                       type="number" required placeholder="VD: 15000000"
                                       className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500"
                                       value={formData.revenue}
                                       onChange={e => setFormData({...formData, revenue: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1.5 font-medium">Khu vực / Tỉnh</label>
                                    <select 
                                        className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2 text-[13px] text-slate-200 outline-none focus:border-blue-500"
                                        value={formData.provinceId}
                                        onChange={e => setFormData({...formData, provinceId: e.target.value})}
                                    >
                                        {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[13px] text-slate-400 mb-1.5 font-medium">Ngành hàng</label>
                                    <select 
                                        className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2 text-[13px] text-slate-200 outline-none focus:border-blue-500"
                                        value={formData.categoryId}
                                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                                    >
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-[13px] text-slate-400 mb-1.5 font-medium">Phòng ban phụ trách</label>
                                <select 
                                    className="w-full bg-[#151b36] border border-[#1C2541] rounded-lg px-3 py-2 text-[13px] text-slate-200 outline-none focus:border-blue-500"
                                    value={formData.departmentId}
                                    onChange={e => setFormData({...formData, departmentId: e.target.value})}
                                >
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end space-x-3 border-t border-[#1C2541] mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 mt-4 rounded-lg text-sm text-slate-400 hover:text-white transition">Hủy bỏ</button>
                                <button type="submit" className="px-5 py-2 mt-4 rounded-lg bg-[#0f62fe] hover:bg-blue-600 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20">Lưu dữ liệu</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
}
