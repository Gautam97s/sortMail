"use client";

import React from "react";
import { Sparkles, Copy, CheckCircle2, FileText, AlertCircle } from "lucide-react";
import type { ThreadDetail } from "@/types/dashboard";

interface SummaryPanelProps {
    intel: ThreadDetail["intel"];
    attachments: ThreadDetail["attachments"];
}

export default function SummaryPanel({ intel, attachments }: SummaryPanelProps) {
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-5">
            {/* AI Summary */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-ai" />
                    <span className="section-label mb-0">AI Summary</span>
                </div>
                <div className="p-4 rounded-lg bg-ai-soft/50 border border-[#D4C8FF]/50">
                    <p className="text-sm text-ink-mid leading-relaxed">{intel.summary}</p>
                    <button
                        onClick={() => handleCopy(intel.summary)}
                        className="btn-ghost mt-2 text-xs text-ai"
                    >
                        <Copy size={12} /> Copy
                    </button>
                </div>
            </div>

            {/* Intent & Urgency */}
            <div className="flex items-center gap-3">
                <span className="priority-badge priority-urgent">
                    <AlertCircle size={10} /> {intel.intent}
                </span>
                <span className="text-xs font-mono text-muted">
                    Urgency: {intel.urgencyScore}/100
                </span>
            </div>

            {/* Main Ask */}
            <div>
                <span className="section-label">Main Ask</span>
                <div className="p-3 rounded-lg bg-paper-mid border border-border-light">
                    <p className="text-sm text-ink font-medium">{intel.mainAsk}</p>
                </div>
            </div>

            {/* Action Items */}
            <div>
                <span className="section-label">Action Items</span>
                <div className="space-y-2">
                    {intel.actionItems.map((item, i) => (
                        <div
                            key={i}
                            className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-paper-mid transition-colors cursor-pointer group"
                        >
                            <CheckCircle2 size={14} className="text-muted mt-0.5 group-hover:text-success transition-colors shrink-0" />
                            <span className="text-sm text-ink-mid">{item}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Attachment Summaries */}
            {attachments.length > 0 && (
                <div>
                    <span className="section-label">Attachment Intelligence</span>
                    <div className="space-y-2">
                        {attachments.map((att) => (
                            <div key={att.id} className="p-3 rounded-lg border border-border-light bg-white">
                                <div className="flex items-center gap-2 mb-2">
                                    <FileText size={14} className="text-ink-light" />
                                    <span className="text-sm font-medium text-ink truncate">
                                        {att.filename}
                                    </span>
                                </div>
                                {att.aiSummary && (
                                    <p className="text-xs text-muted mb-2">{att.aiSummary}</p>
                                )}
                                {att.keyPoints && att.keyPoints.length > 0 && (
                                    <ul className="space-y-1">
                                        {att.keyPoints.map((point, i) => (
                                            <li key={i} className="text-xs text-ink-light flex items-start gap-1.5">
                                                <span className="text-accent mt-0.5">•</span>
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
