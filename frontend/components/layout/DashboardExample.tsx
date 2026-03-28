import * as React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardGrid, WidgetConfig, WidgetRegistry } from './DashboardGrid';
import { KPICard } from '@/components/data/KPICard';
import { MixedChart } from '@/components/charts/MixedChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/data/DataTable';

// ════════════════════════════════════════════════════
// Widget Registry — đăng ký tất cả component có thể dùng
// ════════════════════════════════════════════════════
const widgetRegistry: WidgetRegistry = {
  KPICard,
  MixedChart,
  DonutChart,
  GaugeChart,
  DataTable,
};

// ════════════════════════════════════════════════════
// Default Data — dữ liệu mẫu cho từng widget
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
  { month: 'Dec', actual: 6000, target: 6800 }
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
// Default Widget Layout — cấu hình vị trí & kích thước
// ════════════════════════════════════════════════════
/**
 * Lưới 8 cột × 125px, mỗi hàng 100px:
 *
 * ┌──┬──┬──┬──┬──┬──┬──┬──┐
 * │KPI1│KPI2│KPI3│KPI4│  Row 0 (h=1)
 * ├──┴──┴──┴──┴──┼──┴──┴──┤
 * │  MixedChart   │ Donut  │  Row 1-3 (h=3)
 * │  (w=6)        │ (w=2)  │
 * ├──┬──┬──┬──┬──┼──┬──┬──┤
 * │ GaugeChart │ DataTable │  Row 4-6 (h=3)
 * │   (w=4)    │   (w=4)  │
 * └──┴──┴──┴──┴──┴──┴──┴──┘
 */
const defaultWidgets: WidgetConfig[] = [
  // ── Row 0: KPI Cards (mỗi cái w=2, h=1) ──
  {
    i: 'kpi-revenue',
    x: 0, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tổng Doanh Thu', value: '$50.800', trend: 28.4, trendDirection: 'up' },
  },
  {
    i: 'kpi-cost',
    x: 2, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tổng chi phí', value: '$23.600', trend: -12.6, trendDirection: 'down' },
  },
  {
    i: 'kpi-profit',
    x: 4, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Lợi nhuận ròng', value: '$756', trend: 3.1, trendDirection: 'up' },
  },
  {
    i: 'kpi-growth',
    x: 6, y: 0, w: 2, h: 1,
    minW: 2, minH: 1, maxW: 4, maxH: 2,
    component: 'KPICard',
    props: { title: 'Tỉ lệ tăng trưởng', value: '2.7', trend: 11.3, trendDirection: 'up' },
  },

  // ── Row 1-3: MixedChart (w=6, h=3) + DonutChart (w=2, h=3) ──
  {
    i: 'mixed-chart',
    x: 0, y: 1, w: 6, h: 3,
    minW: 4, minH: 2, maxW: 8, maxH: 5,
    component: 'MixedChart',
    props: {
      data: mixData,
      title: 'Doanh thu và Kế hoạch',
      totalValue: '$240.000',
      trend: 24.6,
    },
  },
  {
    i: 'donut-chart',
    x: 6, y: 1, w: 2, h: 3,
    minW: 2, minH: 2, maxW: 4, maxH: 6,
    component: 'DonutChart',
    props: {
      data: donutData,
      title: 'Cơ cấu ngành hàng',
      totalValue: '150.000',
      size: 130,
      top: 3,
    },
  },

  // ── Row 4-6: GaugeChart (w=4, h=3) + DataTable (w=4, h=3) ──
  {
    i: 'gauge-chart',
    x: 0, y: 4, w: 4, h: 3,
    minW: 3, minH: 2, maxW: 6, maxH: 5,
    component: 'GaugeChart',
    props: {
      data: gaugeData,
      title: 'Phân bổ theo Địa lý',
      totalValue: '23,648',
    },
  },
  {
    i: 'data-table',
    x: 4, y: 4, w: 4, h: 3,
    minW: 3, minH: 2, maxW: 8, maxH: 6,
    component: 'DataTable',
    props: {
      data: tableData,
    },
  },
];

// ════════════════════════════════════════════════════
// DashboardExample — Trang Dashboard chính
// ════════════════════════════════════════════════════

export function DashboardExample() {
  const handleLayoutChange = React.useCallback((updatedWidgets: WidgetConfig[]) => {
    // Sau này lưu vào backend: POST /api/dashboard-config
    console.log('[Dashboard] Layout changed:', updatedWidgets.map(w => ({
      id: w.i, x: w.x, y: w.y, w: w.w, h: w.h
    })));
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#0f121b] text-slate-200 overflow-hidden font-sans">
      <Sidebar className="hidden md:flex shrink-0 z-10" />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header 
          title="Tổng quan Doanh nghiệp" 
          subtitle="Cập nhật lúc: 3:17:35 PM" 
        />

        <main className="flex-1 p-8 pt-4 pb-12 mx-auto w-full" style={{ maxWidth: 1100 }}>
          <DashboardGrid
            widgets={defaultWidgets}
            registry={widgetRegistry}
            onLayoutChange={handleLayoutChange}
          />
        </main>
      </div>
    </div>
  );
}
