'use client';

import React from 'react';
import {
    Settings,
    Shield,
    Zap,
    Filter,
    ArrowLeft,
    Plus,
    MoreHorizontal,
    GripVertical,
    CheckCircle2,
    AlertCircle,
    Brain,
    Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockGlobalRules = [
    { id: 'r1', name: 'Spam Auto-Categorization', description: 'Use AI to detect and move marketing fluff to the low-priority queue.', priority: 1, type: 'AI Logic', status: 'Active' },
    { id: 'r2', name: 'Financial Deadline Alert', description: 'Force high-priority notification for any email containing "Invoice" or "Due Date".', priority: 2, type: 'Filtering', status: 'Active' },
    { id: 'r3', name: 'Global Newsletter Digest', description: 'Batch all bulk sender emails into a single 6PM briefing.', priority: 3, type: 'Aggregation', status: 'Paused' },
    { id: 'r4', name: 'Executive Thread Tracking', description: 'Never snooze threads from whitelisted executive domains.', priority: 4, type: 'Security', status: 'Active' },
];

export default function GlobalRulesPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Global System Rules</h1>
                        <p className="text-ink-light text-sm">Configuring platform-wide email processing bottlenecks, AI categorization logic, and priority overrides.</p>
                    </div>
                </div>
                <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                    <Plus size={14} className="mr-2" /> Create Global Rule
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Rules List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border-light shadow-sm overflow-hidden">
                        <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Settings size={14} /> Active Processing Pipeline
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border-light">
                                {mockGlobalRules.map((rule) => (
                                    <div key={rule.id} className="p-5 flex items-start gap-4 hover:bg-paper-mid/30 transition-colors group">
                                        <div className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground/30 hover:text-muted-foreground group-hover:opacity-100 opacity-0 transition-opacity">
                                            <GripVertical size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-ink truncate">{rule.name}</h4>
                                                <RuleStatus status={rule.status} />
                                            </div>
                                            <p className="text-xs text-ink-light leading-relaxed mb-3">
                                                {rule.description}
                                            </p>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-ink-light uppercase">
                                                <RuleTypeUI type={rule.type} />
                                                <span className="opacity-30">•</span>
                                                <span>Priority: {rule.priority}</span>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-paper-mid/30 border-dashed">
                        <CardContent className="p-10 flex flex-col items-center justify-center text-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-border-light shadow-sm text-muted-foreground">
                                <Plus size={20} />
                            </div>
                            <div>
                                <h5 className="text-sm font-bold text-ink mb-1">Add Exception Rule</h5>
                                <p className="text-xs text-ink-light max-w-xs">Define custom filters that override standard AI processing for specific system events.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Brain size={14} /> AI Processing Floor
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-mono font-bold uppercase text-ink-mid">
                                    <span>Confidence Threshold</span>
                                    <span>85%</span>
                                </div>
                                <div className="h-2 w-full bg-paper-mid rounded-full overflow-hidden">
                                    <div className="h-full bg-accent" style={{ width: '85%' }} />
                                </div>
                                <p className="text-[9px] text-ink-light leading-snug">
                                    AI will only auto-categorize emails if confidence exceeds this threshold.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border-light flex items-center justify-between">
                                <span className="text-[10px] font-mono font-bold uppercase text-ink-mid">Strict Security Mode</span>
                                <div className="w-8 h-4 bg-success rounded-full relative">
                                    <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-accent/5 border-l-4 border-l-accent">
                        <CardContent className="p-4 flex gap-4">
                            <div className="p-2 rounded bg-white border border-border-light shadow-sm shrink-0">
                                <Zap size={18} className="text-accent" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold text-accent uppercase mb-1">Performance Insight</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Rules are processed in order of priority. Current pipeline adds **12ms** of latency to inbox syncing.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function RuleStatus({ status }: { status: string }) {
    const active = status === 'Active';
    return (
        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${active ? 'bg-success/10 text-success border-success/20' : 'bg-paper-mid text-ink-light border-border-light'}`}>
            {active ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
            {status}
        </span>
    );
}

function RuleTypeUI({ type }: { type: string }) {
    const icons: Record<string, any> = {
        'AI Logic': Brain,
        'Filtering': Filter,
        'Aggregation': Shield,
        'Security': Shield,
    };
    const Icon = icons[type] || Mail;
    return (
        <span className="flex items-center gap-1 text-accent font-bold">
            <Icon size={10} />
            {type}
        </span>
    );
}
