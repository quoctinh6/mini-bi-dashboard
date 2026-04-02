import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCompactNumber(number: number, maximumSignificantDigits: number = 5): string {
  if (isNaN(number) || number === null || number === undefined) return '0';
  
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumSignificantDigits,
    compactDisplay: 'short'
  });
  
  return formatter.format(number).toLowerCase();
}
