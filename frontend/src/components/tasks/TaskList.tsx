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

interface TaskListProps {
    tasks: TaskDTOv1[];
    onTaskClick: (taskId: string) => void;
    onStatusChange: (taskId: string, status: TaskDTOv1['status']) => void;
}

const PRIORITY_MAPPING: Record<string, { label: string; icon: string; colorClass: string; bgClass: string }> = {
    DO_NOW: { label: "Do Now", icon: "emergency_home", colorClass: "text-error", bgClass: "bg-error-container" },
    DO_TODAY: { label: "Do Today", icon: "schedule", colorClass: "text-tertiary", bgClass: "bg-tertiary-fixed/20" },
    CAN_WAIT: { label: "Can Wait", icon: "event_repeat", colorClass: "text-primary", bgClass: "bg-primary-fixed/20" },
    all: { label: "Neutral", icon: "radio_button_unchecked", colorClass: "text-outline", bgClass: "bg-surface-container" },
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, onStatusChange }) => {
    return (
        <div className="space-y-3">
            {tasks.length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[40px] border border-outline-variant/10 shadow-sm space-y-6">
                    <MaterialSymbol icon="playlist_add_check" className="text-4xl text-outline-variant opacity-20" />
                    <p className="text-sm font-bold text-on-surface uppercase tracking-widest opacity-60 italic">Matrix synchronized. No actionable entities detected.</p>
                </div>
            ) : (
                tasks.map(task => {
                    const priority = PRIORITY_MAPPING[task.priority] || PRIORITY_MAPPING.all;
                    return (
                        <div
                            key={task.task_id}
                            onClick={() => onTaskClick(task.task_id)}
                            className="group bg-white rounded-[24px] p-5 flex flex-col xl:flex-row xl:items-center gap-4 border border-outline-variant/10 hover:border-primary-fixed/30 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative"
                        >
                            <div className="flex items-center gap-6 min-w-0 flex-1">
                                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border border-outline-variant/5 shadow-inner ${priority.bgClass} ${priority.colorClass}`}>
                                    <MaterialSymbol icon={priority.icon} filled className="text-xl" />
                                </div>
                                <div className="min-w-0 flex-1 space-y-1">
                                    <h4 className="text-sm font-bold text-on-surface truncate tracking-tight group-hover:text-primary transition-colors">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-tighter opacity-60 text-outline-variant">
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface-container rounded uppercase">
                                            <MaterialSymbol icon="category" className="text-[10px]" />
                                            {task.task_type}
                                        </div>
                                        <div className="flex items-center gap-1.5 uppercase">
                                            <MaterialSymbol icon="schedule" className="text-[10px]" />
                                                    {task.status.replace('_', ' ')}
                                        </div>
                                        {task.description && <div className="truncate max-w-sm italic opacity-80">{task.description}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="w-full xl:w-60 shrink-0 rounded-2xl border border-primary-fixed/10 bg-primary-fixed/5 p-3 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">AI Intelligence</div>
                                    <div className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${priority.colorClass} ${priority.bgClass}`}>
                                        {task.priority_score.toFixed(0)}
                                    </div>
                                </div>
                                <p className="text-[10px] font-medium text-on-surface-variant line-clamp-2 italic">
                                    {task.priority_explanation}
                                </p>
                                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-outline-variant">
                                    <MaterialSymbol icon="auto_fix" className="text-[11px]" />
                                    {task.effort.replace('_', ' ')} effort
                                </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0 xl:ml-auto">
                                <div className="text-right space-y-1">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${priority.colorClass}`}>
                                        {priority.label}
                                    </div>
                                    <select
                                        className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-black text-[9px] rounded uppercase"
                                        value={task.status}
                                        onChange={(e) => {
                                            e.stopPropagation();
                                            onStatusChange(task.task_id, e.target.value as TaskDTOv1['status']);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <option value="PENDING">Pending</option>
                                        <option value="IN_PROGRESS">In Progress</option>
                                        <option value="COMPLETED">Completed</option>
                                        <option value="DISMISSED">Dismissed</option>
                                    </select>
                                </div>
                                <div className="h-10 w-10 bg-surface-container rounded-xl flex items-center justify-center text-outline group-hover:text-on-surface group-hover:bg-primary-fixed/20 group-hover:text-primary transition-all">
                                    <MaterialSymbol icon="arrow_forward" />
                                </div>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};
