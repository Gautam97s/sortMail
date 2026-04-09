'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useAiDrafts, useApproveDraft, useDraftById, useGenerateDraft, useGenerateFreeformDraft, useSaveDirectDraft, useScheduleDraft, useSendDirectDraft, useUpdateDraft } from '@/hooks/useDrafts';
import { useThreads } from '@/hooks/useThreads';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const MaterialSymbol = ({ icon, className = '' }: { icon: string; className?: string }) => (
    <span className={`material-symbols-outlined ${className}`}>{icon}</span>
);

type AttachmentItem = {
    filename: string;
    mime_type: string;
    content_base64?: string;
    size_bytes?: number;
};

const extractEmail = (value?: string): string => {
    if (!value) return '';
    const match = value.match(/<([^>]+)>/);
    if (match?.[1]) return match[1].trim().toLowerCase();
    return value.includes('@') ? value.trim().toLowerCase() : '';
};

const parseEmails = (raw: string): string[] => {
    return raw
        .split(/[;,\n]/)
        .map((v) => extractEmail(v))
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i);
};

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = String(reader.result || '');
            const base64 = result.includes(',') ? result.split(',')[1] : result;
            resolve(base64);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
};

export default function DraftWorkspacePage() {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const contextPickerRef = useRef<HTMLDivElement | null>(null);

    const [draftIdParam, setDraftIdParam] = useState<string | undefined>();
    const [selectedThreadId, setSelectedThreadId] = useState('');
    const [contextPickerOpen, setContextPickerOpen] = useState(false);
    const [contextSearch, setContextSearch] = useState('');
    const [tone, setTone] = useState('NORMAL');
    const [instructions, setInstructions] = useState('');

    const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');
    const [toField, setToField] = useState('');
    const [ccField, setCcField] = useState('');
    const [bccField, setBccField] = useState('');
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
    const [actionMessage, setActionMessage] = useState('');

    const [scheduleOpen, setScheduleOpen] = useState(false);
    const [scheduledDate, setScheduledDate] = useState('');

    const { data: allDrafts = [] } = useAiDrafts();
    const { data: threads = [] } = useThreads(undefined, contextSearch || undefined, 0, 100);
    const { data: selectedDraft, isLoading: loadingDraft } = useDraftById(draftIdParam);
    const { mutate: generateDraft, isPending: generating } = useGenerateDraft();
    const { mutate: generateFreeformDraft, isPending: generatingFreeform } = useGenerateFreeformDraft();
    const { mutate: updateDraft, isPending: saving } = useUpdateDraft();
    const { mutate: approveDraft, isPending: sending } = useApproveDraft();
    const { mutate: sendDirectDraft, isPending: sendingDirect } = useSendDirectDraft();
    const { mutate: saveDirectDraft, isPending: savingDirect } = useSaveDirectDraft();
    const { mutate: scheduleDraft, isPending: scheduling } = useScheduleDraft();

    const selectedThread = useMemo(
        () => threads.find((t: any) => t.thread_id === selectedThreadId) ?? null,
        [threads, selectedThreadId]
    );

    const threadOptions = useMemo(() => {
        const base = [...threads];
        if (!selectedThreadId) return base;
        const exists = base.some((t: any) => t.thread_id === selectedThreadId);
        if (exists) return base;

        // Keep selected value visible even if it is outside the currently fetched thread list.
        return [
            {
                thread_id: selectedThreadId,
                subject: selectedDraft?.subject || 'Selected draft thread',
            },
            ...base,
        ];
    }, [threads, selectedThreadId, selectedDraft?.subject]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setDraftIdParam(params.get('draftId') || undefined);
    }, []);

    useEffect(() => {
        const onClickOutside = (event: MouseEvent) => {
            if (!contextPickerOpen) return;
            if (contextPickerRef.current && !contextPickerRef.current.contains(event.target as Node)) {
                setContextPickerOpen(false);
            }
        };
        document.addEventListener('mousedown', onClickOutside);
        return () => document.removeEventListener('mousedown', onClickOutside);
    }, [contextPickerOpen]);

    useEffect(() => {
        if (!selectedDraft) return;
        setCurrentDraftId(selectedDraft.id);
        setSelectedThreadId(selectedDraft.thread_id);
        setTone(selectedDraft.tone || 'NORMAL');
        setSubject(selectedDraft.subject || '');
        setBody(selectedDraft.body || '');

        const meta = selectedDraft.metadata_json || {};
        const to = Array.isArray(meta.to) ? meta.to.join(', ') : '';
        const cc = Array.isArray(meta.cc) ? meta.cc.join(', ') : '';
        const bcc = Array.isArray(meta.bcc) ? meta.bcc.join(', ') : '';
        setToField(to);
        setCcField(cc);
        setBccField(bcc);
        setShowCcBcc(Boolean(cc || bcc));
        setAttachments(Array.isArray(meta.attachments) ? meta.attachments : []);
    }, [selectedDraft]);

    const applyDraftToComposer = (draft: any) => {
        setCurrentDraftId(draft.id || null);
        setSelectedThreadId(draft.thread_id || '');
        setTone(draft.tone || 'NORMAL');
        setSubject(draft.subject || '');
        setBody(draft.body || '');
        const meta = draft.metadata_json || {};
        setToField(Array.isArray(meta.to) ? meta.to.join(', ') : '');
        setCcField(Array.isArray(meta.cc) ? meta.cc.join(', ') : '');
        setBccField(Array.isArray(meta.bcc) ? meta.bcc.join(', ') : '');
        setShowCcBcc(Boolean((meta.cc || []).length || (meta.bcc || []).length));
        setAttachments(Array.isArray(meta.attachments) ? meta.attachments : []);
    };

    const handleThreadContextSelect = (threadId: string) => {
        if (!threadId) return;
        setSelectedThreadId(threadId);
        setContextPickerOpen(false);

        const matchedDraft = allDrafts
            .filter((d: any) => d.thread_id === threadId)
            .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

        if (matchedDraft) {
            applyDraftToComposer(matchedDraft);
            return;
        }

        const selected = threadOptions.find((t: any) => t.thread_id === threadId);
        setCurrentDraftId(null);
        setSubject(selected?.subject ? `Re: ${selected.subject}` : '');
        setBody('');
        setCcField('');
        setBccField('');
        setAttachments([]);

        // Auto-create a draft when none exists for the selected context.
        generateDraft(
            { threadId, tone, additionalContext: instructions || undefined },
            {
                onSuccess: (data: any) => {
                    setCurrentDraftId(data.id ?? null);
                    setSubject(data.subject || selected?.subject || '');
                    setBody(data.body || '');
                },
            }
        );
    };

    useEffect(() => {
        if (toField || !selectedThread?.participants?.length) return;
        const firstOther = selectedThread.participants.map((p: string) => extractEmail(p)).find(Boolean);
        if (firstOther) setToField(firstOther);
    }, [selectedThread, toField]);

    const createOrRegenerateDraft = () => {
        if (!selectedThreadId) {
            generateFreeformDraft(
                {
                    tone,
                    subject,
                    instruction: instructions || undefined,
                    to: parseEmails(toField),
                },
                {
                    onSuccess: (data: any) => {
                        if (data?.subject) setSubject((prev) => prev || data.subject);
                        setBody(data?.body || '');
                        setActionMessage('AI generated a new outbound draft.');
                    },
                }
            );
            return;
        }
        generateDraft(
            { threadId: selectedThreadId, tone, additionalContext: instructions || undefined },
            {
                onSuccess: (data: any) => {
                    setCurrentDraftId(data.id ?? null);
                    setSubject((prev) => prev || data.subject || '');
                    setBody(data.body || '');
                    setActionMessage('Draft generated from selected thread context.');
                },
            }
        );
    };

    const persistCurrentDraft = (onSuccess?: () => void) => {
        if (!currentDraftId) {
            const to = parseEmails(toField);
            if (!to.length) {
                setActionMessage('Add at least one recipient in To before saving.');
                return;
            }
            saveDirectDraft(
                {
                    subject,
                    body,
                    to,
                    cc: parseEmails(ccField),
                    bcc: parseEmails(bccField),
                    attachments,
                },
                {
                    onSuccess: () => {
                        setActionMessage('Saved directly to Gmail drafts.');
                        onSuccess?.();
                    },
                }
            );
            return;
        }
        updateDraft(
            {
                draftId: currentDraftId,
                subject,
                body,
                tone,
                to: parseEmails(toField),
                cc: parseEmails(ccField),
                bcc: parseEmails(bccField),
                attachments,
            },
            {
                onSuccess: () => {
                    setActionMessage('Draft saved.');
                    onSuccess?.();
                },
            }
        );
    };

    const handleSendNow = () => {
        if (!currentDraftId) {
            const to = parseEmails(toField);
            if (!to.length) {
                setActionMessage('Add at least one recipient in To before sending.');
                return;
            }
            if (!subject.trim() || !body.trim()) {
                setActionMessage('Subject and body are required to send.');
                return;
            }
            sendDirectDraft(
                {
                    subject,
                    body,
                    to,
                    cc: parseEmails(ccField),
                    bcc: parseEmails(bccField),
                    attachments,
                },
                {
                    onSuccess: () => setActionMessage('Email sent successfully from Gmail.'),
                }
            );
            return;
        }
        persistCurrentDraft(() => {
            approveDraft(currentDraftId, {
                onSuccess: () => setActionMessage('Email sent successfully.'),
            });
        });
    };

    const handleSchedule = () => {
        if (!currentDraftId || !scheduledDate) return;
        persistCurrentDraft(() => {
            scheduleDraft(
                { draftId: currentDraftId, scheduledForDate: new Date(scheduledDate).toISOString() },
                { onSuccess: () => setScheduleOpen(false) }
            );
        });
    };

    const handleAttachmentPick = async (files: FileList | null) => {
        if (!files?.length) return;
        const picked = Array.from(files);
        const encoded = await Promise.all(
            picked.map(async (file) => ({
                filename: file.name,
                mime_type: file.type || 'application/octet-stream',
                size_bytes: file.size,
                content_base64: await fileToBase64(file),
            }))
        );
        setAttachments((prev) => [...prev, ...encoded]);
    };

    const disableActions = saving || savingDirect || sending || sendingDirect || scheduling;

    return (
        <AppShell title="Copilot Workspace" subtitle="Draft Composer">
            <div className="h-[calc(100vh-64px)] overflow-y-auto bg-surface-container-lowest">
                <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/10 pb-3">
                        <Link href="/drafts" className="inline-flex items-center gap-2 text-sm font-medium text-outline-variant hover:text-on-surface">
                            <MaterialSymbol icon="arrow_back" className="text-lg" />
                            Back to Drafts
                        </Link>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => persistCurrentDraft()}
                                disabled={disableActions}
                                className="h-9 px-4 rounded-xl border border-outline-variant/20 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={() => setScheduleOpen(true)}
                                disabled={disableActions}
                                className="h-9 px-4 rounded-xl border border-outline-variant/20 text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                            >
                                Schedule
                            </button>
                            <button
                                onClick={handleSendNow}
                                disabled={disableActions}
                                className="h-9 px-4 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                            >
                                {sending ? 'Sending...' : 'Send'}
                            </button>
                        </div>
                    </div>

                    {actionMessage && (
                        <div className="text-xs px-3 py-2 rounded-lg bg-primary-fixed/20 text-primary border border-primary-fixed/30">
                            {actionMessage}
                        </div>
                    )}

                    <div className="rounded-2xl border border-outline-variant/15 bg-white overflow-hidden">
                        <div className="px-4 md:px-5 py-3 border-b border-outline-variant/10 bg-surface-container-lowest flex flex-wrap items-center gap-3">
                            <div className="relative min-w-[280px] flex-1 max-w-[520px]" ref={contextPickerRef}>
                                <button
                                    onClick={() => setContextPickerOpen((v) => !v)}
                                    className="h-9 w-full px-3 rounded-xl border border-outline-variant/20 text-sm bg-white text-left flex items-center justify-between"
                                >
                                    <span className="truncate">
                                        {threadOptions.find((t: any) => t.thread_id === selectedThreadId)?.subject || 'Select thread context'}
                                    </span>
                                    <MaterialSymbol icon={contextPickerOpen ? 'expand_less' : 'expand_more'} className="text-lg text-outline-variant" />
                                </button>

                                {contextPickerOpen && (
                                    <div className="absolute top-11 left-0 right-0 z-30 rounded-xl border border-outline-variant/20 bg-white shadow-xl p-2 space-y-2">
                                        <div className="relative">
                                            <MaterialSymbol icon="search" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-outline-variant text-base" />
                                            <input
                                                value={contextSearch}
                                                onChange={(e) => setContextSearch(e.target.value)}
                                                placeholder="Search email context..."
                                                className="h-9 w-full pl-8 pr-3 rounded-lg border border-outline-variant/20 text-sm"
                                            />
                                        </div>
                                        <div className="max-h-64 overflow-y-auto">
                                            {threadOptions.length === 0 ? (
                                                <div className="px-3 py-2 text-xs text-outline-variant">No threads found</div>
                                            ) : (
                                                threadOptions.map((thread: any) => (
                                                    <button
                                                        key={thread.thread_id}
                                                        onClick={() => handleThreadContextSelect(thread.thread_id)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-surface-container ${thread.thread_id === selectedThreadId ? 'bg-primary-fixed/20 text-primary' : ''}`}
                                                    >
                                                        <div className="truncate">{thread.subject || '(No Subject)'}</div>
                                                    </button>
                                                ))
                                            )}
                                        </div>
                                        <div className="px-2 text-[10px] text-outline-variant uppercase tracking-wider">
                                            Showing up to 100 results. Use search to find older threads.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <select
                                value={tone}
                                onChange={(e) => setTone(e.target.value)}
                                className="h-9 px-3 rounded-xl border border-outline-variant/20 text-sm"
                            >
                                <option value="BRIEF">Incise</option>
                                <option value="NORMAL">Balanced</option>
                                <option value="FORMAL">Elevated</option>
                            </select>

                            <button
                                onClick={createOrRegenerateDraft}
                                disabled={generating || generatingFreeform}
                                className="h-9 px-4 rounded-xl bg-surface-container text-on-surface text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                            >
                                {(generating || generatingFreeform) ? 'Generating...' : currentDraftId ? 'Regenerate' : 'Generate'}
                            </button>

                            <input
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Optional AI instruction"
                                className="h-9 flex-1 min-w-[220px] px-3 rounded-xl border border-outline-variant/20 text-sm"
                            />
                        </div>

                        <div className="px-4 md:px-5 py-3 space-y-3">
                            <div className="flex items-center gap-2">
                                <label className="w-14 text-xs font-bold uppercase tracking-wider text-outline-variant">To</label>
                                <input
                                    value={toField}
                                    onChange={(e) => setToField(e.target.value)}
                                    placeholder="recipient@example.com"
                                    className="h-9 flex-1 px-3 rounded-xl border border-outline-variant/20 text-sm"
                                />
                                <button
                                    onClick={() => setShowCcBcc((v) => !v)}
                                    className="text-xs font-bold text-primary"
                                >
                                    {showCcBcc ? 'Hide Cc/Bcc' : 'Cc/Bcc'}
                                </button>
                            </div>

                            {showCcBcc && (
                                <>
                                    <div className="flex items-center gap-2">
                                        <label className="w-14 text-xs font-bold uppercase tracking-wider text-outline-variant">Cc</label>
                                        <input
                                            value={ccField}
                                            onChange={(e) => setCcField(e.target.value)}
                                            placeholder="cc@example.com"
                                            className="h-9 flex-1 px-3 rounded-xl border border-outline-variant/20 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="w-14 text-xs font-bold uppercase tracking-wider text-outline-variant">Bcc</label>
                                        <input
                                            value={bccField}
                                            onChange={(e) => setBccField(e.target.value)}
                                            placeholder="bcc@example.com"
                                            className="h-9 flex-1 px-3 rounded-xl border border-outline-variant/20 text-sm"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="flex items-center gap-2">
                                <label className="w-14 text-xs font-bold uppercase tracking-wider text-outline-variant">Subject</label>
                                <input
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="Subject"
                                    className="h-9 flex-1 px-3 rounded-xl border border-outline-variant/20 text-sm"
                                />
                            </div>

                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                placeholder={loadingDraft ? 'Loading draft...' : 'Compose your draft email...'}
                                className="w-full min-h-[360px] p-3 md:p-4 rounded-xl border border-outline-variant/20 text-sm leading-7 resize-y"
                            />

                            {attachments.length > 0 && (
                                <div className="flex flex-wrap items-center gap-2">
                                    {attachments.map((att, idx) => (
                                        <div key={`${att.filename}-${idx}`} className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-surface-container text-xs">
                                            <MaterialSymbol icon="attach_file" className="text-base" />
                                            <span className="max-w-[180px] truncate">{att.filename}</span>
                                            <button
                                                onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                                                className="text-outline-variant hover:text-error"
                                            >
                                                <MaterialSymbol icon="close" className="text-sm" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between border-t border-outline-variant/10 pt-3">
                                <div className="flex items-center gap-2">
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => handleAttachmentPick(e.target.files)}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="h-9 px-3 rounded-xl border border-outline-variant/20 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2"
                                    >
                                        <MaterialSymbol icon="attach_file" className="text-base" />
                                        Attach
                                    </button>
                                </div>

                                <div className="text-[11px] text-outline-variant">
                                    {currentDraftId ? `Draft: ${currentDraftId.slice(0, 8)}...` : 'Generate from thread to create draft'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
                <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-6 space-y-5">
                    <h3 className="text-base font-bold text-on-surface">Schedule Draft</h3>
                    <input
                        type="datetime-local"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-outline-variant/20 text-sm"
                    />
                    <div className="flex gap-2">
                        <button
                            onClick={() => setScheduleOpen(false)}
                            className="flex-1 h-10 rounded-xl border border-outline-variant/20 text-xs font-bold uppercase tracking-wider"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSchedule}
                            disabled={disableActions || !scheduledDate}
                            className="flex-1 h-10 rounded-xl bg-primary text-on-primary text-xs font-bold uppercase tracking-wider disabled:opacity-40"
                        >
                            {scheduling ? 'Scheduling...' : 'Schedule'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>
        </AppShell>
    );
}
