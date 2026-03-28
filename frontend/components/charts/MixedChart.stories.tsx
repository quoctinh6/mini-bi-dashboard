import type { Meta, StoryObj } from '@storybook/react';
import { MixedChart } from './MixedChart';

const meta = {
  title: 'Charts/MixedChart',
  component: MixedChart,
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
      <div className="max-w-4xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MixedChart>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  { month: 'Jan', actual: 2500, target: 4000 },
  { month: 'Feb', actual: 3800, target: 3500 },
  { month: 'Mar', actual: 4800, target: 2000 },
  { month: 'Apr', actual: 6000, target: 4500 },
  { month: 'May', actual: 3500, target: 5800 },
  { month: 'Jun', actual: 7500, target: 6300 },
  { month: 'Jul', actual: 6500, target: 6800 },
  { month: 'Aug', actual: 9500, target: 10200 },
  { month: 'Sep', actual: 12500, target: 11000 },
  { month: 'Oct', actual: 8500, target: 9200 },
  { month: 'Nov', actual: 7500, target: 6500 },
  { month: 'Dec', actual: 6000, target: 6800 }
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};
