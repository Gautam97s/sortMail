'use client';

import { useState } from 'react';
import type { EmailMessage, EmailThreadV1, ThreadIntelV1, TaskDTOv1, DraftDTOv1, AttachmentRef, PriorityLevel } from '@/types/dashboard';
import {
    ArrowLeft, Sparkles, AlertTriangle, Clock, FileText,
    Calendar, Users, Target, Send, RefreshCw, ChevronDown,
    Paperclip, Brain, Zap, MessageSquare, Download, Eye,
    CheckCircle2, Info, XCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppShell from '@/components/layout/AppShell';
import { useThreadDetail } from '@/hooks/useThreadDetail';
import { api } from '@/lib/api';

export default function ThreadDetailPage() {
    const params = useParams();
    const threadId = params?.threadId as string;
    const { data, isLoading, error } = useThreadDetail(threadId);

    if (isLoading) {
        return (
            <AppShell title="Loading Thread...">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_340px] gap-6 p-4 md:p-6">
                    <div className="space-y-4">
                        <div className="h-10 w-2/3 bg-paper-mid animate-pulse rounded-lg" />
                        <div className="h-4 w-1/3 bg-paper-mid animate-pulse rounded" />
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 bg-paper-mid animate-pulse rounded-xl" />
                        ))}
                        <div className="h-40 bg-paper-mid animate-pulse rounded-xl" />
                    </div>
                    <div className="space-y-4">
                        <div className="h-80 bg-paper-mid animate-pulse rounded-xl" />
                        <div className="h-32 bg-paper-mid animate-pulse rounded-xl" />
                    </div>
                </div>
            </AppShell>
        );
    }

    if (error || !data || !data.thread) {
        return (
            <AppShell title="Thread Not Found">
                <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
                    <p className="text-lg font-medium">Thread not found</p>
                    <Link href="/inbox">
                        <Button variant="outline" className="mt-4 gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back to Inbox
                        </Button>
                    </Link>
                </div>
            </AppShell>
        );
    }

    const { thread, intel, tasks, draft } = data;

    return (
        <AppShell title={thread.subject} subtitle={`${thread.messages.length} messages`}>
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Back nav */}
                <Link href="/inbox">
                    <Button variant="ghost" size="sm" className="gap-1.5 mb-3 text-muted-foreground hover:text-ink -ml-1">
                        <ArrowLeft className="h-3.5 w-3.5" /> Inbox
                    </Button>
                </Link>

                <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                    {/* ─── Left: Messages Column ─────────────────── */}
                    <div className="space-y-4 min-w-0">
                        {/* Thread header */}
                        <div>
                            <h1 className="font-display text-xl md:text-2xl font-bold text-ink mb-1 leading-tight">
                                {thread.subject}
                            </h1>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{thread.participants.join(', ')}</span>
                            </div>
                        </div>

                        {/* Messages */}
                        <ScrollArea className="h-[calc(100vh-300px)]">
                            <div className="space-y-3 pr-1">
                                {thread.messages.map((msg: EmailMessage) => (
                                    <MessageCard key={msg.message_id} message={msg} />
                                ))}

                                {/* Auto Draft — always at the bottom of the conversation */}
                                {draft && <DraftCard draft={draft} />}
                            </div>
                        </ScrollArea>
                    </div>

                    {/* ─── Right: Intelligence Sidebar ──────────── */}
                    <div className="space-y-4">
                        {intel ? (
                            <IntelPanel intel={intel} tasks={tasks} attachments={thread.attachments} />
                        ) : (
                            <Card className="border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                                    <Brain className="h-8 w-8 opacity-20" />
                                    <p className="text-sm">AI analysis pending...</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

// ─── Message Card ─────────────────────────────────────────────

function getSenderInfo(fromAddress: string) {
    let name = fromAddress;
    let email = fromAddress;
    const match = fromAddress.match(/(.*?)<(.+?)>/);
    if (match) {
        name = match[1].trim().replace(/^"|"$/g, '');
        email = match[2].trim();
    }
    if (!name || name === email) name = email.split('@')[0];
    const initials = name
        .split(' ')
        .map(n => n[0])
        .filter((_, i, arr) => i === 0 || i === arr.length - 1)
        .join('')
        .toUpperCase()
        .slice(0, 2);
    return { name, email, initials: initials || '?' };
}

function MessageCard({ message }: { message: EmailMessage }) {
    const sender = getSenderInfo(message.from_address);
    const [expanded, setExpanded] = useState(true);
    const isFromUser = message.is_from_user;

    return (
        <Card className={`transition-all ${isFromUser ? 'border-l-2 border-l-primary/60 bg-primary/[0.02]' : 'border-border'}`}>
            <CardHeader className="pb-2 cursor-pointer select-none" onClick={() => setExpanded(!expanded)}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isFromUser ? 'bg-primary/10 text-primary' : 'bg-paper-deep text-ink-light'}`}>
                            {isFromUser ? 'YO' : sender.initials}
                        </div>
                        <div>
                            <p className="text-sm font-semibold leading-tight">
                                {isFromUser ? 'You' : sender.name}
                            </p>
                            <p className="text-[11px] text-muted-foreground font-mono">
                                {new Date(message.sent_at).toLocaleString('en-IN', {
                                    month: 'short', day: 'numeric',
                                    hour: '2-digit', minute: '2-digit',
                                    timeZone: 'Asia/Kolkata',
                                })}
                            </p>
                        </div>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
                </div>
            </CardHeader>
            {expanded && (
                <CardContent className="pt-0">
                    <Separator className="mb-3" />
                    {message.body_html ? (
                        <div
                            className="text-sm text-ink-mid email-body-html leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: message.body_html }}
                        />
                    ) : (
                        <div className="text-sm leading-relaxed whitespace-pre-line text-ink-mid">
                            {message.body_text}
                        </div>
                    )}
                </CardContent>
            )}
        </Card>
    );
}

// ─── Intelligence Panel (right sidebar with tabs) ────────────

function IntelPanel({ intel, tasks, attachments }: {
    intel: ThreadIntelV1;
    tasks: TaskDTOv1[];
    attachments: AttachmentRef[];
}) {
    const [activeTab, setActiveTab] = useState('intel');
    const urgencyScore = intel.urgency_score;
    const urgencyColor = urgencyScore >= 70 ? 'text-danger' : urgencyScore >= 40 ? 'text-warning' : 'text-success';
    const urgencyBg = urgencyScore >= 70 ? 'bg-red-50 border-red-200' : urgencyScore >= 40 ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200';
    const intentLabel = (intel.intent || '').replace(/_/g, ' ');

    const tabItems = [
        { value: 'intel', label: 'Intelligence', icon: Brain },
        { value: 'tasks', label: `Tasks${tasks.length > 0 ? ` (${tasks.length})` : ''}`, icon: Target },
        { value: 'attach', label: `Files${attachments.length > 0 ? ` (${attachments.length})` : ''}`, icon: Paperclip },
    ];

    return (
        <Card className="border-ai/20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 pt-4 pb-2 border-b border-border/50">
                <Brain className="h-4 w-4 text-ai" />
                <span className="text-xs font-mono uppercase tracking-widest text-ai font-bold">AI Intelligence</span>
            </div>

            {/* Sub-tabs */}
            <div className="flex border-b border-border/40 bg-paper-mid/30 px-1 pt-1 gap-0.5">
                {tabItems.map(t => (
                    <button
                        key={t.value}
                        onClick={() => setActiveTab(t.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider rounded-t transition-all whitespace-nowrap
                            ${activeTab === t.value
                                ? 'bg-white text-ink border border-border/60 border-b-white -mb-px shadow-sm'
                                : 'text-muted hover:text-ink'
                            }`}
                    >
                        <t.icon className="h-3 w-3" />
                        {t.label}
                    </button>
                ))}
            </div>

            <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-300px)]">
                    <div className="p-4 space-y-4">

                        {/* ── Intelligence Tab ─────────────────── */}
                        {activeTab === 'intel' && (
                            <>
                                {/* Summary */}
                                <div>
                                    <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1.5">Summary</p>
                                    <p className="text-sm leading-relaxed text-ink">{intel.summary}</p>
                                </div>

                                {/* Intent + Urgency badges */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline" className="capitalize text-xs border-ai/30 text-ai bg-ai-soft/40">
                                        {intentLabel}
                                    </Badge>
                                    <Badge variant="outline" className={`text-xs ${urgencyColor} border-current`}>
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Urgency: {urgencyScore}/100
                                    </Badge>
                                </div>

                                {/* Main Ask */}
                                {intel.main_ask && (
                                    <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 rounded-lg p-3">
                                        <p className="text-[10px] font-mono text-amber-600 uppercase tracking-widest mb-1">Main Ask</p>
                                        <p className="text-sm font-semibold text-ink">{intel.main_ask}</p>
                                    </div>
                                )}

                                {/* Decision Needed */}
                                {intel.decision_needed && (
                                    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 rounded-lg p-3">
                                        <p className="text-[10px] font-mono text-orange-600 uppercase tracking-widest mb-1">Decision Needed</p>
                                        <p className="text-sm font-medium text-ink">{intel.decision_needed}</p>
                                    </div>
                                )}

                                {/* Deadlines */}
                                {intel.extracted_deadlines?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Deadlines</p>
                                        <div className="space-y-1.5">
                                            {intel.extracted_deadlines.map((d, i) => (
                                                <div key={i} className="flex items-center gap-2 text-sm">
                                                    <Calendar className="h-3.5 w-3.5 text-warning shrink-0" />
                                                    <span className="font-medium">
                                                        {d.normalized
                                                            ? new Date(d.normalized).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                                            : d.raw_text}
                                                    </span>
                                                    {d.normalized && (
                                                        <span className="text-xs text-muted-foreground">&ldquo;{d.raw_text}&rdquo;</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Suggested Action */}
                                {intel.suggested_action && (
                                    <div className="bg-ai-soft border border-ai/20 rounded-lg p-3">
                                        <p className="text-[10px] font-mono text-ai uppercase tracking-widest mb-1">Suggested Action</p>
                                        <p className="text-sm text-ink">{intel.suggested_action}</p>
                                    </div>
                                )}

                                {/* Reply Points */}
                                {intel.suggested_reply_points?.length > 0 && (
                                    <div>
                                        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Reply Points</p>
                                        <ul className="space-y-1.5">
                                            {intel.suggested_reply_points.map((p, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <Zap className="h-3 w-3 text-ai shrink-0 mt-0.5" />
                                                    <span>{p}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Tasks Tab ────────────────────────── */}
                        {activeTab === 'tasks' && (
                            <>
                                {tasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                                        <CheckCircle2 className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">No pending tasks</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {tasks.map((task: TaskDTOv1) => {
                                            const priorityConfig: Record<string, { label: string; color: string; bg: string }> = {
                                                do_now: { label: 'Do Now', color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
                                                do_today: { label: 'Today', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
                                                can_wait: { label: 'Can Wait', color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
                                            };
                                            const cfg = priorityConfig[task.priority as string] ?? priorityConfig['can_wait'];
                                            return (
                                                <div key={task.task_id} className={`rounded-lg border p-3 ${cfg.bg}`}>
                                                    <p className="text-sm font-semibold text-ink mb-1">{task.title}</p>
                                                    {task.description && (
                                                        <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
                                                    )}
                                                    <div className="flex items-center gap-1.5">
                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border-current ${cfg.color}`}>
                                                            {cfg.label}
                                                        </Badge>
                                                        {task.effort && (
                                                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                                                {task.effort.replace('_', ' ')}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Attachments Tab ──────────────────── */}
                        {activeTab === 'attach' && (
                            <>
                                {attachments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                                        <Paperclip className="h-8 w-8 opacity-20" />
                                        <p className="text-sm">No attachments</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {attachments.map((att: AttachmentRef) => {
                                            const attIntel = intel?.attachment_summaries?.find(a => a.attachment_id === att.attachment_id);
                                            const sizeKB = Math.round(att.size_bytes / 1024);
                                            const sizeDisplay = sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${sizeKB} KB`;

                                            return (
                                                <div key={att.attachment_id} className="border border-border rounded-lg overflow-hidden">
                                                    <div className="flex items-center gap-2 px-3 py-2.5 bg-paper-mid/30">
                                                        <FileText className="h-4 w-4 text-accent shrink-0" />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-medium truncate">{att.filename}</p>
                                                            <p className="text-[11px] text-muted-foreground font-mono">{sizeDisplay}</p>
                                                        </div>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Button
                                                                variant="ghost" size="icon" className="h-7 w-7"
                                                                onClick={() => handlePreview(att.attachment_id, att.mime_type)}
                                                                title="Preview"
                                                            >
                                                                <Eye className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost" size="icon" className="h-7 w-7"
                                                                onClick={() => handleDownload(att.attachment_id, att.filename)}
                                                                title="Download"
                                                            >
                                                                <Download className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                    {attIntel && (
                                                        <div className="px-3 py-2.5 bg-ai-soft/30 border-t border-ai/10">
                                                            <p className="text-[10px] text-ai font-mono uppercase tracking-widest mb-1">AI Summary</p>
                                                            <p className="text-xs leading-relaxed text-ink-mid">{attIntel.summary}</p>
                                                            {attIntel.key_points?.length > 0 && (
                                                                <ul className="mt-1.5 space-y-0.5">
                                                                    {attIntel.key_points.map((kp, i) => (
                                                                        <li key={i} className="text-xs text-ink-mid flex gap-1">
                                                                            <span className="text-ai">•</span> {kp}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

// ─── Attachment action helpers (defined outside for use in panel) ─

async function handleDownload(attachment_id: string, filename: string) {
    try {
        const response = await api.get(`/api/attachments/${attachment_id}/download`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    } catch (e) { console.error('Download failed', e); }
}

async function handlePreview(attachment_id: string, mime_type: string) {
    try {
        const response = await api.get(`/api/attachments/${attachment_id}/preview`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data], { type: mime_type }));
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 10000);
    } catch (e) { console.error('Preview failed', e); }
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
        <Card className="border-ai/30 bg-gradient-to-br from-ai-soft/20 to-transparent">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-ai/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-3.5 w-3.5 text-ai" />
                        </div>
                        <span className="text-sm font-mono uppercase tracking-wider text-ai font-bold">AI Draft</span>
                        <Badge variant="outline" className="text-[10px] capitalize border-ai/30 text-ai">{draft.tone}</Badge>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="ghost" size="sm"
                            className="gap-1.5 text-xs h-7 text-muted-foreground hover:text-ink"
                            onClick={handleRegenerate}
                            disabled={isRegenerating}
                        >
                            <RefreshCw className={`h-3 w-3 ${isRegenerating ? 'animate-spin' : ''}`} />
                            Regenerate
                        </Button>
                        <Button size="sm" className="gap-1.5 text-xs h-7 bg-ai hover:bg-ai/90 text-white">
                            <Send className="h-3 w-3" /> Use Draft
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <Separator className="mb-3 border-ai/10" />
                <div className="text-sm leading-relaxed whitespace-pre-line text-ink">
                    {draft.content.split(/(\[.*?\])/).map((part, i) => {
                        if (part.startsWith('[') && part.endsWith(']')) {
                            const placeholder = draft.placeholders?.find(p => p.key === part);
                            return (
                                <span
                                    key={i}
                                    className="bg-yellow-100 border border-yellow-300 rounded px-1 py-0.5 text-yellow-700 cursor-pointer hover:bg-yellow-200 transition-colors text-xs"
                                    title={placeholder?.description}
                                >
                                    {part}
                                </span>
                            );
                        }
                        return <span key={i}>{part}</span>;
                    })}
                </div>
                {draft.has_unresolved_placeholders && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                        {draft.placeholders?.length ?? 0} placeholder{(draft.placeholders?.length ?? 0) !== 1 ? 's' : ''} need{(draft.placeholders?.length ?? 0) === 1 ? 's' : ''} your input
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
