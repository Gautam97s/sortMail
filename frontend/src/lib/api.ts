import axios from 'axios';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sortmail-production.up.railway.app';
const API_URL = RAW_URL.replace(/^http:\/\/(?!localhost)/, 'https://');

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Intercept 401 Unauthorized globally to boot unauthenticated users to the login screen
if (typeof window !== 'undefined') {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                // Prevent infinite redirect loops on public paths
                const publicPaths = [
                    '/login', '/privacy', '/terms', '/onboarding', '/help',
                    '/callback', '/magic-link-sent', '/verify', '/reset-password'
                ];
                const currentPath = window.location.pathname;

                if (!publicPaths.some(path => currentPath.startsWith(path)) && currentPath !== '/') {
                    window.location.href = '/login';
                }
            }
            return Promise.reject(error);
        }
    );
}


export const endpoints = {
    dashboard: '/api/dashboard',
    threads: '/api/threads',
    tasks: '/api/tasks',
    drafts: '/api/drafts',
    waitingFor: '/api/reminders',
    emailSync: '/api/emails/sync',
    emailSyncStatus: '/api/emails/sync/status',
    eventStream: '/api/events/stream',
    authMe: '/api/auth/me',
    updateProfile: '/api/auth/users/me',
    notifications: '/api/notifications',
    notificationPrefs: '/api/notifications/preferences',
    creditsMe: '/api/credits/me',
    creditsTransactions: '/api/credits/me/transactions',
    contacts: '/api/contacts',
    contactByEmail: (email: string) => `/api/contacts/by-email/${email}`,
    contactThreads: (id: string) => `/api/contacts/${id}/threads`,
    contactUnsubscribe: (id: string) => `/api/contacts/${id}/unsubscribe`,
    contactTags: (id: string) => `/api/contacts/${id}/tags`,
    contactTagRemove: (id: string, tagId: string) => `/api/contacts/${id}/tags/${tagId}`,
    tags: '/api/tags',
    draftApprove: (id: string) => `/api/drafts/${id}/approve`,
    draftSchedule: (id: string) => `/api/drafts/${id}/schedule`,
    draftRegenerate: (id: string) => `/api/drafts/${id}/regenerate`,

    calendarSuggestions: '/api/tasks/calendar-suggestions',
    connectedAccounts: '/api/connected-accounts',
    adminUsers: '/api/admin/users',
    adminCreditsAdjust: '/api/admin/credits/adjust',
    helpCategories: '/api/help/categories',
    helpArticle: (slug: string) => `/api/help/articles/${slug}`,
    teamMembers: '/api/settings/team',
    rules: '/api/settings/rules',
    integrations: '/api/settings/integrations',
    sessions: '/api/settings/sessions',
    developer: '/api/settings/developer',
    billingPlan: '/api/settings/billing/plan',
    privacyPolicy: '/api/legal/privacy',
    termsOfService: '/api/legal/terms',
    landingContent: '/api/content/landing',
    onboardingSteps: '/api/onboarding/steps',
    onboardingTips: '/api/onboarding/tips',
    userProfile: '/api/app/profile',
    navCounts: '/api/threads/counts',
    search: '/api/search',
    appStatus: '/api/app/status',
};
