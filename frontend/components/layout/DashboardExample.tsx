import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { KPICard } from '@/components/data/KPICard';
import { MixedChart } from '@/components/charts/MixedChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable, NotificationRecord } from '@/components/data/DataTable';

const mixData = [
  { month: 'Jan', actual: 1200, target: 3000 },
  { month: 'Feb', actual: 3800, target: 2000 },
  { month: 'Mar', actual: 4800, target: 1800 },
  { month: 'Apr', actual: 6000, target: 4500 },
  { month: 'May', actual: 3200, target: 6000 },
  { month: 'Jun', actual: 7500, target: 6200 },
  { month: 'Jul', actual: 6500, target: 5800 },
  { month: 'Aug', actual: 9500, target: 10200 },
  { month: 'Sep', actual: 12500, target: 11000 },
  { month: 'Oct', actual: 8500, target: 9200 },
  { month: 'Nov', actual: 7500, target: 6500 },
  { month: 'Dec', actual: 6000, target: 6800 }
];

const donutData = [
    { label: 'Thiết bị', value: 75000, color: '#d946ef' },
    { label: 'Phần mềm', value: 45000, color: '#3b82f6' },
    { label: 'Dịch vụ', value: 30000, color: '#0ea5e9' },
];

const gaugeData = [
    { label: 'Miền Bắc', value: 15624, color: '#d946ef' }, // Purple
    { label: 'Miền Trung', value: 5546, color: '#3b82f6' }, // Blue
    { label: 'Miền Nam', value: 2478, color: '#0ea5e9' }, // Cyan
];

const tableData: NotificationRecord[] = [
    { id: '#1532', date: 'Dec 30, 10:06 AM', performance: 'Cao', topic: 'Phần mềm' },
    { id: '#1531', date: 'Dec 29, 2:59 AM', performance: 'Thấp', topic: 'Miền Nam' },
    { id: '#1530', date: 'Dec 29, 12:54 AM', performance: 'Thấp', topic: 'Miền Trung' },
    { id: '#1529', date: 'Dec 28, 2:32 PM', performance: 'Cao', topic: 'Thiết bị' },
    { id: '#1528', date: 'Dec 27, 2:20 PM', performance: 'Thấp', topic: 'Miền Bắc' },
    { id: '#1527', date: 'Dec 26, 9:48 AM', performance: 'Cao', topic: 'Dịch vụ' },
];

export function DashboardExample() {
  return (
    <div className="flex h-screen w-full bg-[#0f121b] text-slate-200 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex shrink-0 z-10" />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header 
          title="Tổng quan Doanh nghiệp" 
          subtitle="Cập nhật lúc: 3:17:35 PM" 
        />

        <main className="flex-1 p-8 pt-4 pb-12 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard title="Tổng Doanh Thu" value="$50.800" trend={28.4} trendDirection="up" />
                <KPICard title="Tổng chi phí" value="$23.600" trend={-12.6} trendDirection="down" />
                <KPICard title="Lợi nhuận ròng" value="$756" trend={3.1} trendDirection="up" />
                <KPICard title="Tỉ lệ tăng trưởng" value="2.7" trend={11.3} trendDirection="up" />
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                
                {/* Left Column (Main Chart + Bottom Row) */}
                <div className="lg:col-span-2 xl:col-span-3 flex flex-col gap-6">
                    {/* Mixed Chart */}
                    <MixedChart 
                        data={mixData} 
                        title="Doanh thu và Kế hoạch" 
                        totalValue="$240.000" 
                        trend={24.6} 
                    />
                    
                    {/* Bottom Row inside left column: Geography + Table */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        <GaugeChart 
                            data={gaugeData} 
                            title="Phân bổ theo Địa lý" 
                            totalValue="23,648" 
                        />
                        <DataTable data={tableData} />
                    </div>
                </div>

                {/* Right Column (Industry Structure) */}
                <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
                    <DonutChart 
                        data={donutData} 
                        title="Cơ cấu ngành hàng" 
                        totalValue="150.000" 
                    />
                    {/* Placeholder for anything else in right column or just let it stretch */}
                </div>

            </div>
        </main>
      </div>
    </div>
  );
}
