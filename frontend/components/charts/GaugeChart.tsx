"use client";

import React from 'react';
import { BaseChart } from './BaseChart';
import { cn, formatCompactNumber } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { NumberDisplay } from '@/components/ui/NumberDisplay';

interface GaugeChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: { label: string; value: number; color: string }[];
    title?: string;
    totalValue?: string | number;
    unit?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({ 
    data, 
    title = "Phân bổ theo Địa lý", 
    totalValue = "23,648",
    unit,
    className,
    ...props
}) => {
    // ECharts gauge for half-donut
    // Need to create a pie chart from 180 to 360 degrees, or 180 to 0.
    const calculatedTotal = totalValue !== undefined 
        ? totalValue 
        : data.reduce((acc, item) => acc + item.value, 0);

    const option = {
        tooltip: {
            trigger: 'item',
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: '#334155',
            textStyle: { color: '#f8fafc' },
            formatter: (params: any) => {
                return `${params.name}: <span style="font-weight: bold; margin-left: 8px;">${formatCompactNumber(params.value)}</span> ${unit || ''}`;
            }
        },
        series: [
            {
                name: 'Địa lý',
                type: 'pie',
                radius: ['70%', '90%'],
                center: ['50%', '75%'],
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
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
            </div>
            
            <div className="relative flex-1 min-h-[160px] w-full">
                <div className="absolute inset-0">
                    <BaseChart option={option} height="100%" transparent />
                </div>
                {/* Overlay for total in the center of the gauge */}
                <div className="absolute top-[65%] left-1/2 -translate-x-1/2 text-center">
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0">Tổng</div>
                    <NumberDisplay value={calculatedTotal} unit={unit} className="text-xl text-white font-bold" />
                </div>
            </div>

            <div className="mt-2 flex flex-col gap-1.5 flex-shrink-0">
                {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                            <span className="text-slate-400">{item.label}</span>
                        </div>
                        <NumberDisplay value={item.value} unit={unit} className="text-slate-200 font-medium" />
                    </div>
                ))}
            </div>
        </div>
    );
};
