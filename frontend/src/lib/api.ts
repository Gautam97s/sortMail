import axios from 'axios';

const RAW_URL = process.env.NEXT_PUBLIC_API_URL || 'https://sortmail-production.up.railway.app';
const API_URL = RAW_URL.replace(/^http:\/\/(?!localhost)/, 'https://');

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

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
    contacts: '/api/threads/contacts',
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
    navCounts: '/api/app/nav-counts',
    appStatus: '/api/app/status',
};
