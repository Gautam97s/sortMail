"use client";

import React from 'react';

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface TaskFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    sourceFilter: string;
    onSourceChange: (value: string) => void;
    priorityFilter: string;
    onPriorityChange: (priority: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
    onClearFilters: () => void;
    onCreateTask: () => void;
    isSaving?: boolean;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
    searchQuery,
    onSearchChange,
    sourceFilter,
    onSourceChange,
    priorityFilter,
    onPriorityChange,
    statusFilter,
    onStatusChange,
    onClearFilters,
    onCreateTask,
    isSaving = false,
}) => {
    const hasActiveFilters = searchQuery !== '' || sourceFilter !== '' || priorityFilter !== 'all' || statusFilter !== 'all';

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 bg-surface-container-low p-2 rounded-[28px] border border-outline-variant/10 shadow-inner">
            <div className="flex-1 relative group w-full">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-outline-variant group-focus-within:text-primary transition-colors">
                    <MaterialSymbol icon="search" />
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search tasks by title or description..."
                    className="w-full h-14 pl-16 pr-6 bg-white rounded-2xl text-base font-medium text-on-surface focus:outline-none border-2 border-transparent focus:border-primary-fixed/30 shadow-sm transition-all placeholder:text-outline-variant/50 italic"
                />
            </div>

            <div className="flex items-center gap-2 p-1.5 shrink-0 bg-white/40 rounded-2xl border border-outline-variant/5">
                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl">
                    <MaterialSymbol icon="link" className="text-sm text-outline-variant" />
                    <input
                        value={sourceFilter}
                        onChange={(e) => onSourceChange(e.target.value)}
                        placeholder="Thread ID"
                        className="w-28 bg-transparent text-[10px] font-black uppercase tracking-widest text-on-surface focus:outline-none"
                    />
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl">
                    <MaterialSymbol icon="priority_high" className="text-sm text-outline-variant" />
                    <select
                        value={priorityFilter}
                        onChange={(e) => onPriorityChange(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-on-surface focus:outline-none cursor-pointer"
                    >
                        <option value="all">All Priorities</option>
                        <option value="DO_NOW">Do Now</option>
                        <option value="DO_TODAY">Do Today</option>
                        <option value="CAN_WAIT">Can Wait</option>
                    </select>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-surface-container rounded-xl">
                    <MaterialSymbol icon="published_with_changes" className="text-sm text-outline-variant" />
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value)}
                        className="bg-transparent text-[10px] font-black uppercase tracking-widest text-on-surface focus:outline-none cursor-pointer"
                    >
                        <option value="all">Any Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="DISMISSED">Dismissed</option>
                    </select>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="h-10 w-10 flex items-center justify-center bg-error-container text-error rounded-xl hover:bg-error transition-all hover:text-white"
                        title="Reset Filters"
                    >
                        <MaterialSymbol icon="filter_alt_off" className="text-lg" />
                    </button>
                )}

                <button
                    onClick={onCreateTask}
                    disabled={isSaving}
                    className="h-10 px-4 flex items-center justify-center bg-primary text-on-primary rounded-xl hover:opacity-90 disabled:opacity-60 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <MaterialSymbol icon="add" className="text-base mr-1" />
                    {isSaving ? 'Saving...' : 'New Task'}
                </button>
            </div>
        </div>
    );
};
