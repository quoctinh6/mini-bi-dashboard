import type { Meta, StoryObj } from '@storybook/react';
import { DonutChart, DONUT_PALETTES } from './DonutChart';

const meta = {
  title: 'Charts/DonutChart',
  component: DonutChart,
  parameters: {
    layout: 'padded',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0f121b' }
        ]
    }
  },
  tags: ['autodocs'],
  argTypes: {
    palette: {
      control: 'select',
      options: Object.keys(DONUT_PALETTES),
      description: 'Chọn bảng màu nhanh',
    },
    innerRadius: {
      control: { type: 'range', min: 0, max: 90, step: 5 },
      description: '0 = pie đặc, 60‑70 = donut chuẩn',
    },
    size: {
      control: { type: 'range', min: 120, max: 400, step: 10 },
      description: 'Kích thước SVG (px)',
    },
    top: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Số segment hiển thị riêng, còn lại gom vào "Khác"',
    },
    showPercentage: {
      control: 'boolean',
      description: 'Hiện % trên legend',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DonutChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
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

export const Default: Story = {
  args: {
    data: sampleData,
    totalValue: '150.000',
    palette: 'vivid',
    innerRadius: 60,
    size: 200,
    top: 3,
    showPercentage: true,
  },
};
