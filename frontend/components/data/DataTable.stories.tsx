import type { Meta, StoryObj } from '@storybook/react';
import { DataTable, NotificationRecord } from './DataTable';

const meta = {
  title: 'Data/DataTable',
  component: DataTable,
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
      <div className="w-[600px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DataTable>;

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData: NotificationRecord[] = [
  { id: '#1532', date: 'Dec 30, 10:06 AM', performance: 'Cao', topic: 'Phần mềm' },
  { id: '#1531', date: 'Dec 29, 2:59 AM', performance: 'Thấp', topic: 'Miền Nam' },
  { id: '#1530', date: 'Dec 29, 12:54 AM', performance: 'Thấp', topic: 'Miền Trung' },
  { id: '#1529', date: 'Dec 28, 2:32 PM', performance: 'Cao', topic: 'Thiết bị' },
  { id: '#1528', date: 'Dec 27, 2:20 PM', performance: 'Thấp', topic: 'Miền Bắc' },
  { id: '#1527', date: 'Dec 26, 9:48 AM', performance: 'Cao', topic: 'Dịch vụ' },
];

export const Default: Story = {
  args: {
    data: sampleData,
  },
};
