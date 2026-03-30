import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Forbidden403Page } from './Forbidden403Page';
import { AuthProvider } from '@/lib/AuthContext';

const meta = {
  title: 'Pages/Error 403',
  component: Forbidden403Page,
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
} satisfies Meta<typeof Forbidden403Page>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    onGoHome: () => console.log('Go Home clicked'),
  },
};
