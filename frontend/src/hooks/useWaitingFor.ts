import { useQuery } from '@tanstack/react-query';
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
