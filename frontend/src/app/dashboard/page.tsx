'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useDashboard } from '@/hooks/useDashboard';
import { useUser } from '@/hooks/useUser';
import TaskCreateModal from '@/components/modals/TaskCreateModal';
import Link from 'next/link';
import type { TaskDTOv1, ThreadListItem } from '@/types/dashboard';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: dashboardData, isLoading, error } = useDashboard();
    const { data: userData } = useUser();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            router.replace('/dashboard');
        }
    }, [searchParams, router]);

    if (isLoading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="h-64 rounded-2xl bg-surface-container" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-surface-container-low" />)}
                </div>
            </div>
        );
    }

    if (error || !dashboardData) {
        return (
            <div className="p-12 text-center">
                <MaterialSymbol icon="error" className="text-error text-4xl mb-4" />
                <p className="text-on-surface-variant font-semibold">Failed to load intelligence data.</p>
                <button onClick={() => window.location.reload()} className="mt-4 text-primary font-bold hover:underline">
                    Retry Sync
                </button>
            </div>
        );
    }

    const { briefing, stats, recent_threads, priority_tasks } = dashboardData;
    const firstName = userData?.name?.split(' ')[0] || 'there';
    const statStyles = {
        primary: {
            chip: 'bg-primary-fixed/30 text-primary',
            iconWrap: 'bg-primary-fixed/30 text-primary',
        },
        error: {
            chip: 'bg-error-container/80 text-error',
            iconWrap: 'bg-error-container/80 text-error',
        },
        secondary: {
            chip: 'bg-secondary-container/70 text-secondary',
            iconWrap: 'bg-secondary-container/70 text-secondary',
        },
        tertiary: {
            chip: 'bg-tertiary-fixed/30 text-tertiary',
            iconWrap: 'bg-tertiary-fixed/30 text-tertiary',
        },
    } as const;
    type StatColor = keyof typeof statStyles;

    return (
        <div className="flex flex-col p-6 md:p-10 gap-10 max-w-[1600px] mx-auto">
            {/* Header Greeting */}
            <header className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-headline font-bold text-on-surface tracking-tight">
                    Good morning, {firstName}
                </h1>
                <p className="text-on-surface-variant font-medium">
                    Here&apos;s your intelligence briefing for <span className="text-primary font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</span>.
                </p>
            </header>

            {/* Top Row: AI Briefing + Quick Stats */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Briefing Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-tertiary-fixed/40 to-primary-fixed/20 rounded-[32px] p-8 md:p-10 tonal-shadow relative overflow-hidden border border-white/40">
                    <div className="absolute top-0 right-0 p-8 opacity-10 blur-sm">
                        <MaterialSymbol icon="auto_awesome" filled className="text-[120px] text-tertiary" />
                    </div>
                    
                    <div className="relative z-10 flex flex-col gap-6 md:pr-20">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-tertiary shadow-sm border border-white">
                                <MaterialSymbol icon="auto_awesome" filled className="text-xl" />
                            </div>
                            <span className="font-headline font-bold text-tertiary uppercase tracking-widest text-xs">
                                Morning Intel
                            </span>
                        </div>
                        
                        <p className="text-lg md:text-xl font-medium text-on-surface leading-snug">
                            {briefing.summary}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                            {briefing.suggested_actions.map((action: string, i: number) => (
                                <button key={i} className="px-4 py-2 bg-white/80 hover:bg-white text-on-surface border border-outline-variant/30 transition-all rounded-full text-xs font-bold shadow-sm hover:scale-105 active:scale-95">
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Focus Card / AI Performance */}
                <div className="bg-surface-container-low rounded-[32px] p-8 border border-outline-variant/10 flex flex-col justify-between tonal-shadow">
                    <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-bold text-outline uppercase tracking-[0.2em] mb-2">Focus Score</span>
                        <div className="flex items-end gap-2">
                            <span className="text-5xl font-headline font-bold text-primary tracking-tighter">88</span>
                            <span className="text-lg font-bold text-outline mb-1.5">/100</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-high rounded-full mt-4 overflow-hidden">
                            <div className="w-[88%] h-full bg-primary rounded-full shadow-[0_0_8px_rgba(0,91,191,0.4)]" />
                        </div>
                    </div>
                    
                    <div className="mt-8">
                        <p className="text-sm font-semibold text-on-surface-variant leading-relaxed">
                            You&apos;re <span className="text-primary font-bold">12% more efficient</span> today. Your response time to urgent threads is under <span className="text-on-surface font-bold">4 mins</span>.
                        </p>
                    </div>

                    <button className="mt-8 flex items-center justify-between w-full p-4 bg-white rounded-2xl border border-black/5 hover:bg-slate-50 transition-colors group">
                        <span className="text-sm font-bold text-on-surface">View Insights</span>
                        <MaterialSymbol icon="arrow_forward" className="text-primary group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </section>

            {/* Metrics Grid */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Unread Mails', value: stats.unread, delta: stats.unread_delta, icon: 'mail', color: 'primary' },
                    { label: 'Urgent Action', value: stats.urgent, icon: 'priority_high', color: 'error' },
                    { label: 'Tasks Due', value: stats.tasks_due, icon: 'checklist', color: 'secondary' },
                    { label: 'Waiting On', value: stats.awaiting_reply, icon: 'hourglass_empty', color: 'tertiary' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-[24px] p-6 border border-outline-variant/10 hover:border-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer tonal-shadow">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${statStyles[stat.color as StatColor].iconWrap} group-hover:scale-110 transition-transform`}>
                                <MaterialSymbol icon={stat.icon} filled className="text-2xl" />
                            </div>
                            {stat.delta && (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statStyles[stat.color as StatColor].chip}`}>
                                    {stat.delta}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-3xl font-headline font-bold text-on-surface leading-tight">
                                {stat.value}
                            </span>
                            <span className="text-[11px] font-bold text-outline uppercase tracking-wider mt-1">
                                {stat.label}
                            </span>
                        </div>
                    </div>
                ))}
            </section>

            {/* Main Content: Recent Intelligence (Activity) + Tasks List */}
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
                
                {/* Recent Intelligence Feed */}
                <div className="xl:col-span-3 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-headline font-bold text-on-surface">Recent Activity</h2>
                        <Link href="/inbox" className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                            Open Inbox <MaterialSymbol icon="arrow_outward" className="text-sm" />
                        </Link>
                    </div>

                    <div className="bg-white rounded-[32px] border border-outline-variant/10 overflow-hidden tonal-shadow">
                        <div className="divide-y divide-outline-variant/5">
                            {recent_threads.map((thread: ThreadListItem) => {
                                const participantName = thread.participants?.[0]?.split('<')[0]?.trim() || 'Internal';
                                const initials = participantName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
                                
                                return (
                                    <Link key={thread.thread_id} href={`/inbox/${thread.thread_id}`}>
                                        <div className="p-5 flex items-center gap-5 hover:bg-surface-container-lowest transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-sm shrink-0 border border-white">
                                                {initials}
                                            </div>
                                            
                                            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors truncate">
                                                        {participantName}
                                                    </h4>
                                                    <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">
                                                        {new Date(thread.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-semibold text-on-surface-variant truncate">
                                                    {thread.subject}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {thread.urgency_score >= 80 && (
                                                    <div className="w-2 h-2 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(186,26,26,0.5)]" title="Urgent" />
                                                )}
                                                <MaterialSymbol icon="chevron_right" className="text-outline text-lg group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                            
                            {recent_threads.length === 0 && (
                                <div className="p-12 text-center text-on-surface-variant italic font-medium">
                                    No incoming intel yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks Column */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-headline font-bold text-on-surface">Intelligence Tasks</h2>
                        <span className="text-[11px] font-bold bg-primary-fixed/30 text-primary px-3 py-1 rounded-full">
                            {priority_tasks.length} Action Items
                        </span>
                    </div>

                    <div className="bg-surface-container-low rounded-[32px] p-8 border border-outline-variant/10 tonal-shadow">
                        <div className="space-y-6">
                            {priority_tasks.length > 0 ? priority_tasks.slice(0, 6).map((task: TaskDTOv1) => (
                                <div key={task.task_id} className="flex items-start gap-4 group cursor-pointer hover:translate-x-1 transition-transform">
                                    <div className={`mt-1 w-5 h-5 rounded-md border-2 border-primary/20 bg-white flex items-center justify-center transition-colors ${task.status === 'COMPLETED' ? 'bg-primary border-primary' : 'group-hover:border-primary/50'}`}>
                                        {task.status === 'COMPLETED' && <MaterialSymbol icon="check" className="text-white text-xs" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm font-bold leading-snug truncate ${task.status === 'COMPLETED' ? 'line-through text-outline' : 'text-on-surface'}`}>
                                            {task.title}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold uppercase tracking-widest">
                                            <span className={task.priority === 'DO_NOW' ? 'text-error' : 'text-on-surface-variant'}>
                                                {task.priority.replace('_', ' ')}
                                            </span>
                                            {task.deadline && (
                                                <span className="text-outline flex items-center gap-1">
                                                    <MaterialSymbol icon="event" className="text-xs" />
                                                    {new Date(task.deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-8 flex flex-col items-center gap-4">
                                    <MaterialSymbol icon="verified" className="text-primary text-4xl opacity-50" />
                                    <p className="text-sm font-semibold text-on-surface-variant italic">All clear for today.</p>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full mt-10 py-4 text-sm font-bold bg-white text-primary rounded-2xl flex items-center justify-center gap-2 border border-outline-variant/10 shadow-sm hover:bg-primary-fixed/20 hover:border-primary/20 transition-all font-headline"
                        >
                            <MaterialSymbol icon="add" className="text-lg" />
                            New Intelligence Task
                        </button>
                    </div>
                </div>
            </div>

            <TaskCreateModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />
        </div>
    );
}

export default function DashboardPage() {
    return (
        <AppShell showRightSidebar={false}>
            <Suspense fallback={
                <div className="p-10 space-y-10 animate-pulse w-full max-w-[1600px] mx-auto">
                    <div className="h-12 w-64 bg-surface-container rounded-lg" />
                    <div className="h-64 rounded-[32px] bg-surface-container w-full" />
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </AppShell>
    );
}
