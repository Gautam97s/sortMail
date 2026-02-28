'use client';

import React, { useState, useMemo } from 'react';
import AppShell from '@/components/layout/AppShell';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { TaskList } from '@/components/tasks/TaskList';
import { useTasks } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List as ListIcon, Plus } from 'lucide-react';
import { TaskDTOv1 } from '@/types/dashboard';

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
        // TODO: Open task detail modal
    };

    if (isLoading) {
        return (
            <AppShell title="Tasks">
                <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                    <div className="p-6">
                        <div className="h-12 w-64 bg-paper-mid animate-pulse rounded-lg mb-6" />
                        <div className="flex gap-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex-1 h-96 bg-paper-mid animate-pulse rounded-xl" />
                            ))}
                        </div>
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell title="Tasks">
                <div className="p-8 text-center text-danger">
                    Failed to load tasks.
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Tasks">
            <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
                <div className="flex flex-col gap-3 md:gap-4 px-4 md:px-6 pt-4 md:pt-6 pb-2 shrink-0">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <h1 className="font-display text-2xl md:text-3xl text-ink truncate">Tasks</h1>
                            <p className="text-sm md:text-base text-ink-light mt-0.5 md:mt-1 truncate">Manage your actionable items.</p>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3 shrink-0">
                            <div className="bg-surface-card p-1 rounded-lg border border-border-light flex items-center">
                                <Button
                                    variant={view === 'board' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('board')}
                                    className="h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                    <LayoutGrid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={view === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setView('list')}
                                    className="h-7 w-7 md:h-8 md:w-8 p-0"
                                >
                                    <ListIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <Button className="h-8 md:h-9 px-3 gap-1.5 md:gap-2 bg-accent hover:bg-accent-hover text-white text-xs md:text-sm">
                                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                <span className="hidden sm:inline">Add Task</span>
                                <span className="sm:hidden">Add</span>
                            </Button>
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

                <div className="flex-1 overflow-hidden px-4 md:px-6 pb-4 md:pb-6">
                    {view === 'board' ? (
                        <TaskKanban tasks={filteredTasks} onTaskClick={handleTaskClick} />
                    ) : (
                        <div className="h-full overflow-y-auto pr-2 scrollbar-thin">
                            <TaskList tasks={filteredTasks} onTaskClick={handleTaskClick} />
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    );
}
