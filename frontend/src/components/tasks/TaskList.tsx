import React from 'react';
import { TaskDTOv1 } from '@/types/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PriorityBadge from '@/components/shared/PriorityBadge';
import { AlertTriangle, ChevronRight, Mail, LayoutList } from 'lucide-react';

interface TaskListProps {
    tasks: TaskDTOv1[];
    onTaskClick: (taskId: string) => void;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
    pending: { label: 'To Do', className: 'bg-paper-deep text-muted border-border/60' },
    in_progress: { label: 'In Progress', className: 'bg-accent/10 text-accent border-accent/20' },
    completed: { label: 'Done', className: 'bg-green-500/10 text-green-600 border-green-500/20' },
};

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
    if (tasks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-muted bg-paper-mid/30 rounded-xl border border-dashed border-border/60">
                <LayoutList className="h-12 w-12 opacity-20 mb-4" />
                <p className="font-mono text-sm uppercase tracking-widest opacity-60">No tasks found</p>
                <p className="text-xs opacity-50 mt-1">Try adjusting your filters</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {tasks.map((task) => (
                <Card
                    key={task.task_id}
                    className="cursor-pointer hover:bg-paper-mid/50 transition-all duration-200 group border-border shadow-sm overflow-hidden"
                    onClick={() => onTaskClick(task.task_id)}
                >
                    <CardContent className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4 relative overflow-hidden">
                        {/* Urgent highlight */}
                        {task.priority === 'do_now' && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-danger opacity-80" />
                        )}

                        <div className="flex flex-col sm:flex-row items-start gap-4 md:gap-6 flex-1 min-w-0">
                            <div className="flex flex-row sm:flex-col gap-2 shrink-0 sm:w-28 items-center sm:items-start">
                                <PriorityBadge priority={task.priority} className="w-fit" />
                                <Badge variant="outline" className={`w-fit text-[9px] md:text-[10px] font-mono uppercase tracking-tighter ${STATUS_BADGES[task.status]?.className || ''}`}>
                                    {STATUS_BADGES[task.status]?.label || task.status}
                                </Badge>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-ink leading-snug group-hover:text-accent transition-colors font-display text-base md:text-lg">
                                    {task.title}
                                </h4>
                                <p className="text-xs md:text-sm text-ink/70 truncate mt-1">
                                    {task.description}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] md:text-xs text-muted font-mono uppercase tracking-wider">
                                    {task.effort === 'deep_work' && (
                                        <span className="bg-ai/10 text-ai px-1.5 py-0.5 rounded-sm font-bold">DEEP WORK</span>
                                    )}
                                    <span className="flex items-center gap-1.5 opacity-80">
                                        <Mail className="h-3 w-3" />
                                        Task via Email
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 md:gap-10 shrink-0 sm:pl-6 sm:border-l border-border/40 h-full pt-3 sm:pt-0 border-t sm:border-t-0 mt-2 sm:mt-0">
                            <div className="text-left sm:text-right min-w-0 sm:min-w-[100px]">
                                {task.deadline ? (
                                    <div className="flex flex-row-reverse sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-bold font-mono">
                                            Due By
                                        </div>
                                        <div className={`text-xs md:text-sm font-black font-mono flex items-center justify-end gap-1.5 mt-0.5 ${new Date(task.deadline) < new Date() ? 'text-danger' : 'text-ink'}`}>
                                            {new Date(task.deadline) < new Date() && <AlertTriangle className="h-3.5 w-3.5" />}
                                            {new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }).toUpperCase()}
                                        </div>
                                    </div>
                                ) : (
                                    <span className="text-xs md:text-sm text-muted font-mono">—</span>
                                )}
                            </div>
                            <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-border group-hover:text-accent transition-all group-hover:translate-x-1 shrink-0" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
