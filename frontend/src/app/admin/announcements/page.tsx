'use client';

import React, { useState } from 'react';
import {
    Megaphone,
    Calendar,
    Clock,
    Eye,
    Plus,
    ArrowLeft,
    Trash2,
    Edit3,
    CheckCircle2,
    AlertCircle,
    MousePointer2,
    Layout
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockAnnouncements = [
    { id: 'a1', title: 'Scheduled Maintenance', type: 'Banner', status: 'Active', target: 'All Users', views: '2.4k', clicks: '142' },
    { id: 'a2', title: 'New AI Features Released!', type: 'Modal', status: 'Scheduled', target: 'Pro Users', views: '0', clicks: '0' },
    { id: 'a3', title: 'Q1 Partnership Update', type: 'Email + Banner', status: 'Expired', target: 'Enterprise', views: '842', clicks: '56' },
];

export default function AnnouncementsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">System Announcements</h1>
                        <p className="text-ink-light text-sm">Create and manage horizontal broadcasts, modal alerts, and feature updates.</p>
                    </div>
                </div>
                <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                    <Plus size={14} className="mr-2" /> New Announcement
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Composer / List */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border-light shadow-sm overflow-hidden">
                        <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Megaphone size={14} /> Active & Scheduled
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border-light">
                                {mockAnnouncements.map((ann) => (
                                    <div key={ann.id} className="p-5 flex items-start gap-4 hover:bg-paper-mid/30 transition-colors group">
                                        <div className={`mt-1 p-2 rounded-lg bg-paper-mid border border-border-light group-hover:bg-white transition-colors`}>
                                            <Layout size={16} className="text-ink-mid" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="text-sm font-bold text-ink truncate">{ann.title}</h4>
                                                <AnnouncementStatus status={ann.status} />
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-ink-light">
                                                <span className="bg-paper-mid px-1.5 py-0.5 rounded text-accent font-bold uppercase tracking-tight">{ann.type}</span>
                                                <span className="opacity-30">•</span>
                                                <span>Target: {ann.target}</span>
                                                <span className="opacity-30">•</span>
                                                <span className="flex items-center gap-1"><Eye size={10} /> {ann.views}</span>
                                                <span className="opacity-30">•</span>
                                                <span className="flex items-center gap-1"><MousePointer2 size={10} /> {ann.clicks}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-accent">
                                                <Edit3 size={14} />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-danger">
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-paper-mid/30">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Plus size={14} /> Quick Composer
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-ink uppercase mb-1 block">Title</label>
                                    <Input placeholder="E.g. Website Maintenance" className="h-9 text-xs border-border-light" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-ink uppercase mb-1 block">Type</label>
                                    <select className="w-full h-9 rounded-md border border-border-light bg-white text-xs px-2 focus:ring-1 focus:ring-accent outline-none">
                                        <option>Header Banner</option>
                                        <option>Fullscreen Modal</option>
                                        <option>Toast Notification</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[9px] font-mono font-bold text-ink uppercase mb-1 block">Message Content</label>
                                <textarea className="w-full min-h-[80px] rounded-md border border-border-light bg-white text-xs p-3 focus:ring-1 focus:ring-accent outline-none resize-none" placeholder="Enter your announcement message..."></textarea>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" className="h-9 text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-4">Save Draft</Button>
                                <Button className="h-9 text-[10px] font-bold uppercase tracking-widest bg-accent px-6 shadow-sm">Schedule Broadcast</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Performance & Scheduling */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar size={14} /> Publication Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-6">
                            <div className="flex items-center gap-4 group">
                                <div className="p-2 rounded-lg bg-paper-mid text-muted-foreground group-hover:bg-accent/5 group-hover:text-accent transition-colors">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <h5 className="text-[11px] font-bold text-ink mb-0.5">Automated Cleanup</h5>
                                    <p className="text-[10px] text-ink-light leading-snug">Announcements older than 30 days are automatically archived.</p>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border-light">
                                <h5 className="text-[9px] font-mono font-bold text-ink uppercase mb-3">Live Reach Summary</h5>
                                <div className="h-2 w-full bg-paper-mid rounded-full overflow-hidden flex">
                                    <div className="h-full bg-success" style={{ width: '45%' }} />
                                    <div className="h-full bg-accent" style={{ width: '25%' }} />
                                    <div className="h-full bg-muted" style={{ width: '30%' }} />
                                </div>
                                <div className="flex justify-between mt-2 text-[9px] font-mono text-ink-light">
                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-success" /> Seen</span>
                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-accent" /> Active</span>
                                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-muted" /> Pending</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-info/5 border-l-4 border-l-info">
                        <CardContent className="p-4 flex gap-4">
                            <AlertCircle size={20} className="text-info shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-bold text-info uppercase mb-1">Accessibility Tip</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Keep announcement banners short (max 100 chars) for better readability on mobile devices.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function AnnouncementStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Active': 'bg-success/10 text-success border-success/20',
        'Scheduled': 'bg-accent/10 text-accent border-accent/20',
        'Expired': 'bg-paper-mid text-ink-light border-border-light',
    };
    const icon = {
        'Active': <CheckCircle2 size={10} />,
        'Scheduled': <Clock size={10} />,
        'Expired': <AlertCircle size={10} />,
    }[status];

    return (
        <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${styles[status]}`}>
            {icon} {status}
        </span>
    );
}
