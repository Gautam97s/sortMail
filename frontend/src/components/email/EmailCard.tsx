"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Paperclip, Sparkles, Archive, FileText, CheckSquare, FileEdit } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import PriorityBadge from "@/components/shared/PriorityBadge";
import type { Email } from "@/types/dashboard";

interface EmailCardProps {
    email: Email;
}

export default function EmailCard({ email }: EmailCardProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <Link
            href={`/inbox/${email.threadId}`}
            className={`email-card gap-4 group relative ${!email.isRead ? "unread" : ""}`}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Unread indicator */}
            <div className="w-2 flex items-start pt-3 shrink-0">
                {!email.isRead && (
                    <div className="w-2 h-2 rounded-full bg-accent" />
                )}
            </div>

            {/* Avatar */}
            <Avatar initials={email.sender.initials} size="md" />

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-sm truncate ${!email.isRead ? "font-semibold text-ink" : "text-ink-light"}`}>
                        {email.sender.name}
                    </span>
                    <span className="text-xs font-mono text-muted ml-auto shrink-0">
                        {email.receivedAt}
                    </span>
                </div>
                <div className={`text-sm truncate mb-0.5 ${!email.isRead ? "text-ink font-medium" : "text-ink-mid"}`}>
                    {email.subject}
                </div>
                <div className="text-xs text-muted truncate">
                    {email.snippet}
                </div>
            </div>

            {/* Meta */}
            <div className="flex flex-col items-end gap-1.5 shrink-0">
                <PriorityBadge priority={email.priority} />
                <div className="flex items-center gap-2">
                    {email.attachments.length > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted">
                            <Paperclip size={11} />
                            {email.attachments.length}
                        </span>
                    )}
                    {email.aiReady && (
                        <span className="ai-badge">
                            <Sparkles size={10} /> AI
                        </span>
                    )}
                </div>
            </div>

            {/* Quick Actions (hover overlay) */}
            {hovered && (
                <div
                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-white border border-border-light rounded-lg shadow-md px-1 py-1 animate-fade-in z-10"
                    onClick={(e) => e.preventDefault()}
                >
                    <button className="btn-ghost px-2 py-1.5" title="AI Summary">
                        <FileText size={14} />
                    </button>
                    <button className="btn-ghost px-2 py-1.5" title="Create Task">
                        <CheckSquare size={14} />
                    </button>
                    <button className="btn-ghost px-2 py-1.5" title="Draft Reply">
                        <FileEdit size={14} />
                    </button>
                    <button className="btn-ghost px-2 py-1.5" title="Archive">
                        <Archive size={14} />
                    </button>
                </div>
            )}
        </Link>
    );
}
