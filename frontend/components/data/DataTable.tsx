import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Calendar } from 'lucide-react';
import { NumberDisplay } from '@/components/ui/NumberDisplay';

export interface DataRecord {
  id: string;
  label: string;
  value: string | number;
  status?: string;
  topic?: string;
}

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  data: DataRecord[];
  title?: string;
  columns?: { key: keyof DataRecord; label: string; align?: 'left' | 'right' }[];
}

export function DataTable({ 
  data, 
  title = 'Thông báo', 
  columns = [
    { key: 'id', label: 'ID' },
    { key: 'label', label: 'Ngày' },
    { key: 'status', label: 'Hiệu suất' },
    { key: 'topic', label: 'Chủ đề', align: 'right' },
  ],
  className, 
  ...props 
}: DataTableProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-400">
          <thead className="border-b border-slate-800 text-slate-500 uppercase font-medium">
            <tr>
              {columns.map((col) => (
                <th key={col.key.toString()} className={cn("pb-3 px-2 font-medium", col.align === 'right' && 'text-right')}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id + i}
                className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
              >
                {columns.map((col) => {
                  const val = row[col.key];
                  
                  if (col.key === 'status') {
                    return (
                      <td key={col.key.toString()} className="py-3 px-2">
                        <Badge
                          variant={val === 'Cao' || val === 'Tốt' ? 'success' : 'destructive'}
                          className="h-5 px-1.5 py-0 font-medium"
                        >
                          • {val || 'N/A'}
                        </Badge>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={col.key.toString()} 
                      className={cn("py-3 px-2 text-slate-300", col.align === 'right' && 'text-right')}
                    >
                      {typeof val === 'number' ? <NumberDisplay value={val} className="text-xs" /> : val}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
