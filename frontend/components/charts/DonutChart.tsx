"use client";

import React, { useState } from 'react';
import { cn } from '@/lib/utils';

// ── Palette presets để dễ chỉnh trong Storybook controls ──
export const DONUT_PALETTES = {
    vivid:   ['#b026ff', '#0044ff', '#00e5ff', '#10b981', '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#64748b'],
    cool:    ['#6366f1', '#3b82f6', '#06b6d4', '#14b8a6', '#22c55e', '#84cc16', '#a3e635', '#67e8f9', '#818cf8', '#94a3b8'],
    warm:    ['#f43f5e', '#fb923c', '#fbbf24', '#f472b6', '#e879f9', '#c084fc', '#ef4444', '#f97316', '#eab308', '#ec4899'],
    neon:    ['#00ff87', '#00e0ff', '#ff00e5', '#ffea00', '#ff5733', '#c70039', '#00bfff', '#39ff14', '#ff6ec7', '#7df9ff'],
    pastel:  ['#a78bfa', '#93c5fd', '#6ee7b7', '#fcd34d', '#fca5a5', '#f9a8d4', '#c4b5fd', '#99f6e4', '#fdba74', '#d1d5db'],
} as const;

export type PaletteName = keyof typeof DONUT_PALETTES;

export interface DonutSegment {
    label: string;
    value: number;
    color?: string;       // màu riêng, nếu không truyền sẽ lấy từ palette
}

export interface DonutChartProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: DonutSegment[];
    title?: string;
    totalValue?: string;
    top?: number;
    palette?: PaletteName;          // chọn bảng màu nhanh
    customColors?: string[];        // hoặc truyền mảng màu tùy ý
    innerRadius?: number;           // 0‑100, default 60 (% bán kính ngoài)
    showPercentage?: boolean;
    size?: number;                  // kích thước SVG px
}

const defaultData: DonutSegment[] = [
    { label: 'Thiết bị',       value: 45000 },
    { label: 'Phần mềm',      value: 30000 },
    { label: 'Dịch vụ',       value: 22500 },
    { label: 'Đào tạo',       value: 15000 },
    { label: 'Tư vấn',        value: 12000 },
    { label: 'Bảo trì',       value: 9000  },
    { label: 'Gia công',      value: 7500  },
    { label: 'Bản quyền',     value: 4500  },
    { label: 'Quảng cáo',     value: 3000  },
    { label: 'Văn phòng phẩm', value: 1500 },
];

// ── Helpers ──
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, outerR: number, innerR: number, startAngle: number, endAngle: number) {
    const sweep = endAngle - startAngle;
    const largeArc = sweep > 180 ? 1 : 0;

    const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
    const outerEnd   = polarToCartesian(cx, cy, outerR, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerR, endAngle);
    const innerEnd   = polarToCartesian(cx, cy, innerR, startAngle);

    return [
        `M ${outerStart.x} ${outerStart.y}`,
        `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
        `L ${innerStart.x} ${innerStart.y}`,
        `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
        'Z',
    ].join(' ');
}

export const DonutChart: React.FC<DonutChartProps> = ({
    data = defaultData,
    title = 'Cơ cấu ngành hàng',
    totalValue = '150.000',
    top = 3,
    palette = 'vivid',
    customColors,
    innerRadius = 60,
    showPercentage = true,
    size = 200,
    className,
    ...props
}) => {
    // ── Resolve colors ──
    const colors = customColors ?? DONUT_PALETTES[palette];

    // ── Gán màu cho data ──
    const coloredData = data.map((d, i) => ({
        ...d,
        color: d.color ?? colors[i % colors.length],
    }));

    // ── Top N + Others ──
    const sorted = [...coloredData].sort((a, b) => b.value - a.value);
    const topItems = sorted.slice(0, top);
    const others   = sorted.slice(top);

    let chartData = [...topItems];
    if (others.length > 0) {
        chartData.push({
            label: 'Khác',
            value: others.reduce((s, d) => s + d.value, 0),
            color: '#6b7280',
        });
    }

    const total = chartData.reduce((s, d) => s + d.value, 0);

    // ── SVG geometry ──
    const cx = size / 2;
    const cy = size / 2;
    const outerR = (size / 2) - 4;                        // padding nhỏ
    const innerR = outerR * (innerRadius / 100);
    const gap    = 1.2;                                    // khoảng cách giữa các segment (độ)

    // ── Build segments ──
    let currentAngle = 0;
    const segments = chartData.map((item) => {
        const pct   = total > 0 ? item.value / total : 0;
        const sweep = pct * 360 - gap;
        const start = currentAngle + gap / 2;
        const end   = start + Math.max(sweep, 0.5);       // tránh sweep ≤ 0
        currentAngle += pct * 360;
        return { ...item, pct, start, end };
    });

    // ── Tooltip state ──
    const [tooltip, setTooltip] = useState<{
        x: number; y: number;
        item: { label: string; value: number; pct: number; color: string };
    } | null>(null);

    const [hoverIdx, setHoverIdx] = useState<number | null>(null);

    return (
        <div
            className={cn('flex flex-col rounded-2xl bg-[#0e1322] p-6 shadow-sm overflow-hidden', className)}
            style={{ width: size + 150 }}
            {...props}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-medium text-white">{title}</h3>
            </div>

            {/* Donut SVG */}
            <div className="relative flex justify-center items-center">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {segments.map((seg, i) => (
                        <path
                            key={i}
                            d={describeArc(cx, cy, outerR, innerR, seg.start, seg.end)}
                            fill={seg.color!}
                            className="transition-transform duration-200 origin-center"
                            style={{
                                transform: hoverIdx === i ? 'scale(1.045)' : 'scale(1)',
                                filter: hoverIdx === i ? 'brightness(1.25) drop-shadow(0 0 6px rgba(0,0,0,.35))' : 'none',
                                cursor: 'pointer',
                            }}
                            onMouseMove={(e) => {
                                setTooltip({ x: e.clientX, y: e.clientY, item: { label: seg.label, value: seg.value, pct: seg.pct, color: seg.color! } });
                                setHoverIdx(i);
                            }}
                            onMouseLeave={() => { setTooltip(null); setHoverIdx(null); }}
                        />
                    ))}

                    {/* Center text */}
                    <text x={cx} y={cy - 6} textAnchor="middle" className="fill-gray-400 text-[10px] font-medium">
                        Tổng
                    </text>
                    <text x={cx} y={cy + 12} textAnchor="middle" className="fill-white text-sm font-bold">
                        {totalValue}
                    </text>
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-col gap-3 px-1">
                {coloredData.map((item, i) => {
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={i}
                            className="flex items-center justify-between cursor-default transition-opacity hover:opacity-80"
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setTooltip({
                                    x: rect.right - 100,
                                    y: rect.top - 40,
                                    item: { label: item.label, value: item.value, pct: item.value / total, color: item.color! },
                                });
                            }}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <div className="flex items-center gap-3">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-gray-400 font-medium">{item.label}</span>
                            </div>
                            {showPercentage && (
                                <span className="text-sm font-medium text-white">{pct}%</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className="fixed z-50 pointer-events-none bg-[#1e293b] border border-slate-700 text-white px-3 py-2 rounded shadow-2xl animate-in fade-in zoom-in-95 duration-100"
                    style={{ left: tooltip.x + 15, top: tooltip.y - 15 }}
                >
                    <div className="flex items-center gap-2 mb-1">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tooltip.item.color }} />
                        <span className="text-xs text-gray-300 font-medium">{tooltip.item.label}</span>
                    </div>
                    <div className="flex items-end justify-between gap-4 mt-1">
                        <span className="text-sm font-bold tracking-tight">{tooltip.item.value.toLocaleString()}</span>
                        <span className="text-xs font-semibold" style={{ color: tooltip.item.color }}>
                            {(tooltip.item.pct * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
