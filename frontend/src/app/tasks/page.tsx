"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { TaskKanban } from '@/components/tasks/TaskKanban';
import { TaskList } from '@/components/tasks/TaskList';
import { useCreateTask, useDeleteTask, useTasks, useUpdateTask } from '@/hooks/useTasks';
import { TaskDTOv1 } from '@/types/dashboard';
import Link from 'next/link';
import { api, endpoints } from '@/lib/api';
import AppShell from '@/components/layout/AppShell';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function TasksPage() {
    type SourceContext = {
        threadId: string;
        subject?: string;
        attachments: Array<{ attachment_id?: string; filename?: string; mime_type?: string }>;
    } | null;

    const [view, setView] = useState<'board' | 'list'>('board');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskDTOv1 | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sourceFilter, setSourceFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newPriority, setNewPriority] = useState('DO_TODAY');
    const [newType, setNewType] = useState('OTHER');
    const [sourceContext, setSourceContext] = useState<SourceContext>(null);
    const [sourceLoading, setSourceLoading] = useState(false);

    const taskFilters = useMemo(() => ({
        q: searchQuery || undefined,
        thread_id: sourceFilter || undefined,
        priority: priorityFilter === 'all' ? undefined : priorityFilter,
        status: statusFilter === 'all' ? undefined : statusFilter,
    }), [searchQuery, sourceFilter, priorityFilter, statusFilter]);

    const { data: tasks, isLoading, error } = useTasks(taskFilters);
    const createTask = useCreateTask();
    const updateTask = useUpdateTask();
    const deleteTask = useDeleteTask();

    const filteredTasks = useMemo(() => {
        return tasks || [];
    }, [tasks]);

    const handleClearFilters = () => {
        setSearchQuery('');
        setSourceFilter('');
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

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const params = new URLSearchParams(window.location.search);
        setView((params.get('view') as 'board' | 'list' | null) || 'board');
        setSearchQuery(params.get('q') || '');
        setSourceFilter(params.get('source') || '');
        setPriorityFilter(params.get('priority') || 'all');
        setStatusFilter(params.get('status') || 'all');
    }, []);

    useEffect(() => {
        const loadSource = async () => {
            if (!selectedTask?.thread_id) {
                setSourceContext(null);
                return;
            }
            try {
                setSourceLoading(true);
                const { data } = await api.get(`${endpoints.threads}/${selectedTask.thread_id}`);
                const attachments = data?.thread?.attachments || [];
                setSourceContext({
                    threadId: selectedTask.thread_id,
                    subject: data?.thread?.subject,
                    attachments,
                });
            } catch {
                setSourceContext({
                    threadId: selectedTask.thread_id,
                    subject: undefined,
                    attachments: [],
                });
            } finally {
                setSourceLoading(false);
            }
        };
        void loadSource();
    }, [selectedTask?.thread_id]);

    if (isLoading) {
        return (
            <AppShell title="Tasks" subtitle="Focus workspace">
                <div className="p-6 space-y-6 animate-pulse max-w-[1280px] mx-auto">
                    <div className="h-8 w-40 bg-surface-container rounded-lg" />
                    <div className="flex gap-4 h-[520px]">
                        {[1, 2, 3].map(i => <div key={i} className="flex-1 bg-surface-container rounded-2xl" />)}
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error) {
        return (
            <AppShell title="Tasks" subtitle="Focus workspace">
                <div className="h-full flex items-center justify-center p-12">
                    <div className="text-center space-y-4">
                        <MaterialSymbol icon="error" className="text-4xl text-error" />
                        <p className="text-sm font-bold text-on-surface uppercase tracking-widest">Neural Link Distorted</p>
                        <button onClick={() => window.location.reload()} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Re-Initialize</button>
                    </div>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Tasks" subtitle={panelLabel}>
            <div className="min-h-full flex flex-col bg-surface-container-lowest max-w-[1280px] mx-auto w-full">
                {/* Editorial Header */}
                <div className="px-4 md:px-6 pt-4 pb-4 space-y-4 shrink-0">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight">Focus Matrix</h1>
                            <p className="text-xs font-medium text-on-surface-variant opacity-80 italic">{panelLabel}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 bg-white/50 p-1 rounded-xl border border-outline-variant/10 shadow-sm w-fit max-w-full">
                            <button
                                onClick={() => setView('board')}
                                className={`h-9 px-4 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'board' ? 'bg-on-surface text-surface shadow-sm' : 'text-outline-variant hover:bg-surface-container-high'}`}
                            >
                                <MaterialSymbol icon="view_kanban" className="text-lg" />
                                Canvas
                            </button>
                            <button
                                onClick={() => setView('list')}
                                className={`h-9 px-4 rounded-lg flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-on-surface text-surface shadow-sm' : 'text-outline-variant hover:bg-surface-container-high'}`}
                            >
                                <MaterialSymbol icon="view_list" className="text-lg" />
                                Stream
                            </button>
                        </div>
                </div>

                <TaskFilters
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sourceFilter={sourceFilter}
                    onSourceChange={setSourceFilter}
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
                <div className="flex-1 min-h-0 px-4 md:px-6 pb-6">
                {view === 'board' ? (
                    <TaskKanban
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onStatusChange={handleStatusChange}
                    />
                ) : (
                    <div className="min-h-0 overflow-y-auto scrollbar-none pr-2">
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
                    <div className="w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-2xl border border-outline-variant/20 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 shrink-0">
                            <h2 className="text-lg font-bold text-on-surface">Create Task</h2>
                            <button onClick={() => setIsCreateOpen(false)} className="h-8 w-8 rounded-lg bg-surface-container text-outline">
                                <MaterialSymbol icon="close" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        </div>
                        <div className="flex justify-end gap-3 px-5 py-4 border-t border-outline-variant/10 shrink-0 bg-surface-container-lowest">
                            <button onClick={() => setIsCreateOpen(false)} className="h-10 px-4 rounded-xl bg-surface-container text-outline">Cancel</button>
                            <button onClick={handleCreate} disabled={isSaving || !newTitle.trim()} className="h-10 px-4 rounded-xl bg-primary text-on-primary disabled:opacity-60">Save Task</button>
                        </div>
                    </div>
                </div>
            )}

                {selectedTask && (
                <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-hidden bg-white rounded-2xl border border-outline-variant/20 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10 shrink-0">
                            <h2 className="text-lg font-bold text-on-surface">Edit Task</h2>
                            <button onClick={closeDetails} className="h-8 w-8 rounded-lg bg-surface-container text-outline">
                                <MaterialSymbol icon="close" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            <input
                                className="w-full h-11 rounded-xl border border-outline-variant/20 px-4"
                                value={selectedTask.title}
                                onChange={(e) => updateSelected({ title: e.target.value })}
                            />
                            <textarea
                                className="w-full min-h-28 rounded-xl border border-outline-variant/20 px-4 py-3"
                                value={selectedTask.description || ''}
                                onChange={(e) => updateSelected({ description: e.target.value })}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-on-surface">Source Reference</h3>
                                        {selectedTask.source_type && (
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-outline-variant/20 font-bold uppercase tracking-widest text-outline">
                                                {selectedTask.source_type}
                                            </span>
                                        )}
                                    </div>

                                    {!selectedTask.thread_id ? (
                                        <p className="text-xs text-outline">No source thread attached to this task.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-on-surface truncate">{sourceContext?.subject || `Thread ${selectedTask.thread_id}`}</p>
                                                    <p className="text-[10px] text-outline truncate">ID: {selectedTask.thread_id}</p>
                                                </div>
                                                <Link
                                                    href={`/inbox/${selectedTask.thread_id}`}
                                                    className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg bg-primary text-on-primary flex items-center"
                                                >
                                                    Open Thread
                                                </Link>
                                            </div>

                                            {selectedTask.source_email_id && (
                                                <p className="text-[10px] text-outline">Source Email: {selectedTask.source_email_id}</p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-2xl border border-outline-variant/20 bg-white p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-on-surface">Attachment Context</h3>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container-low border border-outline-variant/10 font-bold uppercase tracking-widest text-outline">
                                            AI Intel
                                        </span>
                                    </div>

                                    {sourceLoading ? (
                                        <p className="text-xs text-outline">Loading attachment context...</p>
                                    ) : (sourceContext?.attachments?.length || 0) > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {(sourceContext?.attachments || []).slice(0, 8).map((a, idx) => (
                                                <span
                                                    key={a.attachment_id || `${a.filename || 'att'}-${idx}`}
                                                    className="text-[10px] px-2 py-1 rounded-lg bg-surface-container-low border border-outline-variant/20 text-on-surface truncate max-w-full"
                                                >
                                                    {a.filename || a.attachment_id || `Attachment ${idx + 1}`}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-outline">No attachments found for this source thread.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-outline-variant/10 shrink-0 bg-surface-container-lowest">
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
                            <div className="flex gap-3 justify-end">
                                <button onClick={closeDetails} className="h-10 px-4 rounded-xl bg-surface-container text-outline">Close</button>
                                <button onClick={handleQuickSaveSelected} disabled={isSaving} className="h-10 px-4 rounded-xl bg-primary text-on-primary disabled:opacity-60">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>
        </AppShell>
    );
}
