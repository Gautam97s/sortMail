import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { DraftDTOv1 } from '@/types/dashboard';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

export function useDrafts(threadId?: string) {
    return useQuery({
        queryKey: ['drafts', threadId],
        queryFn: async (): Promise<DraftDTOv1 | null> => {
            const params = threadId ? { thread_id: threadId } : {};
            const { data } = await api.get(endpoints.drafts, { params });
            return data;
        },
        staleTime: 1000 * 60 * 2,
    });
}
