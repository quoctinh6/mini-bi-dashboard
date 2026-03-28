import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Calendar } from 'lucide-react';

export interface NotificationRecord {
  id: string;
  date: string;
  performance: 'Cao' | 'Thấp';
  topic: string;
}

interface DataTableProps extends React.HTMLAttributes<HTMLDivElement> {
  data: NotificationRecord[];
  title?: string;
}

export function DataTable({ data, title = 'Thông báo', className, ...props }: DataTableProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-slate-800 bg-slate-900/50 p-5 shadow-sm overflow-hidden',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <Select icon={<Calendar className="h-3 w-3" />} className="h-8 text-xs bg-slate-800 border-none w-32 py-1 px-2 pr-6">
          <option>Jan 2024</option>
          <option>Feb 2024</option>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-400">
          <thead className="border-b border-slate-800 text-slate-500 uppercase font-medium">
            <tr>
              <th className="pb-3 px-2 font-medium">Mã thông báo</th>
              <th className="pb-3 px-2 font-medium">Ngày</th>
              <th className="pb-3 px-2 font-medium">Hiệu suất</th>
              <th className="pb-3 px-2 font-medium text-right">Chủ đề</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={row.id}
                className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-2 text-slate-300">{row.id}</td>
                <td className="py-3 px-2">{row.date}</td>
                <td className="py-3 px-2">
                  <Badge
                    variant={row.performance === 'Cao' ? 'success' : 'destructive'}
                    className="h-5 px-1.5 py-0 font-medium"
                  >
                    • {row.performance}
                  </Badge>
                </td>
                <td className="py-3 px-2 text-slate-300 text-right">{row.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
