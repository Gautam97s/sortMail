'use client';

import React from 'react';
import {
    CreditCard,
    TrendingUp,
    ArrowLeft,
    Plus,
    History,
    User,
    Zap,
    DollarSign,
    ShieldCheck,
    AlertCircle,
    ArrowUpRight,
    Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockCreditSummary = [
    { label: 'Total Credits Issued', value: '4.2M', sub: 'Last 30 days' },
    { label: 'Active Consumption', value: '1.8M', sub: '92% AI-driven' },
    { label: 'Revenue Generated', value: '$84,200', sub: 'Add-on purchases' },
    { label: 'Pending Refunds', value: '12', sub: 'Manual review required' },
];

const recentAdjustments = [
    { id: 'adj1', user: 'Marcus Aurelius', amount: '+5,000', reason: 'Service Interruption Comp', date: '2h ago' },
    { id: 'adj2', user: 'Sarah Connor', amount: '-200', reason: 'Incorrect Billing Fixed', date: '5h ago' },
];

export default function CreditsOverviewPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Credits Economy</h1>
                        <p className="text-ink-light text-sm">Monitoring platform-wide credit liquidity, AI token costs, and manual balance adjustments.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href="/admin/credits/transactions">
                        <Button variant="outline" className="h-10 border-border-light text-xs font-bold uppercase tracking-wider shadow-sm">
                            <History size={14} className="mr-2" /> View Full Ledger
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {mockCreditSummary.map((stat, i) => (
                    <Card key={i} className="border-border-light shadow-sm">
                        <CardContent className="p-5">
                            <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</h4>
                            <p className="text-2xl font-display text-ink mt-1">{stat.value}</p>
                            <p className="text-[10px] text-ink-light mt-1 font-mono">{stat.sub}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Manual Adjuster */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <DollarSign size={14} /> Manual Balance Adjustment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Search User</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input placeholder="Email or User ID..." className="pl-10 h-10 text-sm border-border-light" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Adjustment Amount</label>
                                <Input type="number" placeholder="E.g. 500 or -200" className="h-10 text-sm border-border-light" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Reason for Audit Log</label>
                            <Input placeholder="E.g. Beta tester reward" className="h-10 text-sm border-border-light" />
                        </div>
                        <div className="pt-4 border-t border-border-light flex justify-end gap-3">
                            <Button variant="ghost" className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reset</Button>
                            <Button className="h-10 bg-accent font-bold uppercase tracking-widest text-xs px-8 shadow-md">Apply Adjustment</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Admin Actions */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={14} /> Admin Adjustments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border-light">
                                {recentAdjustments.map((adj) => (
                                    <div key={adj.id} className="p-4 hover:bg-paper-mid/30 transition-colors flex items-center justify-between">
                                        <div className="min-w-0">
                                            <h5 className="text-xs font-bold text-ink truncate">{adj.user}</h5>
                                            <p className="text-[9px] text-ink-light truncate uppercase font-mono">{adj.reason}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end shrink-0">
                                            <span className={`text-xs font-mono font-bold ${adj.amount.startsWith('+') ? 'text-success' : 'text-danger'}`}>{adj.amount}</span>
                                            <span className="text-[9px] text-ink-light font-mono">{adj.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-info/5 border-l-4 border-l-info">
                        <CardContent className="p-4 flex gap-4">
                            <AlertCircle size={20} className="text-info shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-bold text-info uppercase mb-1">Economy Threshold</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Current platform liquidity is **above safe floor**. Automatic token scaling is enabled.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
