'use client';

import React from 'react';
import {
    Bell,
    AlertTriangle,
    AlertCircle,
    Info,
    CheckCircle2,
    ArrowLeft,
    Filter,
    MoreHorizontal,
    ExternalLink,
    Zap,
    Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockAlerts = [
    { id: 'a1', severity: 'critical', title: 'OpenAI API Error Rate High', desc: 'System detecting 15% error rate on GPT-4o inference requests.', time: '12 mins ago', icon: Zap },
    { id: 'a2', severity: 'warning', title: 'Worker Backlog Increasing', desc: 'Sync worker queue has exceeded 5,000 items. Processing delay expected.', time: '45 mins ago', icon: Clock },
    { id: 'a3', severity: 'info', title: 'New Admin Invited', desc: 'Admin invitation sent to isabella@sortmail.io.', time: '2 hours ago', icon: Info },
    { id: 'a4', severity: 'critical', title: 'Database Connection Spike', desc: 'Postgres connection pool reaching 90% capacity (81/100).', time: '3 hours ago', icon: AlertCircle },
];

export default function AlertsCenterPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">System Alerts Center</h1>
                        <p className="text-ink-light text-sm">Actionable system warnings, errors, and administrative notices.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        <CheckCircle2 size={14} className="mr-2" /> Mark All as Read
                    </Button>
                </div>
            </div>

            {/* Alert Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard label="Critical Issues" count={2} color="text-danger" bg="bg-danger/5" />
                <SummaryCard label="Warnings" count={1} color="text-warning" bg="bg-warning/5" />
                <SummaryCard label="Resolved (24h)" count={12} color="text-success" bg="bg-success/5" />
            </div>

            {/* Alerts List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">Active Alerts</h3>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold text-accent">
                        <Filter size={12} className="mr-2" /> Filter
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {mockAlerts.map((alert) => (
                        <AlertItem key={alert.id} {...alert} />
                    ))}
                </div>
            </div>

            {/* Resolved History Link */}
            <Card className="border-dashed border-border-light bg-paper-mid/20 hover:bg-paper-mid/40 transition-colors cursor-pointer">
                <CardContent className="p-6 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <Clock size={14} /> View Resolved Alerts History
                </CardContent>
            </Card>
        </div>
    );
}

function SummaryCard({ label, count, color, bg }: any) {
    return (
        <Card className={`border-border-light shadow-sm ${bg}`}>
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                    <p className={`text-3xl font-display mt-0.5 ${color}`}>{count}</p>
                </div>
                <Bell size={24} className={`${color} opacity-20`} />
            </CardContent>
        </Card>
    );
}

function AlertItem({ severity, title, desc, time, icon: Icon }: any) {
    const config: Record<string, any> = {
        critical: { border: 'border-l-danger', bg: 'bg-danger/5', iconColor: 'text-danger' },
        warning: { border: 'border-l-warning', bg: 'bg-warning/5', iconColor: 'text-warning' },
        info: { border: 'border-l-info', bg: 'bg-info/5', iconColor: 'text-info' },
    };

    const s = config[severity] || config.info;

    return (
        <Card className={`border-border-light border-l-4 shadow-sm group hover:shadow-md transition-shadow ${s.border}`}>
            <CardContent className="p-5 flex items-start gap-4">
                <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white border border-border-light`}>
                    <Icon size={18} className={s.iconColor} />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-ink">{title}</h4>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-ink">
                                <ExternalLink size={14} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-ink">
                                <MoreHorizontal size={14} />
                            </Button>
                        </div>
                    </div>
                    <p className="text-[13px] text-ink-light leading-relaxed mb-3">{desc}</p>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{time}</span>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-ink-mid hover:bg-paper-mid">Acknowledge</Button>
                            <Button size="sm" className="h-7 px-3 text-[10px] font-bold uppercase tracking-widest shadow-sm">Resolve</Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
