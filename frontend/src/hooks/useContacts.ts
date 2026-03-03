import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Contact } from '@/types/dashboard';

export function useContacts() {
    return useQuery<Contact[]>({
        queryKey: ['contacts'],
        queryFn: async () => {
            const { data } = await api.get(endpoints.contacts);
            return data;
        },
        staleTime: 1000 * 60 * 5,
    });
}

export function useToggleUnsubscribe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (contactId: string) => {
            const { data } = await api.post(endpoints.contactUnsubscribe(contactId));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
        },
    });
}
