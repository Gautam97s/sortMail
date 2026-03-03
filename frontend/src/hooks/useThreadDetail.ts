import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { EmailThreadV1, ThreadIntelV1, TaskDTOv1, DraftDTOv1 } from '@/types/dashboard';


interface ThreadDetailData {
    thread: EmailThreadV1;
    intel: ThreadIntelV1 | null;
    tasks: TaskDTOv1[];
    draft: DraftDTOv1 | null;
}

export function useThreadDetail(threadId: string) {
    return useQuery({
        queryKey: ['thread', threadId],
        queryFn: async (): Promise<ThreadDetailData | null> => {
            if (!threadId) return null;

            // Real API call
            const { data } = await api.get(`${endpoints.threads}/${threadId}`);
            return data;
        },
        enabled: !!threadId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
