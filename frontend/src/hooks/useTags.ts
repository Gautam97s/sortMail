import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Tag } from '@/types/dashboard';

export function useTags() {
    return useQuery<Tag[]>({
        queryKey: ['tags'],
        queryFn: async () => {
            const { data } = await api.get(endpoints.tags);
            return data;
        },
        staleTime: 1000 * 60 * 10,
    });
}

export function useUpdateTagColor() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ tagId, color_hex }: { tagId: string; color_hex: string }) => {
            const { data } = await api.patch(`${endpoints.tags}/${tagId}`, { color_hex });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tags'] });
        },
    });
}
