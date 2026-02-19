"use client";

import React from "react";
import { Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import type { Briefing } from "@/types/dashboard";

interface AIBriefingProps {
    briefing: Briefing;
}

export default function AIBriefing({ briefing }: AIBriefingProps) {
    return (
        <div className="card p-6 relative overflow-hidden">
            {/* AI accent stripe */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ai to-accent opacity-60" />

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-ai-soft flex items-center justify-center">
                        <Sparkles size={16} className="text-ai" />
                    </div>
                    <div>
                        <h3 className="text-base font-display text-ink">Morning Briefing</h3>
                        <span className="text-xs font-mono text-muted">{briefing.date}</span>
                    </div>
                </div>

                <button className="btn-ghost" title="Refresh briefing">
                    <RefreshCw size={14} />
                </button>
            </div>

            <p className="text-body text-ink-light leading-relaxed mb-5">
                {briefing.summary}
            </p>

            {/* Suggested Actions */}
            <div className="space-y-2">
                <span className="section-label">Suggested Actions</span>
                {briefing.suggestedActions.map((action, i) => (
                    <div
                        key={i}
                        className="flex items-start gap-3 p-3 rounded-lg bg-paper-mid hover:bg-paper-deep transition-colors cursor-pointer group"
                    >
                        <CheckCircle2 size={16} className="text-muted mt-0.5 group-hover:text-success transition-colors shrink-0" />
                        <span className="text-sm text-ink">{action}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
