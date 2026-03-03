"use client";

import React, { useState } from "react";
import { Clock, Mail, Send, Calendar, Sparkles, Inbox } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppShell from "@/components/layout/AppShell";
import { formatDistanceToNow, format } from "date-fns";
import { useAiDrafts, useApproveDraft, useScheduleDraft } from "@/hooks/useDrafts";
import { AiDraft } from "@/types/dashboard";

export default function AiDraftsPage() {
    const { data: drafts = [], isLoading } = useAiDrafts();
    const { mutate: approveDraft, isPending: approving } = useApproveDraft();
    const { mutate: scheduleDraft, isPending: scheduling } = useScheduleDraft();

    const [scheduleTarget, setScheduleTarget] = useState<AiDraft | null>(null);
    const [scheduledDate, setScheduledDate] = useState("");
    const [previewDraft, setPreviewDraft] = useState<AiDraft | null>(null);

    const handleScheduleSubmit = () => {
        if (!scheduleTarget || !scheduledDate) return;
        scheduleDraft(
            { draftId: scheduleTarget.id, scheduledForDate: new Date(scheduledDate).toISOString() },
            { onSuccess: () => setScheduleTarget(null) }
        );
    };

    const toneColor: Record<string, string> = {
        professional: "bg-blue-100 text-blue-700",
        casual: "bg-green-100 text-green-700",
        formal: "bg-purple-100 text-purple-700",
    };

    if (isLoading) {
        return (
            <AppShell title="AI Drafts">
                <div className="max-w-3xl mx-auto p-6 space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-32 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="AI Drafts" subtitle={`${drafts.length} pending`}>
            <div className="max-w-3xl mx-auto p-6 space-y-4">
                {drafts.length === 0 ? (
                    <Card className="p-16 text-center text-muted-foreground">
                        <Inbox className="h-14 w-14 mx-auto mb-4 opacity-20" />
                        <p className="text-lg font-medium">No pending drafts</p>
                        <p className="text-sm mt-1">
                            AI-generated drafts appear here when a response is suggested for an email thread.
                        </p>
                    </Card>
                ) : (
                    drafts.map(draft => (
                        <Card
                            key={draft.id}
                            className="p-5 space-y-3 hover:border-primary/40 hover:shadow-sm transition-all"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Sparkles className="h-4 w-4 text-ai shrink-0" />
                                        <p className="font-medium text-ink truncate">{draft.subject}</p>
                                        <Badge
                                            className={`text-[10px] px-1.5 py-0 capitalize ${toneColor[draft.tone] ?? "bg-paper-mid text-ink-light"}`}
                                        >
                                            {draft.tone}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                                        <span className="ml-1 text-[10px] font-mono opacity-50">{draft.thread_id.slice(0, 8)}…</span>
                                    </div>
                                </div>
                                <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                            </div>

                            {/* Body Preview */}
                            <div
                                className="bg-paper-mid/50 rounded-lg p-3 text-sm text-ink-light leading-relaxed line-clamp-3 cursor-pointer hover:bg-paper-mid transition-colors"
                                onClick={() => setPreviewDraft(draft)}
                            >
                                {draft.body}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <Button
                                    size="sm"
                                    className="gap-1.5 bg-primary text-white hover:bg-primary/90 flex-1"
                                    onClick={() => approveDraft(draft.id)}
                                    disabled={approving}
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    Send Now
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1.5 flex-1"
                                    onClick={() => { setScheduleTarget(draft); setScheduledDate(""); }}
                                    disabled={scheduling}
                                >
                                    <Calendar className="h-3.5 w-3.5" />
                                    Send Later
                                </Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Preview Modal */}
            {previewDraft && (
                <Dialog open onOpenChange={() => setPreviewDraft(null)}>
                    <DialogContent className="max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-ai" />
                                {previewDraft.subject}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="bg-paper-mid/50 rounded-lg p-4 text-sm text-ink leading-relaxed whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                            {previewDraft.body}
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setPreviewDraft(null)}>Close</Button>
                            <Button
                                className="gap-1.5"
                                onClick={() => { approveDraft(previewDraft.id); setPreviewDraft(null); }}
                                disabled={approving}
                            >
                                <Send className="h-3.5 w-3.5" />
                                Send Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {/* Schedule Modal */}
            {scheduleTarget && (
                <Dialog open onOpenChange={() => setScheduleTarget(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Schedule Draft</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3 py-2">
                            <p className="text-sm text-muted-foreground">
                                When do you want to send: <span className="font-medium text-ink">{scheduleTarget.subject}</span>?
                            </p>
                            <div className="space-y-1.5">
                                <Label htmlFor="schedule-time">Date & Time</Label>
                                <Input
                                    id="schedule-time"
                                    type="datetime-local"
                                    value={scheduledDate}
                                    onChange={e => setScheduledDate(e.target.value)}
                                    className="bg-paper"
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={() => setScheduleTarget(null)}>Cancel</Button>
                            <Button
                                onClick={handleScheduleSubmit}
                                disabled={!scheduledDate || scheduling}
                                className="gap-1.5"
                            >
                                <Calendar className="h-3.5 w-3.5" />
                                Schedule
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </AppShell>
    );
}
