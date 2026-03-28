import type { Meta, StoryObj } from '@storybook/react';
import { KPICard } from './KPICard';

const meta = {
  title: 'Data/KPICard',
  component: KPICard,
  parameters: {
    layout: 'centered',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0f121b' }
        ]
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof KPICard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PositiveTrend: Story = {
  args: {
    title: 'Tổng Doanh Thu',
    value: '$50.800',
    trend: 28.4,
  },
};

export const NegativeTrend: Story = {
  args: {
    title: 'Tổng chi phí',
    value: '$23.600',
    trend: -12.6,
  },
};

export const MultipleCardsPreview: Story = {
    render: () => (
      <div className="flex gap-4 w-[800px]">
        <KPICard title="Tổng Doanh Thu" value="$50.800" trend={28.4} className="flex-1" />
        <KPICard title="Tổng chi phí" value="$23.600" trend={-12.6} className="flex-1" />
        <KPICard title="Lợi nhuận ròng" value="$756" trend={3.1} className="flex-1" />
        <KPICard title="Tỉ lệ tăng trưởng" value="2.7" trend={11.3} className="flex-1" />
      </div>
    )
  };
