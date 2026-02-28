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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Calendar as CalendarIcon, Flag, Tag, Sparkles } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface TaskCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: {
        title?: string;
        description?: string;
        sourceEmail?: string;
    };
}

export default function TaskCreateModal({ isOpen, onClose, initialData }: TaskCreateModalProps) {
    const [date, setDate] = useState<Date>();
    const [priority, setPriority] = useState("medium");
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-ai to-purple-400" />

                <DialogHeader className="px-8 pt-8 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <Sparkles size={16} />
                        </div>
                        <DialogTitle className="font-display text-xl">Create New Task</DialogTitle>
                    </div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        Powering up your productivity
                    </p>
                </DialogHeader>

                <div className="px-8 py-4 space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Title</Label>
                        <Input
                            id="title"
                            placeholder="What needs to be done?"
                            defaultValue={initialData?.title}
                            className="h-11 border-border/40 focus:border-accent/40 bg-paper-mid/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Add more details..."
                            defaultValue={initialData?.description}
                            className="min-h-[100px] border-border/40 focus:border-accent/40 bg-paper-mid/30 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Deadline</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full h-11 justify-start text-left font-normal border-border/40 bg-paper-mid/30",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                        {date ? format(date, "PPP") : <span>Set date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={setDate}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Priority</Label>
                            <Select value={priority} onValueChange={setPriority}>
                                <SelectTrigger className="h-11 border-border/40 bg-paper-mid/30">
                                    <SelectValue placeholder="Priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-3 h-3 text-danger" fill="currentColor" /> High
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="medium">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-3 h-3 text-warning" fill="currentColor" /> Medium
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="low">
                                        <div className="flex items-center gap-2">
                                            <Flag className="w-3 h-3 text-info" fill="currentColor" /> Low
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-8 py-6 bg-paper-mid/40 border-t border-border/30 mt-4">
                    <Button variant="ghost" onClick={onClose} disabled={loading} className="text-muted-foreground hover:text-ink">
                        Cancel
                    </Button>
                    <Button onClick={handleCreate} disabled={loading} className="px-8 shadow-lg shadow-accent/20">
                        {loading ? "Creating..." : "Create Task"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
