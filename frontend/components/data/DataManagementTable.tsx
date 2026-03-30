"use client";
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/Checkbox';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Pagination } from '@/components/ui/Pagination';

export interface DataRecord {
  id: string;
  date: string;
  category: string;
  region: string;
  revenue: string;
  cost: string;
}

export interface DataManagementTableProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataRecord[];
  totalItems: number;
}

export function DataManagementTable({ data, totalItems, className, ...props }: DataManagementTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(4);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((r) => r.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const toggleRow = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const currentData = data; // use directly for demo as data is already 4 items
  const allSelected = currentData.length > 0 && selectedRows.size === currentData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const SortHeader = ({ label }: { label: string }) => (
    <div className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-200 group">
      <span>{label}</span>
      <div className="flex flex-col text-slate-600 group-hover:text-slate-400">
        <ChevronUp className="h-2.5 w-2.5 mb-[-3px]" />
        <ChevronDown className="h-2.5 w-2.5" />
      </div>
    </div>
  );

  return (
    <div
      className={cn(
        'flex flex-col w-full h-full rounded-2xl border border-slate-700/60 bg-[#0f172a] shadow-sm p-6',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <h3 className="text-[15px] font-medium text-slate-100">Tất cả dữ liệu</h3>
        <div className="text-sm font-medium text-purple-400">
           {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} trên {totalItems}
        </div>
      </div>

      <div className="flex-1 min-h-[300px] overflow-auto">
        <table className="w-full text-left text-sm text-slate-300 border-collapse">
          <thead className="border-b border-slate-700/60 text-slate-400 font-medium">
            <tr>
              <th className="pb-4 px-4 w-12 bg-transparent text-center font-normal align-middle">
                 <div className="flex flex-col items-center justify-center pt-1"><Checkbox checked={allSelected} onCheckedChange={toggleAll}/></div>
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap align-middle">
                 <SortHeader label="Ngày" />
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap align-middle">
                 <SortHeader label="Danh mục" />
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap align-middle">
                 <SortHeader label="Khu vực" />
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap align-middle">
                 <SortHeader label="Doanh thu" />
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap align-middle">
                 <SortHeader label="Chi phí" />
              </th>
              <th className="pb-4 px-4 font-normal whitespace-nowrap text-right align-middle">
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row) => (
              <tr
                key={row.id}
                className={cn(
                    "border-b border-slate-700/50 last:border-0 hover:bg-white/[0.02] transition-colors h-[60px]",
                    selectedRows.has(row.id) && "bg-white/[0.03]"
                 )}
              >
                <td className="px-4 text-center align-middle">
                  <div className="flex flex-col items-center justify-center">
                     <Checkbox
                        checked={selectedRows.has(row.id)}
                        onCheckedChange={(c) => toggleRow(row.id, c)}
                     />
                  </div>
                </td>
                <td className="px-4 whitespace-nowrap font-light text-slate-300/90 align-middle">{row.date}</td>
                <td className="px-4 whitespace-nowrap font-light text-slate-300/90 align-middle">{row.category}</td>
                <td className="px-4 whitespace-nowrap font-light text-slate-300/90 align-middle">{row.region}</td>
                <td className="px-4 whitespace-nowrap font-semibold text-slate-200 align-middle">{row.revenue}</td>
                <td className="px-4 whitespace-nowrap font-semibold text-slate-200 align-middle">{row.cost}</td>
                <td className="px-4 whitespace-nowrap text-right align-middle">
                  <div className="flex items-center justify-end space-x-4 text-slate-400">
                    <button className="hover:text-purple-400 transition-colors">
                      <Edit2 className="h-[15px] w-[15px]" strokeWidth={2.5} />
                    </button>
                    <button className="hover:text-red-400 transition-colors">
                      <Trash2 className="h-[15px] w-[15px]" strokeWidth={2.5} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-2 border-t border-slate-700/60 pt-4">
        <Pagination 
           currentPage={currentPage} 
           totalPages={totalPages} 
           totalItems={totalItems} 
           itemsPerPage={itemsPerPage} 
           onPageChange={setCurrentPage} 
           onItemsPerPageChange={setItemsPerPage} 
        />
      </div>
    </div>
  );
}
