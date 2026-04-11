import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';

export interface BinItem {
    id: string;
    entity_type: 'thread' | 'task' | 'draft' | 'workflow_reminder' | string;
    entity_id: string;
    entity_label?: string;
    deleted_at: string;
    restore_until: string;
}

export function useBinItems() {
    return useQuery({
        queryKey: ['bin-items'],
        queryFn: async (): Promise<BinItem[]> => {
            const { data } = await api.get(endpoints.bin);
            return data;
        },
    });
}

export function useRestoreBinItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (binItemId: string): Promise<void> => {
            await api.post(`${endpoints.bin}/${binItemId}/restore`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bin-items'] });
            qc.invalidateQueries({ queryKey: ['threads'] });
            qc.invalidateQueries({ queryKey: ['tasks'] });
            qc.invalidateQueries({ queryKey: ['waiting-for'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
            qc.invalidateQueries({ queryKey: ['nav-counts'] });
        },
    });
}

export function usePurgeBinItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (binItemId: string): Promise<void> => {
            await api.delete(`${endpoints.bin}/${binItemId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['bin-items'] });
        },
    });
}
