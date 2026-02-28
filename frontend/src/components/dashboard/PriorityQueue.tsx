"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PriorityBadge from "@/components/shared/PriorityBadge";
import type { Task } from "@/types/dashboard";

interface PriorityQueueProps {
    tasks: Task[];
    limit?: number;
}

export default function PriorityQueue({ tasks, limit = 4 }: PriorityQueueProps) {
    const todoTasks = tasks.filter((t) => t.status === "todo").slice(0, limit);

    return (
        <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border-light">
                <h3 className="font-display text-base text-ink">Priority Queue</h3>
                <Link href="/tasks" className="btn-ghost text-accent text-xs">
                    All Tasks <ArrowRight size={12} />
                </Link>
            </div>

            <div className="divide-y divide-border-light">
                {todoTasks.map((task) => (
                    <div
                        key={task.id}
                        className="flex items-start gap-3 px-5 py-3.5 hover:bg-paper-mid transition-colors cursor-pointer"
                    >
                        <div className="w-1 h-full min-h-[32px] rounded-full mt-1" style={{
                            backgroundColor:
                                task.priority === "urgent" ? "var(--priority-urgent)" :
                                    task.priority === "high" ? "var(--priority-high)" :
                                        task.priority === "medium" ? "var(--priority-medium)" :
                                            "var(--priority-low)"
                        }} />

                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-ink">{task.title}</div>
                            {task.dueDate && (
                                <span className="text-xs font-mono text-muted">{task.dueDate}</span>
                            )}
                            {task.sourceSender && (
                                <span className="text-xs text-muted ml-2">from {task.sourceSender}</span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <PriorityBadge priority={task.priority} />
                            {task.isAIGenerated && (
                                <span className="ai-badge">AI</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
