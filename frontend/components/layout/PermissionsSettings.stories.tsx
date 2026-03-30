import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PermissionsSettings } from './PermissionsSettings';
import { AuthProvider } from '@/lib/AuthContext';

const meta = {
  title: 'Pages/PermissionsSettings',
  component: PermissionsSettings,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full flex bg-[#0f121b]">
        <AuthProvider>
          <Story />
        </AuthProvider>
      </div>
    ),
  ],
} satisfies Meta<typeof PermissionsSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
