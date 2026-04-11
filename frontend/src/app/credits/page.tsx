'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CreditCard, History, TrendingUp, Wallet, ShieldCheck, Clock3 } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

type CreditBalance = {
    balance: number;
    plan: string;
    monthly_allowance: number;
    used_this_month: number;
    resets_on: string | null;
    bonus_available: number;
    bonus_consumed_this_cycle: number;
    monthly_remaining: number;
    total_spent_this_cycle: number;
    raw_used_this_month: number;
    consumption_policy: string;
};

type CreditTransaction = {
    id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    operation_type?: string | null;
    status: string;
    created_at: string;
};

function f(value: number): string {
    return (value || 0).toFixed(3);
}

function shortDate(dateIso: string | null): string {
    if (!dateIso) return '-';
    return new Date(dateIso).toLocaleDateString();
}

export default function CreditsPage() {
    const [credits, setCredits] = useState<CreditBalance | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'ALL' | 'DEDUCTION' | 'BONUS' | 'PURCHASE' | 'ADMIN_ADJUSTMENT'>('ALL');

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const [balanceRes, transactionsRes] = await Promise.all([
                    api.get(endpoints.creditsMe),
                    api.get(endpoints.creditsTransactions),
                ]);
                if (!mounted) return;
                setCredits(balanceRes.data);
                setTransactions(transactionsRes.data || []);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const usagePct = useMemo(() => {
        if (!credits || credits.monthly_allowance <= 0) return 0;
        return Math.min(100, (credits.used_this_month / credits.monthly_allowance) * 100);
    }, [credits]);

    const bonusPct = useMemo(() => {
        if (!credits) return 0;
        const total = (credits.bonus_available || 0) + (credits.bonus_consumed_this_cycle || 0);
        if (total <= 0) return 0;
        return Math.min(100, ((credits.bonus_consumed_this_cycle || 0) / total) * 100);
    }, [credits]);

    const daysLeft = useMemo(() => {
        if (!credits?.resets_on) return null;
        const now = new Date();
        const reset = new Date(credits.resets_on);
        const diff = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    }, [credits]);

    const projectedDailySpend = useMemo(() => {
        if (!credits?.resets_on) return 0;
        const start = new Date(credits.resets_on);
        start.setMonth(start.getMonth() - 1);
        const elapsed = Math.max(1, Math.ceil((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24)));
        return (credits.total_spent_this_cycle || 0) / elapsed;
    }, [credits]);

    const filteredTransactions = useMemo(() => {
        if (activeFilter === 'ALL') return transactions;
        return transactions.filter((tx) => (tx.transaction_type || '').toUpperCase() === activeFilter);
    }, [transactions, activeFilter]);

    return (
        <AppShell title="Credits" subtitle="Track balance, burn, and cycle health">
            <div className="p-6 max-w-[1100px] mx-auto space-y-8">
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <Card className="xl:col-span-2 border-ai/20 shadow-lg shadow-ai/5 overflow-hidden">
                        <CardHeader className="bg-ai/5 border-b border-ai/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-ai" />
                                    <CardTitle>Credit Wallet</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-ai border-ai/30 font-mono uppercase tracking-wider">
                                    {credits?.plan || 'Loading'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <KeyMetric label="Available" value={loading ? '...' : f(credits?.balance || 0)} icon={Wallet} tone="text-accent" />
                                <KeyMetric label="Cycle Spent" value={loading ? '...' : f(credits?.total_spent_this_cycle || 0)} icon={TrendingUp} tone="text-warning" />
                                <KeyMetric label="Monthly Remaining" value={loading ? '...' : f(credits?.monthly_remaining || 0)} icon={ShieldCheck} tone="text-success" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-ink-light">Allowance usage</span>
                                    <span className="font-mono text-ink">{f(credits?.used_this_month || 0)} / {f(credits?.monthly_allowance || 0)}</span>
                                </div>
                                <Progress value={usagePct} className="h-3 bg-paper-mid [&>div]:bg-gradient-to-r [&>div]:from-ai [&>div]:to-accent" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-ink-light">Bonus consumed</span>
                                    <span className="font-mono text-ink">{f(credits?.bonus_consumed_this_cycle || 0)} / {f((credits?.bonus_consumed_this_cycle || 0) + (credits?.bonus_available || 0))}</span>
                                </div>
                                <Progress value={bonusPct} className="h-2 bg-paper-mid [&>div]:bg-info" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="bg-paper-mid/40 border-b border-border-light">
                            <CardTitle className="text-sm">Cycle Health</CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-3 text-sm">
                            <Info label="Resets on" value={shortDate(credits?.resets_on || null)} />
                            <Info label="Days left" value={daysLeft === null ? '-' : `${daysLeft}`} />
                            <Info label="Daily spend (est.)" value={f(projectedDailySpend)} />
                            <Info label="Raw monthly usage" value={f(credits?.raw_used_this_month || 0)} />
                            <Info label="Policy" value={credits?.consumption_policy || '-'} />
                            <Button className="w-full mt-3 gap-2">
                                <CreditCard className="h-4 w-4" />
                                Buy Credits
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/40 border-b border-border-light">
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <div className="flex items-center gap-2">
                                <History className="h-4 w-4 text-muted-foreground" />
                                <CardTitle className="text-sm">Credit Activity</CardTitle>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['ALL', 'DEDUCTION', 'BONUS', 'PURCHASE', 'ADMIN_ADJUSTMENT'].map((item) => (
                                    <Button
                                        key={item}
                                        variant={activeFilter === item ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setActiveFilter(item as any)}
                                        className="text-[10px] uppercase tracking-widest"
                                    >
                                        {item.replace('_', ' ')}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-paper-mid/30 text-ink-light uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="text-left px-4 py-3">Time</th>
                                    <th className="text-left px-4 py-3">Type</th>
                                    <th className="text-left px-4 py-3">Operation</th>
                                    <th className="text-right px-4 py-3">Amount</th>
                                    <th className="text-right px-4 py-3">Balance After</th>
                                    <th className="text-right px-4 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTransactions.map((item) => (
                                    <tr key={item.id} className="border-t border-border-light/60 hover:bg-paper-mid/20">
                                        <td className="px-4 py-3 whitespace-nowrap">{new Date(item.created_at).toLocaleString()}</td>
                                        <td className="px-4 py-3"><Badge variant="outline" className="font-mono">{item.transaction_type}</Badge></td>
                                        <td className="px-4 py-3">{item.operation_type || '-'}</td>
                                        <td className={`px-4 py-3 text-right font-mono ${(item.amount || 0) < 0 ? 'text-danger' : 'text-success'}`}>
                                            {(item.amount || 0) < 0 ? '' : '+'}{f(item.amount || 0)}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono">{f(item.balance_after || 0)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-ink-light">
                                                <Clock3 className="h-3 w-3" /> {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && filteredTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-sm text-muted-foreground">No matching credit activity in this filter.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </CardContent>
                </Card>
            </div>
        </AppShell>
    );
}

function KeyMetric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; tone: string }) {
    return (
        <div className="rounded-lg border border-border-light p-4 bg-white">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-light">{label}</span>
                <Icon className={`h-4 w-4 ${tone}`} />
            </div>
            <p className="text-2xl font-display text-ink">{value}</p>
        </div>
    );
}

function Info({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono text-ink">{value}</span>
        </div>
    );
}
