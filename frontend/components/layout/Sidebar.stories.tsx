import type { Meta, StoryObj } from '@storybook/react';
import { Sidebar } from './Sidebar';

const meta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
        default: 'dark',
        values: [
            { name: 'dark', value: '#0f121b' }
        ]
    }
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
  render: () => (
    <div className="h-screen w-full bg-[#0f121b] flex antialiased">
      <Sidebar />
      <div className="flex-1 p-8 text-white">
        {/* Main Content Area Preview */}
        <h1 className="text-2xl font-bold">Main Content Area</h1>
      </div>
    </div>
  )
};
