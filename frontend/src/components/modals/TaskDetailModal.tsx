"use client";

import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    CheckCircle2,
    Clock,
    Calendar as CalendarIcon,
    Flag,
    MessageSquare,
    Trash2,
    Edit3,
    ExternalLink,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";

interface TaskDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: {
        id: string;
        title: string;
        description: string;
        status: string;
        priority: string;
        deadline?: string;
        createdAt: string;
        sourceEmail?: {
            subject: string;
            sender: string;
            id: string;
        };
    };
}

const priorityConfig = {
    high: { label: "High", color: "bg-danger/10 text-danger border-danger/20" },
    medium: { label: "Medium", color: "bg-warning/10 text-warning border-warning/20" },
    low: { label: "Low", color: "bg-info/10 text-info border-info/20" },
};

export default function TaskDetailModal({ isOpen, onClose, task }: TaskDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const cfg = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.medium;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-border/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-ai to-purple-400" />

                <div className="p-8 pb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={cfg.color}>
                                    <Flag className="w-3 h-3 mr-1" fill="currentColor" /> {cfg.label}
                                </Badge>
                                <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-widest bg-paper-mid/50 border-border/40">
                                    {task.status.replace("_", " ")}
                                </Badge>
                            </div>
                            <DialogTitle className="font-display text-2xl text-ink leading-tight">
                                {task.title}
                            </DialogTitle>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="text-sm text-ink-light leading-relaxed whitespace-pre-wrap">
                            {task.description || "No description provided."}
                        </div>

                        <div className="grid grid-cols-2 gap-8 py-6 border-y border-border/30">
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <CalendarIcon size={12} /> Deadline
                                </span>
                                <p className="text-sm font-medium text-ink">
                                    {task.deadline ? format(new Date(task.deadline), "MMMM do, yyyy") : "No deadline set"}
                                </p>
                            </div>
                            <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <Clock size={12} /> Created
                                </span>
                                <p className="text-sm font-medium text-ink">
                                    {format(new Date(task.createdAt), "MMM d, h:mm a")}
                                </p>
                            </div>
                        </div>

                        {task.sourceEmail && (
                            <div className="space-y-4">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Source Email
                                </span>
                                <div className="p-4 rounded-xl bg-paper-mid/40 border border-border/40 hover:border-accent/30 transition-colors cursor-pointer group">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-sm font-semibold text-ink group-hover:text-accent transition-colors">{task.sourceEmail.subject}</p>
                                            <p className="text-xs text-muted-foreground mt-1">From: {task.sourceEmail.sender}</p>
                                        </div>
                                        <ExternalLink size={14} className="text-muted-foreground group-hover:text-accent transition-colors" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <DialogFooter className="px-8 py-6 bg-paper-mid/40 border-t border-border/30 mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="text-danger hover:bg-danger/10 hover:text-danger rounded-lg">
                            <Trash2 size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-accent/10 hover:text-accent rounded-lg">
                            <Edit3 size={18} />
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="outline" onClick={onClose} className="border-border/60 hover:bg-paper-mid">
                            Close
                        </Button>
                        <Button className="gap-2 shadow-lg shadow-success/20 bg-success hover:bg-success/90">
                            <CheckCircle2 size={16} />
                            Mark as Done
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
