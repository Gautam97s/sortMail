import React, { useEffect } from 'react';
import gsap from 'gsap';
import { Sparkles, Activity, ArrowRight, Mail, Zap, ChevronRight } from 'lucide-react';
import { DashboardData, TaskDTOv1, ThreadListItem } from '@/types/dashboard';
import { mockUserProfile } from '@/data/user';
import Link from 'next/link';

interface DashboardViewProps {
    data: DashboardData;
}

const DashboardView: React.FC<DashboardViewProps> = ({ data }) => {
    const user = mockUserProfile;

    useEffect(() => {
        const tl = gsap.timeline();

        // Header
        tl.fromTo(".dash-header", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4 });

        // Briefing Card
        tl.fromTo(".briefing-card",
            { y: 20, opacity: 0, scale: 0.95 },
            { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" },
            "-=0.2"
        );

        // Bullet points reveal
        tl.fromTo(".briefing-point",
            { x: -10, opacity: 0 },
            { x: 0, opacity: 1, stagger: 0.05, duration: 0.3 },
            "-=0.1"
        );

        // Activity Feed
        tl.fromTo(".activity-item",
            { y: 10, opacity: 0 },
            { y: 0, opacity: 1, stagger: 0.05, duration: 0.3 },
            "-=0.2"
        );
    }, []);

    const { briefing, stats, recent_threads, priority_tasks } = data;

    return (
        <div className="h-full p-8 overflow-y-auto custom-scrollbar bg-paper">
            <div className="dash-header mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display text-ink mb-1">Good Morning, {user.firstName}</h1>
                    <p className="text-ink-light font-mono text-xs uppercase tracking-widest">{briefing.date}</p>
                </div>
                <div className="flex gap-2">
                    <span className="text-[10px] font-mono font-bold text-accent uppercase bg-accent/5 px-2 py-1 rounded border border-accent/20">
                        {user.plan} Active
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Executive Briefing Card */}
                <div className="col-span-2 briefing-card relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-ai to-purple-400 rounded-2xl opacity-10 group-hover:opacity-20 transition duration-500 blur"></div>
                    <div className="relative h-full bg-white border border-border-light rounded-xl p-8 overflow-hidden shadow-sm">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] rotate-12">
                            <Sparkles size={180} className="text-ai" />
                        </div>

                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-ai/10 flex items-center justify-center">
                                <Sparkles size={16} className="text-ai" />
                            </div>
                            <span className="font-mono font-bold uppercase tracking-widest text-[11px] text-ai">Executive Intelligence Briefing</span>
                        </div>

                        <div className="space-y-6">
                            <p className="text-ink-mid text-xl leading-relaxed font-medium">
                                {briefing.summary}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-2">
                                {briefing.suggested_actions.map((action: string, i: number) => (
                                    <div key={i} className="briefing-point px-3 py-1.5 rounded-full bg-paper-mid border border-border-light text-xs font-medium text-ink-light flex items-center gap-2 hover:border-ai/50 transition-colors cursor-pointer group">
                                        <Zap size={12} className="text-ai opacity-50 group-hover:opacity-100" />
                                        {action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 gap-4 col-span-1">
                    <StatBox label="Unread" value={stats.unread} color="text-info" icon={Mail} />
                    <StatBox label="Urgent" value={stats.urgent} color="text-danger" icon={Activity} />

                    <div className="col-span-2 briefing-card bg-accent rounded-xl p-6 flex flex-col justify-between h-[160px] relative overflow-hidden group cursor-pointer shadow-lg shadow-accent/20">
                        <div className="relative z-10">
                            <h3 className="text-white font-display text-xl mb-1">Process Queue</h3>
                            <p className="text-white/70 text-sm font-mono">{stats.tasks_due} items awaiting action</p>
                        </div>
                        <div className="relative z-10 flex items-center gap-2 text-white font-medium text-sm group-hover:gap-3 transition-all">
                            Enter Focus Mode <ArrowRight size={16} />
                        </div>
                        <div className="absolute -right-4 -bottom-4 bg-white/10 w-32 h-32 rounded-full group-hover:scale-110 transition-transform duration-700" />
                    </div>
                </div>
            </div>

            {/* Recent Items Grid */}
            <div className="mt-12 grid lg:grid-cols-2 gap-12">
                {/* Priority Tasks */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Zap size={18} className="text-amber-500" />
                            <h2 className="text-xs font-mono font-bold uppercase tracking-widest">Priority Queue</h2>
                        </div>
                        <Link href="/tasks" className="text-[10px] uppercase font-bold text-accent hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {priority_tasks.slice(0, 3).map((task: TaskDTOv1) => (
                            <div key={task.task_id} className="activity-item bg-white border border-border-light p-4 rounded-xl flex items-center justify-between hover:border-accent/30 transition-all cursor-pointer group shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-1 h-8 rounded-full ${task.priority === 'do_now' ? 'bg-danger' : 'bg-accent'}`} />
                                    <div>
                                        <h4 className="text-ink font-medium text-sm group-hover:text-accent transition-colors">{task.title}</h4>
                                        <p className="text-muted-foreground text-[10px] font-mono uppercase mt-0.5">{task.task_type} • Due Today</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-muted-foreground group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Intelligence */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Activity size={18} className="text-info" />
                            <h2 className="text-xs font-mono font-bold uppercase tracking-widest">Recent Analysis</h2>
                        </div>
                        <Link href="/inbox" className="text-[10px] uppercase font-bold text-accent hover:underline">Inbox</Link>
                    </div>
                    <div className="space-y-3">
                        {recent_threads.slice(0, 3).map((thread: ThreadListItem) => (
                            <div key={thread.thread_id} className="activity-item bg-white border border-border-light p-4 rounded-xl flex items-center justify-between hover:border-ai/30 transition-all cursor-pointer group shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-paper-mid flex items-center justify-center text-[10px] font-bold text-ink-light">
                                        JS
                                    </div>
                                    <div>
                                        <h4 className="text-ink font-medium text-sm group-hover:text-ai transition-colors truncate max-w-[200px]">{thread.subject}</h4>
                                        <p className="text-muted-foreground text-[10px] font-mono uppercase mt-0.5">{thread.intent} • {thread.urgency_score} score</p>
                                    </div>
                                </div>
                                <div className={`w-1.5 h-1.5 rounded-full ${thread.urgency_score > 70 ? 'bg-danger animate-pulse' : 'bg-success'}`} />
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, color, icon: Icon }: any) => (
    <div className="briefing-card bg-white border border-border-light rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
            <Icon size={14} className={color} />
        </div>
        <p className="text-2xl font-display text-ink">{value}</p>
    </div>
);
export default DashboardView;
