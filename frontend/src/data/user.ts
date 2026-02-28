import type { UserProfile, NavCounts, AppStatus } from '@/types/settings';

export const mockUserProfile: UserProfile = {
    firstName: "Isabella",
    lastName: "R.",
    email: "isabella@sortmail.ai",
    plan: "Pro",
    initials: "IR"
};

export const mockNavCounts: NavCounts = {
    inbox: 47,
    tasks: 8,
    followups: 12
};

export const mockAppStatus: AppStatus = {
    isOnline: true,
    lastSync: "5 min ago"
};
