import type { Meta, StoryObj } from '@storybook/react';
import { DashboardExample } from './DashboardExample';

const meta = {
  title: 'Pages/Dashboard',
  component: DashboardExample,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof DashboardExample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Complete: Story = {};
