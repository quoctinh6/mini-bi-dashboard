"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface BaseChartProps {
    option: any;
    height?: string;
    onEvents?: any;
}

export const BaseChart: React.FC<BaseChartProps> = ({ option, height = '400px', onEvents }) => {
    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-full">
            <ReactECharts
                option={option}
                style={{ height, width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
                lazyUpdate={true}
                onEvents={onEvents}
            />
        </div>
    );
};
