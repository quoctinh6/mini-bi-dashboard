"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Calendar, Palette, Undo2 } from 'lucide-react';

interface MixedChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data: { month: string; actual: number; target: number }[];
    title?: string;
    totalValue?: string;
    trend?: number;
    isEditable?: boolean;
}

const MIXED_PALETTES = [
    { name: 'default', actual: '#d946ef', target: '#06b6d4' },
    { name: 'ocean', actual: '#3b82f6', target: '#10b981' },
    { name: 'sunset', actual: '#f97316', target: '#eab308' },
    { name: 'berry', actual: '#ec4899', target: '#8b5cf6' },
    { name: 'forest', actual: '#22c55e', target: '#14b8a6' },
];

export const MixedChart: React.FC<MixedChartProps> = ({ 
    data, 
    title = "Doanh thu và Kế hoạch", 
    totalValue = "$240.000",
    trend = 24.6,
    isEditable = false,
    className,
    ...props
}) => {
    // ── Lịch sử & Palette ──
    const [history, setHistory] = useState<{ overrides: Record<string, string>, themeIdx: number }[]>([{ overrides: {}, themeIdx: 0 }]);
    const [step, setStep] = useState(0);

    const { overrides: colorOverrides, themeIdx: activeThemeIdx } = history[step] || history[0];
    const currentTheme = MIXED_PALETTES[activeThemeIdx];

    const pushState = (newOverrides: Record<string, string>, newThemeIdx: number) => {
        const newHistory = history.slice(0, step + 1);
        newHistory.push({ overrides: newOverrides, themeIdx: newThemeIdx });
        setHistory(newHistory);
        setStep(newHistory.length - 1);
    };

    const handleColorChange = (seriesName: string, newColor: string) => {
        pushState({ ...colorOverrides, [seriesName]: newColor }, activeThemeIdx);
    };

    const cyclePalette = () => {
        const nextIdx = (activeThemeIdx + 1) % MIXED_PALETTES.length;
        pushState({}, nextIdx);
    };

    const handleUndo = useCallback(() => {
        if (!isEditable) return;
        setStep(prev => Math.max(0, prev - 1));
    }, [isEditable]);

    // Lắng nghe Ctrl+Z
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                handleUndo();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [handleUndo]);

    const actualColor = colorOverrides['Thực tế'] || currentTheme.actual;
    const targetColor = colorOverrides['Kế hoạch'] || currentTheme.target;

    const xAxisData = data.map(item => item.month);
    const actualData = data.map(item => item.actual);
    const targetData = data.map(item => item.target);

    const onEvents = {
        click: (params: any) => {
            if (isEditable && params.seriesName) {
                document.getElementById(`color-picker-mixed-${params.seriesName}`)?.click();
            }
        }
    };

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
                itemStyle: { color: actualColor, borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'Kế hoạch',
                type: 'line',
                data: targetData,
                itemStyle: { color: targetColor },
                lineStyle: { width: 2 },
                smooth: true,
                symbolSize: 6,
                symbol: 'circle'
            }
        ]
    };

    return (
        <div className={cn("flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm", className)} {...props}>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 relative group/header">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
                        {isEditable && (
                            <div className="flex items-center opacity-0 group-hover/header:opacity-100 transition-opacity">
                                <button 
                                    onClick={handleUndo} 
                                    disabled={step === 0}
                                    className="p-1 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                                    title="Hoàn tác (Ctrl+Z)"
                                >
                                    <Undo2 className="h-3.5 w-3.5" />
                                </button>
                                <button 
                                    onClick={cyclePalette} 
                                    className="p-1 text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/20 rounded transition-colors"
                                    title="Đổi dải màu gốc"
                                >
                                    <Palette className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
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
            
            <div className={cn("relative flex-1 min-h-0 w-full", isEditable && "cursor-crosshair")}>
                <div className="absolute inset-0">
                    <BaseChart option={option} height="100%" transparent onEvents={onEvents} />
                </div>
            </div>

            {/* Hidden Color Pickers */}
            <input
                id="color-picker-mixed-Thực tế"
                type="color"
                className="opacity-0 absolute w-0 h-0 pointer-events-none"
                value={actualColor}
                onChange={(e) => handleColorChange('Thực tế', e.target.value)}
            />
            <input
                id="color-picker-mixed-Kế hoạch"
                type="color"
                className="opacity-0 absolute w-0 h-0 pointer-events-none"
                value={targetColor}
                onChange={(e) => handleColorChange('Kế hoạch', e.target.value)}
            />
        </div>
    );
};
