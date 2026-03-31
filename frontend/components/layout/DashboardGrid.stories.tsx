import type { Meta, StoryObj } from '@storybook/react';
import { DashboardGrid, WidgetConfig, WidgetRegistry, WidgetTemplate } from './DashboardGrid';
import { KPICard } from '@/components/data/KPICard';
import { MixedChart } from '@/components/charts/MixedChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { DataTable } from '@/components/data/DataTable';

const testRegistry: WidgetRegistry = { 
  KPICard,
  MixedChart,
  DonutChart,
  GaugeChart,
  DataTable
};

const testWidgets: WidgetConfig[] = [
  { i: 'kpi-1', x: 0, y: 0, w: 2, h: 1, minW: 2, minH: 1, component: 'KPICard', props: { title: 'Metric A', value: '$1.000', trend: 10, trendDirection: 'up' } },
  { i: 'kpi-2', x: 2, y: 0, w: 2, h: 1, minW: 2, minH: 1, component: 'KPICard', props: { title: 'Metric B', value: '$2.000', trend: -5, trendDirection: 'down' } },
  { i: 'kpi-3', x: 4, y: 0, w: 4, h: 1, minW: 2, minH: 1, component: 'KPICard', props: { title: 'Metric C', value: '$3.000', trend: 15, trendDirection: 'up' } },
];

const testTemplates: WidgetTemplate[] = [
  {
    component: 'KPICard', label: 'Thẻ KPI', category: 'kpi',
    defaultW: 2, defaultH: 1, minW: 2, minH: 1, maxW: 4, maxH: 2,
    defaultProps: { title: 'KPI mới', value: '$0', trend: 0, trendDirection: 'up' },
  },
  {
    component: 'MixedChart', label: 'Biểu đồ Kết hợp', category: 'chart',
    defaultW: 4, defaultH: 3, minW: 3, minH: 2,
    defaultProps: { title: 'Doanh thu & Mục tiêu', data: [], totalValue: '0' },
  },
  {
    component: 'DonutChart', label: 'Biểu đồ Tròn', category: 'chart',
    defaultW: 2, defaultH: 3, minW: 2, minH: 2,
    defaultProps: { title: 'Cơ cấu', data: [], totalValue: '0' },
  },
  {
    component: 'GaugeChart', label: 'Biểu đồ Tốc độ', category: 'chart',
    defaultW: 4, defaultH: 3, minW: 3, minH: 2,
    defaultProps: { title: 'Hiệu suất Miền', data: [], totalValue: '0' },
  },
  {
    component: 'DataTable', label: 'Bảng Dữ liệu', category: 'data',
    defaultW: 4, defaultH: 3, minW: 3, minH: 2,
    defaultProps: { title: 'Danh sách chi tiết', data: [], columns: [] },
  },
];

const meta = {
  title: 'Layout/DashboardGrid',
  component: DashboardGrid,
  parameters: { layout: 'padded', backgrounds: { default: 'dashboard' } },
  decorators: [
    (Story) => (
      <div className="bg-[#0f121b] p-8 min-h-screen text-slate-200" style={{ width: 1100 }}>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    editable: { control: 'boolean', description: 'Bật/tắt chế độ chỉnh sửa' },
  },
} satisfies Meta<typeof DashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { 
    widgets: testWidgets, 
    registry: testRegistry, 
    widgetTemplates: testTemplates, 
    editable: false 
  },
};

export const EditMode: Story = {
  args: { 
    widgets: testWidgets, 
    registry: testRegistry, 
    widgetTemplates: testTemplates, 
    editable: true 
  },
};
