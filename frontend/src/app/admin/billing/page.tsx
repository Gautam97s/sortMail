'use client';

import React from 'react';
import {
    CreditCard,
    TrendingUp,
    Users,
    ArrowLeft,
    Download,
    Filter,
    ArrowUpRight,
    DollarSign,
    RefreshCw,
    AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockTransactions = [
    { id: 't1', user: 'Marcus Aurelius', amount: '$499.00', status: 'Succeeded', date: '2024-02-28', plan: 'Enterprise' },
    { id: 't2', user: 'Sarah Connor', amount: '$49.00', status: 'Succeeded', date: '2024-02-27', plan: 'Pro' },
    { id: 't3', user: 'Thomas Anderson', amount: '$49.00', status: 'Pending', date: '2024-02-26', plan: 'Pro' },
    { id: 't4', user: 'Ellen Ripley', amount: '$499.00', status: 'Failed', date: '2024-02-25', plan: 'Enterprise' },
    { id: 't5', user: 'Arthur Dent', amount: '$0.00', status: 'Free', date: '2024-02-24', plan: 'Free' },
];

export default function BillingManagementPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Billing & Revenue</h1>
                        <p className="text-ink-light text-sm">Managing subscriptions, transactions, and financial health.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Download size={14} className="mr-2" /> Financial Export
                    </Button>
                </div>
            </div>

            {/* Billing Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BillingStat label="Monthly Revenue (MRR)" value="$42,500" sub="+8.2% vs last month" icon={TrendingUp} color="text-success" />
                <BillingStat label="Active Paid Users" value="842" sub="65% conversion rate" icon={Users} color="text-info" />
                <BillingStat label="Churn Rate" value="2.4%" sub="Industry leading" icon={ArrowUpRight} color="text-accent" />
                <BillingStat label="Pending Invoices" value="12" sub="$4,280 total value" icon={AlertCircle} color="text-warning" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Transactions */}
                <Card className="lg:col-span-2 border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Recent Transactions
                            <RefreshCw size={14} className="opacity-40" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-paper-mid/20 text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                    <tr>
                                        <th className="px-6 py-3">Date</th>
                                        <th className="px-6 py-3">Customer</th>
                                        <th className="px-6 py-3">Plan</th>
                                        <th className="px-6 py-3">Amount</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light text-sm">
                                    {mockTransactions.map((tx) => (
                                        <tr key={tx.id} className="hover:bg-paper-mid/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-ink-light">{tx.date}</td>
                                            <td className="px-6 py-4 font-medium text-ink">{tx.user}</td>
                                            <td className="px-6 py-4 text-xs font-mono text-ink-mid">{tx.plan}</td>
                                            <td className="px-6 py-4 font-mono font-bold">{tx.amount}</td>
                                            <td className="px-6 py-4 text-center">
                                                <TransactionStatus txStatus={tx.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Billing Health Checklist */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm bg-paper-mid/30">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <DollarSign size={14} /> Revenue Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <BillingMetricItem label="Avg Revenue per User" value="$42.50" />
                            <BillingMetricItem label="LTV (Estimated)" value="$1,240" />
                            <BillingMetricItem label="CAC (Global)" value="$85.00" />
                            <Button className="w-full h-10 font-bold uppercase tracking-wider text-[10px] bg-accent mt-2 shadow-sm">
                                Open Billing Stripe Dashboard
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm border-l-4 border-l-success">
                        <CardContent className="p-5 flex gap-4">
                            <TrendingUp className="text-success shrink-0" size={20} />
                            <div>
                                <h5 className="text-[10px] font-bold text-success uppercase mb-1">Growth Streak</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    SortMail has maintained positive MRR growth for 12 consecutive weeks.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BillingStat({ label, value, sub, icon: Icon, color }: any) {
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

function TransactionStatus({ txStatus }: { txStatus: string }) {
    const styles: Record<string, string> = {
        'Succeeded': 'bg-success/10 text-success border-success/20',
        'Pending': 'bg-warning/10 text-warning border-warning/20',
        'Failed': 'bg-danger/10 text-danger border-danger/20',
        'Free': 'bg-paper-mid text-ink-light border-border-light',
    };
    return (
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-block min-w-[80px] ${styles[txStatus]}`}>
            {txStatus}
        </span>
    );
}

function BillingMetricItem({ label, value }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border-light/50 last:border-0">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{label}</span>
            <span className="text-xs font-bold text-ink">{value}</span>
        </div>
    );
}
