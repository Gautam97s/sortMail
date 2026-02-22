import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required: sends HttpOnly auth cookie cross-origin
    headers: {
        'Content-Type': 'application/json',
    },
});

export const endpoints = {
    dashboard: '/api/dashboard',
    threads: '/api/threads',
    tasks: '/api/tasks',
    drafts: '/api/drafts',
    waitingFor: '/api/reminders',
    notifications: '/api/notifications',
    contacts: '/api/threads/contacts',
    calendarSuggestions: '/api/tasks/calendar-suggestions',
    emailSync: '/api/emails/sync',
};
