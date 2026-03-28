import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from './Badge';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const meta = {
  title: 'UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'default',
  },
};

export const PositiveChange: Story = {
  args: {
    children: (
      <>
        28.4% <ArrowUpRight className="ml-1 h-3 w-3" />
      </>
    ),
    variant: 'success',
  },
};

export const NegativeChange: Story = {
  args: {
    children: (
      <>
        -12.6% <ArrowDownRight className="ml-1 h-3 w-3" />
      </>
    ),
    variant: 'destructive',
  },
};

export const StatusHigh: Story = {
  args: {
    children: '• Cao',
    variant: 'success',
  },
};

export const StatusLow: Story = {
  args: {
    children: '• Thấp',
    variant: 'destructive',
  },
};
