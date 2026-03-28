import type { Meta, StoryObj } from '@storybook/react';
import { Select } from './Select';
import { Calendar } from 'lucide-react';

const meta = {
  title: 'UI/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    icon: {
      control: false,
    },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <option>Tùy chọn 1</option>
        <option>Tùy chọn 2</option>
      </>
    ),
  },
};

export const WithDateIcon: Story = {
  args: {
    icon: <Calendar className="h-4 w-4" />,
    children: (
      <>
        <option>1/2025 - 12/2025</option>
        <option>1/2024 - 12/2024</option>
      </>
    ),
  },
};

export const SmallDateFilter: Story = {
    args: {
      icon: <Calendar className="h-3 w-3" />,
      className: "h-8 text-xs bg-slate-800/50",
      children: (
        <>
          <option>Jan 2024</option>
          <option>Feb 2024</option>
        </>
      ),
    },
  };
