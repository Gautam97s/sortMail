"use client";

import React, { useEffect } from 'react';
import gsap from 'gsap';
import { DashboardData, TaskDTOv1, ThreadListItem } from '@/types/dashboard';
import { useUser } from '@/hooks/useUser';
import Link from 'next/link';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface DashboardViewProps {
    data: DashboardData;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
    const { data: user, isLoading: isUserLoading } = useUser();

    useEffect(() => {
        const tl = gsap.timeline();
        tl.fromTo(".dash-header", { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" });
        tl.fromTo(".briefing-card", { y: 20, opacity: 0, scale: 0.98 }, { y: 0, opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, "-=0.2");
        tl.fromTo(".stat-card", { y: 15, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.4, ease: "back.out(1.4)" }, "-=0.3");
        tl.fromTo(".activity-section", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, "-=0.2");
        tl.fromTo(".activity-item", { x: -5, opacity: 0 }, { x: 0, opacity: 1, stagger: 0.03, duration: 0.3 }, "-=0.3");
    }, []);

    const { briefing, stats, recent_threads, priority_tasks } = data;

    return (
        <div className="h-full p-6 md:p-10 overflow-y-auto scrollbar-none bg-surface-container-lowest">
            {/* Dynamic Editorial Header */}
            <div className="dash-header mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">
                        Good Morning, {isUserLoading ? '...' : user?.name?.split(' ')[0] || 'User'}
                    </h1>
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] font-black text-outline-variant uppercase tracking-[0.3em] font-mono">{briefing.date}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-1.5 bg-primary-fixed/20 text-primary font-black text-[10px] rounded-full uppercase tracking-widest border border-primary/10 flex items-center gap-2">
                        <MaterialSymbol icon="verified_user" className="text-sm" />
                        {user?.plan || 'Standard'} Nodes Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Executive Intelligence Briefing */}
                <div className="col-span-2 briefing-card group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 to-tertiary-fixed/30 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 -z-10" />
                    <div className="bg-white rounded-[40px] border border-outline-variant/10 p-10 shadow-xl shadow-black/5 hover:border-primary-fixed/30 transition-all overflow-hidden h-full">
                        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-1000">
                            <MaterialSymbol icon="auto_awesome" className="text-[160px]" />
                        </div>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 bg-primary-fixed text-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:rotate-12">
                                <MaterialSymbol icon="auto_fix" filled className="text-2xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Neural Summary</span>
                                <h2 className="text-lg font-headline font-bold text-on-surface">Intelligence Stream</h2>
                            </div>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <p className="text-xl md:text-2xl font-headline font-medium text-on-surface leading-tight tracking-tight max-w-2xl italic">
                                &ldquo;{briefing.summary}&rdquo;
                            </p>

                            <div className="flex flex-wrap gap-3">
                                {briefing.suggested_actions.map((action: string, i: number) => (
                                    <div key={i} className="px-5 py-2.5 rounded-2xl bg-surface-container-low border border-outline-variant/10 text-xs font-bold text-on-surface-variant flex items-center gap-3 hover:bg-white hover:border-primary-fixed hover:shadow-lg transition-all cursor-pointer group/item">
                                        <div className="h-2 w-2 rounded-full bg-primary-fixed animate-pulse group-hover/item:scale-150 transition-transform" />
                                        {action}
                                        <MaterialSymbol icon="arrow_forward" className="text-sm opacity-0 group-hover/item:opacity-100 translate-x-[-10px] group-hover/item:translate-x-0 transition-all" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytical Stats & Queue */}
                <div className="col-span-1 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard icon="mail" label="Unread Index" value={stats.unread} color="text-primary" bg="bg-primary-fixed/20" />
                        <StatCard icon="notification_important" label="Critical Urgency" value={stats.urgent} color="text-error" bg="bg-error-container" />
                    </div>

                    <Link href="/tasks" className="block stat-card group">
                        <div className="bg-on-surface rounded-[32px] p-8 h-[220px] flex flex-col justify-between relative overflow-hidden shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <div className="relative z-10 space-y-2">
                                <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center text-white backdrop-blur-sm">
                                    <MaterialSymbol icon="bolt" filled />
                                </div>
                                <h3 className="text-surface font-headline text-2xl font-bold tracking-tight mt-4">Task Manifest</h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                    <p className="text-surface/60 text-[10px] font-black uppercase tracking-widest">{stats.tasks_due} items awaiting resolution</p>
                                </div>
                            </div>
                            
                            <div className="relative z-10 flex items-center gap-3 text-surface font-black text-xs uppercase tracking-widest group-hover:gap-5 transition-all">
                                Engage Focus Mode <MaterialSymbol icon="arrow_forward" className="text-lg" />
                            </div>
                            
                            <div className="absolute -right-8 -bottom-8 bg-white/5 w-48 h-48 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                            <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000">
                                <MaterialSymbol icon="cognition" className="text-[120px] text-white" />
                            </div>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Neural Feed Segments */}
            <div className="mt-16 grid lg:grid-cols-2 gap-16">
                {/* Priority Action Queue */}
                <div className="activity-section space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 bg-surface-container rounded-xl flex items-center justify-center text-on-surface">
                                <MaterialSymbol icon="priority_high" />
                            </div>
                            <h2 className="text-[10px] font-black text-outline-variant uppercase tracking-[0.2em]">Priority Action Matrix</h2>
                        </div>
                        <Link href="/tasks" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Full Expansion</Link>
                    </div>
                    <div className="space-y-3">
                        {priority_tasks.slice(0, 3).map((task: TaskDTOv1) => (
                            <div key={task.task_id} className="activity-item bg-white border border-outline-variant/10 p-5 rounded-[24px] flex items-center justify-between hover:border-primary-fixed/30 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className={`h-1.5 w-10 rounded-full shrink-0 ${task.priority === 'DO_NOW' ? 'bg-error animate-pulse' : 'bg-primary-fixed'}`} />
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-on-surface truncate tracking-tight group-hover:text-primary transition-colors">{task.title}</h4>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="px-1.5 py-0.5 bg-surface-container-high text-outline-variant font-black text-[8px] rounded uppercase tracking-tighter">{task.task_type}</div>
                                            <span className="text-[9px] font-black text-outline-variant uppercase tracking-tighter opacity-60">Due Today</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-10 w-10 bg-surface-container rounded-xl flex items-center justify-center text-outline group-hover:text-on-surface transition-colors">
                                    <MaterialSymbol icon="chevron_right" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Intelligence Analysis Feed */}
                <div className="activity-section space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-8 bg-surface-container rounded-xl flex items-center justify-center text-on-surface">
                                <MaterialSymbol icon="analytics" />
                            </div>
                            <h2 className="text-[10px] font-black text-outline-variant uppercase tracking-[0.2em]">Neural Analysis Feed</h2>
                        </div>
                        <Link href="/inbox" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Inbox Matrix</Link>
                    </div>
                    <div className="space-y-3">
                        {recent_threads.slice(0, 3).map((thread: ThreadListItem) => (
                            <div key={thread.thread_id} className="activity-item bg-white border border-outline-variant/10 p-5 rounded-[24px] flex items-center justify-between hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="h-10 w-10 rounded-xl bg-surface-container flex items-center justify-center text-[10px] font-black text-on-surface-variant border border-outline-variant/10">
                                        {thread.participants?.[0]?.substring(0, 2).toUpperCase() || 'TX'}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors truncate tracking-tight">{thread.subject}</h4>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[9px] font-black text-primary uppercase tracking-tighter">{thread.intent} Analysis</span>
                                            <div className="h-1 w-1 bg-outline-variant/30 rounded-full" />
                                            <span className="text-[9px] font-black text-outline-variant uppercase tracking-tighter opacity-60">Confidence: {thread.urgency_score}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`h-2 w-2 rounded-full ${thread.urgency_score > 70 ? 'bg-error animate-pulse shadow-[0_0_8px_rgba(255,0,0,0.5)]' : 'bg-primary'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ label, value, color, icon, bg }: any) => (
    <div className="stat-card bg-white border border-outline-variant/10 rounded-[28px] p-6 shadow-sm hover:border-primary-fixed/30 hover:shadow-lg transition-all group">
        <div className="flex items-center justify-between mb-4">
            <span className="text-[9px] font-black text-outline-variant uppercase tracking-widest">{label}</span>
            <div className={`h-8 w-8 rounded-lg ${bg} ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <MaterialSymbol icon={icon} className="text-lg" />
            </div>
        </div>
        <p className="text-3xl font-headline font-bold text-on-surface tabular-nums">{value}</p>
    </div>
);

export default DashboardView;
