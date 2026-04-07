'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import Sidebar from '@/components/layout/Sidebar';
import RightSidebar from '@/components/layout/RightSidebar';
import TopNavigationBar from '@/components/layout/TopNavigationBar';
import { useThreads } from '@/hooks/useThreads';
import { useSmartSync } from '@/hooks/useSmartSync';
import { useRealtimeEvents } from '@/hooks/useRealtimeEvents';
import { useUser } from '@/hooks/useUser';
import {
    RefreshCw,
    Inbox,
    AlertTriangle,
    Clock,
    FileText,
    ChevronRight,
    ChevronLeft,
    Star,
    Reply,
    MoreVertical,
    Sparkles,
    Activity,
    Database,
    ChevronDown,
    Archive,
    Tag,
} from 'lucide-react';
import { FilterTab, ThreadListItem } from '@/types/dashboard';

export default function InboxPage() {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const { data: user } = useUser();

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    const { data: threads, isLoading, error } = useThreads(undefined, debouncedSearch || undefined);
    const { syncState, triggerSync } = useSmartSync();
    useRealtimeEvents();

    const isSyncing = syncState === 'syncing' || syncState === 'checking';
    const filtered = threads ?? [];

    return (
        <div className="flex w-full h-screen overflow-hidden bg-slate-50 text-slate-900 font-display">
            {/* Mobile Overlay */}
            <div className={`drawer-overlay ${mobileSidebarOpen ? 'open' : ''} z-40`} onClick={() => setMobileSidebarOpen(false)} />

            {/* Reusing existing Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

            <main className="flex-1 flex flex-col min-w-0 bg-white border-l border-slate-200 z-10 shadow-[10px_0_30px_-15px_rgba(0,0,0,0.1)] overflow-hidden">
                {/* TopNavigationBar */}
                <TopNavigationBar
                    onMobileSidebarOpen={() => setMobileSidebarOpen(true)}
                    onSearchChange={(value) => setSearch(value)}
                    searchPlaceholder="Search emails, subjects or summaries..."
                />

                {/* View Controls & Toolbar */}
                <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between border-b border-slate-100 bg-white/90 backdrop-blur-md sticky top-0 z-10 w-full shrink-0 ml-0">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer" />
                            <ChevronDown className="h-4 w-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                        </div>
                        <div className="flex items-center gap-3 md:gap-4 text-slate-500 border-l border-slate-200 pl-4 md:pl-6">
                            <button className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors" onClick={triggerSync} disabled={isSyncing}>
                                <RefreshCw className={`h-4 w-4 md:h-[20px] md:w-[20px] ${isSyncing ? 'animate-spin' : ''}`} />
                                <span className="text-xs font-semibold hidden md:inline">Refresh</span>
                            </button>
                            <button className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                                <Archive className="h-4 w-4 md:h-[20px] md:w-[20px]" />
                                <span className="text-xs font-semibold hidden md:inline">Archive</span>
                            </button>
                            <button className="hover:text-indigo-600 flex items-center gap-1.5 transition-colors">
                                <Tag className="h-4 w-4 md:h-[20px] md:w-[20px]" />
                                <span className="text-xs font-semibold hidden md:inline">Label</span>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4">
                        <div className="text-[10px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:block">Page 1 of 4</div>
                        <div className="flex gap-1">
                            <button className="p-1 hover:bg-slate-100 rounded text-slate-400 disabled:opacity-30" disabled>
                                <ChevronLeft className="h-[20px] w-[20px]" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 rounded text-slate-600">
                                <ChevronRight className="h-[20px] w-[20px]" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Inbox List */}
                <div className="flex-1 overflow-y-auto px-4 py-4 md:p-6 w-full custom-scrollbar">
                    <div className="max-w-[1200px] mx-auto pb-8">
                        <div className="space-y-2">
                            {isLoading ? (
                                <div className="space-y-2">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div key={i} className="h-28 rounded-2xl bg-slate-50 animate-pulse border border-slate-100" />
                                    ))}
                                </div>
                            ) : error ? (
                                <div className="p-8 text-center text-red-600 font-bold bg-slate-50 rounded-2xl border border-red-100">
                                    Failed to load threads.
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3 bg-white rounded-2xl border border-slate-100">
                                    <Inbox className="h-12 w-12 opacity-30 text-slate-400" />
                                    <p className="text-base font-bold text-slate-700">Your inbox is empty</p>
                                    <p className="text-sm text-slate-500">Make sure your Gmail account is connected, then sync.</p>
                                    <Button variant="outline" onClick={triggerSync} disabled={isSyncing} className="gap-2 mt-4 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold shadow-sm">
                                        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                                        Sync Emails
                                    </Button>
                                </div>
                            ) : (
                                filtered.map((thread: ThreadListItem) => (
                                    <ThreadRow key={thread.thread_id} thread={thread} />
                                ))
                            )}
                        </div>

                        {/* Bento Grid View (Summary & Quick Stats) */}
                        {!isLoading && filtered.length > 0 && (
                            <div className="grid grid-cols-12 gap-4 mt-8">
                                <div className="col-span-12 lg:col-span-8 bg-indigo-50/50 border border-indigo-600/10 rounded-2xl p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Sparkles className="h-[20px] w-[20px] text-indigo-600" />
                                            <h4 className="text-sm font-bold text-indigo-600">AI Inbox Intelligence</h4>
                                        </div>
                                        <p className="text-xs md:text-sm text-slate-600 leading-relaxed max-w-md">
                                            You have {filtered.filter(t => t.urgency_score >= 70).length} urgent emails and {filtered.filter(t => t.intent === 'action_required').length} threads pending action. Your AI assistant has pre-drafted priority responses.
                                        </p>
                                    </div>
                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-600/20 transition-all">
                                            Review Drafts
                                        </button>
                                        <button className="px-4 py-2 bg-white text-slate-700 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-all">
                                            Clear Low-Priority
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="col-span-12 lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-center shadow-sm">
                                    <div className="relative z-10 w-full">
                                        <h4 className="text-[11px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Inbox Health</h4>
                                        <div className="space-y-5">
                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-2">
                                                    <span className="text-slate-600">UNREAD MESSAGES</span>
                                                    <span className="text-indigo-600">{filtered.filter((t: any) => t.is_unread).length} / {Math.max(50, filtered.length)}</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-indigo-600 h-full max-w-full" style={{ width: `${Math.min(100, Math.max(5, (filtered.filter((t: any) => t.is_unread).length / Math.max(50, filtered.length)) * 100))}%` }} />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-[11px] font-bold mb-2">
                                                    <span className="text-slate-600">STORAGE USED</span>
                                                    <span className="text-slate-500">82%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                                    <div className="bg-amber-400 h-full w-[82%]" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                                        <Database className="h-40 w-40 text-slate-900" strokeWidth={1} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Right Contextual Sidebar */}
            <RightSidebar />
        </div>
    );
}

function ThreadRow({ thread }: { thread: ThreadListItem & { tags?: string[] } }) {
    const isUrgent = thread.urgency_score >= 70;
    const isAction = thread.intent === 'action_required';
    const isFyi = thread.intent === 'fyi';
    const isUnread = (thread as any).is_unread ?? false;

    // Parse sender from thread.participants
    const firstParticipant = (thread as any).participants?.[0] ?? '';
    const sender = (() => {
        if (!firstParticipant) return { name: 'Unknown' };
        const nameMatch = firstParticipant.match(/^"?([^"<]+)"?\s*</);
        const name = nameMatch
            ? nameMatch[1].trim()
            : firstParticipant.split('@')[0].replace(/[._]/g, ' ');
        return { name };
    })();

    return (
        <div className={`group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-2xl bg-white border border-slate-100 hover:border-indigo-600/30 hover:shadow-[0_8px_30px_rgb(79,70,229,0.06)] transition-all duration-300 relative overflow-hidden cursor-pointer`}>
            {/* Priority left bar */}
            {(isUrgent || isAction) && (
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${isUrgent ? 'bg-red-500' : 'bg-amber-500'} opacity-0 group-hover:opacity-100 transition-opacity`} />
            )}

            <div className="pt-[5px] shrink-0">
                <input type="checkbox" className="w-[15px] h-[15px] md:w-4 md:h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer transition-colors" onClick={(e) => e.stopPropagation()} />
            </div>
            <div className="pt-[3px] shrink-0">
                <Star className={`h-[16px] w-[16px] md:h-[18px] md:w-[18px] cursor-pointer transition-colors ${isUrgent || isAction ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 hover:text-yellow-400'}`} onClick={(e) => e.stopPropagation()} />
            </div>

            <Link href={`/inbox/${thread.thread_id}`} className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[13px] md:text-sm ${isUnread ? 'font-bold text-slate-900' : 'font-bold text-slate-800'}`}>{sender.name}</span>
                        {isUrgent && <span className="px-2 py-[2px] bg-red-50 text-red-600 text-[9px] md:text-[10px] font-bold rounded-full border border-red-100 uppercase tracking-wide">Urgent</span>}
                        {isAction && !isUrgent && <span className="px-2 py-[2px] bg-indigo-50 text-indigo-600 text-[9px] md:text-[10px] font-bold rounded-full border border-indigo-100 uppercase tracking-wide">Team</span>}
                        {isFyi && <span className="px-2 py-[2px] bg-slate-100 text-slate-500 text-[9px] md:text-[10px] font-bold rounded-full border border-slate-200 uppercase tracking-wide">News</span>}
                    </div>
                    <span className="text-[10px] md:text-[11px] font-semibold text-slate-400 shrink-0 tabular-nums">{formatTime(thread.last_updated)}</span>
                </div>
                
                <h3 className={`text-[13px] md:text-sm truncate mb-2 ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-500'}`}>
                    {thread.subject || '(No Subject)'}
                </h3>

                <div className={`flex gap-2.5 md:gap-3 items-start ${isFyi ? 'opacity-70' : ''}`}>
                    <div className="flex-shrink-0 mt-0.5">
                        <Sparkles className={`h-[16px] w-[16px] md:h-[18px] md:w-[18px] ${isFyi ? 'text-slate-400' : 'text-indigo-600'}`} />
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2.5 px-3 border border-slate-100 grow transition-colors group-hover:bg-slate-50/50">
                        <p className={`text-[11px] md:text-xs leading-relaxed italic line-clamp-2 ${isFyi ? 'text-slate-500' : 'text-slate-600'}`}>
                            &quot;AI Summary: {thread.summary || 'Pending analysis...'}&quot;
                        </p>
                    </div>
                </div>
            </Link>
            
            {/* Hover Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all shrink-0 pt-1 pointer-events-auto translate-x-2 group-hover:translate-x-0">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-slate-400 shadow-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <Reply className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-slate-100 rounded-lg text-slate-400 shadow-sm" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                    <MoreVertical className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}

function formatTime(isoDate: string): string {
    const normalized = isoDate.endsWith('Z') || isoDate.includes('+') ? isoDate : isoDate + 'Z';
    const date = new Date(normalized);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    const tz = 'Asia/Kolkata';
    if (diffHours < 24) {
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: tz });
    }
    if (diffHours < 24 * 7) {
        return date.toLocaleDateString('en-IN', { weekday: 'short', timeZone: tz });
    }
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', timeZone: tz });
}
