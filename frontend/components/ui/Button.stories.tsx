import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Download, Plus } from 'lucide-react';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

export const PrimaryAction: Story = {
  args: {
    children: (
      <>
        Tạo báo cáo
      </>
    ),
    variant: 'default',
  },
};

export const SecondaryExport: Story = {
  args: {
    children: (
      <>
        Xuất PDF <Download className="ml-2 h-4 w-4" />
      </>
    ),
    variant: 'secondary',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};
