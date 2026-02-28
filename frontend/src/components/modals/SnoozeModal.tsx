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
import {
    Clock,
    Calendar as CalendarIcon,
    Sunset,
    Sunrise,
    Coffee,
    Moon,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { format, addDays, nextMonday, setHours, setMinutes } from "date-fns";
import { cn } from "@/lib/utils";

interface SnoozeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSnooze: (date: Date) => void;
}

export default function SnoozeModal({ isOpen, onClose, onSnooze }: SnoozeModalProps) {
    const [customDate, setCustomDate] = useState<Date>();
    const [loading, setLoading] = useState(false);

    const quickOptions = [
        { label: "Later Today", time: "6:00 PM", icon: Sunset, date: setMinutes(setHours(new Date(), 18), 0) },
        { label: "Tomorrow", time: "9:00 AM", icon: Sunrise, date: setMinutes(setHours(addDays(new Date(), 1), 9), 0) },
        { label: "This Weekend", time: "Sat, 10:00 AM", icon: Coffee, date: setMinutes(setHours(addDays(new Date(), 7 - new Date().getDay()), 10), 0) },
        { label: "Next Week", time: "Mon, 9:00 AM", icon: Moon, date: setMinutes(setHours(nextMonday(new Date()), 9), 0) },
    ];

    const handleSnooze = (date: Date) => {
        setLoading(true);
        onSnooze(date);
        onClose();
        setLoading(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border/40 bg-white/95 backdrop-blur-xl shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent via-ai to-purple-400" />

                <DialogHeader className="px-8 pt-8 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                            <Clock size={16} />
                        </div>
                        <DialogTitle className="font-display text-xl">Snooze Reminder</DialogTitle>
                    </div>
                </DialogHeader>

                <div className="px-8 py-4">
                    <div className="grid grid-cols-1 gap-2">
                        {quickOptions.map((opt, i) => (
                            <button
                                key={i}
                                onClick={() => handleSnooze(opt.date)}
                                className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-white hover:bg-paper-mid hover:border-accent/40 transition-all group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-paper-mid flex items-center justify-center text-muted-foreground group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                        <opt.icon size={20} />
                                    </div>
                                    <div className="text-left">
                                        <p className="text-sm font-semibold text-ink">{opt.label}</p>
                                        <p className="text-[11px] text-muted-foreground font-mono">{opt.time}</p>
                                    </div>
                                </div>
                                <ArrowRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-border/30">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 justify-between px-5 font-medium border-border/40 bg-paper-mid/30 hover:border-accent/40 transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon size={16} className="text-muted-foreground" />
                                        <span className="text-sm">Pick custom date...</span>
                                    </div>
                                    {customDate && <span className="text-xs text-accent font-mono">{format(customDate, "MMM d")}</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="end">
                                <Calendar
                                    mode="single"
                                    selected={customDate}
                                    onSelect={(d) => {
                                        setCustomDate(d);
                                        if (d) handleSnooze(d);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                <div className="px-8 py-6 flex items-center justify-center gap-2 text-[10px] text-muted-foreground font-mono uppercase tracking-widest bg-paper-mid/40 mt-4 border-t border-border/10">
                    <Sparkles size={10} className="text-ai" fill="currentColor" />
                    AI will remind you at the best time
                </div>
            </DialogContent>
        </Dialog>
    );
}
