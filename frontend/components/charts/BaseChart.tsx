"use client";

import React from 'react';
import ReactECharts from 'echarts-for-react';

interface BaseChartProps {
    option: any;
    height?: string;
    onEvents?: any;
    /** When true, renders without wrapper styling (for embedding in grid cells) */
    transparent?: boolean;
}

export const BaseChart: React.FC<BaseChartProps> = ({ option, height = '400px', onEvents, transparent = false }) => {
    if (transparent) {
        return (
            <ReactECharts
                option={option}
                style={{ height, width: '100%' }}
                opts={{ renderer: 'canvas' }}
                notMerge={true}
                lazyUpdate={true}
                onEvents={onEvents}
            />
        );
    }

    return (
        <div className="bg- p-4 rounded-2xl shadow-sm border border-gray-100 w-full">
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
