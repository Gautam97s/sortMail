"use client";

import React, { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { formatDistanceToNow } from "date-fns";
import { useAiDrafts, useApproveDraft, useScheduleDraft, useGenerateDraft } from "@/hooks/useDrafts";
import { DraftControls } from "@/components/drafts/DraftControls";
import { DraftEditor } from "@/components/drafts/DraftEditor";
import { AiDraft } from "@/types/dashboard";
import { useThreads } from "@/hooks/useThreads";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

export default function DraftsPage() {
    // ── Generator state ──────────────────────────────────────────────
    const [selectedThreadId, setSelectedThreadId] = useState("");
    const [tone, setTone] = useState("NORMAL");
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

    return (
        <AppShell title="Copilot Workspace" subtitle="Intelligent Reply Synthesis">
            {/* ── Main two-panel generator ───────────────────────────── */}
            <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-surface-container-lowest">
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
                        <div className="border-t border-outline-variant/10 bg-white/80 backdrop-blur-xl shrink-0 shadow-[0_-4px_30px_-10px_rgba(0,0,0,0.05)]">
                            <button
                                className="w-full h-14 flex items-center justify-between px-6 hover:bg-surface-container transition-all group"
                                onClick={() => setPendingOpen(p => !p)}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="h-4 w-4 bg-primary-fixed rounded-full animate-pulse shadow-sm shadow-primary/20" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface flex items-center gap-3">
                                        Active Intelligence Queue
                                        <span className="h-5 px-2 bg-on-surface text-surface rounded-full flex items-center justify-center font-black">
                                            {drafts.length}
                                        </span>
                                    </span>
                                </div>
                                <div className={`p-2 rounded-xl group-hover:bg-primary-fixed/20 group-hover:text-primary transition-all ${pendingOpen ? 'rotate-180' : ''}`}>
                                    <MaterialSymbol icon="expand_less" className="text-xl" />
                                </div>
                            </button>

                            {pendingOpen && (
                                <div className="max-h-72 overflow-y-auto px-6 pb-6 space-y-3">
                                    {drafts.map(draft => (
                                        <div
                                            key={draft.id}
                                            className="group bg-surface-container-low border border-outline-variant/5 rounded-2xl p-4 flex items-center gap-5 hover:bg-white hover:border-primary-fixed hover:shadow-xl hover:shadow-primary/5 transition-all"
                                        >
                                            <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-outline group-hover:text-primary transition-colors border border-outline-variant/5">
                                                <MaterialSymbol icon="auto_fix" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <p className="text-sm font-bold text-on-surface truncate tracking-tight">{draft.subject}</p>
                                                    <div className="px-1.5 py-0.5 bg-primary-fixed/20 text-primary font-black text-[8px] rounded uppercase tracking-wider">{draft.tone}</div>
                                                </div>
                                                <p
                                                    className="text-xs font-medium text-outline-variant truncate cursor-pointer hover:text-on-surface transition-colors italic"
                                                    onClick={() => setPreviewDraft(draft)}
                                                >
                                                    &ldquo;{draft.body.slice(0, 120)}...&rdquo;
                                                </p>
                                                <div className="flex items-center gap-1.5 text-[9px] font-black text-outline uppercase tracking-tighter mt-1">
                                                    <MaterialSymbol icon="schedule" className="text-xs" />
                                                    Manifested {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                                <button
                                                    className="h-10 px-4 bg-primary text-on-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                                    onClick={() => approveDraft(draft.id)}
                                                    disabled={approving}
                                                >
                                                    <MaterialSymbol icon="send" className="text-lg" />
                                                    Deploy
                                                </button>
                                                <button
                                                    className="h-10 px-4 bg-surface-container text-on-surface-variant rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:shadow-md transition-all flex items-center gap-2 border border-outline-variant/10"
                                                    onClick={() => { setScheduleTarget(draft); setScheduledDate(""); }}
                                                    disabled={scheduling}
                                                >
                                                    <MaterialSymbol icon="event" className="text-lg" />
                                                    Defer
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* No drafts yet — show subtle info at bottom */}
                    {drafts.length === 0 && (
                        <div className="h-14 border-t border-outline-variant/10 px-6 flex items-center gap-3 text-[10px] font-black text-outline uppercase tracking-widest bg-white/80">
                            <MaterialSymbol icon="cloud_done" className="text-lg text-primary" />
                            Intelligence Queue Exhausted · Ready for next synthesis
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Modal */}
            {previewDraft && (
                <Dialog open onOpenChange={() => setPreviewDraft(null)}>
                    <DialogContent className="max-w-2xl rounded-[40px] border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-white p-8 space-y-6">
                            <div className="flex items-center justify-between pb-6 border-b border-outline-variant/10">
                                <div className="space-y-1">
                                    <div className="px-2.5 py-1 bg-primary-fixed/20 text-primary font-black text-[9px] rounded-full uppercase tracking-widest inline-block mb-1">Manifested Response</div>
                                    <h3 className="text-xl font-headline font-bold text-on-surface tracking-tight">{previewDraft.subject}</h3>
                                </div>
                                <button onClick={() => setPreviewDraft(null)} className="h-10 w-10 flex items-center justify-center bg-surface-container rounded-2xl text-outline hover:text-error transition-all">
                                    <MaterialSymbol icon="close" />
                                </button>
                            </div>
                            <div className="bg-surface-container-low rounded-3xl p-6 text-base font-body text-on-surface leading-loose whitespace-pre-wrap max-h-[60vh] overflow-y-auto border border-outline-variant/5 italic">
                                {previewDraft.body}
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <div className="flex items-center gap-3 text-[10px] font-black text-outline uppercase tracking-widest">
                                    <MaterialSymbol icon="architecture" className="text-lg" />
                                    Tone: {previewDraft.tone}
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        className="h-12 px-8 bg-primary text-on-primary rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 flex items-center gap-3"
                                        onClick={() => { approveDraft(previewDraft.id); setPreviewDraft(null); }}
                                        disabled={approving}
                                    >
                                        <MaterialSymbol icon="send_and_archive" className="text-xl" />
                                        Authorize & Deploy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Schedule Modal */}
            {scheduleTarget && (
                <Dialog open onOpenChange={() => setScheduleTarget(null)}>
                    <DialogContent className="max-w-md rounded-[32px] border-none shadow-2xl p-8 space-y-8">
                        <div className="space-y-4">
                            <div className="h-14 w-14 bg-surface-container rounded-2xl flex items-center justify-center text-primary border border-outline-variant/5">
                                <MaterialSymbol icon="schedule_send" className="text-2xl" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xl font-headline font-bold text-on-surface">Temporal Deferral</h3>
                                <p className="text-sm font-medium text-on-surface-variant">
                                    Finalizing sending parameters for <span className="text-primary font-bold">{scheduleTarget.subject}</span>
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-outline px-1">Execution Velocity</label>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                className="w-full h-14 px-4 bg-surface-container rounded-2xl border border-outline-variant/15 focus:ring-2 focus:ring-primary-fixed focus:border-primary text-sm font-bold transition-all"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setScheduleTarget(null)}
                                className="flex-1 h-12 rounded-2xl border border-outline-variant/15 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleSubmit}
                                disabled={!scheduledDate || scheduling}
                                className="flex-2 px-8 bg-on-surface text-surface h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-on-surface/90 transition-all shadow-xl shadow-black/10 disabled:opacity-30"
                            >
                                <MaterialSymbol icon="lock_clock" className="text-lg" />
                                Secure Schedule
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppShell>
    );
}
