import type { Meta, StoryObj } from '@storybook/react';
import { GeoChart } from './GeoChart';

const meta: Meta<typeof GeoChart> = {
  title: 'Components/Charts/GeoChart',
  component: GeoChart,
  tags: ['autodocs'],
  argTypes: {
    data: {
      description: 'Dữ liệu số lượng (doanh thu/đơn hàng) của từng vùng/tỉnh thành. Sửa mảng JSON này để thay đổi giá trị.',
      control: 'object',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Bản đồ nhiệt (Heatmap) thể hiện tổng quan kinh doanh theo Tỉnh/vùng miền (Province/Zone).',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof GeoChart>;

export const Default: Story = {
  args: {
    data: [
      { label: 'Hà Nội', value: 80000000 },
      { label: 'Thành phố Hồ Chí Minh', value: 95000000 },
      { label: 'Đà Nẵng', value: 40000000 },
      { label: 'Hải Phòng', value: 30000000 },
      { label: 'Thanh Hóa', value: 15000000 },
      { label: 'Nghệ An', value: 12000000 },
      { label: 'Đồng Nai', value: 60000000 },
      { label: 'Bình Dương', value: 50000000 },
      { label: 'Cần Thơ', value: 25000000 },
      { label: 'Lào Cai', value: 5000000 },
      { label: 'Lâm Đồng', value: 20000000 },
    ],
  },
};

export const FallbackData: Story = {
  args: {
    data: [],
  },
};
