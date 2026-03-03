"use client";

import React, { useState } from "react";
import { Clock, Send, Calendar, Sparkles, Inbox, ChevronDown, ChevronUp } from "lucide-react";
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
import { formatDistanceToNow } from "date-fns";
import { useAiDrafts, useApproveDraft, useScheduleDraft, useGenerateDraft } from "@/hooks/useDrafts";
import { DraftControls } from "@/components/drafts/DraftControls";
import { DraftEditor } from "@/components/drafts/DraftEditor";
import { AiDraft } from "@/types/dashboard";
import { useThreads } from "@/hooks/useThreads";

export default function DraftsPage() {
    // ── Generator state ──────────────────────────────────────────────
    const [selectedThreadId, setSelectedThreadId] = useState("");
    const [tone, setTone] = useState("normal");
    const [instructions, setInstructions] = useState("");
    const [draftContent, setDraftContent] = useState("");
    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

    // ── Pending drafts state ─────────────────────────────────────────
    const [pendingOpen, setPendingOpen] = useState(true);
    const [scheduleTarget, setScheduleTarget] = useState<AiDraft | null>(null);
    const [scheduledDate, setScheduledDate] = useState("");
    const [previewDraft, setPreviewDraft] = useState<AiDraft | null>(null);

    // ── Hooks ────────────────────────────────────────────────────────
    const { data: drafts = [] } = useAiDrafts();
    const { data: threads = [] } = useThreads();
    const { mutate: generateDraft, isPending: isGenerating } = useGenerateDraft();
    const { mutate: approveDraft, isPending: approving } = useApproveDraft();
    const { mutate: scheduleDraft, isPending: scheduling } = useScheduleDraft();

    const selectedThread = threads.find((t: any) => t.thread_id === selectedThreadId) ?? null;

    const handleGenerate = () => {
        if (!selectedThreadId) return;
        generateDraft(
            { threadId: selectedThreadId, tone, additionalContext: instructions },
            {
                onSuccess: (data: any) => {
                    setDraftContent(data.body ?? "");
                    setCurrentDraftId(data.id ?? null);
                },
            }
        );
    };

    const handleRegenerate = () => {
        if (!selectedThreadId) return;
        handleGenerate();
    };

    const handleScheduleSubmit = () => {
        if (!scheduleTarget || !scheduledDate) return;
        scheduleDraft(
            { draftId: scheduleTarget.id, scheduledForDate: new Date(scheduledDate).toISOString() },
            { onSuccess: () => setScheduleTarget(null) }
        );
    };

    const toneColor: Record<string, string> = {
        professional: "bg-blue-100 text-blue-700",
        normal: "bg-blue-100 text-blue-700",
        casual: "bg-green-100 text-green-700",
        formal: "bg-purple-100 text-purple-700",
        brief: "bg-orange-100 text-orange-700",
    };

    return (
        <AppShell title="Draft Copilot" subtitle="AI-powered reply generator">
            {/* ── Main two-panel generator ───────────────────────────── */}
            <div className="flex h-[calc(100vh-64px)] overflow-hidden">
                {/* Left panel: controls */}
                <DraftControls
                    selectedThreadId={selectedThreadId}
                    onThreadChange={setSelectedThreadId}
                    tone={tone}
                    onToneChange={setTone}
                    instructions={instructions}
                    onInstructionsChange={setInstructions}
                    isGenerating={isGenerating}
                    onGenerate={handleGenerate}
                />

                {/* Right panel: editor + pending drafts */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Draft editor takes most of the space */}
                    <div className="flex-1 overflow-hidden">
                        <DraftEditor
                            content={draftContent}
                            onUpdateContent={setDraftContent}
                            originalThread={selectedThread as any}
                            isGenerating={isGenerating}
                            onRegenerate={handleRegenerate}
                        />
                    </div>

                    {/* Collapsible pending drafts section at the bottom */}
                    {drafts.length > 0 && (
                        <div className="border-t border-border-light bg-surface-card shrink-0">
                            <button
                                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-ink hover:bg-paper-mid/50 transition-colors"
                                onClick={() => setPendingOpen(p => !p)}
                            >
                                <span className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4 text-ai" />
                                    Pending AI Drafts
                                    <span className="bg-ai/10 text-ai text-[10px] font-bold rounded-full px-2 py-0.5">
                                        {drafts.length}
                                    </span>
                                </span>
                                {pendingOpen ? <ChevronDown className="h-4 w-4 text-ink-light" /> : <ChevronUp className="h-4 w-4 text-ink-light" />}
                            </button>

                            {pendingOpen && (
                                <div className="max-h-64 overflow-y-auto px-4 pb-4 space-y-2">
                                    {drafts.map(draft => (
                                        <Card
                                            key={draft.id}
                                            className="p-3 flex items-start gap-3 hover:border-primary/40 hover:shadow-sm transition-all"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-medium text-ink text-sm truncate">{draft.subject}</p>
                                                    <Badge
                                                        className={`text-[10px] px-1.5 py-0 capitalize ${toneColor[draft.tone] ?? "bg-paper-mid text-ink-light"}`}
                                                    >
                                                        {draft.tone}
                                                    </Badge>
                                                </div>
                                                <p
                                                    className="text-xs text-ink-light mt-1 line-clamp-1 cursor-pointer hover:text-ink transition-colors"
                                                    onClick={() => setPreviewDraft(draft)}
                                                >
                                                    {draft.body}
                                                </p>
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 shrink-0">
                                                <Button
                                                    size="sm"
                                                    className="h-7 text-xs bg-primary text-white hover:bg-primary/90"
                                                    onClick={() => approveDraft(draft.id)}
                                                    disabled={approving}
                                                >
                                                    <Send className="h-3 w-3 mr-1" /> Send
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-7 text-xs"
                                                    onClick={() => { setScheduleTarget(draft); setScheduledDate(""); }}
                                                    disabled={scheduling}
                                                >
                                                    <Calendar className="h-3 w-3 mr-1" /> Later
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* No drafts yet — show subtle info at bottom */}
                    {drafts.length === 0 && (
                        <div className="shrink-0 border-t border-border-light px-4 py-2 flex items-center gap-2 text-xs text-muted-foreground bg-surface-card">
                            <Inbox className="h-3.5 w-3.5 opacity-40" />
                            No pending AI drafts · Generate one using the panel on the left
                        </div>
                    )}
                </div>
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
                                <Label htmlFor="schedule-time">Date &amp; Time</Label>
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
