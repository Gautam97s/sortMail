import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { ThreadListItem } from '@/types/dashboard';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export function useThreads(filter?: string) {
    return useQuery({
        queryKey: ['threads', filter],
        queryFn: async (): Promise<ThreadListItem[]> => {
            const { data } = await api.get(endpoints.threads, { params: { filter } });
            return data;
        },
        staleTime: 1000 * 60 * 5,       // Cache for 5 minutes — no API call on navigation
        gcTime: 1000 * 60 * 10,          // Keep in memory 10 minutes after unmount
        refetchOnWindowFocus: false,      // Don't refetch when tab gets focus
        refetchOnReconnect: false,        // Don't refetch on reconnect
        retry: 1,                         // Only retry once on failure
    });
}
