"use client";

import React, { useState, useMemo } from 'react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { TaskList } from '@/components/tasks/TaskList';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';
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
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskDTOv1 | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState('DO_TODAY');
    const [newType, setNewType] = useState('OTHER');

    const taskFilters = useMemo(() => ({
        q: searchQuery || undefined,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
    }), [searchQuery, priorityFilter, statusFilter]);

    const { data: tasks, isLoading, error } = useTasks(taskFilters);
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const filteredTasks = useMemo(() => {
        return tasks || [];
    }, [tasks]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setPriorityFilter('all');
        setStatusFilter('all');
    };

    const handleTaskClick = (taskId: string) => {
        const task = filteredTasks.find((t) => t.task_id === taskId) || null;
        setSelectedTask(task);
    };

    const handleStatusChange = async (taskId: string, status: TaskDTOv1['status']) => {
        await updateTask.mutateAsync({ taskId, payload: { status } });
    };

    const handleCreate = async () => {
        if (!newTitle.trim()) return;
        await createTask.mutateAsync({
            title: newTitle.trim(),
            description: newDescription.trim() || undefined,
            priority: newPriority,
            task_type: newType,
            status: 'PENDING',
        });
        setNewTitle('');
        setNewDescription('');
        setNewPriority('DO_TODAY');
        setNewType('OTHER');
        setIsCreateOpen(false);
    };

    const handleQuickSaveSelected = async () => {
        if (!selectedTask) return;
        await updateTask.mutateAsync({
            taskId: selectedTask.task_id,
            payload: {
                title: selectedTask.title,
                description: selectedTask.description || '',
                status: selectedTask.status,
                priority: selectedTask.priority,
                task_type: selectedTask.task_type,
            },
        });
    };

    const isSaving = createTask.isPending || updateTask.isPending || deleteTask.isPending;

    const taskCount = filteredTasks.length;
    const completedCount = filteredTasks.filter((t) => t.status === 'COMPLETED').length;
    const activeCount = filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length;

    const panelLabel = `${taskCount} tasks • ${activeCount} in progress • ${completedCount} completed`;

    const closeDetails = () => setSelectedTask(null);

    const updateSelected = (patch: Partial<TaskDTOv1>) => {
        setSelectedTask((prev) => (prev ? { ...prev, ...patch } : prev));
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
                        <p className="text-sm font-medium text-on-surface-variant opacity-80 italic">{panelLabel}</p>
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
                    onCreateTask={() => setIsCreateOpen(true)}
                    isSaving={isSaving}
                />
            </div>

            {/* Matrix Viewport */}
            <div className="flex-1 overflow-hidden px-10 pb-10">
                {view === 'board' ? (
                    <TaskKanban
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div className="h-full overflow-y-auto scrollbar-none pr-4">
                        <TaskList
                            tasks={filteredTasks}
                            onTaskClick={handleTaskClick}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                )}
            </div>

            {isCreateOpen && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-xl bg-white rounded-3xl border border-outline-variant/20 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-on-surface">Create Task</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="h-8 w-8 rounded-lg bg-surface-container text-outline">
                                <MaterialSymbol icon="close" />
                            </button>
                        </div>
                        <input
                            className="w-full h-11 rounded-xl border border-outline-variant/20 px-4"
                            placeholder="Task title"
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                        />
                        <textarea
                            className="w-full h-28 rounded-xl border border-outline-variant/20 px-4 py-3"
                            placeholder="Description"
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-3">
                            <select className="h-11 rounded-xl border border-outline-variant/20 px-3" value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                                <option value="DO_NOW">Do Now</option>
                                <option value="DO_TODAY">Do Today</option>
                                <option value="CAN_WAIT">Can Wait</option>
                            </select>
                            <select className="h-11 rounded-xl border border-outline-variant/20 px-3" value={newType} onChange={(e) => setNewType(e.target.value)}>
                                <option value="OTHER">Other</option>
                                <option value="REPLY">Reply</option>
                                <option value="REVIEW">Review</option>
                                <option value="SCHEDULE">Schedule</option>
                                <option value="FOLLOWUP">Followup</option>
                            </select>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button onClick={() => setIsCreateOpen(false)} className="h-10 px-4 rounded-xl bg-surface-container text-outline">Cancel</button>
                            <button onClick={handleCreate} disabled={isSaving || !newTitle.trim()} className="h-10 px-4 rounded-xl bg-primary text-on-primary disabled:opacity-60">Save Task</button>
                        </div>
                    </div>
                </div>
            )}

            {selectedTask && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-3xl border border-outline-variant/20 shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-on-surface">Edit Task</h2>
                            <button onClick={closeDetails} className="h-8 w-8 rounded-lg bg-surface-container text-outline">
                                <MaterialSymbol icon="close" />
                            </button>
                        </div>
                        <input
                            className="w-full h-11 rounded-xl border border-outline-variant/20 px-4"
                            value={selectedTask.title}
                            onChange={(e) => updateSelected({ title: e.target.value })}
                        />
                        <textarea
                            className="w-full h-28 rounded-xl border border-outline-variant/20 px-4 py-3"
                            value={selectedTask.description || ''}
                            onChange={(e) => updateSelected({ description: e.target.value })}
                        />
                        <div className="grid grid-cols-3 gap-3">
                            <select className="h-11 rounded-xl border border-outline-variant/20 px-3" value={selectedTask.priority} onChange={(e) => updateSelected({ priority: e.target.value as TaskDTOv1['priority'] })}>
                                <option value="DO_NOW">Do Now</option>
                                <option value="DO_TODAY">Do Today</option>
                                <option value="CAN_WAIT">Can Wait</option>
                            </select>
                            <select className="h-11 rounded-xl border border-outline-variant/20 px-3" value={selectedTask.status} onChange={(e) => updateSelected({ status: e.target.value as TaskDTOv1['status'] })}>
                                <option value="PENDING">Pending</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="DISMISSED">Dismissed</option>
                            </select>
                            <select className="h-11 rounded-xl border border-outline-variant/20 px-3" value={selectedTask.task_type} onChange={(e) => updateSelected({ task_type: e.target.value as TaskDTOv1['task_type'] })}>
                                <option value="OTHER">Other</option>
                                <option value="REPLY">Reply</option>
                                <option value="REVIEW">Review</option>
                                <option value="SCHEDULE">Schedule</option>
                                <option value="FOLLOWUP">Followup</option>
                            </select>
                        </div>
                        <div className="flex justify-between pt-2">
                            <button
                                onClick={async () => {
                                    await deleteTask.mutateAsync(selectedTask.task_id);
                                    closeDetails();
                                }}
                                className="h-10 px-4 rounded-xl bg-error text-white disabled:opacity-60"
                                disabled={isSaving}
                            >
                                Delete
                            </button>
                            <div className="flex gap-3">
                                <button onClick={closeDetails} className="h-10 px-4 rounded-xl bg-surface-container text-outline">Close</button>
                                <button onClick={handleQuickSaveSelected} disabled={isSaving} className="h-10 px-4 rounded-xl bg-primary text-on-primary disabled:opacity-60">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
