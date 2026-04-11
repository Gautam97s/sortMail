'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import AppShell from '@/components/layout/AppShell';
import { useDismissWaitingFor, useWaitingFor } from '@/hooks/useWaitingFor';
import type { WaitingForDTOv1 } from '@/types/dashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MaterialSymbol = ({ icon, filled = false, className = '' }: { icon: string; filled?: boolean; className?: string }) => (
    <span
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

type FilterKey = 'all' | 'urgent' | 'active' | 'recent';

const filterLabels: Record<FilterKey, string> = {
    all: 'All',
    urgent: 'Urgent',
    active: 'Active',
    recent: 'Recent',
};

function getBucket(item: WaitingForDTOv1): FilterKey {
    if (item.days_waiting >= 4) return 'urgent';
    if (item.days_waiting >= 1) return 'active';
    return 'recent';
}

function getInitials(recipient: string) {
    const [namePart, emailPart] = recipient.includes('<') ? recipient.split('<') : [recipient, ''];
    const source = namePart.trim() || emailPart.replace('>', '').split('@')[0] || recipient;
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function metricTone(days: number) {
    if (days >= 4) {
        return {
            label: 'Needs attention',
            chip: 'bg-error-container text-error',
            ring: 'ring-error/10',
            accent: 'border-l-error',
        };
    }
    if (days >= 1) {
        return {
            label: 'Waiting',
            chip: 'bg-tertiary-fixed/40 text-tertiary',
            ring: 'ring-tertiary/10',
            accent: 'border-l-tertiary',
        };
    }
    return {
        label: 'Fresh',
        chip: 'bg-primary-fixed/35 text-primary',
        ring: 'ring-primary/10',
        accent: 'border-l-primary',
    };
}

function groupSummary(items: WaitingForDTOv1[]) {
    if (items.length === 0) {
        return {
            oldest: 0,
            average: 0,
            reminded: 0,
        };
    }

    const totalDays = items.reduce((sum, item) => sum + item.days_waiting, 0);
    const oldest = Math.max(...items.map((item) => item.days_waiting));
    const reminded = items.filter((item) => item.reminded).length;

    return {
        oldest,
        average: Math.round((totalDays / items.length) * 10) / 10,
        reminded,
    };
}

function FollowUpStatCard({ icon, label, value, hint, tone }: { icon: string; label: string; value: string | number; hint: string; tone: 'primary' | 'tertiary' | 'error' | 'muted' }) {
    const toneClasses = {
        primary: 'bg-primary-fixed/35 text-primary',
        tertiary: 'bg-tertiary-fixed/35 text-tertiary',
        error: 'bg-error-container text-error',
        muted: 'bg-surface-container-high text-on-surface-variant',
    } as const;

    return (
        <Card className="rounded-2xl border-outline-variant/10 bg-white/90 shadow-sm">
            <CardContent className="p-4 flex items-start gap-3">
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border border-white/60 shadow-sm ${toneClasses[tone]}`}>
                    <MaterialSymbol icon={icon} className="text-[22px]" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">{label}</div>
                    <div className="mt-1 text-2xl font-headline font-bold text-on-surface leading-none">{value}</div>
                    <div className="mt-1 text-xs text-on-surface-variant">{hint}</div>
                </div>
            </CardContent>
        </Card>
    );
}

function FollowUpItemCard({
    item,
    resolving,
    onClose,
}: {
    item: WaitingForDTOv1;
    resolving: boolean;
    onClose: (waitingId: string) => void;
}) {
    const tone = metricTone(item.days_waiting);
    const lastSentLabel = formatDistanceToNow(new Date(item.last_sent_at), { addSuffix: true });
    const lastRemindedLabel = item.last_reminded_at ? formatDistanceToNow(new Date(item.last_reminded_at), { addSuffix: true }) : null;

    return (
        <Card className={`overflow-hidden rounded-2xl border-outline-variant/10 bg-white/95 transition-all hover:shadow-lg hover:-translate-y-0.5 ${tone.ring}`}>
            <div className={`border-l-4 ${tone.accent}`}>
                <CardContent className="p-4 md:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex gap-3 min-w-0 flex-1">
                            <div className="h-12 w-12 rounded-2xl bg-surface-container-high text-primary font-black flex items-center justify-center text-sm border border-white/60 shrink-0">
                                {getInitials(item.recipient)}
                            </div>

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="font-headline text-base md:text-lg font-bold text-on-surface truncate">{item.recipient}</h3>
                                    <Badge variant="outline" className={`rounded-full border-transparent px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] ${tone.chip}`}>
                                        {tone.label}
                                    </Badge>
                                    {item.reminded && (
                                        <Badge variant="outline" className="rounded-full border-primary/15 bg-primary/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                                            Reminder sent
                                        </Badge>
                                    )}
                                </div>

                                <p className="text-sm font-semibold text-on-surface-variant leading-snug line-clamp-2">{item.thread_subject}</p>
                                <p className="text-xs text-outline-variant leading-relaxed line-clamp-2">{item.thread_summary}</p>

                                <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
                                        <MaterialSymbol icon="outgoing_mail" className="text-[16px]" />
                                        Sent {lastSentLabel}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
                                        <MaterialSymbol icon="schedule" className="text-[16px]" />
                                        Waiting {item.days_waiting} day{item.days_waiting === 1 ? '' : 's'}
                                    </span>
                                    {lastRemindedLabel && (
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-low px-2.5 py-1">
                                            <MaterialSymbol icon="notifications_active" className="text-[16px]" />
                                            Reminded {lastRemindedLabel}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 lg:pt-1 lg:shrink-0">
                            <Button variant="outline" asChild className="rounded-xl border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container h-9 px-3 text-xs font-semibold">
                                <Link href={`/inbox/${item.thread_id}`}>
                                    <MaterialSymbol icon="open_in_new" className="text-[18px]" />
                                    Open thread
                                </Link>
                            </Button>
                            <Button
                                onClick={() => onClose(item.waiting_id)}
                                disabled={resolving}
                                className="rounded-xl h-9 px-4 text-xs font-semibold bg-primary text-white shadow-sm hover:bg-primary/90"
                            >
                                <MaterialSymbol icon="check_circle" className="text-[18px]" />
                                {resolving ? 'Closing...' : 'Close'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}

function FollowupsEmptyState() {
    return (
        <Card className="rounded-3xl border-dashed border-outline-variant/20 bg-white/80 shadow-sm">
            <CardContent className="p-8 md:p-10 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
                    <MaterialSymbol icon="task_alt" className="text-[32px]" />
                </div>
                <h3 className="font-headline text-xl font-bold text-on-surface">No active follow-ups</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm text-on-surface-variant">
                    Every open thread is either resolved or currently outside the follow-up queue.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Button asChild className="rounded-xl px-4">
                        <Link href="/inbox">Review inbox</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl border-outline-variant/20 bg-surface-container-lowest px-4">
                        <Link href="/dashboard">Back to dashboard</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function FollowupsPage() {
    const { data: waitingItems = [], isLoading, error } = useWaitingFor();
    const dismissWaiting = useDismissWaitingFor();
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<FilterKey>('all');

    const visibleItems = useMemo(() => {
        const normalized = search.trim().toLowerCase();
        return waitingItems
            .filter((item) => filter === 'all' || getBucket(item) === filter)
            .filter((item) => {
                if (!normalized) return true;
                return [item.recipient, item.thread_subject, item.thread_summary]
                    .filter(Boolean)
                    .some((value) => value.toLowerCase().includes(normalized));
            })
            .sort((a, b) => b.days_waiting - a.days_waiting);
    }, [waitingItems, search, filter]);

    const stats = useMemo(() => ({
        active: waitingItems.length,
        urgent: waitingItems.filter((item) => item.days_waiting >= 4).length,
        fresh: waitingItems.filter((item) => item.days_waiting === 0).length,
        summary: groupSummary(waitingItems),
    }), [waitingItems]);

    if (isLoading) {
        return (
            <AppShell title="Follow-ups" subtitle="Waiting on replies">
                <div className="mx-auto max-w-[1200px] space-y-5 p-4 md:p-6">
                    <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-low border border-outline-variant/10" />
                        <div className="h-64 animate-pulse rounded-3xl bg-surface-container-low border border-outline-variant/10" />
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 animate-pulse rounded-2xl bg-surface-container-low border border-outline-variant/10" />
                        ))}
                    </div>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 animate-pulse rounded-3xl bg-surface-container-low border border-outline-variant/10" />
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell title="Follow-ups" subtitle="Waiting on replies">
                <div className="mx-auto max-w-[980px] p-4 md:p-6">
                    <Card className="rounded-3xl border border-error/20 bg-error-container/20 shadow-sm">
                        <CardContent className="p-6 text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-error-container text-error">
                                <MaterialSymbol icon="report" className="text-[28px]" />
                            </div>
                            <h3 className="font-headline text-xl font-bold text-on-surface">Failed to load follow-ups</h3>
                            <p className="mt-2 text-sm text-on-surface-variant">
                                The reminders feed could not be synchronized right now.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Follow-ups" subtitle={stats.active > 0 ? `${stats.active} open follow-ups` : 'All conversations are caught up'}>
            <div className="mx-auto max-w-[1200px] space-y-5 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-3xl border border-white/50 bg-gradient-to-br from-primary-fixed/25 via-surface-container-lowest to-tertiary-fixed/20 p-5 md:p-6 tonal-shadow">
                    <div className="absolute -right-4 -top-8 h-36 w-36 rounded-full bg-primary-fixed/40 blur-3xl" />
                    <div className="absolute -bottom-8 left-1/3 h-28 w-28 rounded-full bg-tertiary-fixed/40 blur-3xl" />

                    <div className="relative grid gap-5 lg:grid-cols-[1.55fr_1fr] lg:items-end">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.24em] text-tertiary shadow-sm">
                                <MaterialSymbol icon="schedule" className="text-[16px]" />
                                Follow-up queue
                            </div>
                            <div className="space-y-2 max-w-2xl">
                                <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight text-on-surface">
                                    Keep conversations moving.
                                </h1>
                                <p className="max-w-2xl text-sm md:text-base text-on-surface-variant">
                                    This view surfaces every open reply request, ranks the most delayed threads first, and lets you close the loop in one pass.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="rounded-full border-transparent bg-primary-fixed/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                                    Table-backed lifecycle
                                </Badge>
                                <Badge variant="outline" className="rounded-full border-transparent bg-tertiary-fixed/35 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-tertiary">
                                    Auto-closes on reply
                                </Badge>
                                <Badge variant="outline" className="rounded-full border-transparent bg-surface-container-low px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-on-surface-variant">
                                    Sorted by delay
                                </Badge>
                            </div>
                        </div>

                        <Card className="rounded-3xl border-outline-variant/10 bg-white/85 shadow-sm backdrop-blur">
                            <CardHeader className="px-5 pt-5 pb-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Queue health</div>
                                        <div className="mt-1 font-headline text-lg font-bold text-on-surface">Operational overview</div>
                                    </div>
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
                                        <MaterialSymbol icon="insights" className="text-[22px]" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-3 px-5 pb-5 pt-0">
                                <FollowUpStatCard icon="hourglass_top" label="Open follow-ups" value={stats.active} hint="Rows currently waiting for a response" tone="primary" />
                                <div className="grid grid-cols-2 gap-3">
                                    <FollowUpStatCard icon="error" label="Urgent" value={stats.urgent} hint="Four or more days waiting" tone="error" />
                                    <FollowUpStatCard icon="fiber_new" label="Fresh" value={stats.fresh} hint="Created today" tone="tertiary" />
                                </div>
                                <div className="rounded-2xl bg-surface-container-low p-4">
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">Oldest</div>
                                            <div className="mt-1 text-lg font-headline font-bold text-on-surface">{stats.summary.oldest}d</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">Average</div>
                                            <div className="mt-1 text-lg font-headline font-bold text-on-surface">{stats.summary.average}d</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-outline">Reminded</div>
                                            <div className="mt-1 text-lg font-headline font-bold text-on-surface">{stats.summary.reminded}</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                <section className="rounded-3xl border border-outline-variant/10 bg-white/90 p-4 md:p-5 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <h2 className="font-headline text-lg font-bold text-on-surface">Queue filters</h2>
                            <p className="text-sm text-on-surface-variant">Search by recipient, subject, or thread summary.</p>
                        </div>

                        <div className="w-full lg:w-[22rem]">
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search follow-ups"
                                className="h-11 rounded-2xl border-outline-variant/20 bg-surface-container-lowest px-4"
                            />
                        </div>
                    </div>

                    <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterKey)} className="mt-4">
                        <TabsList className="grid h-auto w-full grid-cols-2 gap-2 rounded-2xl bg-transparent p-0 md:grid-cols-4">
                            {(['all', 'urgent', 'active', 'recent'] as FilterKey[]).map((key) => (
                                <TabsTrigger
                                    key={key}
                                    value={key}
                                    className="rounded-2xl border border-outline-variant/15 bg-surface-container-low px-4 py-2.5 text-xs font-bold uppercase tracking-[0.18em] text-on-surface-variant data-[state=active]:border-primary/20 data-[state=active]:bg-primary-fixed/35 data-[state=active]:text-primary data-[state=active]:shadow-sm"
                                >
                                    {filterLabels[key]}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        <TabsContent value={filter} className="mt-5">
                            {visibleItems.length === 0 ? (
                                <FollowupsEmptyState />
                            ) : (
                                <div className="space-y-3">
                                    {visibleItems.map((item) => (
                                        <FollowUpItemCard
                                            key={item.waiting_id}
                                            item={item}
                                            resolving={dismissWaiting.isPending && dismissWaiting.variables === item.waiting_id}
                                            onClose={(waitingId) => dismissWaiting.mutate(waitingId)}
                                        />
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </section>
            </div>
        </AppShell>
    );
}