"use client";

import React from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface GaugeChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: { label: string; value: number; color: string }[];
    title?: string;
    totalValue?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
    data, 
    title = "Phân bổ theo Địa lý", 
    totalValue = "23,648",
    className,
    ...props
}) => {
    // ECharts gauge for half-donut
    // Need to create a pie chart from 180 to 360 degrees, or 180 to 0.
    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f8fafc' }
        },
        series: [
            {
                name: 'Địa lý',
                type: 'pie',
                radius: ['70%', '90%'],
                center: ['50%', '70%'],
                // startAngle: 180, endAngle: 0
                startAngle: 180,
                endAngle: 0,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#0f121b',
                    borderWidth: 2
                },
                label: {
                    show: false
                },
                labelLine: { show: false },
                data: [
                    ...data.map(dim => ({
                        value: dim.value,
                        name: dim.label,
                        itemStyle: { color: dim.color }
                    }))
                ]
            }
        ]
    };

    return (
        <div className={cn("flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm", className)} {...props}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            </div>
            
            <div className="relative flex-1 min-h-0 w-full">
                <div className="absolute inset-0">
                    <BaseChart option={option} height="100%" transparent />
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 flex-shrink-0">
                <div className="text-base font-bold text-white mb-1">
                    Tổng: {totalValue}
                </div>
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-300">{item.label}</span>
                        </div>
                        <span className="font-medium text-slate-200">{item.value.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
