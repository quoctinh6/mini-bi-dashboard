"use client";

import React from 'react';
import { BaseChart } from './BaseChart';
import { formatCompactNumber } from '@/lib/utils';

interface PieChartProps {
    data: { label: string; value: number }[];
    title?: string;
    onSliceClick?: (sliceLabel: string) => void;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title = "Tỷ trọng doanh thu", onSliceClick }) => {
    
    // Đổi tên key label -> name cho ECharts Pie
    const formattedData = data.map(item => ({
        name: item.label,
        value: item.value
    }));

    const option = {
        title: {
            text: title,
            left: 'center',
            textStyle: { color: '#333', fontSize: 16, fontWeight: '600' }
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => `${params.seriesName} <br/>${params.name} : ${formatCompactNumber(params.value)} (${params.percent}%)`
        },
        legend: {
            bottom: '0',
            left: 'center'
        },
        series: [
            {
                name: 'Doanh thu',
                type: 'pie',
                radius: ['40%', '70%'], // Donut chart
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: false,
                    position: 'center'
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: '18',
                        fontWeight: 'bold'
                    }
                },
                labelLine: {
                    show: false
                },
                data: formattedData
            }
        ]
    };

    const onEvents = {
        'click': (params: any) => {
            if (onSliceClick && params.name) {
                onSliceClick(params.name);
            }
        }
    };

    return <BaseChart option={option} height="350px" onEvents={onEvents} />;
};
