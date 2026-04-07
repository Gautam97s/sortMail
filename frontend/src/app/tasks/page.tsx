"use client";

import React, { useState, useMemo } from 'react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { TaskList } from '@/components/tasks/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { TaskDTOv1 } from '@/types/dashboard';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function TasksPage() {
    const [view, setView] = useState<'board' | 'list'>('board');
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const { data: tasks, isLoading, error } = useTasks();

    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter((task: TaskDTOv1) => {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
            const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
            const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
            return matchesSearch && matchesPriority && matchesStatus;
        });
    }, [searchQuery, priorityFilter, statusFilter, tasks]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setPriorityFilter('all');
        setStatusFilter('all');
    };

    const handleTaskClick = (taskId: string) => {
        console.log('Task clicked:', taskId);
    };

    if (isLoading) {
        return (
            <div className="p-10 space-y-8 animate-pulse">
                <div className="h-10 w-48 bg-surface-container rounded-xl" />
                <div className="flex gap-6 h-[600px]">
                    {[1, 2, 3].map(i => <div key={i} className="flex-1 bg-surface-container rounded-[32px]" />)}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="h-full flex items-center justify-center p-20">
                <div className="text-center space-y-4">
                    <MaterialSymbol icon="error" className="text-4xl text-error" />
                    <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Neural Link Distorted</p>
                    <button onClick={() => window.location.reload()} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Re-Initialize</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-surface-container-lowest overflow-hidden">
            {/* Editorial Header */}
            <div className="px-10 pt-10 pb-6 space-y-8 shrink-0">
                <div className="flex items-end justify-between">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">Focus Matrix</h1>
                        <p className="text-sm font-medium text-on-surface-variant opacity-80 italic">Synchronize actionable entities across neural columns.</p>
                    </div>
                    <div className="flex items-center gap-4 bg-white/50 p-1.5 rounded-2xl border border-outline-variant/10 shadow-sm">
                        <button
                            onClick={() => setView('board')}
                            className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'board' ? 'bg-on-surface text-surface shadow-xl' : 'text-outline-variant hover:bg-surface-container-high'}`}
                        >
                            <MaterialSymbol icon="view_kanban" className="text-lg" />
                            Canvas
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`h-11 px-6 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-on-surface text-surface shadow-xl' : 'text-outline-variant hover:bg-surface-container-high'}`}
                        >
                            <MaterialSymbol icon="view_list" className="text-lg" />
                            Stream
                        </button>
                        <div className="w-[1px] h-6 bg-outline-variant/20 mx-2" />
                        <button className="h-11 px-6 bg-primary text-on-primary rounded-xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20">
                            <MaterialSymbol icon="add" className="text-xl" />
                            Annex Entity
                        </button>
                    </div>
                </div>

                <TaskFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    priorityFilter={priorityFilter}
                    onPriorityChange={setPriorityFilter}
                    statusFilter={statusFilter}
                    onStatusChange={setStatusFilter}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Matrix Viewport */}
            <div className="flex-1 overflow-hidden px-10 pb-10">
                {view === 'board' ? (
                    <TaskKanban tasks={filteredTasks} onTaskClick={handleTaskClick} />
                ) : (
                    <div className="h-full overflow-y-auto scrollbar-none pr-4">
                        <TaskList tasks={filteredTasks} onTaskClick={handleTaskClick} />
                    </div>
                )}
            </div>
        </div>
    );
}
