"use client";

import React from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Calendar } from 'lucide-react';

interface MixedChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: { month: string; actual: number; target: number }[];
    title?: string;
    totalValue?: string;
    trend?: number;
}

export const MixedChart: React.FC<MixedChartProps> = ({ 
    data, 
    title = "Doanh thu và Kế hoạch", 
    totalValue = "$240.000",
    trend = 24.6,
    className,
    ...props
}) => {
    const xAxisData = data.map(item => item.month);
    const actualData = data.map(item => item.actual);
    const targetData = data.map(item => item.target);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross', label: { backgroundColor: '#1e293b' } },
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f8fafc' }
        },
        legend: {
            data: ['Thực tế', 'Kế hoạch'],
            top: 0,
            itemWidth: 8,
            itemHeight: 8,
            icon: 'circle',
            textStyle: { color: '#94a3b8' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            top: '40px',
            containLabel: true
        },
        xAxis: [
            {
                type: 'category',
                data: xAxisData,
                axisPointer: { type: 'shadow' },
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#94a3b8', margin: 16 }
            }
        ],
        yAxis: [
            {
                type: 'value',
                min: 0,
                max: 15000,
                interval: 2500,
                axisLabel: { color: '#94a3b8' },
                splitLine: { lineStyle: { color: '#1e293b', type: 'dashed' } }
            }
        ],
        series: [
            {
                name: 'Thực tế',
                type: 'bar',
                data: actualData,
                barWidth: '40%',
                itemStyle: { color: '#d946ef', borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'Kế hoạch',
                type: 'line',
                data: targetData,
                itemStyle: { color: '#06b6d4' },
                lineStyle: { width: 2 },
                smooth: true,
                symbolSize: 6,
                symbol: 'circle'
            }
        ]
    };

    return (
        <div className={cn("flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm", className)} {...props}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">{title}</h3>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{totalValue}</span>
                        {trend && (
                            <Badge variant="success" className="h-5 px-1.5 py-0 font-medium">
                                {trend}% ↗
                            </Badge>
                        )}
                    </div>
                </div>
                
                <Select icon={<Calendar className="h-3 w-3" />} className="h-8 text-xs bg-slate-800 border-none w-[160px] py-1 px-2 pr-6">
                    <option>1/2025 - 12/2025</option>
                    <option>1/2024 - 12/2024</option>
                </Select>
            </div>
            
            <div className="relative w-full h-[300px]">
                {/* Wrap in absolute to prevent layout jumps with ReactEcharts */}
                <div className="absolute inset-0">
                    <BaseChart option={option} height="100%" />
                </div>
            </div>
        </div>
    );
};
