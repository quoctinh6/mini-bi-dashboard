"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { cn, formatCompactNumber } from '@/lib/utils';
import { Palette, Undo2 } from 'lucide-react';
import { NumberDisplay } from '@/components/ui/NumberDisplay';

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
    totalValue?: string | number;
    unit?: string;
    top?: number;
    palette?: PaletteName;          // chọn bảng màu nhanh
    customColors?: string[];        // hoặc truyền mảng màu tùy ý
    innerRadius?: number;           // 0‑100, default 60 (% bán kính ngoài)
    showPercentage?: boolean;
    size?: number;                  // kích thước SVG px
    isEditable?: boolean;           // cờ để quản lý màu
    onSegmentSelect?: (label: string | null) => void; // callback khi click segment
    selectedLabel?: string | null;  // nhãn đang được chọn (để highlight)
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
    unit,
    top = 3,
    palette = 'vivid',
    customColors,
    innerRadius = 60,
    showPercentage = true,
    size = 200,
    isEditable = false,
    onSegmentSelect,
    selectedLabel,
    className,
    ...props
}) => {
    // ── Lịch sử & Bảng màu nền ──
    const PALETTES: PaletteName[] = ['vivid', 'cool', 'warm', 'neon', 'pastel'];
    const [currentTheme, setCurrentTheme] = useState<PaletteName>(palette);
    
    const [history, setHistory] = useState<{ overrides: Record<string, string>, theme: PaletteName }[]>([{ overrides: {}, theme: palette }]);
    const [step, setStep] = useState(0);

    const { overrides: colorOverrides, theme: activeTheme } = history[step] || history[0];

    const pushState = (newOverrides: Record<string, string>, newTheme: PaletteName) => {
        const newHistory = history.slice(0, step + 1);
        newHistory.push({ overrides: newOverrides, theme: newTheme });
        setHistory(newHistory);
        setStep(newHistory.length - 1);
        setCurrentTheme(newTheme);
    };

    const handleColorChange = (label: string, newColor: string) => {
        pushState({ ...colorOverrides, [label]: newColor }, activeTheme);
    };

    const cyclePalette = () => {
        const nextIdx = (PALETTES.indexOf(activeTheme) + 1) % PALETTES.length;
        pushState({}, PALETTES[nextIdx]); // Khi đổi theme sẽ reset override
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

    // ── Resolve colors ──
    const colors = customColors ?? DONUT_PALETTES[activeTheme];

    // ── Gán màu cho data ──
    const coloredData = data.map((d, i) => ({
        ...d,
        color: colorOverrides[d.label] || d.color || colors[i % colors.length],
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
            className={cn('flex flex-col rounded-2xl bg-[#0e1322] p-4 shadow-sm overflow-hidden', className)}
            {...props}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h3 className="text-base font-medium text-white">{title}</h3>
                {isEditable && (
                    <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                            onClick={handleUndo} 
                            disabled={step === 0}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="Hoàn tác (Ctrl+Z)"
                        >
                            <Undo2 className="h-3.5 w-3.5" />
                        </button>
                        <button 
                            onClick={cyclePalette} 
                            className="p-1.5 text-fuchsia-400 hover:text-fuchsia-300 hover:bg-fuchsia-500/20 rounded transition-colors"
                            title="Đổi dải màu gốc"
                        >
                            <Palette className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Donut SVG */}
            <div className="relative flex-1 min-h-0 flex justify-center items-center group/svg">
                <svg
                    className="max-w-full max-h-full"
                    viewBox={`0 0 ${size} ${size}`}
                    preserveAspectRatio="xMidYMid meet"
                >
                    {segments.map((seg, i) => (
                        <path
                            key={i}
                            d={describeArc(cx, cy, outerR, innerR, seg.start, seg.end)}
                            fill={seg.color!}
                            className="transition-transform duration-200 origin-center"
                            style={{
                                transform: (hoverIdx === i || selectedLabel === seg.label) ? 'scale(1.045)' : 'scale(1)',
                                filter: (hoverIdx === i || selectedLabel === seg.label) ? 'brightness(1.25) drop-shadow(0 0 6px rgba(0,0,0,.35))' : 'none',
                                cursor: isEditable ? 'crosshair' : 'pointer',
                            }}
                            onClick={() => {
                                if (isEditable) {
                                    document.getElementById(`color-picker-donut-${seg.label}`)?.click();
                                } else if (onSegmentSelect) {
                                    // Toggle selection
                                    onSegmentSelect(selectedLabel === seg.label ? null : seg.label);
                                }
                            }}
                            onMouseMove={(e) => {
                                setTooltip({ x: e.clientX, y: e.clientY, item: { label: seg.label, value: seg.value, pct: seg.pct, color: seg.color! } });
                                setHoverIdx(i);
                            }}
                            onMouseLeave={() => { setTooltip(null); setHoverIdx(null); }}
                        />
                    ))}

                    {/* Center text */}
                    <foreignObject 
                        x={cx - outerR} 
                        y={cy - 30} 
                        width={outerR * 2} 
                        height={60}
                        style={{ pointerEvents: 'none' }}
                    >
                        <div className="flex flex-col items-center justify-center h-full w-full pointer-events-none select-none">
                            <span className={cn(
                                "text-[10px] uppercase font-bold tracking-wider transition-all duration-300",
                                tooltip ? "text-slate-400" : "text-slate-500"
                            )}>
                                {tooltip ? tooltip.item.label : "Tổng cộng"}
                            </span>
                            <div className="flex items-center justify-center gap-1.5 transition-all duration-300">
                                <NumberDisplay 
                                    value={tooltip ? tooltip.item.value : totalValue} 
                                    unit={unit} 
                                    className={cn(
                                        "transition-all duration-300 font-bold",
                                        tooltip ? "text-base text-white" : "text-sm text-slate-300"
                                    )} 
                                />
                            </div>
                            {tooltip && (
                                <div className="text-[10px] font-bold mt-0.5 animate-in fade-in slide-in-from-bottom-1 duration-300" style={{ color: tooltip.item.color }}>
                                    {((tooltip.item.value / (total || 1)) * 100).toFixed(1)}%
                                </div>
                            )}
                        </div>
                    </foreignObject>
                </svg>
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-col gap-2 px-1 flex-shrink-0 overflow-y-auto max-h-[120px]">
                {coloredData.map((item, i) => {
                    const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                    return (
                        <div
                            key={i}
                            className={cn(
                                "flex items-center justify-between transition-all duration-200 rounded-md px-1 py-0.5",
                                (hoverIdx !== null && chartData[hoverIdx]?.label === item.label) ? "bg-slate-800/50" : 
                                selectedLabel === item.label ? "bg-fuchsia-500/10 border border-fuchsia-500/20 shadow-[0_0_10px_rgba(217,70,239,0.1)]" : "hover:bg-slate-800/30"
                            )}
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                if (isEditable) {
                                    document.getElementById(`color-picker-donut-${item.label}`)?.click();
                                } else if (onSegmentSelect) {
                                    onSegmentSelect(selectedLabel === item.label ? null : item.label);
                                }
                            }}
                            onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const idx = chartData.findIndex(d => d.label === item.label);
                                setHoverIdx(idx >= 0 ? idx : null);
                                setTooltip({
                                    x: rect.right - 100,
                                    y: rect.top - 40,
                                    item: { label: item.label, value: item.value, pct: item.value / total, color: item.color! },
                                });
                            }}
                            onMouseLeave={() => {
                                setHoverIdx(null);
                                setTooltip(null);
                            }}
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full flex-shrink-0 ring-1 ring-transparent hover:ring-white transition-all shadow-[0_0_8px_rgba(255,255,255,0.2)]" style={{ backgroundColor: item.color }} />
                                <span className="text-xs text-gray-400 font-medium truncate group-hover:text-white transition-colors">{item.label}</span>
                            </div>
                            {showPercentage && (
                                <span className="text-xs font-medium text-white ml-2">{pct}%</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Hidden Color Pickers */}
            {coloredData.map((item, i) => (
                <input
                    key={`picker-${i}`}
                    id={`color-picker-donut-${item.label}`}
                    type="color"
                    className="opacity-0 absolute w-0 h-0 pointer-events-none"
                    value={item.color}
                    onChange={(e) => handleColorChange(item.label, e.target.value)}
                />
            ))}

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
                        <span className="text-sm font-bold tracking-tight">{formatCompactNumber(tooltip.item.value)}</span>
                        <span className="text-xs font-semibold" style={{ color: tooltip.item.color }}>
                            {(tooltip.item.pct * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};
