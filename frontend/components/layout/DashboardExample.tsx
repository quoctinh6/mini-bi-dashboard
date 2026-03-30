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
import { AlertTriangle } from 'lucide-react';

const topEmployeesData = [
  { id: '#NV001', date: 'Nguyễn Văn A', performance: 'Cao' as const, topic: '120% KPI' },
  { id: '#NV002', date: 'Lê Thị B', performance: 'Cao' as const, topic: '105% KPI' },
  { id: '#NV003', date: 'Trần Văn C', performance: 'Cao' as const, topic: '98% KPI' },
];

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
// Widget Templates — kéo thả từ picker
// ════════════════════════════════════════════════════
const widgetTemplates: WidgetTemplate[] = [
  {
    component: 'KPICard',
    label: 'Thẻ KPI',
    description: 'Chỉ số KPI với xu hướng tăng/giảm',
    category: 'kpi',
    defaultW: 2, defaultH: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    defaultProps: {
      title: 'Chỉ số mới',
      value: '$0',
      trend: 0,
      trendDirection: 'up',
    },
  },
  {
    component: 'MixedChart',
    label: 'Biểu đồ hỗn hợp',
    description: 'Biểu đồ cột + đường — thực tế vs kế hoạch',
    category: 'chart',
    defaultW: 6, defaultH: 3,
    minW: 4, minH: 2, maxW: 8, maxH: 5,
    defaultProps: {
      data: [
        { month: 'T1', actual: 2000, target: 3000 },
        { month: 'T2', actual: 3500, target: 3200 },
        { month: 'T3', actual: 4200, target: 4000 },
        { month: 'T4', actual: 5100, target: 4800 },
        { month: 'T5', actual: 4800, target: 5500 },
        { month: 'T6', actual: 6200, target: 6000 },
      ],
      title: 'Biểu đồ mới',
      totalValue: '$0',
      trend: 0,
    },
  },
  {
    component: 'DonutChart',
    label: 'Biểu đồ Donut',
    description: 'Biểu đồ tròn — tỷ lệ phân bổ',
    category: 'chart',
    defaultW: 2, defaultH: 3,
    minW: 2, minH: 2, maxW: 4, maxH: 6,
    defaultProps: {
      data: [
        { label: 'Mục A', value: 40 },
        { label: 'Mục B', value: 30 },
        { label: 'Mục C', value: 20 },
        { label: 'Mục D', value: 10 },
      ],
      title: 'Donut mới',
      totalValue: '100',
      size: 130,
      top: 3,
    },
  },
  {
    component: 'GaugeChart',
    label: 'Biểu đồ Gauge',
    description: 'Bán nguyệt — phân bổ khu vực',
    category: 'chart',
    defaultW: 4, defaultH: 3,
    minW: 3, minH: 2, maxW: 6, maxH: 5,
    defaultProps: {
      data: [
        { label: 'Khu vực A', value: 5000, color: '#d946ef' },
        { label: 'Khu vực B', value: 3000, color: '#3b82f6' },
        { label: 'Khu vực C', value: 2000, color: '#0ea5e9' },
      ],
      title: 'Gauge mới',
      totalValue: '10,000',
    },
  },
  {
    component: 'DataTable',
    label: 'Bảng dữ liệu',
    description: 'Bảng thông báo dạng hàng',
    category: 'data',
    defaultW: 4, defaultH: 3,
    minW: 3, minH: 2, maxW: 8, maxH: 6,
    defaultProps: {
      data: [
        { id: '#001', date: 'Jan 1, 12:00 PM', performance: 'Cao' as const, topic: 'Mẫu' },
        { id: '#002', date: 'Jan 2, 3:00 PM', performance: 'Thấp' as const, topic: 'Mẫu' },
      ],
      title: 'Bảng mới',
    },
  },
];

// ════════════════════════════════════════════════════
// Default Data
// ════════════════════════════════════════════════════
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
  { month: 'Dec', actual: 6000, target: 6800 },
];

const donutData = [
  { label: 'Thiết bị',       value: 45000 },
  { label: 'Phần mềm',      value: 30000 },
  { label: 'Dịch vụ',       value: 22500 },
  { label: 'Đào tạo',       value: 15000 },
  { label: 'Tư vấn',        value: 12000 },
  { label: 'Bảo trì',       value: 9000  },
  { label: 'Gia công',      value: 7500  },
  { label: 'Bản quyền',     value: 4500  },
  { label: 'Quảng cáo',     value: 3000  },
  { label: 'Văn phòng phẩm', value: 1500 },
];

const gaugeData = [
  { label: 'Miền Bắc', value: 15624, color: '#d946ef' },
  { label: 'Miền Trung', value: 5546, color: '#3b82f6' },
  { label: 'Miền Nam', value: 2478, color: '#0ea5e9' },
];

const tableData = [
  { id: '#1532', date: 'Dec 30, 10:06 AM', performance: 'Cao' as const, topic: 'Phần mềm' },
  { id: '#1531', date: 'Dec 29, 2:59 AM', performance: 'Thấp' as const, topic: 'Miền Nam' },
  { id: '#1530', date: 'Dec 29, 12:54 AM', performance: 'Thấp' as const, topic: 'Miền Trung' },
  { id: '#1529', date: 'Dec 28, 2:32 PM', performance: 'Cao' as const, topic: 'Thiết bị' },
  { id: '#1528', date: 'Dec 27, 2:20 PM', performance: 'Thấp' as const, topic: 'Miền Bắc' },
  { id: '#1527', date: 'Dec 26, 9:48 AM', performance: 'Cao' as const, topic: 'Dịch vụ' },
];

// ════════════════════════════════════════════════════
// Default Widgets
// ════════════════════════════════════════════════════
const defaultWidgets: WidgetConfig[] = [
  {
    i: 'kpi-revenue', x: 0, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tổng Doanh Thu', value: '$50.800', trend: 28.4, trendDirection: 'up' },
  },
  {
    i: 'kpi-cost', x: 2, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tổng chi phí', value: '$23.600', trend: -12.6, trendDirection: 'down' },
  },
  {
    i: 'kpi-profit', x: 4, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Lợi nhuận ròng', value: '$756', trend: 3.1, trendDirection: 'up' },
  },
  {
    i: 'kpi-growth', x: 6, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tỉ lệ tăng trưởng', value: '2.7', trend: 11.3, trendDirection: 'up' },
  },
  {
    i: 'mixed-chart', x: 0, y: 1, w: 6, h: 3,
    minW: 4, minH: 2, maxW: 8, maxH: 5,
    component: 'MixedChart',
    props: { data: mixData, title: 'Doanh thu và Kế hoạch', totalValue: '$240.000', trend: 24.6 },
  },
  {
    i: 'donut-chart', x: 6, y: 1, w: 2, h: 3,
    minW: 2, minH: 2, maxW: 4, maxH: 6,
    component: 'DonutChart',
    props: { data: donutData, title: 'Cơ cấu ngành hàng', totalValue: '150.000', size: 130, top: 3 },
  },
  {
    i: 'gauge-chart', x: 0, y: 4, w: 4, h: 3,
    minW: 3, minH: 2, maxW: 6, maxH: 5,
    component: 'GaugeChart',
    props: { data: gaugeData, title: 'Phân bổ theo Địa lý', totalValue: '23,648' },
  },
  {
    i: 'data-table', x: 4, y: 4, w: 4, h: 3,
    minW: 3, minH: 2, maxW: 8, maxH: 6,
    component: 'DataTable',
    props: { data: tableData },
  },
];

// ════════════════════════════════════════════════════
// DashboardExample
// ════════════════════════════════════════════════════
export function DashboardExample({ hideSidebar }: { hideSidebar?: boolean }) {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const handleLayoutChange = React.useCallback((updatedWidgets: WidgetConfig[]) => {
    console.log('[Dashboard] Layout changed:', updatedWidgets.map(w => ({
      id: w.i, x: w.x, y: w.y, w: w.w, h: w.h
    })));
  }, []);

  const isManager = currentUser?.role === 'manager';
  
  // RLS Widget Filtering
  const displayWidgets = React.useMemo(() => {
    return defaultWidgets.map(widget => {
      // If it's the gauge chart and user is manager, change it to DataTable for top employees
      if (widget.i === 'gauge-chart' && isManager) {
        return {
          ...widget,
          component: 'DataTable',
          props: { data: topEmployeesData, title: 'Top nhân viên xuất sắc nhất Miền' }
        };
      }
      return widget;
    });
  }, [isManager]);

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
          <div className="px-8 pt-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/50 pb-4">
            <Header title="Tổng quan Doanh nghiệp" subtitle="Cập nhật lúc: 3:17:35 PM" className="p-0 w-auto" />
          </div>
          <main className="flex-1 p-8 pt-6 pb-12 mx-auto w-full" style={{ maxWidth: 1100 }}>
            <DashboardGrid
              widgets={displayWidgets}
              registry={widgetRegistry}
              widgetTemplates={widgetTemplates}
              onLayoutChange={handleLayoutChange}
            />
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
