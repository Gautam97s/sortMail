"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowUpRight,
    MessageCircle,
    Copy,
    Share2,
    Calendar,
    Zap,
    Users,
    Circle,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AppShell from '@/components/layout/AppShell';
import { mockTasks } from "@/data/tasks";

export default function SharedTasksPage() {
    const [filter, setFilter] = useState("all");
    const tasks = mockTasks;

    return (
        <AppShell title="Shared Tasks" subtitle="Team-wide action items">
            <div className="max-w-6xl mx-auto space-y-12 py-12 px-8">
                {/* Header */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-ai font-mono text-sm tracking-widest uppercase mb-2">
                        <Zap size={16} /> Workspace Intelligence
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-bold text-ink tracking-tight">
                        Shared <span className="italic text-accent">Tasks</span>
                    </h1>
                    <p className="text-xl text-ink-light max-w-2xl leading-relaxed">
                        Collation of action items extracted from team threads by Gemini.
                        Assigned, tracked, and synchronized across your organization.
                    </p>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4">
                    <Button
                        variant={filter === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilter('all')}
                        className="rounded-xl font-bold px-6"
                    >
                        All Open
                    </Button>
                    <Button
                        variant={filter === 'assigned' ? 'default' : 'ghost'}
                        onClick={() => setFilter('assigned')}
                        className="rounded-xl px-6 font-medium"
                    >
                        Assigned to Me
                    </Button>
                </div>

                {/* Tasks List */}
                <div className="space-y-6">
                    {tasks.map((task) => (
                        <Card key={task.task_id} className="group hover:shadow-xl hover:shadow-accent/5 transition-all border-border-light rounded-3xl overflow-hidden">
                            <CardContent className="p-0">
                                <div className="flex flex-col sm:flex-row items-stretch">
                                    <div className="w-1.5 bg-accent/20 group-hover:bg-accent transition-colors" />

                                    <div className="flex-1 p-8">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="h-12 w-12 rounded-2xl bg-paper-mid flex items-center justify-center border border-border-light group-hover:border-accent/40 transition-colors">
                                                    <CheckCircle2 className="h-6 w-6 text-muted group-hover:text-accent transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-display font-bold text-ink mb-1 group-hover:text-accent transition-colors tracking-tight">
                                                        {task.title}
                                                    </h3>
                                                    <div className="flex items-center gap-1.5 text-xs text-ai font-bold">
                                                        <MessageCircle size={12} />
                                                        Source: Thread #782
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-4 sm:pt-0">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map((i) => (
                                                        <div key={i} className="h-8 w-8 rounded-full border-2 border-white overflow-hidden bg-paper-mid">
                                                            <Image
                                                                src={`https://picsum.photos/id/${i + 20}/100/100`}
                                                                alt={`Member ${i}`}
                                                                width={32}
                                                                height={32}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="h-8 w-8 rounded-full border-2 border-white bg-accent text-white flex items-center justify-center text-[10px] font-bold">
                                                    +2
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-between border-t border-border-light pt-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-xs font-mono text-muted uppercase tracking-wider">
                                                    <Clock size={14} /> Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'soon'}
                                                </div>
                                                <Badge variant="outline" className="rounded-full bg-paper border-border-light text-[10px] uppercase font-bold tracking-widest text-ink/60">
                                                    {task.priority.replace('_', ' ')}
                                                </Badge>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Button variant="ghost" size="icon" className="rounded-xl text-muted hover:text-ink">
                                                    <Copy size={18} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl text-muted hover:text-ink">
                                                    <Share2 size={18} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl text-muted hover:text-ink">
                                                    <ArrowUpRight size={18} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Bottom Tip */}
                <div className="p-8 bg-ai/5 border border-ai/20 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 text-center md:text-left overflow-hidden relative">
                    <div className="h-16 w-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-ai shrink-0 relative z-10">
                        <Users size={32} />
                    </div>
                    <div className="space-y-1 flex-1 relative z-10">
                        <h4 className="font-display font-bold text-ink text-lg">AI Collaboration Tip</h4>
                        <p className="text-ink-light text-sm max-w-xl">
                            The Gemini engine automatically detects tasks in team threads and suggests shared ownership based on past expertise and availability.
                        </p>
                    </div>
                    <Button variant="outline" className="border-ai/20 hover:bg-white text-ai rounded-2xl font-bold relative z-10">
                        Customize AI Engine
                    </Button>
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <Circle size={200} strokeWidth={20} className="text-ai" />
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
