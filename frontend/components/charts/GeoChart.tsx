import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

// 1. Import file JSON tọa độ bản đồ Việt Nam
import vietnamGeoJson from './vn-all.geo.json';

// 2. Đăng ký bản đồ với ECharts (tên 'vietnam' sẽ được gọi ở dưới)
echarts.registerMap('vietnam', vietnamGeoJson as any);

interface GeoChartProps {
    data?: { label: string; value: number }[]; // Thêm data props để tương thích với Dashboard cha
}

export const GeoChart: React.FC<GeoChartProps> = ({ data }) => {
  // Map data từ props sang dạng yêu cầu của echarts {name, value} nếu có
  const chartData = data && data.length > 0 ? data.map(item => ({ name: item.label, value: item.value })) : [
      // Dữ liệu fallback để test
      { name: 'Hà Nội', value: 800 },
      { name: 'Thành phố Hồ Chí Minh', value: 950 },
      { name: 'Đà Nẵng', value: 400 },
      { name: 'Hải Phòng', value: 300 },
  ];

  const maxVal = Math.max(...chartData.map(d => d.value), 1000);

  const option = {
    title: {
      text: 'Thống kê theo Tỉnh thành',
      left: 'center',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}', // {b} là tên tỉnh, {c} là con số
    },
    visualMap: {
      min: 0,
      max: maxVal,
      left: 'left',
      top: 'bottom',
      text: ['Cao', 'Thấp'],
      calculable: true,
      inRange: {
        color: ['#e0f3f8', '#006dd9'], // Đổ màu từ nhạt sang đậm
      },
    },
    series: [
      {
        name: 'Doanh thu',
        type: 'map',
        map: 'vietnam', // Tên này phải khớp chính xác với tên đã đăng ký ở trên
        roam: true, // Cho phép người dùng lăn chuột để zoom bản đồ
        label: {
            show: false
        },
        itemStyle: {
            areaColor: '#f1f5f9',
            borderColor: '#94a3b8'
        },
        emphasis: {
            itemStyle: {
                areaColor: '#3b82f6'
            },
            label: { show: true, color: '#fff' }
        },
        data: chartData,
      },
    ],
  };

  return <ReactECharts option={option} style={{ height: '500px', width: '100%' }} />;
};
