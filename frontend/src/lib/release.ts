import { UserProfile } from '@/types/dashboard';

export type FeatureKey =
    | 'chatbot'
    | 'semantic_search'
    | 'attachment_intelligence'
    | 'experiments_console'
    | 'notifications_center';

const parseBool = (value: string | undefined, defaultValue: boolean): boolean => {
    if (value === undefined) return defaultValue;
    return value.toLowerCase() === 'true';
};

const parseCsv = (value: string | undefined): string[] => {
    if (!value) return [];
    return value
        .split(',')
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean);
};

export const RELEASE = {
    version: process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0-beta',
    channel: process.env.NEXT_PUBLIC_RELEASE_CHANNEL || 'beta',
};

const INTERNAL_TESTERS = parseCsv(process.env.NEXT_PUBLIC_INTERNAL_TESTER_EMAILS);

const FEATURE_SWITCHES: Record<FeatureKey, boolean> = {
    chatbot: parseBool(process.env.NEXT_PUBLIC_ENABLE_CHATBOT, false),
    semantic_search: parseBool(process.env.NEXT_PUBLIC_ENABLE_SEMANTIC_SEARCH, true),
    attachment_intelligence: parseBool(process.env.NEXT_PUBLIC_ENABLE_ATTACHMENT_INTEL, true),
    experiments_console: parseBool(process.env.NEXT_PUBLIC_ENABLE_EXPERIMENTS_CONSOLE, false),
    notifications_center: parseBool(process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS_CENTER, true),
};

export const isInternalTester = (user?: Pick<UserProfile, 'email' | 'role'> | null): boolean => {
    if (!user) return false;
    const email = user.email?.toLowerCase() || '';
    return user.role === 'admin' || INTERNAL_TESTERS.includes(email);
};

export const isFeatureEnabled = (
    feature: FeatureKey,
    user?: Pick<UserProfile, 'email' | 'role'> | null,
): boolean => {
    if (isInternalTester(user)) return true;
    return FEATURE_SWITCHES[feature];
};
