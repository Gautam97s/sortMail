import { useQuery } from '@tanstack/react-query';
import { api, endpoints } from '@/lib/api';

export interface SettingsData {
    rules: any[];
    sessions: any[];
    integrations: any[];
    teamMembers: any[];
    aiPreferences?: {
        model: string;
        tone: string;
        auto_draft: boolean;
        summary_length: number;
    };
    privacyPreferences?: {
        data_retention: string;
        email_tracking: boolean;
        read_receipts: boolean;
    };
}

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async (): Promise<SettingsData> => {
            const { data } = await api.get(endpoints.settings);
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes cache
    });
}
