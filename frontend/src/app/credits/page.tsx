'use client';

import { useEffect, useMemo, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CreditCard, History, Zap, TrendingUp } from 'lucide-react';
import { api, endpoints } from '@/lib/api';

type CreditBalance = {
    balance: number;
    plan: string;
    monthly_allowance: number;
    used_this_month: number;
    resets_on: string | null;
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

export default function CreditsPage() {
    const [credits, setCredits] = useState<CreditBalance | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [loading, setLoading] = useState(true);

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

    const percentUsed = useMemo(() => {
        if (!credits || credits.monthly_allowance <= 0) return 0;
        return Math.min(100, (credits.used_this_month / credits.monthly_allowance) * 100);
    }, [credits]);

    const available = credits?.balance ?? 0;
    const used = credits?.used_this_month ?? 0;
    const allowance = credits?.monthly_allowance ?? 0;

    return (
        <AppShell title="AI Credits" subtitle="Manage your intelligence quota">
            <div className="p-6 max-w-4xl mx-auto space-y-8">

                {/* Balance Card */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 overflow-hidden border-ai/20 shadow-lg shadow-ai/5">
                        <CardHeader className="bg-ai/5 border-b border-ai/10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5 text-ai" />
                                    <CardTitle>Current Balance</CardTitle>
                                </div>
                                <Badge variant="outline" className="text-ai border-ai/30">{credits?.plan ? credits.plan.toUpperCase() : 'LOADING'}</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-4xl font-display text-ink">{loading ? '...' : available}</p>
                                        <p className="text-sm text-muted-foreground uppercase font-mono tracking-tighter">Credits available</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-mono text-muted-foreground">{loading ? '...' : `${used} / ${allowance} used`}</p>
                                    </div>
                                </div>
                                <Progress value={percentUsed} className="h-3 bg-paper-mid [&>div]:bg-gradient-to-r from-ai to-purple-400" />
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <TrendingUp className="h-4 w-4 text-success" />
                                    <span>
                                        Quota resets on <span className="text-ink font-medium">{credits?.resets_on ? new Date(credits.resets_on).toLocaleDateString() : 'unknown'}</span>
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-paper-deep border-border flex flex-col justify-center items-center p-6 text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
                            <Zap className="h-8 w-8 text-accent" />
                        </div>
                        <div>
                            <h3 className="font-display text-lg">Running low?</h3>
                            <p className="text-xs text-muted-foreground mt-1">Get instant credits for high-volume periods.</p>
                        </div>
                        <Button className="w-full gap-2">
                            <CreditCard className="h-4 w-4" />
                            Buy Credits
                        </Button>
                    </Card>
                </div>

                {/* Pricing Packs */}
                <div className="space-y-4">
                    <h2 className="font-display text-xl">Top-up Packs</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                        {[
                            { name: 'Starter', credits: '500', price: '$9', color: 'bg-info' },
                            { name: 'Pro', credits: '2,000', price: '$29', color: 'bg-ai', bestValue: true },
                            { name: 'Elite', credits: '5,000', price: '$59', color: 'bg-accent' },
                        ].map((pack, i) => (
                            <Card key={i} className={`relative group hover:border-accent/40 transition-all ${pack.bestValue ? 'border-accent' : ''}`}>
                                {pack.bestValue && (
                                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white px-3 py-1">Best Value</Badge>
                                )}
                                <CardContent className="p-6 text-center space-y-4">
                                    <div className={`w-10 h-10 rounded-lg ${pack.color}/10 mx-auto flex items-center justify-center`}>
                                        <Sparkles className={`h-5 w-5 ${pack.color.replace('bg-', 'text-')}`} />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-display">{pack.credits}</p>
                                        <p className="text-xs text-muted-foreground uppercase font-mono tracking-widest">{pack.name} PACK</p>
                                    </div>
                                    <p className="text-3xl font-display text-accent">{pack.price}</p>
                                    <Button variant="outline" className="w-full text-xs">Purchase Pack</Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Usage History */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <h2 className="font-display text-xl">Usage History</h2>
                    </div>
                    <Card>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border">
                                {transactions.length > 0 ? transactions.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-paper-mid transition-colors">
                                        <div>
                                            <p className="font-medium text-sm">{item.operation_type || item.transaction_type}</p>
                                            <p className="text-xs text-muted-foreground">Balance after: {item.balance_after}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-mono text-ink">{item.amount < 0 ? `${item.amount}` : `+${item.amount}`}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-mono">{new Date(item.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="p-8 text-center text-sm text-muted-foreground">No credit activity yet.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppShell>
    );
}
