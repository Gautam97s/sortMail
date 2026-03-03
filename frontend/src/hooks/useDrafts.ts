import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { DraftDTOv1, AiDraft } from '@/types/dashboard';

/** Fetch draft for an in-progress generation (existing generate flow) */
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

/** Fetch all AI-generated (pending) drafts from the backend */
export function useAiDrafts() {
    return useQuery<AiDraft[]>({
        queryKey: ['ai-drafts'],
        queryFn: async () => {
            const { data } = await api.get(endpoints.drafts);
            return Array.isArray(data) ? data : [];
        },
        staleTime: 1000 * 60 * 2,
    });
}

/** Approve a stored AI draft for immediate send */
export function useApproveDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (draftId: string) => {
            const { data } = await api.post(endpoints.draftApprove(draftId));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-drafts'] });
        },
    });
}

/** Schedule a stored AI draft for 'Send Later' */
export function useScheduleDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ draftId, scheduledForDate }: { draftId: string; scheduledForDate: string }) => {
            const { data } = await api.post(endpoints.draftSchedule(draftId), { scheduled_for_date: scheduledForDate });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-drafts'] });
        },
    });
}

