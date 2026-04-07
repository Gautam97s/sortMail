'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useDashboard } from '@/hooks/useDashboard';
import { Button } from '@/components/ui/button';
import TaskCreateModal from '@/components/modals/TaskCreateModal';
import { 
    Sparkles, Mail, AlertTriangle, CheckSquare, Clock, Zap, RefreshCw, 
    PenSquare, RefreshCcw, PlusSquare, BarChart2, Plus, ArrowUpRight, 
    ChevronRight, FileText, Settings, Rocket
} from 'lucide-react';
import type { TaskDTOv1, ThreadListItem, PriorityLevel } from '@/types/dashboard';
import Link from 'next/link';

// Priority Configuration mapping for visual styling
const priorityConfig = {
    do_now: { label: 'Do Now', color: 'bg-danger', text: 'text-danger', bgSoft: 'bg-danger/10' },
    do_today: { label: 'Today', color: 'bg-warning', text: 'text-warning', bgSoft: 'bg-warning/10' },
    can_wait: { label: 'Can Wait', color: 'bg-success', text: 'text-success', bgSoft: 'bg-success/10' },
};

function DashboardContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data, isLoading, error } = useDashboard();
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-48">
                    <div className="lg:col-span-2 rounded-xl bg-paper-mid" />
                    <div className="rounded-xl bg-ai/20" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 h-32">
                    {[1, 2, 3, 4].map(i => <div key={i} className="rounded-xl bg-paper-mid" />)}
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="p-8 text-center text-danger font-medium">
                Failed to load dashboard data. Please try refreshing.
            </div>
        );
    }

    const { briefing, stats, recent_threads, priority_tasks } = data;

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8">
            {/* ─── Hero Section ────────────────────────────── */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AI Briefing */}
                <div className="lg:col-span-2 glass-card p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 p-4 opacity-5 pointer-events-none">
                        <Sparkles className="h-[200px] w-[200px] text-accent" />
                    </div>
                    
                    <div className="flex-1 z-10">
                        <h2 className="text-xl font-display font-bold flex items-center gap-2 mb-4 text-ink">
                            <Sparkles className="h-6 w-6 text-accent" />
                            AI Morning Briefing
                        </h2>
                        <p className="text-muted text-base leading-relaxed mb-8">
                            {briefing.summary}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {briefing.suggested_actions.map((action: string, i: number) => (
                                <button key={i} className="px-4 py-2 bg-white/40 hover:bg-accent/10 border border-white/50 text-accent transition-colors rounded-xl text-xs font-bold shadow-sm">
                                    {action}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card bg-accent/90 p-6 text-slate-900 overflow-hidden flex flex-col justify-between group">
                    <div className="relative z-10">
                        <h2 className="text-lg font-bold mb-6 font-display text-slate-900">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 hover:scale-[1.02]">
                                <PenSquare className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900">Compose</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 hover:scale-[1.02]">
                                <RefreshCcw className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900">Sync</span>
                            </button>
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 hover:scale-[1.02]"
                            >
                                <PlusSquare className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900">Task</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-3 p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/20 hover:scale-[1.02]">
                                <BarChart2 className="h-6 w-6" />
                                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-900">Stats</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Metrics Section ─────────────────────────── */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Unread */}
                <div className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden">
                    <div className="relative">
                        {/* Fake circular graph/ring */}
                        <svg className="w-16 h-16 rotate-[-90deg] text-accent2/20" viewBox="0 0 36 36">
                            <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path strokeDasharray="75, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="text-accent2 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-accent2">75%</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-bold font-display text-ink">{stats.unread}</span>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">Unread Mails</p>
                        {stats.unread_delta && <span className="text-[10px] text-accent font-bold mt-1 block">{stats.unread_delta}</span>}
                    </div>
                </div>

                {/* Urgent */}
                <div className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden">
                    <div className="relative">
                        <svg className="w-16 h-16 rotate-[-90deg] text-danger/20" viewBox="0 0 36 36">
                            <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path strokeDasharray="30, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="text-danger drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-danger">30%</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-bold font-display text-ink">{stats.urgent}</span>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">Urgent</p>
                    </div>
                </div>

                {/* Tasks */}
                <div className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden">
                    <div className="relative">
                        <svg className="w-16 h-16 rotate-[-90deg] text-success/20" viewBox="0 0 36 36">
                            <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path strokeDasharray="62, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-success">62%</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-bold font-display text-ink">{stats.tasks_due}</span>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">Due Tasks</p>
                    </div>
                </div>

                {/* Waiting On */}
                <div className="glass-card p-6 flex items-center gap-5 group relative overflow-hidden">
                    <div className="relative">
                        <svg className="w-16 h-16 rotate-[-90deg] text-accent/20" viewBox="0 0 36 36">
                            <path strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                            <path strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" className="text-accent drop-shadow-[0_0_8px_rgba(124,58,237,0.6)]" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-accent">88%</span>
                        </div>
                    </div>
                    <div>
                        <span className="text-2xl font-bold font-display text-ink">{stats.awaiting_reply}</span>
                        <p className="text-xs font-semibold text-muted uppercase tracking-wider mt-1">Waiting On</p>
                    </div>
                </div>
            </section>

            {/* ─── Main Content Grid ─────────────────────── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Urgent Threads (Mapped from recent_threads) */}
                <div className="xl:col-span-2 space-y-8">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/5">
                            <h2 className="font-bold text-lg font-display text-ink">Recent Emails</h2>
                            <Link href="/inbox" className="text-accent text-sm font-bold hover:underline flex items-center gap-1 cursor-pointer">
                                View All <ArrowUpRight className="h-4 w-4" />
                            </Link>
                        </div>
                        
                        <div className="divide-y divide-border/60">
                            {recent_threads.map((thread: ThreadListItem) => {
                                const participantStr = thread.participants?.[0] || 'Unknown';
                                const nameMatch = participantStr.match(/^"?([^"<]+)"?\s*</);
                                const displayName = nameMatch ? nameMatch[1].trim() : participantStr.split('@')[0].replace(/[._]/g, ' ');
                                const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
                                
                                // Simple mapping for urgency badge
                                let urgencyTheme = { label: 'Low', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' };
                                if (thread.urgency_score >= 80) urgencyTheme = { label: 'High', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400' };
                                else if (thread.urgency_score >= 50) urgencyTheme = { label: 'Medium', bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' };

                                return (
                                    <Link key={thread.thread_id} href={`/inbox/${thread.thread_id}`}>
                                        <div className="p-4 flex flex-col sm:flex-row sm:items-center hover:bg-paper-mid/50 transition-colors cursor-pointer group">
                                            
                                            <div className="flex items-center flex-1 min-w-0 pr-4">
                                                <div className="size-10 rounded-full bg-white/50 border border-white/60 flex items-center justify-center font-bold text-accent text-xs mr-4 shrink-0 shadow-sm">
                                                    {initials}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-ink truncate group-hover:text-accent transition-colors">{displayName}</p>
                                                    <p className="text-xs text-muted truncate mt-0.5">{thread.subject}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 pl-[56px] sm:pl-0">
                                                <div className="px-3 shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${urgencyTheme.bg} ${urgencyTheme.text} shadow-sm border border-white/40`}>
                                                        {urgencyTheme.label}
                                                    </span>
                                                </div>
                                                <div className="text-right shrink-0 w-16">
                                                    <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">
                                                        {new Date(thread.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>

                                        </div>
                                    </Link>
                                );
                            })}
                            
                            {recent_threads.length === 0 && (
                                <div className="p-8 text-center text-muted text-sm">
                                    No recent threads found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tasks & Tips Sidebar */}
                <div className="space-y-8">
                    
                    {/* Tasks Due Today */}
                    <div className="glass-card p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-bold text-lg font-display text-ink">Tasks Due Today</h2>
                            <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-md text-accent border border-white/60">
                                {priority_tasks.length} total
                            </span>
                        </div>
                        
                        <div className="space-y-4">
                            {priority_tasks.length > 0 ? priority_tasks.slice(0, 5).map((task: TaskDTOv1) => {
                                const isCompleted = task.status === 'completed';
                                
                                return (
                                    <div key={task.task_id} className="flex items-start gap-3 group">
                                        <input 
                                            type="checkbox" 
                                            checked={isCompleted}
                                            readOnly
                                            className="mt-1 rounded border-white/50 text-accent focus:ring-accent h-4 w-4 bg-white/50 cursor-pointer shadow-sm" 
                                        />
                                        <div className="flex-1 min-w-0 cursor-pointer">
                                            <p className={`text-sm font-semibold leading-tight truncate transition-colors ${isCompleted ? 'line-through text-muted/60' : 'text-ink group-hover:text-accent'}`}>
                                                {task.title}
                                            </p>
                                            <p className="text-[10px] text-muted mt-0.5 font-mono uppercase tracking-tighter">
                                                {isCompleted ? 'Completed' : task.deadline ? `Due ${new Date(task.deadline).toLocaleDateString()}` : task.priority.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-muted text-center py-4">No priority tasks today.</p>
                            )}
                        </div>

                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="w-full mt-6 py-2.5 text-sm font-bold bg-white/40 hover:bg-white/60 text-accent transition-colors rounded-xl flex items-center justify-center gap-2 border border-white/60 shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            Add Task
                        </button>
                    </div>

                    {/* Smart Rules Tip */}
                    <div className="glass-card bg-accent2/90 p-6 text-slate-900 overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-slate-900 flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-[0.2em] mb-3">
                                <Zap className="h-3 w-3" /> Pro Tip
                            </p>
                            <h3 className="font-bold text-lg mb-3 font-display text-slate-900">Smart Rules</h3>
                            <p className="text-slate-800 text-sm leading-relaxed mb-6 font-medium">
                                Automate your workflow by setting up rules for incoming attachments from specific target clients.
                            </p>
                            <button className="px-4 py-2.5 bg-white text-accent2 hover:bg-white/90 transition-colors text-xs font-bold rounded-xl w-full flex items-center justify-center gap-2 shadow-sm">
                                Manage Rules
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="absolute -bottom-4 -right-4 opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                            <Settings className="w-32 h-32" />
                        </div>
                    </div>
                </div>
            </div>

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
        <AppShell>
            <Suspense fallback={
                <div className="p-8 space-y-8 animate-pulse w-full">
                    <div className="h-48 rounded-xl bg-paper-mid w-full" />
                </div>
            }>
                <DashboardContent />
            </Suspense>
        </AppShell>
    );
}
