import * as React from 'react';
import { X, FileSpreadsheet, Check, Loader2, Calendar, Globe, Tag, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
  isLoading: boolean;
  categories: any[];
  regions: any[];
  provinces: any[];
  initialFilters?: any;
}

export interface ExportConfig {
  startDate?: string;
  endDate?: string;
  region?: string;
  category?: string;
  province?: string;
  columns: string[];
  syncFirst: boolean;
}

const AVAILABLE_COLUMNS = [
  { id: 'id', label: 'Mã ID' },
  { id: 'date', label: 'Ngày giao dịch' },
  { id: 'category', label: 'Ngành hàng' },
  { id: 'region', label: 'Khu vực' },
  { id: 'province', label: 'Tỉnh thành' },
  { id: 'department', label: 'Phòng ban' },
  { id: 'revenue', label: 'Doanh thu (VND)' },
  { id: 'cost', label: 'Chi phí (VND)' },
  { id: 'quantity', label: 'Số lượng' },
];

export function ExportModal({ 
  isOpen, 
  onClose, 
  onExport, 
  isLoading,
  categories,
  regions,
  provinces,
  initialFilters = {}
}: ExportModalProps) {
  const defaultColumns = AVAILABLE_COLUMNS.map(c => c.id);
  const [config, setConfig] = React.useState<ExportConfig>({
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    region: initialFilters.region || 'All',
    category: initialFilters.category || 'All',
    province: initialFilters.province || 'All',
    columns: defaultColumns,
    syncFirst: false,
  });

  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState<'idle' | 'preparing' | 'downloading'>('idle');

  React.useEffect(() => {
    if (isOpen) {
      if (isLoading) {
        setStatus('preparing');
        let p = 0;
        const interval = setInterval(() => {
          // Slowly cruise to 95% if still preparing 
          p += (95 - p) * 0.1;
          setProgress(p);
        }, 1000);
        return () => clearInterval(interval);
      } else {
        if (status !== 'idle') {
          setProgress(100);
          setTimeout(() => {
            setStatus('idle');
            setProgress(0);
          }, 1500);
        }
      }
    }
  }, [isLoading, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setConfig({
      startDate: initialFilters.startDate || '',
      endDate: initialFilters.endDate || '',
      region: initialFilters.region || 'All',
      category: initialFilters.category || 'All',
      province: initialFilters.province || 'All',
      columns: defaultColumns,
      syncFirst: false,
    });
  };

  const handleToggleColumn = (id: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(id) 
        ? prev.columns.filter(c => c !== id)
        : [...prev.columns, id]
    }));
  };

  const handleSelectAllColumns = () => {
    if (config.columns.length === AVAILABLE_COLUMNS.length) {
      setConfig(prev => ({ ...prev, columns: [] }));
    } else {
      setConfig(prev => ({ ...prev, columns: AVAILABLE_COLUMNS.map(c => c.id) }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 ml-[260px]">
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-700/50 bg-[#0A1128] shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 bg-[#101935]/50 px-8 py-5">
           <div className="flex items-center gap-3">
             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/20 text-fuchsia-400">
                <FileSpreadsheet className="h-6 w-6" />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Cấu hình Xuất Excel</h2>
               <p className="text-xs text-slate-400">Tùy chỉnh dữ liệu trước khi tải về</p>
             </div>
           </div>
           <div className="flex items-center gap-4">
             <button 
               onClick={handleReset}
               className="text-xs font-semibold text-slate-400 hover:text-fuchsia-400 transition-colors"
             >
               Đặt lại bộ lọc
             </button>
             <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
                <X className="h-5 w-5" />
             </button>
           </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-8 py-6 space-y-8">
           
           {/* Section 1: Filters */}
           <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-400">
                <Calendar className="h-4 w-4" /> 1. Bộ lọc dữ liệu
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Ngày bắt đầu</label>
                    <input 
                      type="date" 
                      className="w-full rounded-xl border border-slate-700/50 bg-[#151b36] p-2.5 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                      value={config.startDate}
                      onChange={e => setConfig({...config, startDate: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Ngày kết thúc</label>
                    <input 
                      type="date" 
                      className="w-full rounded-xl border border-slate-700/50 bg-[#151b36] p-2.5 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                      value={config.endDate}
                      onChange={e => setConfig({...config, endDate: e.target.value})}
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Khu vực</label>
                    <select 
                      className="w-full rounded-xl border border-slate-700/50 bg-[#151b36] p-2.5 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                      value={config.region}
                      onChange={e => setConfig({...config, region: e.target.value})}
                    >
                      <option value="All">Tất cả khu vực</option>
                      {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Ngành hàng</label>
                    <select 
                      className="w-full rounded-xl border border-slate-700/50 bg-[#151b36] p-2.5 text-sm text-white focus:border-fuchsia-500 outline-none transition-all"
                      value={config.category}
                      onChange={e => setConfig({...config, category: e.target.value})}
                    >
                      <option value="All">Tất cả ngành hàng</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                 </div>
              </div>
           </div>

           {/* Section 2: Columns */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-400">
                  <Tag className="h-4 w-4" /> 2. Chọn cột dữ liệu
                </h3>
                <div className="flex gap-4">
                  <button 
                    onClick={() => setConfig(prev => ({ ...prev, columns: AVAILABLE_COLUMNS.map(c => c.id) }))}
                    className="text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
                  >
                    Chọn tất cả
                  </button>
                  <button 
                    onClick={() => setConfig(prev => ({ ...prev, columns: [] }))}
                    className="text-xs text-slate-400 hover:text-fuchsia-400 transition-colors"
                  >
                    Bỏ chọn tất cả
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                 {AVAILABLE_COLUMNS.map(col => (
                   <label key={col.id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl bg-[#151b36] border border-slate-800/50 hover:border-fuchsia-500/50 hover:bg-[#1C2541]/50 transition-all">
                      <Checkbox 
                        checked={config.columns.includes(col.id)} 
                        onCheckedChange={() => handleToggleColumn(col.id)}
                      />
                      <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">{col.label}</span>
                   </label>
                 ))}
              </div>
           </div>

           {/* Section 3: Options */}
           <div className="space-y-4 pt-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-fuchsia-400">
                <Database className="h-4 w-4" /> 3. Tùy chọn nâng cao
              </h3>
              <label className="flex items-center justify-between p-4 rounded-2xl bg-[#1c2541]/40 border border-emerald-500/20 cursor-pointer hover:bg-[#1c2541]/60 transition-all group">
                <div className="flex items-center gap-4">
                   <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
                      <Globe className="h-5 w-5" />
                   </div>
                   <div>
                      <p className="text-sm font-bold text-emerald-400">Đồng bộ API trước khi tải</p>
                      <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Cập nhật dữ liệu mới nhất từ hệ thống ERP</p>
                   </div>
                </div>
                <Checkbox 
                  checked={config.syncFirst} 
                  onCheckedChange={(checked) => setConfig({...config, syncFirst: checked as boolean})} 
                  className="h-6 w-6 border-emerald-500/50 data-[state=checked]:bg-emerald-500"
                />
              </label>
           </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between bg-[#101935]/50 px-10 py-6 border-t border-slate-700/50 gap-4">
           <div className="flex-1">
              {status !== 'idle' && (
                <div className="space-y-2">
                   <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <span>
                        {config.syncFirst && progress < 35 ? 'Đang đồng bộ ERP...' : 'Đang tạo dữ liệu Excel...'}
                      </span>
                      <span>{Math.round(progress)}%</span>
                   </div>
                   <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-300" 
                        style={{ width: `${progress}%` }}
                      />
                   </div>
                </div>
              )}
           </div>
           <div className="flex items-center gap-3">
             <button 
               onClick={onClose}
               className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
             >
               Hủy bỏ
             </button>
             <button 
               disabled={isLoading || config.columns.length === 0}
               onClick={() => onExport(config)}
               className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-gradient-to-r from-fuchsia-600 to-purple-600 text-sm font-bold text-white shadow-lg shadow-fuchsia-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:grayscale transition-all"
             >
               {isLoading ? (
                 <>
                   <Loader2 className="h-4 w-4 animate-spin" />
                   <span>Đang xử lý...</span>
                 </>
               ) : (
                 <>
                   <FileSpreadsheet className="h-4 w-4" />
                   <span>Bắt đầu Tải về</span>
                 </>
               )}
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
