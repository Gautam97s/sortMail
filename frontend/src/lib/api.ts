import axios from 'axios';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Force HTTPS in production.
 * Guards against NEXT_PUBLIC_API_URL being set with http:// in Vercel,
 * which causes Mixed Content errors (HTTPS page → HTTP request blocked).
 */
const API_URL =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? RAW_API_URL.replace(/^http:\/\//, 'https://')
        : RAW_API_URL;

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required: sends HttpOnly auth cookie cross-origin
    headers: {
        'Content-Type': 'application/json',
    },
});

export const endpoints = {
    // Core
    dashboard: '/api/dashboard',
    threads: '/api/threads',
    tasks: '/api/tasks',
    drafts: '/api/drafts',
    waitingFor: '/api/reminders',
    emailSync: '/api/emails/sync',
    // User
    authMe: '/api/auth/me',
    updateProfile: '/api/auth/users/me',
    // Notifications
    notifications: '/api/notifications',
    notificationPrefs: '/api/notifications/preferences',
    // Credits
    creditsMe: '/api/credits/me',
    creditsTransactions: '/api/credits/me/transactions',
    // Contacts & Calendar
    contacts: '/api/threads/contacts',
    calendarSuggestions: '/api/tasks/calendar-suggestions',
    // Accounts
    connectedAccounts: '/api/connected-accounts',
    // Admin
    adminUsers: '/api/admin/users',
    adminCreditsAdjust: '/api/admin/credits/adjust',
};

