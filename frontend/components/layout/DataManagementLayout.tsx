import * as React from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Download, Plus, Bell } from 'lucide-react';
import { DataManagementTable, DataRecord } from '@/components/data/DataManagementTable';

const mockData: DataRecord[] = [
  { id: '1', date: '2023-01-15', category: 'Thiết bị', region: 'Miền Bắc', revenue: '$4,500', cost: '$3,000' },
  { id: '2', date: '2023-01-15', category: 'Dịch vụ', region: 'Miền Trung', revenue: '$4,500', cost: '$3,000' },
  { id: '3', date: '2023-01-15', category: 'Phần mềm', region: 'Miền Nam', revenue: '$4,500', cost: '$3,000' },
  { id: '4', date: '2023-01-15', category: 'Thiết bị', region: 'Miền Bắc', revenue: '$4,500', cost: '$3,000' },
];

export function DataManagementLayout({ hideSidebar }: { hideSidebar?: boolean }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A1128] text-slate-200 font-sans">
      {/* Sidebar Overlay/Mock */}
      {!hideSidebar && <Sidebar className="w-[260px] border-r border-[#1C2541] bg-[#0A1128]" />}
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="flex h-[100px] shrink-0 items-center justify-between px-10 bg-transparent">
          <div className="flex flex-col justify-center">
            <h1 className="text-[26px] font-semibold text-white tracking-tight leading-loose">Quản lí dữ liệu</h1>
            <p className="text-[13px] font-normal text-slate-400">Cập nhật lúc: 5:04:31 PM</p>
          </div>
          
          <div className="flex items-center space-x-6">
             <button className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#1C2541]/80 hover:bg-[#1C2541] transition">
                 <Bell className="h-[18px] w-[18px] text-slate-300" strokeWidth={2.5}/>
                 <span className="absolute top-[8px] right-[10px] h-[5px] w-[5px] rounded-full bg-red-500"></span>
             </button>
             <button className="flex items-center space-x-2 text-[13.5px] text-slate-300 hover:text-white transition font-medium">
               <span>Xuất PDF</span>
               <Download className="h-[15px] w-[15px]" strokeWidth={2.5} />
             </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-10 pb-10 flex flex-col">
          {/* Action Buttons */}
          <div className="flex items-center space-x-5 mb-8 mt-2">
            <button className="flex items-center space-x-3 px-5 py-[14px] rounded-xl border border-indigo-500/20 bg-[#151b36] hover:bg-[#1A2244] transition-colors shadow-sm">
               <div className="bg-[#8A4CFF] rounded-full p-[4px] flex items-center justify-center">
                 <Download className="h-[13px] w-[13px] text-white" strokeWidth={3} />
               </div>
               <span className="font-semibold text-[14.5px] text-slate-100">Import CSV</span>
            </button>
            <button className="flex items-center space-x-3 px-5 py-[14px] rounded-xl border border-blue-500/20 bg-[#0E2045] hover:bg-[#102552] transition-colors shadow-sm">
               <div className="bg-[#0f62fe] rounded-full p-[4px] flex items-center justify-center">
                 <Plus className="h-[13px] w-[13px] text-white" strokeWidth={3} />
               </div>
               <span className="font-semibold text-[14.5px] text-slate-100">Thêm bản ghi</span>
            </button>
          </div>
          
          {/* Data Table Container */}
          <div className="flex-1 flex flex-col min-h-[400px]">
             {/* Using a wrapping div to align exact table bounds */}
             <div className="w-full relative">
                <DataManagementTable data={mockData} totalItems={256} className="bg-[#0D1530] border-[#1C2541]" />
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
