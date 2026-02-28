'use client';

import React from 'react';
import {
    ArrowLeft,
    Mail,
    Shield,
    Activity,
    History,
    CreditCard,
    Zap,
    Lock,
    PauseCircle,
    Trash2,
    Calendar,
    ChevronRight,
    ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function UserDetailPage() {
    const { userId } = useParams();

    // Mock specific user data
    const user = {
        id: userId,
        name: 'Marcus Aurelius',
        email: 'marcus@stoic.com',
        plan: 'Enterprise',
        status: 'Active',
        joined: 'October 12, 2023',
        lastLogin: '2 hours ago',
        totalEmails: 12450,
        aiCredits: 450,
        aiLimit: 500,
        usageHistory: [
            { date: '2024-02-28', credits: 42, threads: 125 },
            { date: '2024-02-27', credits: 38, threads: 98 },
            { date: '2024-02-26', credits: 55, threads: 210 },
        ]
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin/users" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Back to Directory
                    </Link>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-3xl font-display text-ink">{user.name}</h1>
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-success/5 text-success border border-success/20">
                                {user.status}
                            </span>
                        </div>
                        <p className="text-ink-light text-sm font-mono flex items-center gap-2">
                            ID: {user.id} <span className="opacity-30">•</span> {user.email}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Lock size={14} className="mr-2" /> Reset Password
                    </Button>
                    <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                        Update Account
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Account Details */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Shield size={14} /> Profile Overview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <DetailRow label="Current Plan" value={user.plan} />
                            <DetailRow label="Member Since" value={user.joined} />
                            <DetailRow label="Last Session" value={user.lastLogin} />
                            <div className="pt-4 flex flex-col gap-2">
                                <Button variant="outline" className="w-full justify-start text-xs border-border-light font-medium text-ink-mid">
                                    <PauseCircle size={14} className="mr-2 text-warning" /> Suspend Account
                                </Button>
                                <Button variant="outline" className="w-full justify-start text-xs border-border-light font-medium text-danger hover:bg-danger/5 hover:border-danger/30">
                                    <Trash2 size={14} className="mr-2" /> Delete Account Data
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-paper-mid/30">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Activity size={14} /> Usage Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-mono font-bold text-ink-mid uppercase">AI Credits</span>
                                    <span className="text-xs font-mono">{user.aiCredits} / {user.aiLimit}</span>
                                </div>
                                <div className="h-2 rounded-full bg-paper-mid overflow-hidden border border-border-light/50">
                                    <div className="h-full bg-ai" style={{ width: `${(user.aiCredits / user.aiLimit) * 100}%` }} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-white border border-border-light rounded-lg">
                                    <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Total Emails</p>
                                    <p className="text-lg font-display text-accent">{user.totalEmails.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-white border border-border-light rounded-lg">
                                    <p className="text-[9px] font-mono text-muted-foreground uppercase mb-1">Threads Analyzed</p>
                                    <p className="text-lg font-display text-ai">842</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Activity & History */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <History size={14} /> Recent Administrative Logs
                            </CardTitle>
                            <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold uppercase tracking-tighter">View Full Audit</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                <LogItem
                                    icon={CreditCard}
                                    text="Subscription upgraded to Enterprise"
                                    date="Feb 24, 2024"
                                    actor="System (Auto-upgrade)"
                                />
                                <LogItem
                                    icon={Zap}
                                    text="Manual credit top-up (+100 credits)"
                                    date="Feb 20, 2024"
                                    actor="Admin: Isabella R."
                                />
                                <LogItem
                                    icon={Lock}
                                    text="Password reset email sent"
                                    date="Jan 15, 2024"
                                    actor="User Request"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Calendar size={14} /> Daily Activity History
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-paper-mid border-y border-border-light text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-2">Date</th>
                                            <th className="px-6 py-2">Credits Used</th>
                                            <th className="px-6 py-2">Processing Volume</th>
                                            <th className="px-6 py-2 text-right text-accent"><ExternalLink size={10} /></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-light">
                                        {user.usageHistory.map((row, i) => (
                                            <tr key={i} className="hover:bg-paper-mid/50 transition-colors">
                                                <td className="px-6 py-3 text-xs font-medium text-ink-mid">{row.date}</td>
                                                <td className="px-6 py-3 text-xs font-mono">{row.credits} credits</td>
                                                <td className="px-6 py-3 text-xs text-ink-light">{row.threads} items synced</td>
                                                <td className="px-6 py-3 text-right">
                                                    <ChevronRight size={12} className="text-muted-foreground ml-auto" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DetailRow({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-border-light/50 last:border-0">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{label}</span>
            <span className="text-sm font-medium text-ink">{value}</span>
        </div>
    );
}

function LogItem({ icon: Icon, text, date, actor }: { icon: any, text: string, date: string, actor: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-paper-mid/50 transition-colors group">
            <div className="mt-0.5 p-1.5 rounded-md bg-paper-mid border border-border-light group-hover:bg-white transition-colors">
                <Icon size={12} className="text-ink-mid" />
            </div>
            <div className="flex-1">
                <p className="text-sm text-ink-mid leading-none mb-1.5">{text}</p>
                <div className="flex items-center gap-2 text-[10px] font-mono text-ink-light">
                    <span>{date}</span>
                    <span className="opacity-30">•</span>
                    <span>By {actor}</span>
                </div>
            </div>
        </div>
    );
}
