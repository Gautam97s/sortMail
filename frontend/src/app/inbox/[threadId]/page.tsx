'use client';

import { useState } from 'react';
import type { EmailMessage, EmailThreadV1, ThreadIntelV1, TaskDTOv1, DraftDTOv1, AttachmentRef, PriorityLevel } from '@/types/dashboard';
import {
    ArrowLeft, Sparkles, AlertTriangle, Clock, FileText,
    Calendar, Users, Target, Send, RefreshCw, ChevronDown,
    Paperclip, Brain, Zap, MessageSquare, Download, Eye,
    CheckCircle2, Info, X, Minus, Reply, Forward, Archive, Trash2,
    Search, Bell, Settings, Tag, Expand
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useThreadDetail } from '@/hooks/useThreadDetail';
import InboxPage from '../page';
import { Rnd } from 'react-rnd';
import { useEffect } from 'react';

export default function ThreadDetailPage() {
    const params = useParams();
    const threadId = params?.threadId as string;
    const { data, isLoading, error } = useThreadDetail(threadId);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (isLoading) {
        return (
            <>
                <div className="fixed inset-0 z-0">
                    <InboxPage />
                </div>
                {mounted && (
                    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl animate-in zoom-in slide-in-from-bottom-5">
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">Opening mail...</span>
                    </div>
                )}
            </>
        );
    }

    if (error || !data || !data.thread) {
        return (
            <>
                <div className="fixed inset-0 z-0">
                    <InboxPage />
                </div>
                {mounted && (
                    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-red-600 text-white px-5 py-3 rounded-xl shadow-xl animate-in zoom-in slide-in-from-bottom-5">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-sm font-medium">Thread not found or unavailable.</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-white/80 hover:text-white hover:bg-white/20 ml-2" onClick={() => window.history.back()}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </>
        );
    }

    const { thread, intel, tasks, draft } = data;

    return (
        <>
            {/* Background Inbox Viewer - Fully clickable and interactive */}
            <div className="fixed inset-0 z-0">
                <InboxPage />
            </div>

            {/* Draggable & Resizable Composer-like Popup */}
            {mounted && (
                <Rnd
                    default={{
                        x: Math.max(0, window.innerWidth - 650 - 40), 
                        y: Math.max(0, window.innerHeight - 600 - 20),
                        width: 650,
                        height: 600,
                    }}
                    minWidth={400}
                    minHeight={300}
                    bounds="window"
                    dragHandleClassName="draggable-handle"
                    className="z-50 bg-white sm:rounded-tl-2xl sm:rounded-tr-2xl shadow-[0_-5px_40px_-5px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col border border-slate-200 pointer-events-auto"
                    style={{ position: 'fixed' }}
                >
                    {/* Popup Header (Gmail Compose style: light grey / blueish background) */}
                    <div className="draggable-handle bg-[#f2f6fc] px-4 py-2.5 flex items-center justify-between cursor-move border-b border-white">
                        <h3 className="font-semibold text-slate-800 truncate pr-4 text-[13px]">{thread.subject}</h3>
                        <div className="flex gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-[#e2e8f0] rounded transition-colors text-slate-500">
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-red-50 hover:text-red-500 rounded transition-colors text-slate-500" onClick={() => window.history.back()}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                {/* Popup Body Content */}
                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                    
                    {/* AI Summary Section */}
                    {intel && (
                        <div className="mb-8 rounded-lg bg-indigo-50 border border-indigo-600/10 p-4">
                            <div className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="text-indigo-600 h-5 w-5" />
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">AI Summary</span>
                                </div>
                                <ChevronDown className="h-5 w-5 text-indigo-600/50 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <p className="mt-3 text-[13px] text-slate-600 leading-relaxed font-medium">
                                {intel.summary}
                            </p>
                        </div>
                    )}

                    {/* Email Meta */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h4 className="text-base font-bold text-slate-900 mb-1">{getSenderInfo(thread.messages[0]?.from_address || '').name}</h4>
                            <p className="text-[13px] text-slate-500">{getSenderInfo(thread.messages[0]?.from_address || '').email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[13px] text-slate-500">
                                {new Date(thread.last_updated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-bold">
                                {new Date(thread.last_updated).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    {/* Email Content Messages */}
                    <div className="space-y-6 pb-6 text-slate-700 leading-loose text-sm">
                        {thread.messages.map((msg: EmailMessage, idx: number) => (
                            <MessageContent key={msg.message_id} message={msg} />
                        ))}
                    </div>

                    {/* Draft Reply (if any) */}
                    {draft && (
                        <div className="mb-6 pt-4">
                            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                                <Send className="h-4 w-4 text-indigo-600" /> Auto-Drafted Reply
                            </h3>
                            <DraftCard draft={draft} />
                        </div>
                    )}

                    {/* Attachments Section */}
                    {thread.attachments && thread.attachments.length > 0 && (
                        <div className="mt-8 border-t border-indigo-600/5 pt-6">
                            <h5 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-4">
                                Attachments ({thread.attachments.length})
                            </h5>
                            <div className="flex flex-wrap gap-4">
                                {thread.attachments.map((att: AttachmentRef) => {
                                    const sizeMB = (att.size_bytes / (1024 * 1024)).toFixed(1);
                                    return (
                                        <div key={att.attachment_id} className="group cursor-pointer flex items-center gap-3 p-3 rounded-xl border border-indigo-600/10 hover:border-indigo-600/30 bg-slate-50 transition-all">
                                            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 shadow-sm shrink-0">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <p className="text-[13px] font-semibold text-slate-800 truncate">{att.filename}</p>
                                                <p className="text-[11px] text-slate-400 font-medium">{sizeMB} MB</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Popup Footer Actions */}
                <div className="px-6 py-4 border-t border-slate-100 bg-white flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                        <Button className="px-5 py-2 h-auto bg-indigo-600 text-white rounded-md font-semibold text-sm tracking-wide hover:bg-indigo-700 transition-all shadow-sm">
                            Reply
                        </Button>
                        <Button variant="outline" className="px-5 py-2 h-auto border-slate-200 text-slate-600 bg-white rounded-md font-semibold text-sm tracking-wide hover:bg-slate-50 transition-all">
                            Forward
                        </Button>
                    </div>
                    <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-slate-100 transition-colors rounded" title="Archive">
                            <Archive className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors rounded" title="Delete">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </Rnd>
            )}
        </>
    );
}

// ─── Message Content Helper ─────────────────────────────────────────────

function getSenderInfo(fromAddress: string) {
    let name = fromAddress;
    let email = fromAddress;
    const match = fromAddress.match(/(.*?)<(.+?)>/);
    if (match) {
        name = match[1].trim().replace(/^"|"$/g, '');
        email = match[2].trim();
    }
    if (!name || name === email) name = email.split('@')[0];
    return { name, email };
}

function MessageContent({ message }: { message: EmailMessage }) {
    return (
        <div className="border-b border-slate-100 pb-6 mb-6 last:border-0 last:pb-0 last:mb-0">
            {message.body_html ? (
                <div
                    className="email-body-html prose prose-sm max-w-none prose-slate"
                    dangerouslySetInnerHTML={{ __html: message.body_html }}
                />
            ) : (
                <div className="whitespace-pre-wrap">
                    {message.body_text}
                </div>
            )}
        </div>
    );
}

// ─── Draft Card ──────────────────────────────────────────────

function DraftCard({ draft }: { draft: DraftDTOv1 }) {
    const [isRegenerating, setIsRegenerating] = useState(false);

    const handleRegenerate = async () => {
        setIsRegenerating(true);
        await new Promise(r => setTimeout(r, 1200));
        setIsRegenerating(false);
    };

    return (
        <div className="rounded-xl border border-indigo-600/20 bg-indigo-50/50 p-4">
            <div className="flex items-center justify-between mb-3 border-b border-indigo-600/10 pb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Tone:</span>
                    <Badge variant="outline" className="text-[10px] capitalize border-indigo-600/30 text-indigo-700 bg-white shadow-sm">{draft.tone}</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost" size="sm"
                        className="gap-1.5 text-xs h-7 text-slate-500 hover:text-indigo-700 hover:bg-white bg-white/50 border border-slate-200"
                        onClick={handleRegenerate}
                        disabled={isRegenerating}
                    >
                        <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                        Regenerate
                    </Button>
                </div>
            </div>
            <div className="text-[13px] leading-relaxed whitespace-pre-line text-slate-800 font-medium">
                {draft.content.split(/(\[.*?\])/).map((part, i) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        const placeholder = draft.placeholders?.find(p => p.key === part);
                        return (
                            <span
                                key={i}
                                className="bg-amber-100 border border-amber-300 rounded px-1 py-0.5 text-amber-800 cursor-pointer hover:bg-amber-200 transition-colors text-xs font-bold"
                                title={placeholder?.description}
                            >
                                {part}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </div>
        </div>
    );
}
