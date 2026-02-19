"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp, Paperclip, FileText } from "lucide-react";
import Avatar from "@/components/shared/Avatar";
import type { Message } from "@/types/dashboard";

interface MessageItemProps {
    message: Message;
    defaultExpanded?: boolean;
}

export default function MessageItem({ message, defaultExpanded = false }: MessageItemProps) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <div className={`border-b border-border-light last:border-b-0 ${message.isFromUser ? "bg-paper-mid/50" : ""}`}>
            {/* Message Header */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-paper-mid transition-colors text-left"
            >
                <Avatar initials={message.sender.initials} size="sm" />

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                            {message.sender.name}
                        </span>
                        {message.isFromUser && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-paper-deep text-muted font-mono">You</span>
                        )}
                    </div>
                    {!expanded && (
                        <div className="text-xs text-muted truncate mt-0.5">
                            {message.bodyText.split("\n")[0]}
                        </div>
                    )}
                </div>

                <span className="text-xs font-mono text-muted shrink-0">{message.timestamp}</span>
                {expanded ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
            </button>

            {/* Message Body */}
            {expanded && (
                <div className="px-5 pb-4 pl-16 animate-fade-up">
                    <div className="text-sm text-ink-mid leading-relaxed whitespace-pre-line">
                        {message.bodyText}
                    </div>

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <span className="section-label">Attachments</span>
                            {message.attachments.map((att) => (
                                <div
                                    key={att.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-border-light bg-white hover:bg-paper-mid transition-colors cursor-pointer"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-paper-deep flex items-center justify-center shrink-0">
                                        <FileText size={16} className="text-ink-light" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-ink truncate">{att.filename}</div>
                                        <div className="text-xs text-muted">
                                            {(att.sizeBytes / 1000).toFixed(0)} KB
                                        </div>
                                    </div>
                                    {att.aiSummary && (
                                        <span className="ai-badge shrink-0">AI Summary</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
