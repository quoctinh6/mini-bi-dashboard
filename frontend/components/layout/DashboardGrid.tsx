"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import { cn } from '@/lib/utils';
import {
  Lock, Unlock, RotateCcw, GripVertical, Maximize2, Minimize2,
  Plus, X, BarChart3, PieChart, Gauge, Table2, TrendingUp,
  Save, Bookmark, Layers, Trash2, Bot, Package,
} from 'lucide-react';
import { AIChatPanel } from './AIChatPanel';

// ── CSS imports cho react-grid-layout ──
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ReactGridLayout = WidthProvider(RGL);

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

export interface WidgetConfig {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  component: string;
  props: Record<string, any>;
  static?: boolean;
}

export type WidgetRegistry = Record<string, React.ComponentType<any>>;

export interface WidgetTemplate {
  component: string;
  label: string;
  description?: string;
  category: string;
  defaultW: number;
  defaultH: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
  defaultProps: Record<string, any>;
}

export interface WidgetCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
}

export interface SavedLayout {
  id: string;
  name: string;
  widgets: WidgetConfig[];
  isDefault?: boolean;
  timestamp: number;
}

// ════════════════════════════════════════════════════
// Grid Constants
// ════════════════════════════════════════════════════
export const GRID_COLS = 8;
export const GRID_ROW_HEIGHT = 100;
export const GRID_MARGIN: [number, number] = [12, 12];
const STORAGE_KEY = 'kernel404-dashboard-layouts';

// ════════════════════════════════════════════════════
// Default Categories
// ════════════════════════════════════════════════════
const DEFAULT_CATEGORIES: WidgetCategory[] = [
  { id: 'all',   label: 'Tất cả',   icon: <Layers className="h-3.5 w-3.5" /> },
  { id: 'kpi',   label: 'KPI',      icon: <TrendingUp className="h-3.5 w-3.5" /> },
  { id: 'chart', label: 'Biểu đồ',  icon: <BarChart3 className="h-3.5 w-3.5" /> },
  { id: 'data',  label: 'Dữ liệu',  icon: <Table2 className="h-3.5 w-3.5" /> },
];

// ════════════════════════════════════════════════════
// Mini Previews — hình thu nhỏ mỗi loại widget
// ════════════════════════════════════════════════════
function MiniPreview({ component }: { component: string }) {
  switch (component) {
    case 'KPICard':
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex flex-col justify-between border border-slate-700/30">
          <div className="text-[7px] text-slate-500 font-medium">Tổng Doanh Thu</div>
          <div className="text-xs font-bold text-white tracking-tight">$50.8K</div>
          <div className="flex items-center gap-1">
            <span className="text-[7px] font-semibold text-emerald-400 bg-emerald-500/10 px-1 rounded">↑ 28.4%</span>
          </div>
        </div>
      );
    case 'MixedChart':
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex flex-col border border-slate-700/30">
          <div className="text-[7px] text-slate-500 font-medium mb-1">Doanh thu & KH</div>
          <div className="flex-1 flex items-end gap-[2px] pb-0.5">
            {[35, 55, 40, 75, 50, 65, 85, 55, 70, 45, 60, 50].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `linear-gradient(to top, rgba(217,70,239,0.7), rgba(217,70,239,0.3))` }} />
            ))}
          </div>
          <svg className="w-full h-3 -mt-3" viewBox="0 0 100 12" preserveAspectRatio="none">
            <polyline fill="none" stroke="#06b6d4" strokeWidth="1.5" points="0,10 8,7 16,8 25,5 33,6 42,4 50,4.5 58,2 67,1 75,3 83,4 92,3.5" />
          </svg>
        </div>
      );
    case 'DonutChart':
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex flex-col items-center justify-center border border-slate-700/30">
          <svg viewBox="0 0 36 36" className="h-10 w-10">
            <circle cx="18" cy="18" r="13" fill="none" stroke="#7c3aed" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="0" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#3b82f6" strokeWidth="5" strokeDasharray="22 78" strokeDashoffset="-30" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#06b6d4" strokeWidth="5" strokeDasharray="18 82" strokeDashoffset="-52" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#6b7280" strokeWidth="5" strokeDasharray="30 70" strokeDashoffset="-70" />
            <text x="18" y="19" textAnchor="middle" className="fill-white" fontSize="5" fontWeight="bold">150K</text>
          </svg>
          <div className="flex gap-1 mt-1">
            <span className="h-1 w-1 rounded-full bg-violet-500" /><span className="h-1 w-1 rounded-full bg-blue-500" /><span className="h-1 w-1 rounded-full bg-cyan-500" />
          </div>
        </div>
      );
    case 'GaugeChart':
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex flex-col items-center justify-center border border-slate-700/30">
          <svg viewBox="0 0 44 28" className="w-11 h-7">
            <path d="M 6 24 A 16 16 0 0 1 38 24" fill="none" stroke="#d946ef" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="26 52" />
            <path d="M 6 24 A 16 16 0 0 1 38 24" fill="none" stroke="#3b82f6" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="14 64" strokeDashoffset="-26" />
            <path d="M 6 24 A 16 16 0 0 1 38 24" fill="none" stroke="#0ea5e9" strokeWidth="4.5" strokeLinecap="round" strokeDasharray="10 68" strokeDashoffset="-40" />
          </svg>
          <div className="text-[7px] text-white font-bold mt-0.5">23,648</div>
        </div>
      );
    case 'DataTable':
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex flex-col border border-slate-700/30">
          <div className="text-[7px] text-slate-500 font-medium mb-1.5">Thông báo</div>
          <div className="flex gap-2 text-[6px] text-slate-600 mb-1 pb-1 border-b border-slate-700/30">
            <span className="flex-1">Mã</span><span className="flex-1">Ngày</span><span className="w-5">HS</span>
          </div>
          {[['#1532', 'Dec 30', true], ['#1531', 'Dec 29', false], ['#1530', 'Dec 29', false]].map(([id, date, ok], i) => (
            <div key={i} className="flex gap-2 text-[6px] py-0.5">
              <span className="flex-1 text-slate-400">{id as string}</span>
              <span className="flex-1 text-slate-500">{date as string}</span>
              <span className={cn('w-5 text-center rounded-sm', ok ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10')}>
                {ok ? '●' : '●'}
              </span>
            </div>
          ))}
        </div>
      );
    default:
      return (
        <div className="w-full h-full bg-slate-800/60 rounded-md p-2 flex items-center justify-center border border-slate-700/30">
          <Layers className="h-5 w-5 text-slate-600" />
        </div>
      );
  }
}

// ════════════════════════════════════════════════════
// Widget Wrapper
// ════════════════════════════════════════════════════
interface WidgetWrapperProps {
  config: WidgetConfig;
  registry: WidgetRegistry;
  editable: boolean;
  onRemove?: (id: string) => void;
}

const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ config, registry, editable, onRemove, className, style, children, ...rest }, ref) => {
    const Component = registry[config.component];

    if (!Component) {
      return (
        <div ref={ref} className={cn('rounded-lg border border-red-800/50 bg-red-900/20 p-4 flex items-center justify-center text-red-400 text-sm', className)} style={style} {...rest}>
          Widget không tồn tại: <code className="ml-1 font-mono">{config.component}</code>
          {children}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          'relative group/widget rounded-lg overflow-hidden',
          editable && 'ring-1 ring-slate-700/50 hover:ring-fuchsia-500/40 transition-all duration-200',
          className
        )}
        style={style}
        {...rest}
      >
        {editable && (
          <div className="drag-handle absolute top-0 left-0 right-0 h-7 z-20 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/widget:opacity-100 transition-opacity bg-gradient-to-b from-slate-800/80 to-transparent">
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>
        )}
        {editable && onRemove && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(config.i); }}
            className="absolute top-1.5 right-1.5 z-30 h-5 w-5 flex items-center justify-center rounded-full bg-red-500/80 hover:bg-red-500 text-white opacity-0 group-hover/widget:opacity-100 transition-all duration-200 shadow-lg"
            title="Xóa widget"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        <Component {...config.props} isEditable={editable} className="h-full w-full" />
        {children}
      </div>
    );
  }
);
WidgetWrapper.displayName = 'WidgetWrapper';

// ════════════════════════════════════════════════════
// Widget Picker — kéo thả, mini preview, categories, saved layouts
// ════════════════════════════════════════════════════
interface WidgetPickerProps {
  templates: WidgetTemplate[];
  categories: WidgetCategory[];
  savedLayouts: SavedLayout[];
  onDragStart: (template: WidgetTemplate) => void;
  onDragEnd: () => void;
  onRestoreLayout: (layout: SavedLayout) => void;
  onSaveLayout: (name: string) => void;
  onDeleteLayout: (id: string) => void;
  onClose: () => void;
  onAIDragStart: (widget: WidgetConfig) => void;
  onAIDragEnd: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
  onRequestEditMode: () => void;
}

function WidgetPicker({
  templates,
  categories,
  savedLayouts,
  onDragStart,
  onDragEnd,
  onRestoreLayout,
  onSaveLayout,
  onDeleteLayout,
  onClose,
  onAIDragStart,
  onAIDragEnd,
  onAddWidget,
  onRequestEditMode,
}: WidgetPickerProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [pickerTab, setPickerTab] = useState<'ai' | 'widgets'>('ai');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [saveName, setSaveName] = useState('');
  const saveInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSaveInput && saveInputRef.current) {
      saveInputRef.current.focus();
    }
  }, [showSaveInput]);

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory);

  const handleSave = () => {
    const name = saveName.trim();
    if (name) {
      onSaveLayout(name);
      setSaveName('');
      setShowSaveInput(false);
    }
  };

  return (
    <div
      className="fixed bottom-24 right-6 z-[60] w-[360px] h-[550px] bg-[#0d1120] border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/80 flex flex-col origin-bottom-right"
      style={{ animation: 'pickerPopup 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40 bg-slate-900/50">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Plus className="h-4 w-4 text-fuchsia-400" />
          Thêm Widget
        </h3>
        <button onClick={onClose} className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col custom-scrollbar">
        {/* ── Bảng đã lưu ── */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <Bookmark className="h-3 w-3" />
              Bảng đã lưu
            </h4>
            <button
              onClick={() => setShowSaveInput(!showSaveInput)}
              className="flex items-center gap-1 text-[10px] font-medium text-fuchsia-400 hover:text-fuchsia-300 transition-colors px-2 py-0.5 rounded-md hover:bg-fuchsia-500/10"
            >
              <Save className="h-3 w-3" /> Lưu hiện tại
            </button>
          </div>

          {/* Save input */}
          {showSaveInput && (
            <div className="flex gap-2 mb-2">
              <input
                ref={saveInputRef}
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                placeholder="Tên bố cục..."
                className="flex-1 h-7 px-2 text-xs bg-slate-800 border border-slate-700/50 rounded-md text-slate-200 placeholder:text-slate-500 focus:border-fuchsia-500 focus:outline-none focus:ring-1 focus:ring-fuchsia-500/50"
              />
              <button onClick={handleSave} className="h-7 px-2.5 text-xs font-medium bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30 rounded-md hover:bg-fuchsia-500/30 transition-colors">
                Lưu
              </button>
            </div>
          )}

          {/* Layout list */}
          <div className="space-y-1">
            {savedLayouts.map((layout) => (
              <div
                key={layout.id}
                className="group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer hover:bg-slate-800/60 border border-transparent hover:border-amber-500/20 transition-all"
                onClick={() => onRestoreLayout(layout)}
              >
                <div className={cn(
                  'h-7 w-7 rounded-md flex items-center justify-center shrink-0',
                  layout.isDefault
                    ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                    : 'bg-slate-800 border border-slate-700/40'
                )}>
                  <Bookmark className={cn('h-3.5 w-3.5', layout.isDefault ? 'text-amber-400' : 'text-slate-400')} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-200 truncate">{layout.name}</div>
                  {layout.isDefault && (
                    <div className="text-[10px] text-slate-500">Ấn để khôi phục mặc định</div>
                  )}
                </div>
                {!layout.isDefault && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeleteLayout(layout.id); }}
                    className="h-5 w-5 flex items-center justify-center rounded text-slate-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Phân cách ── */}
        <div className="mx-4 border-t border-slate-700/40" />

        {/* ── AI / Widgets Tab Switcher ── */}
        <div className="px-4 pt-3 pb-2">
          <div className="flex gap-1 p-0.5 bg-slate-800/40 rounded-lg">
            <button
              onClick={() => setPickerTab('ai')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all flex-1 justify-center',
                pickerTab === 'ai'
                  ? 'bg-gradient-to-r from-fuchsia-500/15 to-blue-500/15 text-fuchsia-300 border border-fuchsia-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              )}
            >
              <Bot className="h-3.5 w-3.5" />
              AI Assistant
            </button>
            <button
              onClick={() => setPickerTab('widgets')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all flex-1 justify-center',
                pickerTab === 'widgets'
                  ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30'
                  : 'text-slate-500 hover:text-slate-300 border border-transparent'
              )}
            >
              <Package className="h-3.5 w-3.5" />
              Widgets
            </button>
          </div>
        </div>

        {/* ── AI Chat Panel ── */}
        {pickerTab === 'ai' && (
          <div className="flex-1 min-h-0 flex flex-col">
            <AIChatPanel
              onDragStart={onAIDragStart}
              onDragEnd={onAIDragEnd}
              onAddWidget={onAddWidget}
              onRequestEditMode={onRequestEditMode}
            />
          </div>
        )}

        {/* ── Widgets Tab Content ── */}
        {pickerTab === 'widgets' && (
          <>
            {/* ── Category Tabs ── */}
            <div className="px-4 pt-1 pb-2">
              <div className="flex gap-1 p-0.5 bg-slate-800/40 rounded-lg">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium rounded-md transition-all flex-1 justify-center',
                      activeCategory === cat.id
                        ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30'
                        : 'text-slate-500 hover:text-slate-300 border border-transparent'
                    )}
                  >
                    {cat.icon}
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Draggable Widget Templates ── */}
            <div key={activeCategory} className="px-4 pb-4 grid grid-cols-2 gap-2 animate-category-switch">
              {filtered.map((template) => (
                <div
                  key={template.component + template.label}
                  draggable
                  unselectable="on"
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', '');
                    e.dataTransfer.effectAllowed = 'copy';
                    onRequestEditMode();
                    onDragStart(template);
                  }}
                  onDragEnd={onDragEnd}
                  className="group cursor-grab active:cursor-grabbing rounded-xl border border-slate-700/40 hover:border-fuchsia-500/40 bg-slate-900/50 hover:bg-slate-800/50 transition-all duration-200 overflow-hidden"
                >
                  {/* Mini Preview */}
                  <div className="h-[72px] p-1.5">
                    <MiniPreview component={template.component} />
                  </div>
                  {/* Label */}
                  <div className="px-2.5 pb-2 pt-1">
                    <div className="text-[11px] font-medium text-slate-300 group-hover:text-white transition-colors truncate">
                      {template.label}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] text-slate-600 bg-slate-800/80 px-1 py-0.5 rounded">
                        {template.defaultW}×{template.defaultH}
                      </span>
                      <span className="text-[9px] text-fuchsia-400/60 opacity-0 group-hover:opacity-100 transition-opacity">
                        kéo để thêm
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes pickerPopup {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes categorySwitch {
          from { opacity: 0; transform: translateX(15px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .animate-category-switch {
          animation: categorySwitch 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.4);
        }
      `}</style>
    </div>
  );
}

// ════════════════════════════════════════════════════
// DashboardGrid — Main Component
// ════════════════════════════════════════════════════

interface DashboardGridProps {
  widgets: WidgetConfig[];
  registry: WidgetRegistry;
  widgetTemplates?: WidgetTemplate[];
  categories?: WidgetCategory[];
  onLayoutChange?: (widgets: WidgetConfig[]) => void;
  editable?: boolean;
  className?: string;
}

export function DashboardGrid({
  widgets,
  registry,
  widgetTemplates = [],
  categories = DEFAULT_CATEGORIES,
  onLayoutChange,
  editable: editableProp,
  className,
}: DashboardGridProps) {
  // ── State ──
  const [isEditable, setIsEditable] = useState(editableProp ?? false);
  const [currentWidgets, setCurrentWidgets] = useState<WidgetConfig[]>(widgets);
  const [initialWidgets] = useState<WidgetConfig[]>(widgets);
  const [showPicker, setShowPicker] = useState(false);
  const [droppingTemplate, setDroppingTemplate] = useState<WidgetTemplate | null>(null);
  const widgetCounter = useRef(0);

  // ── Undo History ──
  const [history, setHistory] = useState<WidgetConfig[][]>([widgets]);
  const [historyStep, setHistoryStep] = useState(0);

  const pushHistory = useCallback((newWidgets: WidgetConfig[]) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      newHistory.push(newWidgets);
      return newHistory;
    });
    setHistoryStep(prev => prev + 1);
    setCurrentWidgets(newWidgets);
    onLayoutChange?.(newWidgets);
  }, [historyStep, onLayoutChange]);

  const handleUndoLayout = useCallback(() => {
    if (!isEditable || historyStep === 0) return;
    setHistoryStep(prev => {
      const nextStep = prev - 1;
      const restored = history[nextStep];
      setCurrentWidgets(restored);
      onLayoutChange?.(restored);
      return nextStep;
    });
  }, [isEditable, history, historyStep, onLayoutChange]);

  // Lắng nghe phím tắt Ctrl+Z toàn grid khi Edit Mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isEditable) return;
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        const target = e.target as HTMLElement;
        // Bỏ qua nếu đang gõ trong input/textarea lưu tên
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          handleUndoLayout();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isEditable, handleUndoLayout]);

  // ── Saved Layouts ──
  const [savedLayouts, setSavedLayouts] = useState<SavedLayout[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch {}
    return [];
  });

  // "Mặc định" layout — luôn ở đầu
  const allLayouts: SavedLayout[] = useMemo(() => [
    { id: 'default', name: 'Mặc định', widgets: initialWidgets, isDefault: true, timestamp: 0 },
    ...savedLayouts,
  ], [initialWidgets, savedLayouts]);

  // Persist saved layouts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedLayouts));
    } catch {}
  }, [savedLayouts]);

  // Sync editable prop
  useEffect(() => {
    if (editableProp !== undefined) setIsEditable(editableProp);
  }, [editableProp]);

  // (Picker no longer requires edit mode — removed auto-close)

  // ── Layout conversion ──
  const layout: Layout[] = useMemo(
    () => currentWidgets.map((w) => ({
      i: w.i, x: w.x, y: w.y, w: w.w, h: w.h,
      minW: w.minW, minH: w.minH, maxW: w.maxW, maxH: w.maxH,
      static: !isEditable || w.static,
    })),
    [currentWidgets, isEditable]
  );

  // ── Handle layout change ──
  const handleLayoutChange = useCallback((newLayout: Layout[]) => {
    setCurrentWidgets(curr => {
      let changed = false;
      const updated = curr.map((widget) => {
        const item = newLayout.find((l) => l.i === widget.i);
        if (!item) return widget;
        // Kiểm tra xem vị trí hoặc kích thước có thực sự bị thay đổi không
        if (item.x !== widget.x || item.y !== widget.y || item.w !== widget.w || item.h !== widget.h) {
          changed = true;
        }
        return { ...widget, x: item.x, y: item.y, w: item.w, h: item.h };
      });

      if (changed) {
        setHistory(h => {
          const newH = h.slice(0, historyStep + 1);
          newH.push(updated);
          return newH;
        });
        setHistoryStep(s => s + 1);
        onLayoutChange?.(updated);
      }
      return changed ? updated : curr;
    });
  }, [historyStep, onLayoutChange]);

  // ── Reset ──
  const handleReset = useCallback(() => {
    pushHistory(initialWidgets);
  }, [initialWidgets, pushHistory]);

  // ── Drop from outside (drag from picker) ──
  const handleDrop = useCallback((_layout: Layout[], item: Layout, _e: Event) => {
    if (!droppingTemplate) return;
    widgetCounter.current += 1;
    const id = `${droppingTemplate.component.toLowerCase()}-${Date.now()}-${widgetCounter.current}`;
    const newWidget: WidgetConfig = {
      i: id,
      x: item.x,
      y: item.y,
      w: item.w,
      h: item.h,
      minW: droppingTemplate.minW,
      minH: droppingTemplate.minH,
      maxW: droppingTemplate.maxW,
      maxH: droppingTemplate.maxH,
      component: droppingTemplate.component,
      props: { ...droppingTemplate.defaultProps },
    };
    const updated = [...currentWidgets, newWidget];
    pushHistory(updated);
    setDroppingTemplate(null);
  }, [droppingTemplate, currentWidgets, pushHistory]);

  // ── Remove widget ──
  const handleRemoveWidget = useCallback((widgetId: string) => {
    const updated = currentWidgets.filter((w) => w.i !== widgetId);
    pushHistory(updated);
  }, [currentWidgets, pushHistory]);

  // ── Save layout ──
  const handleSaveLayout = useCallback((name: string) => {
    const newLayout: SavedLayout = {
      id: `layout-${Date.now()}`,
      name,
      widgets: currentWidgets.map(w => ({ ...w })),
      timestamp: Date.now(),
    };
    setSavedLayouts(prev => [...prev, newLayout]);
  }, [currentWidgets]);

  // ── Restore layout ──
  const handleRestoreLayout = useCallback((layout: SavedLayout) => {
    if (layout.isDefault) {
      handleReset();
    } else {
      setCurrentWidgets(layout.widgets);
      onLayoutChange?.(layout.widgets);
    }
  }, [handleReset, onLayoutChange]);

  // ── Delete layout ──
  const handleDeleteLayout = useCallback((id: string) => {
    setSavedLayouts(prev => prev.filter(l => l.id !== id));
  }, []);

  // ── AI Drag handlers ──
  const [droppingAIWidget, setDroppingAIWidget] = useState<WidgetConfig | null>(null);

  const handleAIDragStart = useCallback((widget: WidgetConfig) => {
    setIsEditable(true); // Auto switch to edit mode
    // Create a pseudo-template for the dropping item
    setDroppingTemplate({
      component: widget.component,
      label: widget.props?.title || 'AI Widget',
      category: 'ai',
      defaultW: widget.w,
      defaultH: widget.h,
      defaultProps: widget.props || {},
    });
    setDroppingAIWidget(widget);
  }, []);

  const handleAIDragEnd = useCallback(() => {
    setDroppingTemplate(null);
    setDroppingAIWidget(null);
  }, []);

  const handleAddWidgetFromAI = useCallback((widget: WidgetConfig) => {
    setIsEditable(true); // Auto switch to edit mode
    // Find the max Y position to place below existing widgets
    const maxY = currentWidgets.reduce((max, w) => Math.max(max, w.y + w.h), 0);
    const newWidget: WidgetConfig = {
      ...widget,
      i: `ai-${widget.component.toLowerCase()}-${Date.now()}`,
      x: 0,
      y: maxY,
    };
    const updated = [...currentWidgets, newWidget];
    pushHistory(updated);
  }, [currentWidgets, pushHistory]);

  // ── Dropping item config for react-grid-layout ──
  const droppingItem = useMemo(() => {
    if (!droppingTemplate) return undefined;
    return { i: '__dropping__', w: droppingTemplate.defaultW, h: droppingTemplate.defaultH };
  }, [droppingTemplate]);

  return (
    <div className={cn('relative', className)}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-end gap-2 mb-3 px-1">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-md transition-all duration-200"
          title="Reset về layout mặc định"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        <button
          onClick={() => setIsEditable((prev) => !prev)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-md transition-all duration-200',
            isEditable
              ? 'text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30 hover:bg-fuchsia-500/20'
              : 'text-slate-400 bg-slate-800/50 border-slate-700/50 hover:text-white hover:bg-slate-800'
          )}
          title={isEditable ? 'Khóa layout' : 'Mở khóa để chỉnh sửa'}
        >
          {isEditable ? (
            <><Unlock className="h-3.5 w-3.5" /> Đang chỉnh sửa</>
          ) : (
            <><Lock className="h-3.5 w-3.5" /> Chỉnh sửa</>
          )}
        </button>
      </div>

      {/* ── Grid ── */}
      <ReactGridLayout
        layout={layout}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        margin={GRID_MARGIN}
        containerPadding={[0, 0]}
        isDraggable={isEditable}
        isResizable={isEditable}
        isDroppable={isEditable}
        draggableHandle=".drag-handle"
        useCSSTransforms={true}
        compactType="vertical"
        onLayoutChange={handleLayoutChange}
        onDrop={handleDrop}
        droppingItem={droppingItem}
        resizeHandles={['se']}
      >
        {currentWidgets.map((widget) => (
          <WidgetWrapper
            key={widget.i}
            config={widget}
            registry={registry}
            editable={isEditable}
            onRemove={isEditable ? handleRemoveWidget : undefined}
          />
        ))}
      </ReactGridLayout>

      {/* ── Edit mode hint ── */}
      {isEditable && !showPicker && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-fuchsia-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg shadow-fuchsia-500/20 animate-pulse">
          <Maximize2 className="h-3.5 w-3.5" />
          Kéo thả để di chuyển, thanh đổi kích thước, ctrl + Z để hoàn tác
          <Minimize2 className="h-3.5 w-3.5" />
        </div>
      )}

      {/* ── FAB "+" — LUÔN HIỂN THỊ (không cần edit mode) ── */}
      <button
        onClick={() => setShowPicker((prev) => !prev)}
        className={cn(
          'fixed bottom-6 right-6 z-[55] h-14 w-14 flex items-center justify-center rounded-full shadow-xl transition-all duration-300',
          showPicker
            ? 'bg-slate-700 hover:bg-slate-600 shadow-slate-900/50'
            : 'bg-gradient-to-br from-fuchsia-500 to-blue-500 hover:from-fuchsia-400 hover:to-blue-400 shadow-fuchsia-500/30 hover:shadow-fuchsia-500/50 hover:scale-110'
        )}
        title="Thêm widget / AI Chat"
      >
        {showPicker
          ? <X className="h-6 w-6 text-white transition-transform duration-300" />
          : <Plus className="h-6 w-6 text-white transition-transform duration-300" />
        }
      </button>

      {/* ── Widget Picker Panel ── */}
      {showPicker && (
        <WidgetPicker
          templates={widgetTemplates}
          categories={categories}
          savedLayouts={allLayouts}
          onDragStart={(t) => {
            setIsEditable(true);
            setDroppingTemplate(t);
          }}
          onDragEnd={() => setDroppingTemplate(null)}
          onRestoreLayout={handleRestoreLayout}
          onSaveLayout={handleSaveLayout}
          onDeleteLayout={handleDeleteLayout}
          onClose={() => setShowPicker(false)}
          onAIDragStart={handleAIDragStart}
          onAIDragEnd={handleAIDragEnd}
          onAddWidget={handleAddWidgetFromAI}
          onRequestEditMode={() => setIsEditable(true)}
        />
      )}

      {/* ── Drop placeholder styling ── */}
      <style>{`
        .react-grid-item.react-grid-placeholder {
          background: rgba(217, 70, 239, 0.12) !important;
          border: 2px dashed rgba(217, 70, 239, 0.5) !important;
          border-radius: 12px !important;
          opacity: 1 !important;
        }
        .react-grid-item.dropping {
          opacity: 0.7;
        }
      `}</style>
    </div>
  );
}