"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Đảm bảo QueryClient chỉ được tạo 1 lần duy nhất để không bị mất cache khi chuyển trang
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Dữ liệu sẽ được coi là "cũ" sau 1 phút
            refetchOnWindowFocus: false, // Không tự động tải lại khi click chuột ra ngoài tab
          },
        },
      })
  );

  console.log("QueryProvider: Rendering with client", !!queryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
