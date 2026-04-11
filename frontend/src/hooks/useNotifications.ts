import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';

export interface NotificationUnreadCount {
    unread: number;
}

export function useNotificationUnreadCount() {
    return useQuery<NotificationUnreadCount>({
        queryKey: ['notifications-unread-count'],
        queryFn: async () => {
            const { data } = await api.get(endpoints.notificationsUnreadCount);
            return data;
        },
        staleTime: 1000 * 30,
        refetchOnWindowFocus: true,
        refetchInterval: 15000,
        retry: 1,
    });
}
