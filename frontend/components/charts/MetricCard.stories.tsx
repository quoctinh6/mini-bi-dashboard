import type { Meta, StoryObj } from '@storybook/react';
import { MetricCard } from './MetricCard';

const meta: Meta<typeof MetricCard> = {
  title: 'Components/Charts/MetricCard',
  component: MetricCard,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MetricCard>;

export const Default: Story = {
  args: {
    title: 'Tổng doanh thu',
    value: 50000000,
  },
};

export const PositiveGrowth: Story = {
  args: {
    title: 'Người dùng mới',
    value: 1250,
    growthRate: 15,
    isPositive: true,
    target: 123
  },
};

export const NegativeGrowth: Story = {
  args: {
    title: 'Tỉ lệ thoát',
    value: '45%',
    growthRate: 5,
    isPositive: false,
  },
};

export const WarningState: Story = {
  args: {
    title: 'Doanh số KPI',
    value: 20000,
    target: 50000,
  },
};
