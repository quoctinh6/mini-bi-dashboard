"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import {
  MessageSquare, BarChart3, Send, Loader2, Bot, User,
  GripVertical, Plus, RotateCcw, Sparkles, AlertTriangle,
} from 'lucide-react';
import { aiServices } from '@/services/apiService';
import type { WidgetConfig } from './DashboardGrid';

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: 'text' | 'chart';
  widget?: WidgetConfig;
  isLoading?: boolean;
  error?: boolean;
}

interface AIChatPanelProps {
  onDragStart: (widget: WidgetConfig) => void;
  onDragEnd: () => void;
  onAddWidget: (widget: WidgetConfig) => void;
  onRequestEditMode: () => void;
}

// ════════════════════════════════════════════════════
// Simple Markdown-like renderer
// ════════════════════════════════════════════════════

function renderContent(text: string) {
  // Split by code blocks
  const parts = text.split(/(```[\s\S]*?```)/g);

  return parts.map((part, i) => {
    if (part.startsWith('```') && part.endsWith('```')) {
      const code = part.slice(3, -3).replace(/^\w+\n/, '');
      return (
        <pre key={i} className="bg-slate-900/80 border border-slate-700/40 rounded-lg p-3 text-[11px] text-slate-300 overflow-x-auto my-2 font-mono">
          {code}
        </pre>
      );
    }

    // Process inline formatting
    const lines = part.split('\n');
    return lines.map((line, j) => {
      if (!line.trim()) return <br key={`${i}-${j}`} />;

      // Bold
      let processed: React.ReactNode = line;
      const boldParts = line.split(/(\*\*.*?\*\*)/g);
      if (boldParts.length > 1) {
        processed = boldParts.map((bp, k) =>
          bp.startsWith('**') && bp.endsWith('**')
            ? <strong key={k} className="text-white font-semibold">{bp.slice(2, -2)}</strong>
            : <React.Fragment key={k}>{bp}</React.Fragment>
        );
      }

      // Table detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.split('|').filter(c => c.trim());
        const isSeparator = cells.every(c => /^[\s-:]+$/.test(c));
        if (isSeparator) return null;
        return (
          <div key={`${i}-${j}`} className="flex gap-0 text-[10px]">
            {cells.map((cell, ci) => (
              <span key={ci} className="flex-1 px-2 py-1 border-b border-slate-700/30 text-slate-300">
                {cell.trim()}
              </span>
            ))}
          </div>
        );
      }

      // Bullet points
      if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
        return (
          <div key={`${i}-${j}`} className="flex gap-2 ml-1 my-0.5">
            <span className="text-fuchsia-400 mt-0.5">•</span>
            <span>{typeof processed === 'string' ? processed.replace(/^[\-•]\s*/, '') : processed}</span>
          </div>
        );
      }

      return <div key={`${i}-${j}`}>{processed}</div>;
    });
  });
}

// ════════════════════════════════════════════════════
// Widget Preview Card (draggable)
// ════════════════════════════════════════════════════

function WidgetPreviewCard({
  widget,
  onDragStart,
  onDragEnd,
  onAdd,
  onRequestEditMode,
}: {
  widget: WidgetConfig;
  onDragStart: (w: WidgetConfig) => void;
  onDragEnd: () => void;
  onAdd: (w: WidgetConfig) => void;
  onRequestEditMode: () => void;
}) {
  const getTypeLabel = (component: string) => {
    switch (component) {
      case 'KPICard': return 'KPI Card';
      case 'MixedChart': return 'Bar + Line';
      case 'DonutChart': return 'Donut Chart';
      case 'GaugeChart': return 'Gauge Chart';
      case 'GeoChart': return 'Geo Map';
      default: return component;
    }
  };

  const getTypeColor = (component: string) => {
    switch (component) {
      case 'KPICard': return 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-400';
      case 'MixedChart': return 'from-fuchsia-500/20 to-fuchsia-600/10 border-fuchsia-500/30 text-fuchsia-400';
      case 'DonutChart': return 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-400';
      case 'GaugeChart': return 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400';
      case 'GeoChart': return 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-400';
      default: return 'from-slate-500/20 to-slate-600/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div
      className="mt-2 rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
    >
      {/* Draggable handle */}
      <div
        draggable
        unselectable="on"
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', '');
          e.dataTransfer.effectAllowed = 'copy';
          onRequestEditMode();
          onDragStart(widget);
        }}
        onDragEnd={onDragEnd}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-slate-800/60 to-transparent cursor-grab active:cursor-grabbing hover:from-slate-700/60 transition-all group"
      >
        <GripVertical className="h-3.5 w-3.5 text-slate-500 group-hover:text-fuchsia-400 transition-colors" />
        <div className={cn(
          'px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-gradient-to-r border',
          getTypeColor(widget.component)
        )}>
          {getTypeLabel(widget.component)}
        </div>
        <span className="text-[10px] text-slate-500 ml-auto">{widget.w}×{widget.h}</span>
        <span className="text-[9px] text-fuchsia-400/60 opacity-0 group-hover:opacity-100 transition-opacity">
          kéo để thêm
        </span>
      </div>

      {/* Widget title & props preview */}
      <div className="px-3 py-2 space-y-1">
        <div className="text-xs font-medium text-white truncate">
          {widget.props?.title || 'Untitled'}
        </div>
        {widget.props?.data && Array.isArray(widget.props.data) && (
          <div className="text-[10px] text-slate-500">
            {widget.props.data.length} data points
          </div>
        )}
      </div>

      {/* Quick add button */}
      <div className="px-3 pb-2">
        <button
          onClick={() => {
            onRequestEditMode();
            onAdd(widget);
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 hover:border-fuchsia-500/40 rounded-lg transition-all"
        >
          <Plus className="h-3 w-3" />
          Thêm vào Dashboard
        </button>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
// AI Chat Panel — Main Component
// ════════════════════════════════════════════════════

export function AIChatPanel({
  onDragStart,
  onDragEnd,
  onAddWidget,
  onRequestEditMode,
}: AIChatPanelProps) {
  const [mode, setMode] = useState<'chat' | 'chart'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: mode === 'chat'
        ? 'Xin chào! 👋 Tôi có thể phân tích dữ liệu doanh nghiệp cho bạn. Hãy hỏi bất kỳ câu hỏi nào về doanh thu, chi phí, lợi nhuận, hay xu hướng kinh doanh.'
        : 'Xin chào! 📊 Hãy mô tả biểu đồ bạn muốn tạo. Tôi sẽ truy vấn dữ liệu và tạo biểu đồ phù hợp cho bạn.',
      type: 'text',
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Update welcome message when mode changes
  const handleModeChange = useCallback((newMode: 'chat' | 'chart') => {
    setMode(newMode);
    setMessages([{
      id: `welcome-${newMode}`,
      role: 'assistant',
      content: newMode === 'chat'
        ? 'Xin chào! 👋 Tôi có thể phân tích dữ liệu doanh nghiệp cho bạn. Hãy hỏi bất kỳ câu hỏi nào về doanh thu, chi phí, lợi nhuận, hay xu hướng kinh doanh.'
        : 'Xin chào! 📊 Hãy mô tả biểu đồ bạn muốn tạo. Ví dụ: "Tạo biểu đồ cột doanh thu theo tháng" hoặc "Pie chart cơ cấu ngành hàng".',
      type: 'text',
    }]);
  }, []);

  // Send message
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      type: 'text',
    };

    const loadingMsg: ChatMessage = {
      id: `loading-${Date.now()}`,
      role: 'assistant',
      content: '',
      type: 'text',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Build history (exclude welcome and loading)
      const history = messages
        .filter(m => m.id !== 'welcome' && !m.id.startsWith('welcome-') && !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await aiServices.chat({
        message: text,
        mode,
        history: [...history, { role: 'user', content: text }],
      });

      if (response.success) {
        const { data } = response;
        const assistantMsg: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: data.content || 'Tôi không thể xử lý yêu cầu này.',
          type: data.type || 'text',
          widget: data.widget || undefined,
        };

        setMessages(prev => [
          ...prev.filter(m => !m.isLoading),
          assistantMsg,
        ]);
      } else {
        throw new Error(response.message || 'Unknown error');
      }
    } catch (error: any) {
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Lỗi: ${error.response?.data?.message || error.message || 'Không thể kết nối đến AI service.'}`,
        type: 'text',
        error: true,
      };

      setMessages(prev => [
        ...prev.filter(m => !m.isLoading),
        errorMsg,
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, mode, messages, isLoading]);

  // Handle Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  // Sample prompts
  const samplePrompts = mode === 'chat'
    ? [
        'Doanh thu tháng cao nhất?',
        'So sánh 3 miền',
        'Top 5 tỉnh thành',
      ]
    : [
        'Biểu đồ cột doanh thu theo tháng',
        'Pie chart ngành hàng',
        'KPI tổng doanh thu',
      ];

  return (
    <div className="flex flex-col h-full">
      {/* ── Mode Switcher ── */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex gap-1 p-0.5 bg-slate-800/40 rounded-lg">
          <button
            onClick={() => handleModeChange('chat')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all flex-1 justify-center',
              mode === 'chat'
                ? 'bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            )}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat
          </button>
          <button
            onClick={() => handleModeChange('chart')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-md transition-all flex-1 justify-center',
              mode === 'chart'
                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent'
            )}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Tạo biểu đồ
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 space-y-3 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' && 'justify-end')}>
            {msg.role === 'assistant' && (
              <div className={cn(
                'h-6 w-6 shrink-0 rounded-full flex items-center justify-center mt-0.5',
                msg.error
                  ? 'bg-red-500/20 border border-red-500/30'
                  : 'bg-gradient-to-br from-fuchsia-500/20 to-blue-500/20 border border-fuchsia-500/30'
              )}>
                {msg.error
                  ? <AlertTriangle className="h-3 w-3 text-red-400" />
                  : <Bot className="h-3 w-3 text-fuchsia-400" />
                }
              </div>
            )}

            <div className={cn(
              'max-w-[85%] rounded-xl px-3 py-2 text-[12px] leading-relaxed',
              msg.role === 'user'
                ? 'bg-fuchsia-500/15 text-slate-200 border border-fuchsia-500/20'
                : msg.error
                  ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                  : 'bg-slate-800/50 text-slate-300 border border-slate-700/30'
            )}>
              {msg.isLoading ? (
                <div className="flex items-center gap-2 py-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-fuchsia-400" />
                  <span className="text-slate-500 text-[11px]">
                    {mode === 'chart' ? 'Đang tạo biểu đồ...' : 'Đang phân tích...'}
                  </span>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '200ms' }} />
                    <span className="w-1 h-1 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                </div>
              ) : (
                <>
                  <div className="whitespace-pre-wrap">{renderContent(msg.content)}</div>
                  {msg.widget && (
                    <WidgetPreviewCard
                      widget={msg.widget}
                      onDragStart={onDragStart}
                      onDragEnd={onDragEnd}
                      onAdd={onAddWidget}
                      onRequestEditMode={onRequestEditMode}
                    />
                  )}
                </>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="h-6 w-6 shrink-0 rounded-full bg-slate-700 flex items-center justify-center mt-0.5 border border-slate-600/50">
                <User className="h-3 w-3 text-slate-400" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Sample Prompts (show when few messages) ── */}
      {messages.length <= 1 && (
        <div className="px-4 py-2 flex flex-wrap gap-1.5">
          {samplePrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => {
                setInput(prompt);
                inputRef.current?.focus();
              }}
              className="px-2.5 py-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/40 hover:border-slate-600/50 rounded-full transition-all hover:text-slate-200"
            >
              <Sparkles className="h-2.5 w-2.5 inline mr-1 text-fuchsia-400/60" />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* ── Input Bar ── */}
      <div className="px-4 py-3 border-t border-slate-700/40">
        <div className="flex items-center gap-2 bg-slate-800/60 border border-slate-700/40 rounded-xl px-3 py-1.5 focus-within:border-fuchsia-500/40 focus-within:ring-1 focus-within:ring-fuchsia-500/20 transition-all">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={mode === 'chat' ? 'Hỏi về dữ liệu...' : 'Mô tả biểu đồ cần tạo...'}
            disabled={isLoading}
            className="flex-1 bg-transparent text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded-lg transition-all',
              input.trim() && !isLoading
                ? 'bg-gradient-to-r from-fuchsia-500 to-blue-500 text-white hover:from-fuchsia-400 hover:to-blue-400 shadow-lg shadow-fuchsia-500/20'
                : 'text-slate-600 cursor-not-allowed'
            )}
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-1.5 px-1">
          <span className="text-[9px] text-slate-600">
            {mode === 'chart' ? '📊 AI sẽ tạo biểu đồ từ dữ liệu thực' : '💬 AI tự truy vấn database'}
          </span>
          {messages.length > 1 && (
            <button
              onClick={() => handleModeChange(mode)}
              className="text-[9px] text-slate-600 hover:text-slate-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="h-2.5 w-2.5" />
              Xóa hội thoại
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
