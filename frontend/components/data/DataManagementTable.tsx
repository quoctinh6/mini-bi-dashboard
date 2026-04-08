"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';
import { Edit2, Trash2, ArrowUpDown, Loader2, Search, ArrowUp, ArrowDown, Download } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';
import { NumberDisplay } from '@/components/ui/NumberDisplay';
import { useTransactions } from '@/hooks/useTransactions';

export interface DataRecord {
  id: string;
  date: string;
  category: string;
  region: string;
  revenue: number;
  cost: number;
  raw: any; 
}

export interface DataManagementTableProps extends React.HTMLAttributes<HTMLDivElement> {
  onEdit?: (record: DataRecord) => void;
  onDelete?: (id: string) => void;
  onExportClick?: () => void;
  onFilterChange?: (filters: any) => void;
  categories?: any[];
  regions?: any[];
}

type SortKey = 'id' | 'date' | 'category' | 'region' | 'revenue' | 'cost';
type SortDir = 'asc' | 'desc' | null;

export function DataManagementTable({ 
  onEdit, 
  onDelete, 
  onExportClick,
  onFilterChange,
  categories = [], 
  regions = [], 
  className, 
  ...props 
}: DataManagementTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  
  // ── Pagination State ──
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);
  
  // ── Sorting State (3-State: asc -> desc -> null) ──
  const [sortKey, setSortKey] = React.useState<SortKey | null>('date');
  const [sortDir, setSortDir] = React.useState<SortDir>('desc');

  // ── Filtering State ──
  const [filterRegion, setFilterRegion] = React.useState<string>('All');
  const [filterCategory, setFilterCategory] = React.useState<string>('All');
  const [minRevenue, setMinRevenue] = React.useState<string>('');
  const [maxRevenue, setMaxRevenue] = React.useState<string>('');
  const [startDate, setStartDate] = React.useState<string>('');
  const [endDate, setEndDate] = React.useState<string>('');
  const [searchId, setSearchId] = React.useState<string>('');

  // ── Query Hook ──
  const queryFilters = React.useMemo(() => {
     let f: any = {
        page: currentPage,
        limit: itemsPerPage
     };
     // Only add sort if it's set
     if (sortKey && sortDir) {
        f.sortBy = sortKey;
        f.sortDir = sortDir;
     }
     
     if (filterRegion && filterRegion !== 'All') f.region = filterRegion;
     if (filterCategory && filterCategory !== 'All') f.category = filterCategory;
     if (minRevenue) f.minRevenue = minRevenue;
     if (maxRevenue) f.maxRevenue = maxRevenue;
     if (startDate) f.startDate = startDate;
     if (endDate) f.endDate = endDate;
     if (searchId) f.searchId = searchId;
     return f;
  }, [currentPage, itemsPerPage, sortKey, sortDir, filterRegion, filterCategory, minRevenue, maxRevenue, startDate, endDate, searchId]);

  // Sync filters back to parent for Export feature
  React.useEffect(() => {
    if (onFilterChange) {
      onFilterChange(queryFilters);
    }
  }, [queryFilters, onFilterChange]);

  const { data: responseData, isLoading, isFetching, isPlaceholderData } = useTransactions(queryFilters);
  
  const records: DataRecord[] = responseData?.data || [];
  const totalItems = responseData?.meta?.total || 0;
  const totalPages = responseData?.meta?.totalPages || 1;

  const toggleAll = (checked: boolean) => {
    if (checked) setSelectedRows(new Set(records.map((r) => r.id)));
    else setSelectedRows(new Set());
  };

  const toggleRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) newSelected.add(id);
    else newSelected.delete(id);
    setSelectedRows(newSelected);
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
       // Cycle: asc -> desc -> null (null drops back to default date desc in backend)
       if (sortDir === 'asc') setSortDir('desc');
       else if (sortDir === 'desc') {
           setSortKey(null);
           setSortDir(null);
       }
    } else {
       setSortKey(key);
       setSortDir('asc');
    }
  };

  const allSelected = records.length > 0 && records.every(r => selectedRows.has(r.id));

  const SortHeader = ({ label, sortName }: { label: string, sortName: SortKey }) => {
    const isActive = sortKey === sortName;
    return (
      <div 
        className={cn("flex items-center space-x-1.5 cursor-pointer group select-none py-1", isActive ? "text-fuchsia-400" : "text-slate-400")}
        onClick={() => handleSort(sortName)}
      >
        <span className="font-semibold tracking-tight">{label}</span>
        <div className="flex flex-col">
          {isActive ? (
             sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUpDown className="h-3 w-3 opacity-20 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('flex flex-col w-full h-full rounded-2xl border border-slate-700/60 bg-[#0A1128] shadow-sm relative', className)} {...props}>
      {isFetching && !isLoading && (
        <div className="absolute top-0 inset-x-0 h-1 bg-fuchsia-500/20 overflow-hidden z-20 rounded-t-2xl">
           <div className="h-full bg-fuchsia-500 animate-[progress_1s_ease-in-out_infinite]" style={{width: '30%'}} />
        </div>
      )}
      
      {/* ── Toolbar / Filter Panel ── */}
      <div className="flex flex-col p-5 border-b border-slate-700/60 gap-4 bg-[#101935]/50">
        
        {/* Top Row: Dropdowns & Status */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="flex items-center gap-3">
              <div className="flex items-center space-x-2 bg-[#151b36] border border-[#1C2541] rounded px-3 py-1.5 shadow-sm">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" placeholder="Tìm ID..."
                  className="bg-transparent text-xs text-slate-200 outline-none w-20"
                  value={searchId} onChange={e => { setSearchId(e.target.value); setCurrentPage(1); }}
                />
              </div>

              <select 
                className="bg-[#151b36] border border-[#1C2541] rounded shadow-sm px-3 py-1.5 text-xs text-slate-300 outline-none hover:border-fuchsia-500 transition"
                value={filterRegion}
                onChange={e => { setFilterRegion(e.target.value); setCurrentPage(1); }}
              >
                <option value="All" className="text-slate-500">Khu vực: Tất cả</option>
                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>

              <select 
                className="bg-[#151b36] border border-[#1C2541] rounded shadow-sm px-3 py-1.5 text-xs text-slate-300 outline-none hover:border-fuchsia-500 transition"
                value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
              >
                <option value="All">Ngành hàng: Tất cả</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>
           
            <div className="flex items-center gap-4">
              <button 
                onClick={onExportClick}
                className="flex items-center space-x-2 text-[12px] text-fuchsia-400 hover:text-white transition font-bold px-4 py-2 border border-fuchsia-500/30 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-600 shadow-[0_0_15px_rgba(217,70,239,0.1)] hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]"
              >
                <Download className="h-4 w-4" strokeWidth={3} />
                <span>Xuất Excel</span>
              </button>
              <div className="text-sm font-medium text-emerald-400 w-[200px] text-right">
                 {totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalItems)} trên {totalItems}
              </div>
            </div>
        </div>

        {/* Bottom Row: Range Filters */}
        <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-700/30">
            {/* Thu Chi Range */}
            <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 w-16">Doanh thu:</span>
                <div className="flex items-center bg-[#151b36] border border-[#1C2541] rounded-lg shadow-sm px-2 py-1">
                    <input 
                      type="number" placeholder="Từ (VNĐ)"
                      className="bg-transparent text-xs text-slate-200 outline-none w-24 px-2 hover:border-fuchsia-500"
                      value={minRevenue} onChange={e => { setMinRevenue(e.target.value); setCurrentPage(1); }}
                    />
                    <span className="text-slate-500 mx-1">-</span>
                    <input 
                      type="number" placeholder="Đến (VNĐ)"
                      className="bg-transparent text-xs text-slate-200 outline-none w-24 px-2"
                      value={maxRevenue} onChange={e => { setMaxRevenue(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>

            {/* Date Range */}
            <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-400 w-[60px]">Thời gian:</span>
                <div className="flex items-center bg-[#151b36] border border-[#1C2541] rounded-lg shadow-sm px-2 py-1">
                    <input 
                      type="date"
                      className="bg-transparent text-xs text-slate-200 outline-none w-28 px-1"
                      value={startDate} onChange={e => { setStartDate(e.target.value); setCurrentPage(1); }}
                    />
                    <span className="text-slate-500 mx-1">-</span>
                    <input 
                      type="date"
                      className="bg-transparent text-xs text-slate-200 outline-none w-28 px-1"
                      value={endDate} onChange={e => { setEndDate(e.target.value); setCurrentPage(1); }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-[300px] overflow-auto p-2 relative">
        {isLoading && (
           <div className="absolute inset-0 bg-[#0A1128]/50 backdrop-blur-[1px] flex items-center justify-center z-20">
              <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
           </div>
        )}
        <table className={cn("w-full text-left text-sm text-slate-300 border-collapse transition-opacity", (isPlaceholderData || isFetching) ? "opacity-60" : "opacity-100")}>
          <thead className="border-b border-slate-700/60 font-medium sticky top-0 bg-[#0A1128] z-10 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">
            <tr>
              <th className="pb-3 px-4 w-12 text-center align-middle">
                 <div className="flex flex-col items-center justify-center pt-1"><Checkbox checked={allSelected} onCheckedChange={toggleAll}/></div>
              </th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Mã" sortName="id" /></th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Ngày T.toán" sortName="date" /></th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Danh mục" sortName="category" /></th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Khu vực" sortName="region" /></th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Doanh thu" sortName="revenue" /></th>
              <th className="pb-3 px-4 whitespace-nowrap align-middle border-x border-slate-800/10 hover:bg-white/[0.02] transition-colors"><SortHeader label="Chi phí" sortName="cost" /></th>
              <th className="pb-3 px-4 whitespace-nowrap text-right align-middle">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {records.length > 0 ? records.map((row) => (
              <tr
                key={row.id}
                className={cn(
                    "border-b border-slate-700/50 last:border-0 hover:bg-white/[0.04] transition-colors h-[50px]",
                    selectedRows.has(row.id) && "bg-white/[0.05]"
                 )}
              >
                <td className="px-4 text-center align-middle">
                  <div className="flex flex-col items-center justify-center">
                     <Checkbox checked={selectedRows.has(row.id)} onCheckedChange={(c) => toggleRow(row.id, c)}/>
                  </div>
                </td>
                <td className="px-4 whitespace-nowrap font-medium text-purple-300 align-middle">#{row.id}</td>
                <td className="px-4 whitespace-nowrap font-light text-slate-300 align-middle">{new Date(row.date).toLocaleDateString('vi-VN')}</td>
                <td className="px-4 whitespace-nowrap font-light align-middle"><span className="px-2 py-1 rounded bg-[#1C2541]/50 text-[11px] text-slate-300 border border-slate-700">{row.category}</span></td>
                <td className="px-4 whitespace-nowrap font-light align-middle text-slate-300">{row.region}</td>
                <td className="px-4 whitespace-nowrap align-middle"><NumberDisplay value={row.revenue} unit="₫" className="text-[13.5px] font-semibold text-emerald-400" /></td>
                <td className="px-4 whitespace-nowrap align-middle"><NumberDisplay value={row.cost} unit="₫" className="text-[13.5px] font-medium text-rose-400" /></td>
                <td className="px-4 whitespace-nowrap text-right align-middle">
                  <div className="flex items-center justify-end space-x-3">
                    <button onClick={() => onEdit?.(row)} title="Sửa bản ghi" className="p-1.5 rounded bg-slate-800 text-slate-400 hover:text-blue-400 hover:bg-slate-700 transition"><Edit2 className="h-3.5 w-3.5" /></button>
                    
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                 <td colSpan={8} className="h-48 text-center text-slate-500 text-sm">
                   {isLoading ? "Đang tải dữ liệu..." : "Không tìm thấy dữ liệu khớp với bộ lọc"}
                 </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-slate-700/60 bg-[#0A1128] rounded-b-2xl">
        <Pagination 
           currentPage={currentPage} 
           totalPages={totalPages} 
           totalItems={totalItems} 
           itemsPerPage={itemsPerPage} 
           onPageChange={setCurrentPage} 
           onItemsPerPageChange={(limit) => { setItemsPerPage(limit); setCurrentPage(1); }} 
        />
      </div>
    </div>
  );
}
