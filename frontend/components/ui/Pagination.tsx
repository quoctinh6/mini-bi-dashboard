import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

export interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className,
  ...props
}: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between text-sm text-slate-400 mt-4", className)} {...props}>
      <div className="mb-4 sm:mb-0">
        {startItem} - {endItem} trên {totalItems}
      </div>
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <span>Số hàng mỗi trang:</span>
          <Select 
            className="w-[72px] h-8 text-xs bg-[#0b132b] border-slate-800"
            value={Math.min(itemsPerPage, totalItems).toString()}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          >
            {[4, 10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center space-x-1.5">
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-[#0b132b] border-slate-800 hover:bg-slate-800"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="h-8 w-8 bg-[#0b132b] border-slate-800 hover:bg-slate-800"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
