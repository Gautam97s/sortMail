import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { WaitingForDTOv1 } from '@/types/dashboard';


export function useWaitingFor() {
    return useQuery({
        queryKey: ['waiting-for'],
        queryFn: async (): Promise<WaitingForDTOv1[]> => {
            const { data } = await api.get(endpoints.waitingFor);
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useDismissWaitingFor() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (waitingId: string): Promise<void> => {
            await api.delete(`${endpoints.waitingFor}/${waitingId}`);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['waiting-for'] });
            qc.invalidateQueries({ queryKey: ['threads'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
