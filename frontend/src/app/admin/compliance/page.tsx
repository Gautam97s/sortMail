'use client';

import React from 'react';
import {
    Shield,
    UserX,
    FileText,
    Clock,
    ArrowLeft,
    CheckCircle2,
    AlertTriangle,
    Lock,
    Search,
    MoreHorizontal,
    Globe
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockComplianceRequests = [
    { id: 'c1', user: 'Marcus Aurelius', type: 'Data Deletion (GDPR)', status: 'Pending', requestedAt: '2024-02-28', deadline: '2024-03-28' },
    { id: 'c2', user: 'Sarah Connor', type: 'Data Export (CCPA)', status: 'Resolved', requestedAt: '2024-02-15', deadline: '2024-03-15' },
    { id: 'c3', user: 'Arthur Dent', type: 'Opt-out Request', status: 'In Progress', requestedAt: '2024-02-26', deadline: '2024-03-26' },
];

export default function ComplianceOversightPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Compliance & Privacy</h1>
                        <p className="text-ink-light text-sm">Managing data privacy requests, regulatory adherence, and user right-to-be-forgotten.</p>
                    </div>
                </div>
            </div>

            {/* Compliance Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ComplianceStat label="Active Requests" value="8" sub="GDPR / CCPA" icon={Shield} color="text-info" />
                <ComplianceStat label="Compliance Score" value="100%" sub="Fully Adhered" icon={CheckCircle2} color="text-success" />
                <ComplianceStat label="Overdue Requests" value="0" sub="Zero backlog" icon={Lock} color="text-accent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Requests Table */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Pending Privacy Requests
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                <Input placeholder="Search requests..." className="pl-7 h-7 text-[10px] bg-white border-border-light" />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-paper-mid/20 text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                    <tr>
                                        <th className="px-6 py-3">User</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                        <th className="px-6 py-3">Deadline</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light text-sm">
                                    {mockComplianceRequests.map((req) => (
                                        <tr key={req.id} className="hover:bg-paper-mid/30 transition-colors group">
                                            <td className="px-6 py-4 font-medium text-ink">{req.user}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-ink-mid">{req.type}</td>
                                            <td className="px-6 py-4 text-center">
                                                <RequestStatus status={req.status} />
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-ink-light">
                                                <div className="flex flex-col">
                                                    <span>{req.deadline}</span>
                                                    <span className={`text-[9px] ${req.status === 'Pending' ? 'text-warning' : 'text-success'}`}>
                                                        {req.status === 'Pending' ? '28 days left' : 'Completed'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreHorizontal size={14} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Policies & Config */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Globe size={14} /> Regional Adherence
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <PolicyItem label="GDPR (EU/UK)" active />
                            <PolicyItem label="CCPA (California)" active />
                            <PolicyItem label="VCDPA (Virginia)" active />
                            <PolicyItem label="LGPD (Brazil)" active />
                            <Button className="w-full h-10 font-bold uppercase tracking-wider text-[10px] bg-accent mt-2 shadow-sm">
                                Update Data Policies
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-paper-mid/30">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <UserX size={14} /> Right to be Forgotten
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <p className="text-[11px] text-ink-light leading-relaxed">
                                Process manual account deletions and purge related backups across all edge nodes.
                            </p>
                            <Button variant="outline" className="w-full h-10 text-[10px] font-bold uppercase tracking-wider border-border-light text-ink">
                                Start Purge Protocol
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ComplianceStat({ label, value, sub, icon: Icon, color }: any) {
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

function RequestStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Pending': 'bg-warning/10 text-warning border-warning/20',
        'Resolved': 'bg-success/10 text-success border-success/20',
        'In Progress': 'bg-info/10 text-info border-info/20',
    };
    return (
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-block min-w-[80px] ${styles[status]}`}>
            {status}
        </span>
    );
}

function PolicyItem({ label, active }: { label: string, active: boolean }) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border-light/50 last:border-0">
            <span className="text-[10px] font-mono font-bold text-ink truncate">{label}</span>
            <span className="text-[9px] font-bold text-success flex items-center gap-1">
                {active && <CheckCircle2 size={10} />} Active Adherence
            </span>
        </div>
    );
}
