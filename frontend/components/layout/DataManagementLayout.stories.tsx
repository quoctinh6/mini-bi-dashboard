import type { Meta, StoryObj } from '@storybook/react';
import { DataManagementLayout } from './DataManagementLayout';

const meta = {
  title: 'Pages/DataManagement',
  component: DataManagementLayout,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DataManagementLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
