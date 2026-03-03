import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';
import { Contact, ThreadListItem } from '@/types/dashboard';

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

export function useContact(email: string) {
    return useQuery<Contact>({
        queryKey: ['contact', email],
        queryFn: async () => {
            const { data } = await api.get(endpoints.contactByEmail(email));
            return data;
        },
        enabled: !!email,
        staleTime: 1000 * 60 * 10,
    });
}

export function useContactThreads(contactId: string) {
    return useQuery<ThreadListItem[]>({
        queryKey: ['contact-threads', contactId],
        queryFn: async () => {
            const { data } = await api.get(endpoints.contactThreads(contactId));
            return data;
        },
        enabled: !!contactId,
        staleTime: 1000 * 60 * 5,
    });
}

export function useToggleUnsubscribe() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ contactId, email }: { contactId: string; email: string }) => {
            const { data } = await api.post(endpoints.contactUnsubscribe(contactId));
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['contact', variables.email] });
        },
    });
}

export function useAddContactTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ contactId, name, color_hex }: { contactId: string; name: string; color_hex?: string }) => {
            const { data } = await api.post(endpoints.contactTags(contactId), { name, color_hex });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['contact'] }); // Invalidate all contact details to be safe
        },
    });
}

export function useRemoveContactTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ contactId, tagId }: { contactId: string; tagId: string }) => {
            const { data } = await api.delete(endpoints.contactTagRemove(contactId, tagId));
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['contacts'] });
            queryClient.invalidateQueries({ queryKey: ['contact'] });
        },
    });
}
