"use client";

import React from 'react';
import { BaseChart } from './BaseChart';

interface MixedChartProps {
    data: { label: string; value: number }[];
    title?: string;
    color?: string; // Hỗ trợ color picker tùy biến
}

export const MixedChart: React.FC<MixedChartProps> = ({ data, title = "Biểu đồ Doanh thu (Bar + Line)", color = '#4f46e5' }) => {
    
    const xAxisData = data.map(item => item.label);
    const seriesData = data.map(item => item.value);

    // Dữ liệu giả định cho Line (ví dụ: Số lượng đơn hàng hoặc Lợi nhuận) để mix
    // Thực tế sẽ lấy từ API
    const lineSeriesData = seriesData.map(val => val * 0.2); 

    const option = {
        title: {
            text: title,
            left: 'center',
            textStyle: {
                color: '#333',
                fontSize: 16,
                fontWeight: '600'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        legend: {
            data: ['Doanh thu', 'Lợi nhuận'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xAxisData,
                axisPointer: { type: 'shadow' }
            }
        ],
        yAxis: [
            {
                type: 'value',
                name: 'Doanh thu (VNĐ)',
                axisLabel: { formatter: '{value}' }
            },
            {
                type: 'value',
                name: 'Lợi nhuận',
                axisLabel: { formatter: '{value}' }
            }
        ],
        series: [
            {
                name: 'Doanh thu',
                type: 'bar',
                data: seriesData,
                itemStyle: { color: color, borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'Lợi nhuận',
                type: 'line',
                yAxisIndex: 1, // Dùng trục Y thứ 2
                data: lineSeriesData,
                itemStyle: { color: '#f59e0b' },
                smooth: true,
                symbolSize: 8
            }
        ]
    };

    return <BaseChart option={option} height="400px" />;
};
