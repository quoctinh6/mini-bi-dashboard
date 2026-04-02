"use client";

import React from 'react';
import { cn, formatCompactNumber } from '@/lib/utils';

interface NumberDisplayProps {
  value: number | string;
  unit?: string;
  className?: string;
  digits?: number;
}

/**
 * Thể hiện số liệu theo định dạng rút gọn (compact) với tối đa 5 chữ số có nghĩa.
 * Hỗ trợ hiển thị đơn vị đi kèm (ví dụ: ₫, $, %).
 */
export const NumberDisplay: React.FC<NumberDisplayProps> = ({ 
  value, 
  unit, 
  className, 
  digits = 5 
}) => {
  // Chuyển đổi chuỗi thành số nếu cần (loại bỏ các ký tự không phải số)
  const numericValue = typeof value === 'string' 
    ? parseFloat(value.replace(/[^0-9.-]+/g, "")) 
    : value;

  // Nếu không phải số, hiển thị nguyên bản
  if (isNaN(numericValue)) {
    return <span className={className}>{value}</span>;
  }

  const formatted = formatCompactNumber(numericValue, digits);

  return (
    <span className={cn("inline-flex items-baseline gap-0.5 tabular-nums font-bold tracking-tight", className)}>
      <span>{formatted}</span>
      {unit && (
        <span className="text-[0.65em] font-medium opacity-80 ml-0.5 uppercase">
          {unit}
        </span>
      )}
    </span>
  );
};
