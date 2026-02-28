'use client';

import React from "react";
import { Sparkles, Copy, AlertCircle, Info, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ActionItemCard from "./ActionItemCard";
import AttachmentIntelCard from "./AttachmentIntelCard";
import { ThreadIntelV1 } from "@/types/dashboard";

interface SummaryPanelProps {
    intel: ThreadIntelV1;
    onActionComplete?: (index: number) => void;
    onAskAI?: (context: string) => void;
}

export default function SummaryPanel({ intel, onActionComplete, onAskAI }: SummaryPanelProps) {
    const handleCopy = () => {
        navigator.clipboard.writeText(intel.summary);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header: Intent & Urgency */}
            <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="flex items-center gap-3">
                    <Badge
                        variant={intel.urgency_score > 70 ? "destructive" : "secondary"}
                        className="font-mono text-[10px] uppercase tracking-widest px-2"
                    >
                        {intel.intent.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                        Urgency: <span className={intel.urgency_score > 70 ? "text-danger" : "text-accent"}>{intel.urgency_score}</span>/100
                    </span>
                </div>
                <div className="flex gap-1">
                    <Badge variant="outline" className="text-[9px] opacity-50 uppercase font-mono">
                        {intel.model_version}
                    </Badge>
                </div>
            </div>

            {/* AI Summary Section */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" />
                        <h3 className="section-label mb-0 text-ai">Executive Summary</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 text-[10px] gap-1 px-2 text-muted-foreground hover:text-ai">
                        <Copy className="h-3 w-3" /> Copy
                    </Button>
                </div>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ai/20 to-purple-400/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                    <div className="relative p-5 rounded-xl bg-paper-mid border border-ai/10 leading-relaxed text-sm text-ink-mid">
                        {intel.summary}
                    </div>
                </div>
            </section>

            {/* Main Ask / Decision Needed */}
            {(intel.main_ask || intel.decision_needed) && (
                <section className="p-4 rounded-xl bg-accent/5 border border-accent/10 space-y-2">
                    <div className="flex items-center gap-2 text-accent">
                        <Zap size={14} className="fill-accent/20" />
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Crucial Outcome</span>
                    </div>
                    <p className="text-sm font-medium text-ink leading-snug">
                        {intel.main_ask || intel.decision_needed}
                    </p>
                </section>
            )}

            {/* Action Items List */}
            {intel.suggested_action && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Info size={14} className="text-muted-foreground" />
                        <h3 className="section-label mb-0">Action Items</h3>
                    </div>
                    <div className="space-y-2">
                        {intel.suggested_reply_points.map((point, i) => (
                            <ActionItemCard
                                key={i}
                                title={point}
                                priority={intel.urgency_score > 70 ? 'do_now' : 'do_today'}
                                isAIGenerated
                                onComplete={() => onActionComplete?.(i)}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Attachment Intelligence */}
            {intel.attachment_summaries && intel.attachment_summaries.length > 0 && (
                <section className="space-y-4">
                    <h3 className="section-label">Attachment Insights</h3>
                    <div className="space-y-3">
                        {intel.attachment_summaries.map((att) => (
                            <AttachmentIntelCard
                                key={att.attachment_id}
                                filename={att.attachment_id}
                                intel={att}
                                onAskAI={() => onAskAI?.(`Tell me more about ${att.attachment_id}`)}
                            />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
