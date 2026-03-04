import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { ThreadListItem } from '@/types/dashboard';


export function useThreads(intent?: string, q?: string) {
    return useQuery({
        queryKey: ['threads', intent, q],
        queryFn: async (): Promise<ThreadListItem[]> => {
            const params: Record<string, string> = {};
            if (intent && intent !== 'all') params.intent = intent;
            if (q) params.q = q;
            const { data } = await api.get(endpoints.threads, { params });
            return data;
        },
        // Intent/search queries always fetch fresh; all-tab is cached for speed
        staleTime: (intent || q) ? 0 : 1000 * 60 * 5,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
    });
}

export interface NavCounts {
    inbox: number;
    actions: number;
    urgent: number;
    fyi: number;
    drafts: number;
}

export function useNavCounts() {
    return useQuery<NavCounts>({
        queryKey: ['nav-counts'],
        queryFn: async () => {
            const { data } = await api.get('/api/threads/counts');
            return data;
        },
        staleTime: 1000 * 60 * 2,   // Refresh every 2 minutes
        refetchOnWindowFocus: true,
        retry: 1,
    });
}
