'use client';

import React from 'react';
import AppShell from '@/components/layout/AppShell';
import { WaitingForDTOv1 } from '@/types/dashboard';
import { formatDistanceToNow } from 'date-fns';
import { useWaitingFor } from '@/hooks/useWaitingFor';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

function FollowUpGroup({ title, items, status }: { title: string; items: WaitingForDTOv1[]; status: 'overdue' | 'pending' | 'snoozed' }) {
    if (items.length === 0 && status !== 'snoozed') return null;

    const config = {
        overdue: { icon: 'error', color: 'text-error', bg: 'bg-error-container', label: 'Critical Delay' },
        pending: { icon: 'schedule', color: 'text-tertiary', bg: 'bg-tertiary-container', label: 'Awaiting' },
        snoozed: { icon: 'notifications_paused', color: 'text-outline', bg: 'bg-surface-container', label: 'Suspended' }
    }[status];

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 px-2">
                <div className={`h-8 w-8 rounded-xl ${config.bg} ${config.color} flex items-center justify-center border border-current/10 shadow-sm`}>
                    <MaterialSymbol icon={config.icon} className="text-xl" />
                </div>
                <div className="flex items-baseline gap-3">
                    <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
                    <span className="text-[10px] font-black text-outline-variant uppercase tracking-widest">{items.length} Intelligence Nodes</span>
                </div>
                <div className="h-px flex-1 bg-outline-variant/10 ml-4 hidden md:block" />
            </div>

            <div className="grid gap-3">
                {items.length === 0 ? (
                    <div className="p-8 rounded-[32px] border border-dashed border-outline-variant/20 bg-surface-container-lowest/50 text-center space-y-3">
                        <div className="h-12 w-12 bg-surface-container rounded-2xl flex items-center justify-center mx-auto text-outline-variant opacity-50">
                            <MaterialSymbol icon="ghost" className="text-2xl" />
                        </div>
                        <p className="text-xs font-bold text-outline-variant uppercase tracking-tighter">No suspended persistence tracking</p>
                    </div>
                ) : (
                    items.map((item) => (
                        <div 
                            key={item.waiting_id} 
                            className="group bg-white rounded-3xl border border-outline-variant/10 p-5 flex flex-col md:flex-row md:items-center gap-6 hover:border-primary-fixed hover:shadow-xl hover:shadow-primary/5 transition-all relative overflow-hidden"
                        >
                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                <div className="h-12 w-12 rounded-2xl bg-primary-fixed/20 text-primary font-black flex items-center justify-center text-sm border border-primary/5 group-hover:scale-105 transition-transform">
                                    {item.recipient.split('@')[0].substring(0, 2).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-sm font-headline font-bold text-on-surface truncate">{item.recipient}</span>
                                        <div className={`px-2 py-0.5 ${config.bg} ${config.color} font-black text-[8px] rounded uppercase tracking-wider`}>
                                            {item.days_waiting} Days Delay
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-on-surface-variant truncate tracking-tight">{item.thread_subject}</h4>
                                    <p className="text-xs font-medium text-outline-variant truncate italic mt-0.5">{item.thread_summary}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-none pt-4 md:pt-0 mt-2 md:mt-0">
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-outline uppercase tracking-tighter tabular-nums">
                                    <MaterialSymbol icon="outgoing_mail" className="text-base" />
                                    {formatDistanceToNow(new Date(item.last_sent_at))} ago
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button className="h-10 w-10 bg-surface-container hover:bg-primary-fixed/20 hover:text-primary rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-outline-variant/5">
                                        <MaterialSymbol icon="notification_add" className="text-lg" />
                                    </button>
                                    <button className="h-10 w-10 bg-surface-container hover:bg-primary-fixed/20 hover:text-primary rounded-xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 border border-outline-variant/5 delay-75">
                                        <MaterialSymbol icon="snooze" className="text-lg" />
                                    </button>
                                    <button className="h-10 px-4 bg-surface-container-high hover:bg-primary text-on-surface-variant hover:text-on-primary rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all border border-outline-variant/10 shadow-sm">
                                        <MaterialSymbol icon="check_circle" className="text-lg" />
                                        <span className="hidden sm:inline">Resolve</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default function FollowupsPage() {
    const { data: waitingItems, isLoading, error } = useWaitingFor();

    if (isLoading) {
        return (
            <AppShell title="Persistence Tracking">
                <div className="max-w-5xl mx-auto p-10 space-y-12">
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-surface-container-low animate-pulse rounded-[32px] border border-outline-variant/10" />
                        ))}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error || !waitingItems) {
        return (
            <AppShell title="Persistence Tracking">
                <div className="max-w-5xl mx-auto p-10">
                    <div className="bg-error-container/10 border border-error/20 p-8 rounded-[32px] text-center">
                        <MaterialSymbol icon="report" className="text-4xl text-error mb-4" />
                        <h3 className="text-xl font-headline font-bold text-error">Intelligence Link Failure</h3>
                        <p className="text-sm font-medium text-error/80 mt-2">Failed to synchronize persistence tracking data.</p>
                    </div>
                </div>
            </AppShell>
        );
    }

    const overdue = waitingItems.filter(i => i.days_waiting > 3);
    const pending = waitingItems.filter(i => i.days_waiting <= 3);
    const snoozed: WaitingForDTOv1[] = [];

    return (
        <AppShell title="Relationship Persistence" subtitle="AI-powered Response Monitoring">
            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-16">
                
                {/* Header Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard icon="error" label="Critical Alerts" value={overdue.length} color="text-error" bg="bg-error-container" />
                    <StatCard icon="schedule" label="Active Tracking" value={pending.length} color="text-tertiary" bg="bg-tertiary-container" />
                    <StatCard icon="done_all" label="Engagement Efficiency" value="94%" color="text-primary" bg="bg-primary-container" />
                </div>

                <div className="space-y-16">
                    <FollowUpGroup
                        title="Critical Nudges"
                        items={overdue}
                        status="overdue"
                    />
                    <FollowUpGroup
                        title="Active Monitoring"
                        items={pending}
                        status="pending"
                    />
                    <FollowUpGroup
                        title="Suspended Persistent"
                        items={snoozed}
                        status="snoozed"
                    />
                </div>
            </div>
        </AppShell>
    );
}

function StatCard({ icon, label, value, color, bg }: { icon: string, label: string, value: string | number, color: string, bg: string }) {
    return (
        <div className="bg-white p-6 rounded-[32px] border border-outline-variant/10 shadow-sm flex items-center gap-6 group hover:border-primary-fixed hover:shadow-xl hover:shadow-primary/5 transition-all">
            <div className={`h-14 w-14 rounded-2xl ${bg} ${color} flex items-center justify-center border border-current/10 shadow-inner group-hover:scale-110 transition-transform`}>
                <MaterialSymbol icon={icon} className="text-2xl" />
            </div>
            <div>
                <div className="text-[10px] font-black text-outline-variant uppercase tracking-widest">{label}</div>
                <div className="text-3xl font-headline font-bold text-on-surface mt-0.5">{value}</div>
            </div>
        </div>
    );
}
