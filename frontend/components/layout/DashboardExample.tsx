"use client";
import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardGrid, WidgetConfig, WidgetRegistry, WidgetTemplate } from './DashboardGrid';
import { KPICard } from '@/components/data/KPICard';
import { MixedChart } from '@/components/charts/MixedChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/data/DataTable';
import { DataManagementLayout } from './DataManagementLayout';
import { PermissionsSettings } from './PermissionsSettings';
import { useAuth } from '@/lib/AuthContext';
import { dashboardServices } from '@/services/apiService';
import { cn } from '@/lib/utils';
import { AlertTriangle, Loader2 } from 'lucide-react';

// ════════════════════════════════════════════════════
// Widget Registry
// ════════════════════════════════════════════════════
const widgetRegistry: WidgetRegistry = {
  KPICard,
  MixedChart,
  DonutChart,
  GaugeChart,
  DataTable,
};

// ════════════════════════════════════════════════════
// DashboardExample
// ════════════════════════════════════════════════════
export function DashboardExample({ hideSidebar }: { hideSidebar?: boolean }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [widgets, setWidgets] = React.useState<WidgetConfig[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  // ── Filters & Master Data ──
  const [regions, setRegions] = React.useState<{ id: number; name: string; code: string }[]>([]);
  const [filters, setFilters] = React.useState({
    regionId: '',
    period: '2025' // Default to 2025 as it's the latest data
  });
  const [lastUpdated, setLastUpdated] = React.useState('');

  // Set initial time on client to avoid hydration mismatch
  React.useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
  }, []);

  // Fetch Master Data (Regions)
  React.useEffect(() => {
    setRegions([
      { id: 1, name: 'Miền Bắc', code: 'NORTH' },
      { id: 2, name: 'Miền Trung', code: 'CENTRAL' },
      { id: 3, name: 'Miền Nam', code: 'SOUTH' },
    ]);
  }, []);

  // Fetch real aggregated data from API
  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      
      let startDate = '2025-01-01';
      let endDate = '2025-12-31';
      if (filters.period === '2024') {
        startDate = '2024-01-01';
        endDate = '2024-12-31';
      }

      const response = await dashboardServices.getOverview({
        regionId: filters.regionId || undefined,
        startDate,
        endDate
      });
      
      if (response.success) {
        const { kpi, charts } = response.data;

        const apiWidgets: WidgetConfig[] = [
          {
            i: 'kpi-revenue', x: 0, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng Doanh Thu', value: kpi.totalRevenue.toLocaleString('vi-VN') + ' ₫', trend: kpi.growthRate, trendDirection: kpi.growthRate >= 0 ? 'up' : 'down' },
          },
          {
            i: 'kpi-cost', x: 2, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng chi phí', value: kpi.totalCost.toLocaleString('vi-VN') + ' ₫', trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'kpi-profit', x: 4, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Lợi nhuận ròng', value: kpi.totalProfit.toLocaleString('vi-VN') + ' ₫', trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'kpi-orders', x: 6, y: 0, w: 2, h: 1,
            component: 'KPICard',
            props: { title: 'Tổng số đơn', value: kpi.totalOrders.toLocaleString('vi-VN'), trend: 0, trendDirection: 'neutral' },
          },
          {
            i: 'mixed-chart', x: 0, y: 1, w: 6, h: 3,
            component: 'MixedChart',
            props: { 
              data: charts.revenueByMonth.map((d: any) => ({ month: d.month, actual: d.revenue, target: d.revenue * 0.9 })), 
              title: 'Doanh thu theo tháng', 
              totalValue: kpi.totalRevenue.toLocaleString('vi-VN') + ' ₫', 
              trend: kpi.growthRate 
            },
          },
          {
            i: 'donut-chart', x: 6, y: 1, w: 2, h: 3,
            component: 'DonutChart',
            props: { 
              data: charts.revenueByCategory.map((d: any) => ({ label: d.label, value: d.value })),
              title: 'Cơ cấu ngành hàng', 
              totalValue: kpi.totalRevenue.toLocaleString('vi-VN'), 
              size: 130, 
              top: 3 
            },
          },
          {
            i: 'gauge-chart', x: 0, y: 4, w: 4, h: 3,
            component: 'GaugeChart',
            props: { 
              data: charts.revenueByRegion.map((d: any) => ({ label: d.label, value: d.revenue, color: d.code === 'NORTH' ? '#d946ef' : d.code === 'SOUTH' ? '#3b82f6' : '#0ea5e9' })),
              title: 'Phân bổ theo Miền', 
              totalValue: kpi.totalRevenue.toLocaleString('vi-VN') 
            },
          },
          {
            i: 'data-table', x: 4, y: 4, w: 4, h: 3,
            component: 'DataTable',
            props: { 
              title: 'Top Tỉnh thành Doanh thu cao',
              columns: [
                { key: 'label', label: 'Tỉnh thành' },
                { key: 'topic', label: 'Mã tỉnh' },
                { key: 'value', label: 'Doanh thu', align: 'right' },
              ],
              data: charts.revenueByProvince.slice(0, 6).map((d: any) => ({ 
                id: d.code, 
                label: d.label, 
                value: d.value.toLocaleString('vi-VN'), 
                topic: d.code 
              })),
            },
          },
        ];

        setWidgets(apiWidgets);
        setLastUpdated(new Date().toLocaleTimeString('vi-VN'));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLayoutChange = React.useCallback((updatedWidgets: WidgetConfig[]) => {
    setWidgets(updatedWidgets);
  }, []);

  // ── Widget Templates for the "+" Picker ──
  const widgetTemplates: WidgetTemplate[] = [
    {
      component: 'KPICard', label: 'Thẻ KPI', category: 'kpi',
      defaultW: 2, defaultH: 1, minW: 2, minH: 1, maxW: 4, maxH: 2,
      defaultProps: { title: 'KPI mới', value: '0', trend: 0, trendDirection: 'neutral' },
    },
    {
      component: 'MixedChart', label: 'Biểu đồ Kết hợp', category: 'chart',
      defaultW: 6, defaultH: 3, minW: 4, minH: 2,
      defaultProps: { title: 'Doanh thu & Mục tiêu', data: [], totalValue: '0 ₫' },
    },
    {
      component: 'DonutChart', label: 'Biểu đồ Tròn', category: 'chart',
      defaultW: 2, defaultH: 3, minW: 2, minH: 2,
      defaultProps: { title: 'Cơ cấu', data: [], totalValue: '0 ₫' },
    },
    {
      component: 'GaugeChart', label: 'Biểu đồ Tốc độ', category: 'chart',
      defaultW: 4, defaultH: 3, minW: 3, minH: 2,
      defaultProps: { title: 'Hiệu suất Miền', data: [], totalValue: '0 ₫' },
    },
    {
      component: 'DataTable', label: 'Bảng Dữ liệu', category: 'data',
      defaultW: 4, defaultH: 3, minW: 3, minH: 2,
      defaultProps: { title: 'Danh sách chi tiết', data: [], columns: [] },
    },
  ];

  return (
    <div className="flex h-screen w-full bg-[#0f121b] text-slate-200 overflow-hidden font-sans">
      {!hideSidebar && (
        <Sidebar 
          className="hidden md:flex shrink-0 z-10" 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      )}
      
      {activeTab === 'dashboard' && (
        <div className="flex-1 flex flex-col overflow-y-auto w-full">
          <div className="px-8 pt-4 flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800/50 pb-4 gap-4">
            <Header 
              title="Tổng quan Doanh nghiệp" 
              subtitle={lastUpdated ? `Cập nhật lúc: ${lastUpdated}` : 'Đang đồng bộ dữ liệu...'} 
              className="p-0 w-auto" 
            />
            
            <div className="flex items-center gap-3 bg-slate-900/40 p-1.5 rounded-xl border border-slate-800/60">
              <div className="flex items-center gap-2 px-3 border-r border-slate-800">
                <span className="text-xs font-medium text-slate-500">Miền:</span>
                <select 
                  value={filters.regionId}
                  onChange={(e) => setFilters(f => ({ ...f, regionId: e.target.value }))}
                  className="bg-transparent text-sm font-semibold text-slate-200 outline-none cursor-pointer hover:text-fuchsia-400 transition-colors"
                >
                  <option value="" className="bg-slate-900">Toàn quốc</option>
                  {regions.map(r => (
                    <option key={r.id} value={r.id} className="bg-slate-900">{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 px-3 border-r border-slate-800">
                <span className="text-xs font-medium text-slate-500">Giai đoạn:</span>
                <select 
                  value={filters.period}
                  onChange={(e) => setFilters(f => ({ ...f, period: e.target.value }))}
                  className="bg-transparent text-sm font-semibold text-slate-200 outline-none cursor-pointer hover:text-fuchsia-400 transition-colors"
                >
                  <option value="2025" className="bg-slate-900">Năm 2025</option>
                  <option value="2024" className="bg-slate-900">Năm 2024</option>
                </select>
              </div>

              <button 
                onClick={fetchData}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-fuchsia-400 transition-all active:scale-95"
                title="Làm mới dữ liệu"
              >
                <Loader2 className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </button>
            </div>
          </div>
          <main className="flex-1 p-8 pt-6 pb-12 mx-auto w-full" style={{ maxWidth: 1100 }}>
            {isLoading ? (
              <div className="flex h-64 w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-fuchsia-500" />
                <span className="ml-3 text-slate-400">Đang tải dữ liệu doanh nghiệp...</span>
              </div>
            ) : (
              <DashboardGrid
                widgets={widgets}
                registry={widgetRegistry}
                widgetTemplates={widgetTemplates}
                onLayoutChange={handleLayoutChange}
              />
            )}
          </main>
        </div>
      )}

      {activeTab === 'data_entry' && (
         <div className="flex-1 w-full h-full relative z-0 bg-[#0A1128]">
           <DataManagementLayout hideSidebar={true} />
         </div>
      )}

      {activeTab === 'permissions' && (
         <div className="flex-1 w-full h-full relative z-0 bg-[#0A1128] overflow-hidden">
           <PermissionsSettings />
         </div>
      )}

      {activeTab === 'settings' && (
         <div className="flex-1 flex flex-col items-start justify-start p-10 bg-[#0A1128] text-slate-200">
           <div className="mb-8">
             <h1 className="text-3xl font-semibold text-white tracking-tight">Cài đặt</h1>
             <p className="text-sm text-slate-400 mt-2">Quản lý các cấu hình chung và định dạng của hệ thống.</p>
           </div>
           
           <div className="w-full max-w-3xl bg-[#0D1530] border border-slate-800/80 rounded-xl p-8 shadow-sm">
              <h2 className="text-lg font-medium text-slate-100 mb-6">Cấu hình chung</h2>
              
              <div className="flex items-center justify-between py-5 border-b border-slate-800/80 last:border-0">
                 <div className="pr-10">
                    <div className="font-medium text-slate-200">Đơn vị tiền tệ mặc định</div>
                    <div className="text-[13px] text-slate-400 mt-1">Chọn đơn vị tiền tệ sẽ được sử dụng để hiển thị trên tất cả các biểu đồ và báo cáo.</div>
                 </div>
                 <select className="h-10 w-48 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-[14px] text-slate-200 focus:outline-none focus:ring-1 focus:ring-purple-500 cursor-pointer">
                    <option value="usd">USD ($)</option>
                    <option value="vnd">VND (₫)</option>
                    <option value="eur">EUR (€)</option>
                 </select>
              </div>
              
              <div className="flex flex-col items-center justify-center py-12 mt-8 border border-dashed border-slate-700/60 rounded-xl bg-slate-800/10">
                 <div className="text-slate-500 text-sm italic font-light">Các tuỳ chọn cài đặt khác sẽ được cập nhật trong tương lai.</div>
               </div>
           </div>
         </div>
      )}
    </div>
  );
}
