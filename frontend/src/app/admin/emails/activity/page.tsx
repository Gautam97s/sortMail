'use client';

import React from 'react';
import {
    Mail,
    CheckCircle2,
    Clock,
    AlertCircle,
    Search,
    Filter,
    ArrowLeft,
    RefreshCcw,
    Zap
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockLogs = [
    { id: 'l1', user: 'Isabella R.', subject: 'Project Update: Q1', status: 'Analyzed', time: '14:22:05', latency: '420ms' },
    { id: 'l2', user: 'Marcus A.', subject: 'Stoic Principles Meeting', status: 'Synced', time: '14:21:50', latency: '150ms' },
    { id: 'l3', user: 'Sarah C.', subject: 'Resistance Logistics', status: 'Error', time: '14:21:12', latency: '2.4s' },
    { id: 'l4', user: 'Neo', subject: 'The Matrix Reloaded', status: 'Analyzed', time: '14:20:45', latency: '380ms' },
    { id: 'l5', user: 'Ellen R.', subject: 'Nostromo Manifest', status: 'Deleted', time: '14:19:30', latency: '120ms' },
    { id: 'l6', user: 'Arthur D.', subject: 'Guide Update', status: 'Analyzed', time: '14:18:15', latency: '450ms' },
];

export default function EmailActivityPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Email Processing Activity</h1>
                        <p className="text-ink-light text-sm">Real-time monitoring of global email synchronization and AI analysis.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                    <RefreshCcw size={14} className="mr-2" /> Live Refresh
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActivityStat label="Success Rate" value="99.4%" sub="Global processing" icon={CheckCircle2} color="text-success" />
                <ActivityStat label="Avg Latency" value="342ms" sub="Sync + Analysis" icon={Clock} color="text-info" />
                <ActivityStat label="AI Queue" value="12 items" sub="Currently active" icon={Zap} color="text-ai" />
            </div>

            {/* Filter Bar */}
            <Card className="border-border-light bg-white shadow-sm ring-1 ring-black/5">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by user, subject, or trace ID..."
                            className="pl-10 h-10 border-border-light focus-visible:ring-accent"
                        />
                    </div>
                    <Button variant="outline" className="h-10 gap-2 border-border-light text-ink w-full md:w-auto">
                        <Filter size={14} /> Filters
                    </Button>
                </CardContent>
            </Card>

            {/* Log Table */}
            <Card className="border-border-light bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-paper-mid border-b border-border-light text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-bold">Processed At</th>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Thread/Subject</th>
                                <th className="px-6 py-4 font-bold">Operation</th>
                                <th className="px-6 py-4 font-bold">Latency</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                            {mockLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-paper-mid/50 transition-colors group">
                                    <td className="px-6 py-4 text-xs font-mono text-ink-mid">
                                        {log.time}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-medium text-ink">{log.user}</span>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm">
                                        <p className="text-sm text-ink-mid truncate">{log.subject}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={log.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-mono font-bold ${log.latency.includes('s') ? 'text-danger' : 'text-ink-light'}`}>
                                            {log.latency}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}

function ActivityStat({ label, value, sub, icon: Icon, color }: any) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-paper-mid flex items-center justify-center shrink-0`}>
                    <Icon size={20} className={color} />
                </div>
                <div>
                    <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                    <p className="text-xl font-display text-ink mt-0.5">{value}</p>
                    <p className="text-[10px] text-ink-light mt-0.5 font-mono">{sub}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Analyzed': 'bg-ai/10 text-ai border-ai/20',
        'Synced': 'bg-success/10 text-success border-success/20',
        'Error': 'bg-danger/10 text-danger border-danger/20',
        'Deleted': 'bg-paper-mid text-ink-light border-border-light',
    };
    return (
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border flex items-center gap-1.5 w-fit ${styles[status]}`}>
            {status === 'Error' && <AlertCircle size={10} />}
            {status}
        </span>
    );
}
