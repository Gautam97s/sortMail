import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { TaskDTOv1 } from '@/types/dashboard';


export function useTasks() {
    return useQuery({
        queryKey: ['tasks'],
        queryFn: async (): Promise<TaskDTOv1[]> => {
            const { data } = await api.get(endpoints.tasks);
            return data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}
