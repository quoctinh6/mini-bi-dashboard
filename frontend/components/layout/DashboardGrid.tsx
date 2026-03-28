"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import { cn } from '@/lib/utils';
import { Lock, Unlock, RotateCcw, GripVertical, Maximize2, Minimize2 } from 'lucide-react';

// ── CSS imports cho react-grid-layout ──
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

// WidthProvider tự đo container width
const ReactGridLayout = WidthProvider(RGL);

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

/** Config cho một widget trên dashboard */
export interface WidgetConfig {
  /** ID duy nhất */
  i: string;
  /** Vị trí cột (0-based, max 7) */
  x: number;
  /** Vị trí hàng (0-based) */
  y: number;
  /** Số ô rộng (1–8) */
  w: number;
  /** Số ô cao */
  h: number;
  /** Resize tối thiểu rộng */
  minW?: number;
  /** Resize tối thiểu cao */
  minH?: number;
  /** Resize tối đa rộng */
  maxW?: number;
  /** Resize tối đa cao */
  maxH?: number;
  /** Tên component (key trong WidgetRegistry) */
  component: string;
  /** Props truyền vào component */
  props: Record<string, any>;
  /** Cho phép di chuyển (static = false thì cho phép) */
  static?: boolean;
}

/** Registry map: component name → React component */
export type WidgetRegistry = Record<string, React.ComponentType<any>>;

// ════════════════════════════════════════════════════
// Grid Constants
// ════════════════════════════════════════════════════
export const GRID_COLS = 8;
export const GRID_ROW_HEIGHT = 100; // px — mỗi ô cao 100px
export const GRID_MARGIN: [number, number] = [12, 12]; // gap 12px

// colWidth ≈ 125px sẽ phụ thuộc vào container width:
// containerWidth = cols * colWidth + (cols - 1) * marginX
// Với cols=8, margin=12: containerWidth = 8*125 + 7*12 = 1084px

// ════════════════════════════════════════════════════
// Widget Wrapper — bọc mỗi widget với resize handle & header
// ════════════════════════════════════════════════════
interface WidgetWrapperProps {
  config: WidgetConfig;
  registry: WidgetRegistry;
  editable: boolean;
}

const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ config, registry, editable, className, style, children, ...rest }, ref) => {
    const Component = registry[config.component];

    if (!Component) {
      return (
        <div
          ref={ref}
          className={cn(
            'rounded-lg border border-red-800/50 bg-red-900/20 p-4 flex items-center justify-center text-red-400 text-sm',
            className
          )}
          style={style}
          {...rest}
        >
          Widget không tồn tại: <code className="ml-1 font-mono">{config.component}</code>
          {/* react-grid-layout resize handle */}
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
        {/* Drag handle indicator — chỉ hiện khi editable */}
        {editable && (
          <div className="drag-handle absolute top-0 left-0 right-0 h-7 z-20 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover/widget:opacity-100 transition-opacity bg-gradient-to-b from-slate-800/80 to-transparent">
            <GripVertical className="h-4 w-4 text-slate-400" />
          </div>
        )}

        {/* Actual widget component — fills the entire cell */}
        <Component
          {...config.props}
          className="h-full w-full"
        />

        {/* react-grid-layout injects resize handle as children */}
        {children}
      </div>
    );
  }
);
WidgetWrapper.displayName = 'WidgetWrapper';

// ════════════════════════════════════════════════════
// DashboardGrid — Main Component
// ════════════════════════════════════════════════════

interface DashboardGridProps {
  /** Danh sách widget configs */
  widgets: WidgetConfig[];
  /** Registry map tên → component */
  registry: WidgetRegistry;
  /** Callback khi layout thay đổi (drag/resize) */
  onLayoutChange?: (widgets: WidgetConfig[]) => void;
  /** Cho phép kéo thả & resize */
  editable?: boolean;
  /** Class cho container ngoài */
  className?: string;
}

export function DashboardGrid({
  widgets,
  registry,
  onLayoutChange,
  editable: editableProp,
  className,
}: DashboardGridProps) {
  // ── State ──
  const [isEditable, setIsEditable] = useState(editableProp ?? false);
  const [currentWidgets, setCurrentWidgets] = useState<WidgetConfig[]>(widgets);
  const [initialWidgets] = useState<WidgetConfig[]>(widgets); // for reset

  // Sync editable prop
  useEffect(() => {
    if (editableProp !== undefined) {
      setIsEditable(editableProp);
    }
  }, [editableProp]);

  // ── Convert WidgetConfig[] → react-grid-layout Layout[] ──
  const layout: Layout[] = useMemo(
    () =>
      currentWidgets.map((w) => ({
        i: w.i,
        x: w.x,
        y: w.y,
        w: w.w,
        h: w.h,
        minW: w.minW,
        minH: w.minH,
        maxW: w.maxW,
        maxH: w.maxH,
        static: !isEditable || w.static,
      })),
    [currentWidgets, isEditable]
  );

  // ── Handle layout change ──
  const handleLayoutChange = useCallback(
    (newLayout: Layout[]) => {
      const updated = currentWidgets.map((widget) => {
        const item = newLayout.find((l) => l.i === widget.i);
        if (!item) return widget;
        return {
          ...widget,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
        };
      });
      setCurrentWidgets(updated);
      onLayoutChange?.(updated);
    },
    [currentWidgets, onLayoutChange]
  );

  // ── Reset layout ──
  const handleReset = useCallback(() => {
    setCurrentWidgets(initialWidgets);
    onLayoutChange?.(initialWidgets);
  }, [initialWidgets, onLayoutChange]);

  return (
    <div className={cn('relative', className)}>
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-end gap-2 mb-3 px-1">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 rounded-md transition-all duration-200"
          title="Reset về layout mặc định"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
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
            <>
              <Unlock className="h-3.5 w-3.5" /> Đang chỉnh sửa
            </>
          ) : (
            <>
              <Lock className="h-3.5 w-3.5" /> Chỉnh sửa
            </>
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
        draggableHandle=".drag-handle"
        useCSSTransforms={true}
        compactType="vertical"
        onLayoutChange={handleLayoutChange}
        resizeHandles={['se']}
      >
        {currentWidgets.map((widget) => (
          <WidgetWrapper
            key={widget.i}
            config={widget}
            registry={registry}
            editable={isEditable}
          />
        ))}
      </ReactGridLayout>

      {/* ── Edit mode overlay hint ── */}
      {isEditable && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-fuchsia-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full shadow-lg shadow-fuchsia-500/20 animate-pulse">
          <Maximize2 className="h-3.5 w-3.5" />
          Kéo thả để di chuyển • Kéo góc để thay đổi kích thước
          <Minimize2 className="h-3.5 w-3.5" />
        </div>
      )}
    </div>
  );
}
