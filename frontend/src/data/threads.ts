import type {
    EmailThreadV1,
    ThreadIntelV1,
    ThreadListItem
} from '@/types/dashboard';

export const mockThreads: EmailThreadV1[] = [
    {
        thread_id: 'thread-001',
        external_id: '18d5f6a7b8c9d0e1',
        subject: 'Contract Review - Final Terms',
        participants: ['sarah@client.com', 'you@company.com'],
        messages: [
            {
                message_id: 'msg-001-a',
                from_address: 'you@company.com',
                to_addresses: ['sarah@client.com'],
                cc_addresses: [],
                subject: 'Contract Review - Final Terms',
                body_text: "Hi Sarah,\n\nCould you please send over the final contract terms when ready?\n\nBest,\nUser",
                sent_at: '2026-02-14T08:00:00Z',
                is_from_user: true,
            },
            {
                message_id: 'msg-001-b',
                from_address: 'sarah@client.com',
                to_addresses: ['you@company.com'],
                cc_addresses: [],
                subject: 'Re: Contract Review - Final Terms',
                body_text: "Hi,\n\nPlease find the final contract terms attached. We need your approval by Friday EOD.\n\nKey changes from the last version:\n- Payment terms moved to NET 30\n- Liability cap increased to $500K\n\nLet me know if you have any questions.\n\nBest,\nSarah",
                sent_at: '2026-02-16T14:30:00Z',
                is_from_user: false,
            },
        ],
        attachments: [
            {
                attachment_id: 'att-001',
                filename: 'Contract_ClientA_Jan2026.pdf',
                original_filename: 'scan001.pdf',
                mime_type: 'application/pdf',
                storage_path: '/storage/attachments/att-001.pdf',
                size_bytes: 245760,
            },
        ],
        last_updated: '2026-02-16T14:30:00Z',
        provider: 'gmail',
    },
    {
        thread_id: 'thread-002',
        external_id: '18d5f6a7b8c9d0e2',
        subject: 'Q3 Marketing Budget Approval',
        participants: ['mike.chen@company.com', 'you@company.com', 'cfo@company.com'],
        messages: [
            {
                message_id: 'msg-002-a',
                from_address: 'mike.chen@company.com',
                to_addresses: ['you@company.com'],
                cc_addresses: ['cfo@company.com'],
                subject: 'Q3 Marketing Budget Approval',
                body_text: "Hi,\n\nAttached is the Q3 marketing budget proposal. Total spend is $45K, up 12% from Q2.\n\nKey highlights:\n- Increased spend on content ($15K)\n- New influencer program ($8K)\n- Reduced paid search (-$3K)\n\nNeed approval by Wednesday.\n\nMike",
                sent_at: '2026-02-15T09:15:00Z',
                is_from_user: false,
            },
        ],
        attachments: [
            {
                attachment_id: 'att-002',
                filename: 'Q3_Marketing_Budget.xlsx',
                original_filename: 'budget_q3.xlsx',
                mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                storage_path: '/storage/attachments/att-002.xlsx',
                size_bytes: 89600,
            },
        ],
        last_updated: '2026-02-15T09:15:00Z',
        provider: 'gmail',
    },
    {
        thread_id: 'thread-003',
        external_id: '18d5f6a7b8c9d0e3',
        subject: 'Team standup notes - Feb 14',
        participants: ['alex@company.com', 'you@company.com', 'team@company.com'],
        messages: [
            {
                message_id: 'msg-003-a',
                from_address: 'alex@company.com',
                to_addresses: ['team@company.com'],
                cc_addresses: [],
                subject: 'Team standup notes - Feb 14',
                body_text: "Hi team,\n\nHere are the standup notes:\n- Sprint velocity is on track\n- Backend API v2 deployed to staging\n- Frontend redesign merged to main\n\nNo blockers.\n\nAlex",
                sent_at: '2026-02-14T10:30:00Z',
                is_from_user: false,
            },
        ],
        attachments: [],
        last_updated: '2026-02-14T10:30:00Z',
        provider: 'gmail',
    },
    {
        thread_id: 'thread-004',
        external_id: '18d5f6a7b8c9d0e4',
        subject: 'Urgent: Server downtime alert',
        participants: ['devops@company.com', 'you@company.com'],
        messages: [
            {
                message_id: 'msg-004-a',
                from_address: 'devops@company.com',
                to_addresses: ['you@company.com'],
                cc_addresses: [],
                subject: 'Urgent: Server downtime alert',
                body_text: "ALERT: Production server response time has exceeded 2s threshold.\n\nAffected services:\n- User authentication API\n- Payment processing\n\nInvestigation in progress. ETA for fix: 2 hours.\n\n-- DevOps Bot",
                sent_at: '2026-02-16T16:00:00Z',
                is_from_user: false,
            },
        ],
        attachments: [],
        last_updated: '2026-02-16T16:00:00Z',
        provider: 'outlook',
    },
    {
        thread_id: 'thread-005',
        external_id: '18d5f6a7b8c9d0e5',
        subject: 'Partnership proposal - StreamlineAI',
        participants: ['jessica@streamlineai.com', 'you@company.com'],
        messages: [
            {
                message_id: 'msg-005-a',
                from_address: 'jessica@streamlineai.com',
                to_addresses: ['you@company.com'],
                cc_addresses: [],
                subject: 'Partnership proposal - StreamlineAI',
                body_text: "Hi,\n\nWe would love to explore a partnership between our companies. StreamlineAI specializes in workflow automation and we think there is strong synergy.\n\nWould you be open to a 30-min call next Tuesday?\n\nBest,\nJessica Park\nHead of Partnerships, StreamlineAI",
                sent_at: '2026-02-13T11:20:00Z',
                is_from_user: false,
            },
        ],
        attachments: [
            {
                attachment_id: 'att-005',
                filename: 'StreamlineAI_Partnership_Deck.pdf',
                original_filename: 'partnership_deck.pdf',
                mime_type: 'application/pdf',
                storage_path: '/storage/attachments/att-005.pdf',
                size_bytes: 1572864,
            },
        ],
        last_updated: '2026-02-13T11:20:00Z',
        provider: 'outlook',
    },
];

export const mockThreadIntel: Record<string, ThreadIntelV1> = {
    'thread-001': {
        thread_id: 'thread-001',
        summary: 'Sarah sent the final contract terms and needs approval by Friday EOD. Key changes include NET 30 payment terms and $500K liability cap.',
        intent: 'action_required',
        urgency_score: 75,
        main_ask: 'Approve or request changes to contract',
        decision_needed: 'Contract approval',
        extracted_deadlines: [
            {
                raw_text: 'by Friday EOD',
                normalized: '2026-02-21T17:00:00Z',
                confidence: 0.92,
                source: 'msg-001-b',
            },
        ],
        entities: [
            { entity_type: 'amount', value: '$500K', confidence: 0.95 },
            { entity_type: 'person', value: 'Sarah', confidence: 0.99 },
        ],
        attachment_summaries: [
            {
                attachment_id: 'att-001',
                summary: 'Master Services Agreement between Company and ClientA. Covers 12-month engagement with defined deliverables and payment terms.',
                key_points: [
                    '12-month contract term',
                    'NET 30 payment terms',
                    '$500K liability cap',
                    'Includes IP assignment clause',
                ],
                document_type: 'contract',
                importance: 'high',
            },
        ],
        suggested_action: 'Review attached contract and respond with approval or concerns',
        suggested_reply_points: [
            'Confirm receipt of contract',
            'Acknowledge the updated terms',
            'State your decision',
        ],
        model_version: 'gemini-1.5-pro',
        processed_at: '2026-02-16T14:35:00Z',
    },
    'thread-002': {
        thread_id: 'thread-002',
        summary: 'Mike is requesting approval for the Q3 marketing budget. Total spend is $45K, a 12% increase from Q2. He needs a decision by Wednesday.',
        intent: 'action_required',
        urgency_score: 60,
        main_ask: 'Approve or adjust Q3 marketing budget',
        decision_needed: 'Budget approval',
        extracted_deadlines: [
            {
                raw_text: 'by Wednesday',
                normalized: '2026-02-19T17:00:00Z',
                confidence: 0.88,
                source: 'msg-002-a',
            },
        ],
        entities: [
            { entity_type: 'amount', value: '$45K', confidence: 0.96 },
            { entity_type: 'person', value: 'Mike Chen', confidence: 0.97 },
        ],
        attachment_summaries: [
            {
                attachment_id: 'att-002',
                summary: 'Q3 Marketing Budget spreadsheet with line-by-line breakdown. Shows 12% increase driven by content and influencer programs.',
                key_points: ['Content: $15K', 'Influencer: $8K', 'Paid search reduced by $3K'],
                document_type: 'budget',
                importance: 'high',
            },
        ],
        suggested_action: 'Review budget spreadsheet and approve or request adjustments',
        suggested_reply_points: [
            'Acknowledge budget proposal',
            'Comment on content spend increase',
            'Approve or flag concerns',
        ],
        model_version: 'gemini-1.5-pro',
        processed_at: '2026-02-15T10:00:00Z',
    },
    'thread-004': {
        thread_id: 'thread-004',
        summary: 'Production server alert - response times exceeding 2s threshold. Auth API and payments affected. Fix ETA is 2 hours.',
        intent: 'urgent',
        urgency_score: 95,
        main_ask: null,
        decision_needed: null,
        extracted_deadlines: [],
        entities: [
            { entity_type: 'service', value: 'User authentication API', confidence: 0.98 },
            { entity_type: 'service', value: 'Payment processing', confidence: 0.97 },
        ],
        attachment_summaries: [],
        suggested_action: 'Monitor the situation and coordinate with DevOps',
        suggested_reply_points: [],
        model_version: 'gemini-1.5-pro',
        processed_at: '2026-02-16T16:05:00Z',
    },
};

export const mockThreadListItems: ThreadListItem[] = mockThreads.map(t => ({
    thread_id: t.thread_id,
    subject: t.subject,
    summary: mockThreadIntel[t.thread_id]?.summary ?? (t.messages[0]?.body_text || '').slice(0, 100) + '...',
    intent: mockThreadIntel[t.thread_id]?.intent ?? 'unknown',
    urgency_score: mockThreadIntel[t.thread_id]?.urgency_score ?? 0,
    last_updated: t.last_updated,
    has_attachments: t.attachments.length > 0,
    days_waiting: 0,
    is_read: false,
}));
// Helper: Extract sender display info 
export function getSenderInfo(email: string): { name: string; initials: string } {
    const name = email.split('@')[0]
        .split('.')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');
    const parts = name.split(' ');
    const initials = parts.length >= 2
        ? parts[0][0] + parts[1][0]
        : parts[0].slice(0, 2).toUpperCase();
    return { name, initials };
}
