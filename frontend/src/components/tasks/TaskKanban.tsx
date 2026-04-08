"use client";

import React from 'react';
import { TaskDTOv1 } from '@/types/dashboard';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface TaskKanbanProps {
    tasks: TaskDTOv1[];
    onTaskClick: (taskId: string) => void;
    onStatusChange: (taskId: string, status: TaskDTOv1['status']) => void;
}

const COLUMN_CONFIG: Record<TaskDTOv1['status'], { label: string; icon: string; color: string }> = {
    PENDING: { label: "Pending", icon: "pending_actions", color: "text-outline" },
    IN_PROGRESS: { label: "In Progress", icon: "bolt", color: "text-primary" },
    COMPLETED: { label: "Completed", icon: "verified", color: "text-tertiary" },
    DISMISSED: { label: "Dismissed", icon: "remove_done", color: "text-error" },
};

export const TaskKanban: React.FC<TaskKanbanProps> = ({ tasks, onTaskClick, onStatusChange }) => {
    const columns: Record<TaskDTOv1['status'], TaskDTOv1[]> = {
        PENDING: tasks.filter((t) => t.status === 'PENDING'),
        IN_PROGRESS: tasks.filter((t) => t.status === 'IN_PROGRESS'),
        COMPLETED: tasks.filter((t) => t.status === 'COMPLETED'),
        DISMISSED: tasks.filter((t) => t.status === 'DISMISSED'),
    };

    return (
        <div className="flex gap-8 h-full overflow-x-auto pb-4 scrollbar-none">
            {Object.entries(COLUMN_CONFIG).map(([status, config]) => (
                <div key={status} className="flex-1 min-w-[320px] flex flex-col bg-surface-container-low/40 rounded-[40px] border border-outline-variant/5 shadow-inner p-4 hover:shadow-xl hover:shadow-black/5 transition-all">
                    {/* Column Header */}
                    <div className="flex items-center justify-between px-6 py-4 mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`h-8 w-8 rounded-xl bg-white border border-outline-variant/10 flex items-center justify-center ${config.color} shadow-sm`}>
                                <MaterialSymbol icon={config.icon} />
                            </div>
                            <h3 className="text-[10px] font-black text-on-surface uppercase tracking-[0.2em]">{config.label}</h3>
                            <div className="px-2 py-0.5 bg-surface-container text-outline-variant font-black text-[9px] rounded-full tabular-nums">
                                {columns[status as TaskDTOv1['status']].length}
                            </div>
                        </div>
                        <div className="h-8 w-8 rounded-xl bg-surface-container text-outline-variant flex items-center justify-center shadow-sm">
                            <MaterialSymbol icon={config.icon} className="text-lg" />
                        </div>
                    </div>

                    {/* Task List */}
                    <div
                        className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-none"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            const taskId = e.dataTransfer.getData('taskId');
                            if (taskId) {
                                onStatusChange(taskId, status as TaskDTOv1['status']);
                            }
                        }}
                    >
                        {columns[status as TaskDTOv1['status']].map(task => (
                            <div
                                key={task.task_id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('taskId', task.task_id);
                                }}
                                onClick={() => onTaskClick(task.task_id)}
                                className="group bg-white rounded-[28px] border border-outline-variant/10 p-5 shadow-sm hover:border-primary-fixed/30 hover:shadow-lg transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className={`absolute top-0 left-0 w-1.5 h-full ${task.priority === 'DO_NOW' ? 'bg-error' : task.priority === 'DO_TODAY' ? 'bg-tertiary-fixed' : 'bg-primary-fixed'}`} />
                                
                                <div className="space-y-4 relative z-10">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className="text-sm font-bold text-on-surface leading-tight tracking-tight group-hover:text-primary transition-colors">
                                            {task.title}
                                        </h4>
                                        <div className="px-2 py-0.5 bg-surface-container text-outline-variant font-black text-[8px] rounded uppercase tracking-tighter shrink-0">
                                            {task.task_type}
                                        </div>
                                    </div>

                                    {task.description && (
                                        <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed opacity-70 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-full bg-surface-container border border-outline-variant/10 overflow-hidden">
                                                {/* Mock user or source avatar */}
                                                <MaterialSymbol icon="face" className="text-[10px] text-outline text-center w-full mt-1.5" />
                                            </div>
                                            <span className="text-[9px] font-black text-outline-variant uppercase tracking-tighter opacity-50">
                                                Node {task.task_id.substring(0, 4)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <select
                                                className="text-[10px] font-black uppercase tracking-widest bg-surface-container rounded-lg px-2 py-1 text-outline"
                                                value={task.status}
                                                onChange={(e) => onStatusChange(task.task_id, e.target.value as TaskDTOv1['status'])}
                                            >
                                                <option value="PENDING">Pending</option>
                                                <option value="IN_PROGRESS">In Progress</option>
                                                <option value="COMPLETED">Completed</option>
                                                <option value="DISMISSED">Dismissed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
