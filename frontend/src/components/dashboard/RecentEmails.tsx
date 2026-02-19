"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Paperclip, Sparkles } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import PriorityBadge from "@/components/shared/PriorityBadge";
import type { Email } from "@/types/dashboard";

interface RecentEmailsProps {
    emails: Email[];
    limit?: number;
}

export default function RecentEmails({ emails, limit = 5 }: RecentEmailsProps) {
    const shown = emails.slice(0, limit);

    return (
        <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                <h3 className="font-display text-base text-ink">Recent Emails</h3>
                <Link href="/inbox" className="btn-ghost text-accent text-xs">
                    View All <ArrowRight size={12} />
                </Link>
            </div>

            <div className="divide-y divide-border-light">
                {shown.map((email) => (
                    <Link
                        key={email.id}
                        href={`/inbox/${email.threadId}`}
                        className={`email-card gap-4 group ${!email.isRead ? "unread" : ""}`}
                    >
                        {/* Unread dot */}
                        <div className="w-2 flex items-start pt-2 shrink-0">
                            {!email.isRead && (
                                <div className="w-2 h-2 rounded-full bg-accent" />
                            )}
                        </div>

                        <Avatar initials={email.sender.initials} size="sm" />

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className={`email-card-sender text-sm ${!email.isRead ? "font-semibold text-ink" : "text-ink-light"}`}>
                                    {email.sender.name}
                                </span>
                                <span className="text-xs font-mono text-muted ml-auto shrink-0">
                                    {email.receivedAt}
                                </span>
                            </div>
                            <div className="text-sm text-ink truncate">{email.subject}</div>
                            <div className="text-xs text-muted truncate mt-0.5">{email.snippet}</div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                            <PriorityBadge priority={email.priority} />
                            <div className="flex items-center gap-2 mt-1">
                                {email.attachments.length > 0 && (
                                    <Paperclip size={12} className="text-muted" />
                                )}
                                {email.aiReady && (
                                    <Sparkles size={12} className="text-ai" />
                                )}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
