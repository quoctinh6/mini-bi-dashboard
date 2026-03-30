import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '@/lib/AuthContext';

const meta = {
  title: 'Pages/Login',
  component: LoginPage,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <Story />
      </AuthProvider>
    ),
  ],
} satisfies Meta<typeof LoginPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
