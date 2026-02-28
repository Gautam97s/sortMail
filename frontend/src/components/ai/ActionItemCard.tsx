'use client';

import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PriorityLevel } from '@/types/dashboard';

interface ActionItemCardProps {
    title: string;
    priority: PriorityLevel;
    deadline?: string;
    isAIGenerated?: boolean;
    onComplete?: () => void;
}

const priorityConfig = {
    do_now: { label: 'Do Now', variant: 'destructive' as const, color: 'text-danger' },
    do_today: { label: 'Today', variant: 'default' as const, color: 'text-amber-500' },
    can_wait: { label: 'Can Wait', variant: 'secondary' as const, color: 'text-success' },
};

export default function ActionItemCard({ title, priority, deadline, isAIGenerated, onComplete }: ActionItemCardProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const cfg = priorityConfig[priority];

    const toggleComplete = () => {
        setIsCompleted(!isCompleted);
        if (!isCompleted && onComplete) {
            onComplete();
        }
    };

    return (
        <Card className={`group transition-all duration-300 ${isCompleted ? 'opacity-50' : 'hover:border-accent/40 hover:shadow-md'}`}>
            <CardContent className="p-4 flex items-start gap-4">
                <button
                    onClick={toggleComplete}
                    className="mt-1 shrink-0 transition-transform active:scale-90"
                >
                    {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-success fill-success/10" />
                    ) : (
                        <Circle className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                    )}
                </button>

                <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={cfg.variant} className="text-[10px] px-1.5 py-0 uppercase font-mono tracking-tighter">
                            {cfg.label}
                        </Badge>
                        {isAIGenerated && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-ai/30 text-ai bg-ai/5">
                                AI Suggested
                            </Badge>
                        )}
                        {deadline && (
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                                <Clock className="h-3 w-3" />
                                {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                        )}
                    </div>

                    <p className={`text-sm font-medium leading-tight ${isCompleted ? 'line-through text-muted-foreground' : 'text-ink'}`}>
                        {title}
                    </p>
                </div>

                {!isCompleted && (
                    <button className="self-center p-1 rounded-md hover:bg-paper-mid opacity-0 group-hover:opacity-100 transition-opacity">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </button>
                )}
            </CardContent>
        </Card>
    );
}
