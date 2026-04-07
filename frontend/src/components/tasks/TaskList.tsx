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
}

const PRIORITY_MAPPING: Record<string, { label: string; icon: string; colorClass: string; bgClass: string }> = {
    do_now: { label: "Immediate", icon: "emergency_home", colorClass: "text-error", bgClass: "bg-error-container" },
    do_soon: { label: "Scheduled", icon: "schedule", colorClass: "text-tertiary", bgClass: "bg-tertiary-fixed/20" },
    later: { label: "Deferred", icon: "event_repeat", colorClass: "text-primary", bgClass: "bg-primary-fixed/20" },
    all: { label: "Neutral", icon: "radio_button_unchecked", colorClass: "text-outline", bgClass: "bg-surface-container" },
};

export const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick }) => {
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
                            className="group bg-white rounded-[24px] p-5 flex items-center justify-between border border-outline-variant/10 hover:border-primary-fixed/30 hover:shadow-lg transition-all cursor-pointer overflow-hidden relative"
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
                                            Active Manifest
                                        </div>
                                        {task.description && <div className="truncate max-w-sm italic opacity-80">{task.description}</div>}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 shrink-0">
                                <div className="text-right space-y-1">
                                    <div className={`text-[10px] font-black uppercase tracking-[0.2em] ${priority.colorClass}`}>
                                        {priority.label}
                                    </div>
                                    <div className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant font-black text-[9px] rounded uppercase flex items-center gap-2">
                                        <MaterialSymbol icon="query_stats" className="text-[10px]" />
                                        Score: 84%
                                    </div>
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
