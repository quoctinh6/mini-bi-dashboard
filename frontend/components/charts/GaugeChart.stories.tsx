import type { Meta, StoryObj } from '@storybook/react';
import { GaugeChart } from './GaugeChart';

const meta = {
  title: 'Charts/GaugeChart',
  component: GaugeChart,
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
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof GaugeChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { label: 'Miền Bắc', value: 15624, color: '#d946ef' },
  { label: 'Miền Trung', value: 5546, color: '#3b82f6' },
  { label: 'Miền Nam', value: 2478, color: '#0ea5e9' },
];

export const Default: Story = {
  args: {
    data: sampleData,
    totalValue: "23,648"
  },
};
