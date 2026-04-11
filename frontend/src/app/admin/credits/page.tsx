'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    History,
    DollarSign,
    ShieldCheck,
    AlertCircle,
    Search,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { api, endpoints } from '@/lib/api';

type AdminCreditsSummary = {
    total_credits_issued: number;
    active_consumption_30d: number;
    purchase_credits_30d: number;
    pending_refunds: number;
};

const recentAdjustments: Array<{ id: string; user: string; amount: string; reason: string; date: string }> = [];

export default function CreditsOverviewPage() {
    const [summary, setSummary] = useState<AdminCreditsSummary | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get<AdminCreditsSummary>(endpoints.adminCreditsSummary);
                if (!mounted) return;
                setSummary(data);
            } catch {
                if (!mounted) return;
                setSummary(null);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const creditSummary = useMemo(() => ([
        {
            label: 'Total Credits Issued',
            value: loading ? '--' : String(summary?.total_credits_issued ?? 0),
            sub: 'All-time completed credit inflows',
        },
        {
            label: 'Active Consumption (30d)',
            value: loading ? '--' : String(summary?.active_consumption_30d ?? 0),
            sub: 'Credits consumed in the last 30 days',
        },
        {
            label: 'Purchases (30d)',
            value: loading ? '--' : String(summary?.purchase_credits_30d ?? 0),
            sub: 'Purchased credits in the last 30 days',
        },
        {
            label: 'Pending Refunds',
            value: loading ? '--' : String(summary?.pending_refunds ?? 0),
            sub: 'Reserved refund transactions',
        },
    ]), [loading, summary]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {creditSummary.map((stat, i) => (
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
                                    <Input disabled title="Adjustment form is not wired yet" placeholder="Email or User ID..." className="pl-10 h-10 text-sm border-border-light" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Adjustment Amount</label>
                                <Input disabled title="Adjustment form is not wired yet" type="number" placeholder="E.g. 500 or -200" className="h-10 text-sm border-border-light" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-ink uppercase tracking-wider">Reason for Audit Log</label>
                            <Input disabled title="Adjustment form is not wired yet" placeholder="E.g. Beta tester reward" className="h-10 text-sm border-border-light" />
                        </div>
                        <div className="pt-4 border-t border-border-light flex justify-end gap-3">
                            <Button variant="ghost" disabled title="Adjustment form is not wired yet" className="h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reset</Button>
                            <Button disabled title="Adjustment form is not wired yet" className="h-10 bg-accent font-bold uppercase tracking-widest text-xs px-8 shadow-md">Apply Adjustment</Button>
                        </div>
                    </CardContent>
                </Card>

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
                                {recentAdjustments.length === 0 && (
                                    <div className="p-6 text-center text-sm text-ink-light">No recent admin adjustments.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-info/5 border-l-4 border-l-info">
                        <CardContent className="p-4 flex gap-4">
                            <AlertCircle size={20} className="text-info shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-bold text-info uppercase mb-1">Economy Threshold</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Current platform liquidity is above safe floor. Automatic token scaling is enabled.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
