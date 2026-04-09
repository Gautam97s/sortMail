'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { formatDistanceToNow } from 'date-fns';
import { useAiDrafts, useApproveDraft, useScheduleDraft } from '@/hooks/useDrafts';
import { AiDraft } from '@/types/dashboard';
import {
    Dialog,
    DialogContent,
} from '@/components/ui/dialog';

const MaterialSymbol = ({ icon, filled = false, className = '' }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

type SortOption = 'recent' | 'oldest' | 'status';

export default function DraftsListPage() {
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortOption>('recent');
    const [previewDraft, setPreviewDraft] = useState<AiDraft | null>(null);
    const [scheduleTarget, setScheduleTarget] = useState<AiDraft | null>(null);
    const [scheduledDate, setScheduledDate] = useState('');

    const { data: drafts = [], isLoading } = useAiDrafts();
    const { mutate: approveDraft, isPending: approving } = useApproveDraft();
    const { mutate: scheduleDraft, isPending: scheduling } = useScheduleDraft();

    const filtered = useMemo(() => {
        let items = drafts;
        
        if (search) {
            const q = search.toLowerCase();
            items = items.filter(d =>
                (d.subject ?? '').toLowerCase().includes(q) ||
                (d.body ?? '').toLowerCase().includes(q)
            );
        }

        if (sort === 'recent') {
            items = [...items].sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
        } else if (sort === 'oldest') {
            items = [...items].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
        } else if (sort === 'status') {
            items = [...items].sort((a, b) => {
                const statusOrder = { draft: 1, scheduled: 2, sent: 3 };
                return (statusOrder[a.status as keyof typeof statusOrder] || 0) - 
                       (statusOrder[b.status as keyof typeof statusOrder] || 0);
            });
        }

        return items;
    }, [drafts, search, sort]);

    const handleScheduleSubmit = () => {
        if (!scheduleTarget || !scheduledDate) return;
        scheduleDraft(
            { draftId: scheduleTarget.id, scheduledForDate: new Date(scheduledDate).toISOString() },
            { onSuccess: () => setScheduleTarget(null) }
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'sent': return 'bg-green-100 text-green-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            case 'draft': return 'bg-amber-100 text-amber-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AppShell title="Drafts" subtitle="Intelligent Management">
            <div className="flex flex-col h-[calc(100vh-64px)] bg-surface-container-lowest">
                {/* Toolbar */}
                <div className="h-14 border-b border-outline-variant/10 flex items-center justify-between px-6 bg-white/50 backdrop-blur-sm sticky top-0 z-20">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="h-9 px-3 bg-surface-container rounded-full flex items-center gap-2 flex-1 max-w-sm">
                            <MaterialSymbol icon="search" className="text-outline-variant text-lg" />
                            <input 
                                type="text" 
                                placeholder="Search drafts..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-outline-variant"
                            />
                        </div>
                        <select 
                            value={sort}
                            onChange={(e) => setSort(e.target.value as SortOption)}
                            className="h-9 px-3 bg-surface-container rounded-xl border border-outline-variant/10 text-sm font-medium focus:ring-2 focus:ring-primary-fixed"
                        >
                            <option value="recent">Most Recent</option>
                            <option value="oldest">Oldest</option>
                            <option value="status">By Status</option>
                        </select>
                    </div>

                    <Link 
                        href="/drafts/workspace" 
                        className="h-9 px-4 bg-primary text-on-primary rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
                    >
                        <MaterialSymbol icon="add" />
                        New Draft
                    </Link>
                </div>

                {/* Drafts List */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-8 space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="p-4 bg-white rounded-2xl border border-outline-variant/10 animate-pulse">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 bg-surface-container rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-surface-container rounded w-3/4" />
                                            <div className="h-3 bg-surface-container rounded w-full" />
                                            <div className="h-3 bg-surface-container rounded w-1/2" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-5 p-8">
                            <div className="h-20 w-20 rounded-full bg-surface-container flex items-center justify-center text-outline">
                                <MaterialSymbol icon="mail" className="text-5xl" />
                            </div>
                            <div className="space-y-2 text-center">
                                <p className="text-lg font-headline font-bold text-on-surface">No Drafts Yet</p>
                                <p className="text-sm text-on-surface-variant max-w-xs">
                                    {search ? 'No drafts match your search.' : 'Start creating intelligent responses to your emails.'}
                                </p>
                            </div>
                            <Link 
                                href="/drafts/workspace"
                                className="px-6 py-3 bg-primary text-on-primary rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <MaterialSymbol icon="auto_fix" />
                                Create First Draft
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3 p-6">
                            {filtered.map((draft) => (
                                <div 
                                    key={draft.id}
                                    className="group bg-white border border-outline-variant/10 rounded-2xl p-5 hover:shadow-lg hover:border-primary-fixed/30 transition-all cursor-pointer"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="h-12 w-12 bg-primary-fixed/20 text-primary rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary-fixed/40 transition-all border border-primary-fixed/10">
                                            <MaterialSymbol icon="auto_fix" className="text-xl" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-base font-bold text-on-surface truncate">
                                                    {draft.subject || '(No Subject)'}
                                                </h3>
                                                <div className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shrink-0 ${getStatusColor(draft.status)}`}>
                                                    {draft.status}
                                                </div>
                                            </div>
                                            <p className="text-sm text-on-surface-variant truncate mb-2 italic">
                                                &ldquo;{draft.body.slice(0, 100)}...&rdquo;
                                            </p>
                                            <div className="flex items-center gap-4 text-[10px] font-black text-outline-variant uppercase tracking-tighter">
                                                <div className="flex items-center gap-1">
                                                    <MaterialSymbol icon="schedule" className="text-xs" />
                                                    {formatDistanceToNow(new Date(draft.created_at), { addSuffix: true })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MaterialSymbol icon="architecture" className="text-xs" />
                                                    {draft.tone}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <MaterialSymbol icon="text_fields" className="text-xs" />
                                                    {draft.body.length} chars
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <Link
                                                href="/drafts/workspace"
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-9 px-3 bg-primary text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-1"
                                            >
                                                <MaterialSymbol icon="edit" className="text-sm" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setPreviewDraft(draft);
                                                }}
                                                className="h-9 px-3 bg-surface-container text-on-surface-variant rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center gap-1 border border-outline-variant/10"
                                            >
                                                <MaterialSymbol icon="visibility" className="text-sm" />
                                                View
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setScheduleTarget(draft);
                                                    setScheduledDate('');
                                                }}
                                                className="h-9 px-3 bg-surface-container text-on-surface-variant rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-surface-container-high transition-all flex items-center gap-1 border border-outline-variant/10"
                                            >
                                                <MaterialSymbol icon="schedule" className="text-sm" />
                                                Schedule
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    approveDraft(draft.id);
                                                }}
                                                disabled={approving}
                                                className="h-9 px-3 bg-green-100 text-green-700 rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <MaterialSymbol icon="send" className="text-sm" />
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Dialog */}
            {previewDraft && (
                <Dialog open onOpenChange={() => setPreviewDraft(null)}>
                    <DialogContent className="max-w-2xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden">
                        <div className="bg-white p-6 space-y-5">
                            <div className="flex items-center justify-between pb-5 border-b border-outline-variant/10">
                                <div className="space-y-1">
                                    <div className="px-2 py-0.5 bg-primary-fixed/20 text-primary font-black text-[8px] rounded-full uppercase tracking-widest inline-block mb-1">Draft Preview</div>
                                    <h3 className="text-lg font-headline font-bold text-on-surface tracking-tight">{previewDraft.subject}</h3>
                                </div>
                                <button onClick={() => setPreviewDraft(null)} className="h-9 w-9 flex items-center justify-center bg-surface-container rounded-xl text-outline hover:text-error transition-all">
                                    <MaterialSymbol icon="close" />
                                </button>
                            </div>
                            <div className="bg-surface-container-low rounded-2xl p-5 text-sm font-body text-on-surface leading-relaxed whitespace-pre-wrap max-h-[50vh] overflow-y-auto border border-outline-variant/5 italic">
                                {previewDraft.body}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-2 text-[9px] font-black text-outline uppercase tracking-widest">
                                    <MaterialSymbol icon="architecture" className="text-base" />
                                    {previewDraft.tone}
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        className="h-10 px-6 bg-primary text-on-primary rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                        onClick={() => { approveDraft(previewDraft.id); setPreviewDraft(null); }}
                                        disabled={approving}
                                    >
                                        <MaterialSymbol icon="send_and_archive" className="text-xl" />
                                        Deploy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* Schedule Dialog */}
            {scheduleTarget && (
                <Dialog open onOpenChange={() => setScheduleTarget(null)}>
                    <DialogContent className="max-w-md rounded-2xl border-none shadow-2xl p-6 space-y-6">
                        <div className="space-y-3">
                            <div className="h-12 w-12 bg-surface-container rounded-xl flex items-center justify-center text-primary border border-outline-variant/5">
                                <MaterialSymbol icon="schedule_send" className="text-xl" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-headline font-bold text-on-surface">Schedule Send</h3>
                                <p className="text-sm font-medium text-on-surface-variant">
                                    When should <span className="text-primary font-bold">{scheduleTarget.subject}</span> be sent?
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-outline px-1">Schedule For</label>
                            <input
                                type="datetime-local"
                                value={scheduledDate}
                                onChange={e => setScheduledDate(e.target.value)}
                                className="w-full h-10 px-3 bg-surface-container rounded-xl border border-outline-variant/15 focus:ring-2 focus:ring-primary-fixed focus:border-primary text-sm font-bold transition-all"
                            />
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setScheduleTarget(null)}
                                className="flex-1 h-10 rounded-xl border border-outline-variant/15 text-[9px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-surface-container transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleScheduleSubmit}
                                disabled={!scheduledDate || scheduling}
                                className="flex-1 px-6 bg-primary text-on-primary h-10 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-30"
                            >
                                <MaterialSymbol icon="lock_clock" className="text-lg" />
                                Schedule
                            </button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppShell>
    );
}
