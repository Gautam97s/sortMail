/**
 * Gemini Service — Mock AI functions
 * Uses LegacyEmail for backward-compat, new Email type for modern components.
 */

import type { LegacyEmail } from '@/types/dashboard';

export const generateBriefing = async (emails: LegacyEmail[]): Promise<string> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("- 3 High priority emails require immediate action relating to Q3 goals.\n- Marketing campaign approval pending for 'Winter Glow'.\n- Server CPU usage alert resolved automatically.");
        }, 1200);
    });
};

export const analyzeEmailContent = async (body: string, sender: string, subject: string) => {
    return new Promise<{ summary: string[]; actionItems: string[] }>((resolve) => {
        setTimeout(() => {
            resolve({
                summary: [
                    `Key topic: ${subject}`,
                    `Sender ${sender} is requesting updates.`,
                    "Urgency detected in tone.",
                ],
                actionItems: [
                    "Reply to sender",
                    "Schedule follow-up meeting",
                    "Review attached documents",
                ],
            });
        }, 1000);
    });
};

export const generateDraftReply = async (email: LegacyEmail, tone: string) => {
    return new Promise<string>((resolve) => {
        setTimeout(() => {
            resolve(`Hi ${email.sender.split(' ')[0]},\n\nThis is a generated ${tone} reply draft acknowledging the receipt of "${email.subject}".\n\nBest,\nUser`);
        }, 800);
    });
};
