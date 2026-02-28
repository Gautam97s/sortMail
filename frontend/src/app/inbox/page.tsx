'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppShell from '@/components/layout/AppShell';
import { useThreads } from '@/hooks/useThreads';
import { useSmartSync } from '@/hooks/useSmartSync';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';
import {
    Search,
    RefreshCw,
    Inbox,
    AlertTriangle,
    Clock,
    FileText,
    ChevronRight
} from 'lucide-react';
import { FilterTab, ThreadListItem } from '@/types/dashboard';

export default function InboxPage() {
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<FilterTab>('all');

    // DB-first: threads load instantly from cache/DB
    const { data: threads, isLoading, error } = useThreads(activeTab === 'all' ? undefined : activeTab);

    // Smart background sync: checks if stale → incremental Gmail sync → invalidates cache
    const { syncState, triggerSync } = useSmartSync();

    // Real-time SSE: auto-refresh when backend publishes intel_ready / new_emails
    useRealtimeEvents();

    const isSyncing = syncState === 'syncing' || syncState === 'checking';

    const filtered = useMemo(() => {
        if (!threads) return [];
        let items = threads;
        if (search) {
            const q = search.toLowerCase();
            items = items.filter((t: ThreadListItem) =>
                t.subject.toLowerCase().includes(q) ||
                t.summary.toLowerCase().includes(q)
            );
        }
        return items;
    }, [search, threads]);


    return (
        <AppShell title="Inbox" subtitle={`${threads?.length || 0} threads`}>
            <div className="max-w-4xl mx-auto space-y-4 px-4 md:px-0">

                {/* ─── Search + Sync ──────────────────── */}
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                        <Input
                            placeholder="Search emails..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10 bg-white border-border text-sm h-10 md:h-11 shadow-sm focus:ring-accent/20"
                        />
                    </div>
                    <Button
                        variant="outline" className="shrink-0 h-10 md:h-11 border-border bg-white hover:bg-paper-mid text-muted hover:text-ink gap-2 px-3 md:px-4"
                        onClick={triggerSync}
                        disabled={isSyncing}
                    >
                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Sync Now</span>
                    </Button>
                </div>
                {isSyncing && (
                    <p className="text-xs text-muted-foreground text-center animate-pulse">
                        Checking for new emails...
                    </p>
                )}

                {/* ─── Tabs ───────────────────────────── */}
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)} className="w-full">
                    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 border-b border-border/40">
                        <TabsList className="bg-transparent h-auto p-0 gap-6 md:gap-8 min-w-max">
                            {[
                                { value: 'all', label: 'All', icon: Inbox },
                                { value: 'urgent', label: 'Urgent', icon: AlertTriangle },
                                { value: 'action_required', label: 'Action Required', icon: Clock },
                                { value: 'fyi', label: 'FYI', icon: FileText },
                            ].map((tab) => (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="bg-transparent border-b-2 border-transparent data-[state=active]:border-accent data-[state=active]:text-ink text-muted px-0 pb-3 rounded-none text-[11px] md:text-sm font-bold uppercase tracking-widest transition-all hover:text-ink gap-2"
                                >
                                    <tab.icon className="h-4 w-4" />
                                    {tab.label}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    </div>
                </Tabs>

                {/* ─── Thread List ────────────────────── */}
                <Card>
                    <CardContent className="p-0">
                        <ScrollArea className="h-[calc(100vh-280px)]">
                            {isLoading ? (
                                <div className="p-4 space-y-4">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-20 rounded-lg bg-paper-mid animate-pulse" />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center text-danger">
                                    Failed to load threads.
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                                    <Inbox className="h-10 w-10 opacity-40" />
                                    <p className="text-sm font-medium">Your inbox is empty</p>
                                    <p className="text-xs">Make sure your Gmail account is connected, then sync.</p>
                                    <Button size="sm" variant="outline" onClick={triggerSync} disabled={isSyncing} className="gap-2 mt-1">
                                        <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                                        Sync Emails
                                    </Button>
                                </div>
                            ) : (
                                filtered.map((thread: ThreadListItem, i: number) => (
                                    <ThreadRow key={thread.thread_id} thread={thread} isLast={i === filtered.length - 1} />
                                ))
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}


function ThreadRow({ thread, isLast }: { thread: ThreadListItem; isLast: boolean }) {
    // Parse sender from thread.participants
    const firstParticipant = (thread as any).participants?.[0] ?? '';
    const sender = (() => {
        if (!firstParticipant) return { name: 'Unknown', initials: '??', color: '#6b7280' };
        const nameMatch = firstParticipant.match(/^"?([^"<]+)"?\s*</);
        const name = nameMatch
            ? nameMatch[1].trim()
            : firstParticipant.split('@')[0].replace(/[._]/g, ' ');
        const parts = name.trim().split(' ').filter(Boolean);
        const initials = parts.length >= 2
            ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
            : name.slice(0, 2).toUpperCase();
        // Deterministic color from name
        const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6'];
        const color = colors[name.charCodeAt(0) % colors.length];
        return { name, initials, color };
    })();

    const isUrgent = thread.urgency_score >= 70;
    const isAction = thread.intent === 'action_required';
    const isFyi = thread.intent === 'fyi';
    const isUnread = (thread as any).is_unread ?? false;

    return (
        <Link href={`/inbox/${thread.thread_id}`}>
            <div className={`
                relative flex items-stretch gap-0
                hover:bg-paper-mid transition-all duration-150 cursor-pointer group
                ${!isLast ? 'border-b border-border/40' : ''}
                ${isUnread ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]' : 'bg-transparent'}
            `}>
                {/* Priority left bar */}
                {isUrgent && <div className="w-1 bg-danger shrink-0 rounded-r" />}
                {isAction && !isUrgent && <div className="w-1 bg-warning shrink-0 rounded-r" />}
                {!isUrgent && !isAction && <div className="w-1 shrink-0" />}

                <div className="flex items-start gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-4 flex-1 min-w-0">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 md:w-11 md:h-11 rounded-full flex items-center justify-center text-[11px] md:text-xs font-bold shrink-0 mt-0.5 border border-border/50"
                        style={{ backgroundColor: sender.color + '15', color: sender.color }}
                    >
                        {sender.initials}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Row 1: Name + Time */}
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                            <div className="flex items-center gap-2 min-w-0">
                                {isUnread && (
                                    <span className="w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_8px_rgba(232,68,10,0.4)]" />
                                )}
                                <span className={`text-sm md:text-base truncate ${isUnread ? 'font-black text-ink tracking-tight' : 'font-semibold text-ink/70'}`}>
                                    {sender.name}
                                </span>
                            </div>
                            <span className="text-[10px] md:text-xs font-mono text-muted shrink-0 tabular-nums uppercase">
                                {formatTime(thread.last_updated)}
                            </span>
                        </div>

                        {/* Row 2: Subject */}
                        <p className={`text-sm truncate leading-snug mb-1 ${isUnread ? 'font-bold text-ink' : 'text-ink/60'}`}>
                            {thread.subject || '(No Subject)'}
                        </p>

                        {/* Row 3: Summary + Chips */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-2">
                            <p className="text-[11px] md:text-xs text-muted truncate flex-1 leading-relaxed">
                                {thread.summary || 'Pending analysis...'}
                            </p>
                            <div className="flex items-center gap-1.5 shrink-0">
                                {isUrgent && (
                                    <Badge variant="destructive" className="text-[9px] px-1.5 py-0 rounded-sm font-black uppercase tracking-wider">Urgent</Badge>
                                )}
                                {isAction && !isUrgent && (
                                    <Badge variant="default" className="text-[9px] px-1.5 py-0 rounded-sm font-black uppercase tracking-wider bg-warning text-white border-0">Action</Badge>
                                )}
                                {isFyi && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 rounded-sm font-bold uppercase tracking-wider bg-paper-deep text-muted">FYI</Badge>
                                )}
                                {thread.has_attachments && (
                                    <FileText className="h-3.5 w-3.5 text-muted/30" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Hover arrow */}
                    <ChevronRight className="h-4 w-4 text-border shrink-0 mt-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                </div>
            </div>
        </Link>
    );
}

function formatTime(isoDate: string): string {
    const normalized = isoDate.endsWith('Z') || isoDate.includes('+') ? isoDate : isoDate + 'Z';
    const date = new Date(normalized);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const tz = 'Asia/Kolkata';
    if (diffHours < 24) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: tz });
    }
    if (diffHours < 24 * 7) {
        return date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: tz });
    }
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: tz });
}
