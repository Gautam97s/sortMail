import { useQuery } from '@tanstack/react-query';
import { threadsApi } from '@/services/api';
import { ThreadIntelV1 } from '@/types/dashboard';

/**
 * specialized hook for polling AI intelligence for a specific thread.
 * If the intelligence is missing or marked as processing, it will poll until ready.
 */
export function useThreadIntel(threadId: string, options: { enabled?: boolean } = {}) {
    return useQuery({
        queryKey: ['threadIntel', threadId],
        queryFn: async (): Promise<ThreadIntelV1 | null> => {
            if (!threadId) return null;

            // In a real app, this would be an API call
            // return await threadsApi.getIntel(threadId);

            // For now, we simulate the logic
            const response = await threadsApi.getThread(threadId);
            // Assuming the thread response might include intel or a separate endpoint is used
            return (response as any).intel || null;
        },
        enabled: !!threadId && options.enabled !== false,
        refetchInterval: (data) => {
            // If data is null or specifically marked as 'processing', poll every 3 seconds
            if (!data) return 3000;
            return false;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
