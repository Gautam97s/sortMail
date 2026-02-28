'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import AppShell from '@/components/layout/AppShell';
import { mockThreads, getSenderInfo } from '@/data/threads';
import { mockDashboard } from '@/data/tasks';
import { useDashboard } from '@/hooks/useDashboard';
import type { TaskDTOv1, ThreadListItem, EmailThreadV1, PriorityLevel } from '@/types/dashboard';
import {
    Sparkles, Mail, AlertTriangle, CheckSquare, Clock,
    ArrowUpRight, ChevronRight, Zap, FileText, Plus
} from 'lucide-react';
import Link from 'next/link';
import TaskCreateModal from '@/components/modals/TaskCreateModal';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const priorityConfig = {
    do_now: { label: 'Do Now', variant: 'destructive' as const, color: 'bg-red-500' },
    do_today: { label: 'Today', variant: 'default' as const, color: 'bg-amber-500' },
    can_wait: { label: 'Can Wait', variant: 'secondary' as const, color: 'bg-green-500' },
};

import { Suspense } from 'react';

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, isLoading, error } = useDashboard();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        // Note: Auth is handled by DashboardLayout + AuthContext via HttpOnly cookies.
        // The old localStorage token check has been removed.
        // If a 'token' param exists in URL, it's from a legacy flow - clean it up.
        const token = searchParams.get('token');
        if (token) {
            // Clear the token from URL (we don't use URL tokens anymore)
            router.replace('/dashboard');
        }
    }, [searchParams, router]);

    if (isLoading) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6">
                <div className="h-48 rounded-xl bg-paper-mid animate-pulse" />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-32 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-6 text-center text-danger">
                Failed to load dashboard data.
            </div>
        );
    }

    const { briefing, stats, recent_threads, priority_tasks } = data;

    return (
        <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

            {/* ─── AI Briefing Card ────────────────── */}
            <Card className="border-border bg-paper-mid/50">
                <CardHeader className="p-4 md:p-6 pb-2 md:pb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-ai" />
                        <CardTitle className="text-xs md:text-sm font-mono uppercase tracking-widest text-ai font-bold">
                            AI Briefing
                        </CardTitle>
                    </div>
                    <CardDescription className="text-sm md:text-base leading-relaxed text-ink mt-2">
                        {briefing.summary}
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                    <div className="flex flex-wrap gap-2">
                        {briefing.suggested_actions.map((action: string, i: number) => (
                            <Button key={i} variant="outline" size="sm" className="h-8 md:h-9 px-3 gap-1.5 text-[10px] md:text-xs font-medium border-border/60 hover:bg-paper-mid hover:text-ink transition-colors">
                                <Zap className="h-3 w-3 text-ai" />
                                {action}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Stat Cards ─────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {[
                    { label: 'Unread', value: stats.unread, icon: Mail, delta: stats.unread_delta, color: 'text-ai' },
                    { label: 'Urgent', value: stats.urgent, icon: AlertTriangle, delta: null, color: 'text-danger' },
                    { label: 'Tasks Due', value: stats.tasks_due, icon: CheckSquare, delta: null, color: 'text-warning' },
                    { label: 'Awaiting Reply', value: stats.awaiting_reply, icon: Clock, delta: null, color: 'text-accent' },
                ].map((stat) => (
                    <Card key={stat.label} className="border-border shadow-sm">
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center justify-between mb-2 md:mb-3">
                                <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-muted">{stat.label}</span>
                                <stat.icon className={`h-3.5 w-3.5 md:h-4 md:w-4 ${stat.color}`} />
                            </div>
                            <p className="font-display text-2xl md:text-3xl text-ink leading-none">{stat.value}</p>
                            {stat.delta && (
                                <p className="font-mono text-[9px] md:text-[10px] text-muted mt-1.5">{stat.delta}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-5 gap-6">

                {/* ─── Priority Tasks ─────────────── */}
                <div className="lg:col-span-2">
                    <Card className="border-border">
                        <CardHeader className="pb-3 border-b border-border/50">
                            <CardTitle className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-muted font-bold">
                                Priority Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[360px]">
                                {priority_tasks.map((task: TaskDTOv1) => {
                                    const cfg = priorityConfig[task.priority as PriorityLevel];
                                    return (
                                        <div key={task.task_id} className="flex items-start gap-4 px-4 md:px-5 py-3 md:py-4 border-b border-border/40 last:border-0 hover:bg-paper-mid/50 transition-colors cursor-pointer group">
                                            <div className={`w-1 h-10 md:h-12 rounded-full ${cfg.color} shrink-0 mt-0.5 opacity-80`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant={cfg.variant} className="text-[9px] px-1.5 py-0 rounded-sm font-bold uppercase tracking-wider">
                                                        {cfg.label}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 rounded-sm font-medium border-border text-muted">
                                                        {task.task_type}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm font-semibold text-ink truncate group-hover:text-accent transition-colors">{task.title}</p>
                                                {task.deadline && (
                                                    <p className="text-[10px] text-muted font-mono mt-1">
                                                        Due: {new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                                    </p>
                                                )}
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-border group-hover:text-muted shrink-0 mt-2 transition-colors" />
                                        </div>
                                    );
                                })}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* ─── Recent Threads ─────────────── */}
                <div className="lg:col-span-3">
                    <Card className="border-border">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-border/50">
                            <CardTitle className="text-[10px] md:text-xs font-mono uppercase tracking-[0.2em] text-muted font-bold">
                                Recent Emails
                            </CardTitle>
                            <Link href="/inbox">
                                <Button variant="ghost" size="sm" className="h-7 text-[10px] uppercase font-bold tracking-widest text-accent hover:bg-accent/10 gap-1.5 transition-all">
                                    Full Inbox <ArrowUpRight className="h-3 w-3" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[360px]">
                                {recent_threads.map((thread: ThreadListItem) => {
                                    const fullThread = mockThreads.find((t: EmailThreadV1) => t.thread_id === thread.thread_id);
                                    const lastMsg = fullThread?.messages[fullThread.messages.length - 1];
                                    const sender = lastMsg ? getSenderInfo(lastMsg.from_address) : { name: 'Unknown', initials: '??' };

                                    return (
                                        <Link key={thread.thread_id} href={`/inbox/${thread.thread_id}`}>
                                            <div className="flex items-start gap-4 px-4 md:px-5 py-3 md:py-4 border-b border-border/40 last:border-0 hover:bg-paper-mid/50 transition-colors cursor-pointer group">
                                                {/* Avatar */}
                                                <div className="w-9 h-9 rounded-full bg-paper-deep flex items-center justify-center text-[11px] font-bold text-muted shrink-0 border border-border/60">
                                                    {sender.initials}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-0.5">
                                                        <p className="text-sm font-semibold text-ink truncate group-hover:text-accent transition-colors">{sender.name}</p>
                                                        <span className="text-[10px] font-mono text-muted uppercase tracking-tighter shrink-0 ml-4">
                                                            {new Date(thread.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-ink/80 truncate">{thread.subject}</p>
                                                    <p className="text-xs text-muted truncate mt-0.5">
                                                        {thread.summary.slice(0, 80)}...
                                                    </p>
                                                </div>

                                                {/* Indicators */}
                                                <div className="flex flex-col items-end gap-1 shrink-0 pt-1">
                                                    {thread.urgency_score >= 70 && (
                                                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 rounded-sm font-bold uppercase">Urgent</Badge>
                                                    )}
                                                    {thread.has_attachments && (
                                                        <FileText className="h-3.5 w-3.5 text-muted/40" />
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ─── Floating Action Button ────────── */}
            <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="fixed bottom-6 right-6 md:bottom-8 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full shadow-2xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center p-0 transition-all hover:scale-105 active:scale-95 group z-40"
                id="fab-create-task"
            >
                <Plus className="h-5 w-5 md:h-6 md:w-6 group-hover:rotate-90 transition-transform duration-300" />
            </Button>

            {/* ─── Modals ────────────────────────── */}
            <TaskCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AppShell title="Dashboard" subtitle="Your morning briefing">
            <Suspense fallback={<div className="p-6"><div className="h-48 rounded-xl bg-paper-mid animate-pulse" /></div>}>
                <DashboardContent />
            </Suspense>
        </AppShell>
    );
}
