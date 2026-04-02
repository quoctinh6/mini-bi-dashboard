import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { dataServices } from '@/services/apiService';
import { DataRecord } from '@/components/data/DataManagementTable';

export const useTotalTransactions = () => {
  return useQuery({
    queryKey: ['transactions', 'total'],
    queryFn: async () => {
      const res = await dataServices.getTransactionCount();
      if (typeof window !== 'undefined') {
        localStorage.setItem('total_transactions', res.total.toString());
      }
      return res.total as number;
    },
    initialData: () => {
      const cached = typeof window !== 'undefined' ? localStorage.getItem('total_transactions') : null;
      if (cached) {
        return parseInt(cached, 10);
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, 
  });
};

export const useTransactions = (filters: any) => {
  return useQuery({
    queryKey: ['transactions', 'all', filters],
    queryFn: async () => {
      // Pass the entire explicit filters object to the backend API route
      const response = await dataServices.getTransactions(filters);
      const mapped: DataRecord[] = response.data.map((t: any) => ({
        id: t.id.toString(),
        date: new Date(t.orderDate).toISOString(),
        category: t.category?.name || 'N/A',
        region: t.region?.name || 'N/A',
        revenue: t.revenue,
        cost: t.cost,
        raw: t 
      }));
      return { data: mapped, meta: response.meta };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 mins
    placeholderData: keepPreviousData,
  });
};
