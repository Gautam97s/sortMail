'use client';

import React from 'react';
import {
    LifeBuoy,
    MessageSquare,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Search,
    Filter,
    MoreHorizontal,
    User,
    ChevronRight,
    MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockTickets = [
    { id: 'tk1', user: 'Marcus Aurelius', subject: 'Pro Plan Billing Issue', status: 'Open', priority: 'High', lastUpdate: '12m ago' },
    { id: 'tk2', user: 'Sarah Connor', subject: 'AI Summary not generating', status: 'In Progress', priority: 'Critical', lastUpdate: '45m ago' },
    { id: 'tk3', user: 'Thomas Anderson', subject: 'Bulk Invite Help', status: 'Resolved', priority: 'Medium', lastUpdate: '2h ago' },
    { id: 'tk4', user: 'Ellen Ripley', subject: 'Account Deletion Request', status: 'Open', priority: 'Low', lastUpdate: '4h ago' },
];

export default function SupportOversightPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Support Oversight</h1>
                        <p className="text-ink-light text-sm">Monitoring customer inquiries, ticket status, and response performance.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        Support Analytics
                    </Button>
                </div>
            </div>

            {/* Support Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SupportStat label="Open Tickets" value="12" sub="4 require urgent action" icon={LifeBuoy} color="text-danger" />
                <SupportStat label="Avg. Response" value="18m" sub="-2m since last week" icon={Clock} color="text-info" />
                <SupportStat label="Solved Today" value="34" sub="98% satisfaction rate" icon={CheckCircle2} color="text-success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Tickets Table */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <div className="p-4 bg-paper-mid/50 border-b border-border-light flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search tickets..."
                                className="pl-9 h-9 text-xs border-border-light bg-white"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border-light text-ink text-[10px] font-bold uppercase tracking-widest">
                            <Filter size={12} /> Priority
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-paper-mid text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                <tr>
                                    <th className="px-6 py-3">Subject</th>
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Priority</th>
                                    <th className="px-6 py-3">Updated</th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light text-sm">
                                {mockTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-paper-mid/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-ink">{ticket.subject}</span>
                                                <span className="text-[10px] text-ink-light font-mono">ID: {ticket.id}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-paper-mid flex items-center justify-center shrink-0 border border-border-light">
                                                <User size={12} className="text-ink-light" />
                                            </div>
                                            <span className="text-xs font-medium text-ink">{ticket.user}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <TicketStatus status={ticket.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <TicketPriority priority={ticket.priority} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-ink-light">{ticket.lastUpdate}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ChevronRight size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Internal Communication */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <MessageCircle size={14} /> Internal Thread
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <p className="text-xs text-ink-light leading-relaxed">
                                Administrative notes for open tickets. Shared across all system admins.
                            </p>
                            <div className="bg-paper-mid/30 p-3 rounded border border-border-light/50 space-y-3">
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-accent font-mono uppercase">Marcus A.</span>
                                    <p className="text-[11px] text-ink font-medium">Investigating tk2. Looks like a service limit issue in OpenAI.</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[9px] font-bold text-info font-mono uppercase">Sarah C.</span>
                                    <p className="text-[11px] text-ink font-medium">tk3 has been resolved. User was using an expired bulk link.</p>
                                </div>
                            </div>
                            <Button className="w-full h-10 font-bold uppercase tracking-wider text-[10px] bg-paper-mid text-ink border border-border-light hover:bg-paper-mid/80 transition-all shadow-sm">
                                View Full Support Slack
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-accent/5 border-l-4 border-l-accent">
                        <CardContent className="p-4 flex gap-4">
                            <AlertCircle size={20} className="text-accent shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-bold text-accent uppercase mb-1">Knowledge Base Sync</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Auto-sync with documentation is enabled. New tickets are matched against common issues.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SupportStat({ label, value, sub, icon: Icon, color }: any) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                    <p className="text-xl font-display text-ink mt-0.5">{value}</p>
                    <p className="text-[10px] text-ink-light mt-0.5 font-mono">{sub}</p>
                </div>
                <Icon size={24} className={`${color} opacity-20`} />
            </CardContent>
        </Card>
    );
}

function TicketStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Open': 'bg-danger/10 text-danger border-danger/20',
        'In Progress': 'bg-info/10 text-info border-info/20',
        'Resolved': 'bg-success/10 text-success border-success/20',
    };
    return (
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-block ${styles[status]}`}>
            {status}
        </span>
    );
}

function TicketPriority({ priority }: { priority: string }) {
    const styles: Record<string, string> = {
        'Critical': 'text-danger font-bold',
        'High': 'text-warning font-bold',
        'Medium': 'text-info font-medium',
        'Low': 'text-ink-light font-normal',
    };
    return (
        <span className={`text-[10px] font-mono uppercase ${styles[priority]}`}>
            {priority}
        </span>
    );
}
