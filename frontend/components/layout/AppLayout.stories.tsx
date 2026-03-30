import type { Meta, StoryObj } from '@storybook/react';
import { AppLayout } from './AppLayout';

// AppLayout already includes AuthProvider internally
const meta = {
  title: 'Pages/App',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AppLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
