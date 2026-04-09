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

/** Fetch a single draft by id (used for edit/view flows) */
export function useDraftById(draftId?: string) {
    return useQuery<AiDraft>({
        queryKey: ['ai-draft', draftId],
        queryFn: async () => {
            const { data } = await api.get(`${endpoints.drafts}/${draftId}`);
            return data;
        },
        enabled: Boolean(draftId),
        staleTime: 1000 * 30,
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
            queryClient.invalidateQueries({ queryKey: ['threads'] });
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
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}

/** Persist edits to an existing draft */
export function useUpdateDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ draftId, subject, body, tone }: { draftId: string; subject?: string; body?: string; tone?: string }) => {
            const { data } = await api.patch(`${endpoints.drafts}/${draftId}`, {
                subject,
                body,
                tone,
            });
            return data as AiDraft;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ai-drafts'] });
            queryClient.invalidateQueries({ queryKey: ['ai-draft', data.id] });
        },
    });
}

/** Generate a new AI draft for a thread */
export function useGenerateDraft() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ threadId, tone, additionalContext }: { threadId: string; tone: string; additionalContext?: string }) => {
            const { data } = await api.post(endpoints.drafts + '/', {
                thread_id: threadId,
                tone,
                additional_context: additionalContext || null,
            });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['ai-drafts'] });
            queryClient.invalidateQueries({ queryKey: ['threads'] });
        },
    });
}

/** Regenerate an existing draft */
export function useRegenerateDraft() {
    return useMutation({
        mutationFn: async ({ draftId, tone }: { draftId: string; tone?: string }) => {
            const { data } = await api.post(endpoints.draftRegenerate(draftId), { tone });
            return data;
        },
    });
}
