'use client';

import React from 'react';
import {
    Download,
    FileText,
    Calendar,
    Clock,
    ArrowLeft,
    FileJson,
    FileSpreadsheet,
    ShieldCheck,
    History,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockExports = [
    { id: 'ex1', name: 'Security_Audit_Feb_2024.pdf', type: 'Audit Log', format: 'PDF', date: '2024-02-28', status: 'Ready' },
    { id: 'ex2', name: 'User_Access_Audit.csv', type: 'Access Log', format: 'CSV', date: '2024-02-25', status: 'Expired' },
    { id: 'ex3', name: 'API_Key_Rotation_Report.json', type: 'Security Events', format: 'JSON', date: '2024-02-15', status: 'Ready' },
];

export default function SecurityAuditExportPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Security Audit Export</h1>
                        <p className="text-ink-light text-sm">Generate and download comprehensive system logs for compliance and regulatory auditing.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Export Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={14} /> New Audit Request
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Log Type</label>
                                    <select className="w-full h-10 rounded-md border border-border-light bg-white text-sm px-3 focus:ring-1 focus:ring-accent outline-none">
                                        <option>Administrative Actions</option>
                                        <option>User Access Logs</option>
                                        <option>Security System Events</option>
                                        <option>Financial & Billing Audit</option>
                                        <option>AI Token Consumption Logs</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Export Format</label>
                                    <div className="flex gap-2">
                                        <FormatButton label="PDF" active icon={FileText} />
                                        <FormatButton label="CSV" icon={FileSpreadsheet} />
                                        <FormatButton label="JSON" icon={FileJson} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Date Range Start</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="date" className="pl-10 h-10 text-sm border-border-light" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Date Range End</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="date" className="pl-10 h-10 text-sm border-border-light" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Audit Reason (Internal Only)</label>
                                <Input placeholder="E.g. Annual Compliance Review Q1" className="h-10 text-sm border-border-light" />
                            </div>

                            <div className="pt-4 border-t border-border-light flex justify-end">
                                <Button className="h-11 bg-accent font-bold uppercase tracking-widest text-xs px-8 shadow-md">
                                    Generate Audit Report
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Previous Exports */}
                    <Card className="border-border-light shadow-sm overflow-hidden">
                        <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <History size={14} /> Export History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-paper-mid/20 text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                    <tr>
                                        <th className="px-6 py-3">Report Name</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light text-sm">
                                    {mockExports.map((exp) => (
                                        <tr key={exp.id} className="hover:bg-paper-mid/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={16} className="text-muted-foreground" />
                                                    <span className="font-medium text-ink">{exp.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-mono text-ink-mid">{exp.type}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-ink-light">{exp.date}</td>
                                            <td className="px-6 py-4">
                                                <ExportStatus status={exp.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {exp.status === 'Ready' && (
                                                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-[10px] font-bold uppercase tracking-widest text-accent hover:bg-accent/5">
                                                        <Download size={12} /> Download
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm bg-accent/5 border-l-4 border-l-accent">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center gap-2 text-accent">
                                <Clock size={18} />
                                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest">Retention Policy</h4>
                            </div>
                            <p className="text-[11px] text-ink-light leading-relaxed">
                                Generated reports are stored for **7 days** before being automatically purged from the secure cache. Ensure you download them promptly.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground">
                                Compliance Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full border-8 border-success flex items-center justify-center mb-4">
                                <span className="text-2xl font-display text-ink">98%</span>
                            </div>
                            <h5 className="text-xs font-bold text-ink mb-1">Audit Ready</h5>
                            <p className="text-[10px] text-ink-light">System is fully compliant with current security protocols.</p>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-warning/5 border-l-4 border-l-warning">
                        <CardContent className="p-4 flex gap-3">
                            <AlertCircle size={18} className="text-warning shrink-0" />
                            <p className="text-[10px] text-ink-light leading-relaxed">
                                PDF exports can take up to 3 minutes for large datasets. You will be notified when the file is ready.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function FormatButton({ label, icon: Icon, active }: any) {
    return (
        <button className={`flex-1 h-10 rounded border flex items-center justify-center gap-2 transition-all ${active ? 'bg-paper-mid border-accent text-accent shadow-inner' : 'bg-white border-border-light text-ink-light hover:border-accent/40 hover:bg-paper-mid/50'}`}>
            <Icon size={14} />
            <span className="text-[10px] font-mono font-bold uppercase">{label}</span>
        </button>
    );
}

function ExportStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Ready': 'text-success font-bold font-mono',
        'Expired': 'text-ink-light opacity-60 font-mono',
    };
    return (
        <span className={`text-[10px] uppercase flex items-center gap-1.5 ${styles[status]}`}>
            {status === 'Ready' ? <CheckCircle2 size={10} /> : <Clock size={10} />}
            {status}
        </span>
    );
}
