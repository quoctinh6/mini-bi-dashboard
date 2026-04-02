"use client";

import React, { useState, useMemo } from 'react';
import RGL, { WidthProvider, Layout } from 'react-grid-layout';
import { cn } from '@/lib/utils';

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

// ════════════════════════════════════════════════════
// Grid Constants
// ════════════════════════════════════════════════════
export const GRID_COLS = 8;
export const GRID_ROW_HEIGHT = 100;
export const GRID_MARGIN: [number, number] = [12, 12];

// ════════════════════════════════════════════════════
// WidgetWrapper — Renders individual widgets
// ════════════════════════════════════════════════════
interface WidgetWrapperProps {
  config: WidgetConfig;
  registry: WidgetRegistry;
}

const WidgetWrapper = React.forwardRef<HTMLDivElement, WidgetWrapperProps & React.HTMLAttributes<HTMLDivElement>>(
  ({ config, registry, className, style, children, ...rest }, ref) => {
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
        className={cn('relative group/widget rounded-lg overflow-hidden', className)}
        style={style}
        {...rest}
      >
        <Component {...config.props} isEditable={false} className="h-full w-full" />
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
  widgets: WidgetConfig[];
  registry: WidgetRegistry;
  className?: string;
}

export function DashboardGrid({
  widgets,
  registry,
  className,
}: DashboardGridProps) {
  const [currentWidgets] = useState<WidgetConfig[]>(widgets);

  const layout: Layout[] = useMemo(
    () => currentWidgets.map((w) => ({
      i: w.i, x: w.x, y: w.y, w: w.w, h: w.h,
      minW: w.minW, minH: w.minH, maxW: w.maxW, maxH: w.maxH,
      static: true, // Always static as per user request to remove edit features
    })),
    [currentWidgets]
  );

  return (
    <div className={cn('relative', className)}>
      <ReactGridLayout
        layout={layout}
        cols={GRID_COLS}
        rowHeight={GRID_ROW_HEIGHT}
        margin={GRID_MARGIN}
        containerPadding={[0, 0]}
        isDraggable={false}
        isResizable={false}
        isDroppable={false}
        useCSSTransforms={true}
        compactType="vertical"
      >
        {currentWidgets.map((widget) => (
          <WidgetWrapper
            key={widget.i}
            config={widget}
            registry={registry}
          />
        ))}
      </ReactGridLayout>
    </div>
  );
}
