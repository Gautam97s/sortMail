import { ThreadListItem, EmailThreadV1 } from '@/types/dashboard';

/**
 * Maps backend API response to frontend ThreadListItem
 * @param backendData - raw data from API
 * @returns ThreadListItem
 */
export function mapThreadToListItem(backendData: any): ThreadListItem {
    return {
        thread_id: backendData.id || backendData.thread_id,
        external_id: backendData.external_id || "",
        subject: backendData.subject,
        summary: backendData.summary || "No summary available",
        urgency_score: backendData.urgency_score || 0,
        days_waiting: backendData.days_waiting || 0,
        intent: backendData.intent || 'FYI',
        has_attachments: backendData.has_attachments || false,
        last_updated: backendData.last_updated || new Date().toISOString(),
        is_read: backendData.is_read !== undefined ? backendData.is_read : (backendData.is_unread === 0),
        participants: backendData.participants || [],
        tags: backendData.tags || [],
    };
}
