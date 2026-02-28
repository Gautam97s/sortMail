'use client';

import React from 'react';
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Download,
    MoreHorizontal,
    User,
    ArrowUpRight,
    ArrowDownLeft,
    CreditCard,
    Zap,
    LifeBuoy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockTransactions = [
    { id: 'tx_123456', user: 'Marcus Aurelius', type: 'Purchase', amount: '+50,000', method: 'Stripe', status: 'Success', date: '2024-02-28 14:24' },
    { id: 'tx_123457', user: 'Sarah Connor', type: 'AI Usage', amount: '-1,240', method: 'Automatic', status: 'Success', date: '2024-02-28 14:15' },
    { id: 'tx_123458', user: 'Thomas Anderson', type: 'Refund', amount: '+500', method: 'Admin Manual', status: 'Success', date: '2024-02-28 13:50' },
    { id: 'tx_123459', user: 'Ellen Ripley', type: 'AI Usage', amount: '-4,100', method: 'Automatic', status: 'Success', date: '2024-02-28 12:30' },
    { id: 'tx_123460', user: 'Arthur Dent', type: 'Purchase', amount: '+10,000', method: 'PayPal', status: 'Failed', date: '2024-02-28 11:05' },
];

export default function CreditTransactionsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin/credits" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Credits Overview
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Transaction Ledger</h1>
                        <p className="text-ink-light text-sm">Immutable audit log of all credit movements including purchases, AI consumption, and manual adjustments.</p>
                    </div>
                </div>
                <Button variant="outline" className="h-10 border-border-light text-xs font-bold uppercase tracking-wider shadow-sm gap-2">
                    <Download size={14} /> Export CSV
                </Button>
            </div>

            <Card className="border-border-light shadow-sm overflow-hidden">
                <div className="p-4 bg-paper-mid/50 border-b border-border-light flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID, User, or Amount..."
                            className="pl-9 h-9 text-xs border-border-light bg-white"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border-light text-ink text-[10px] font-bold uppercase tracking-widest bg-white">
                            <Filter size={12} /> Type
                        </Button>
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border-light text-ink text-[10px] font-bold uppercase tracking-widest bg-white">
                            Status
                        </Button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-paper-mid/20 text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                            <tr>
                                <th className="px-6 py-3">Transaction ID</th>
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3 text-center">Type</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3">Method</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light text-sm">
                            {mockTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-paper-mid/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] text-ink-mid">{tx.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-paper-mid flex items-center justify-center shrink-0 border border-border-light">
                                                <User size={10} className="text-ink-light" />
                                            </div>
                                            <span className="text-xs font-medium text-ink">{tx.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <TransactionTypeUI type={tx.type} />
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold text-xs ${tx.amount.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                                        {tx.amount}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono text-ink-light uppercase">{tx.method}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono text-ink-light">{tx.date}</td>
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
                <div className="p-4 bg-paper-mid/10 border-t border-border-light flex justify-between items-center text-[10px] font-mono text-ink-light">
                    <span>Showing 1-5 of 12,482 transactions</span>
                    <div className="flex gap-1">
                        <Button disabled size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase border-border-light bg-white">Previous</Button>
                        <Button size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase border-border-light bg-white">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function TransactionTypeUI({ type }: { type: string }) {
    const icons: Record<string, any> = {
        'Purchase': CreditCard,
        'AI Usage': Zap,
        'Refund': LifeBuoy,
    };
    const Icon = icons[type] || History;
    return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-paper-mid border border-border-light text-[9px] font-bold text-ink-mid uppercase">
            <Icon size={10} className="text-accent" />
            {type}
        </span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const active = status === 'Success';
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-success' : 'bg-danger'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${active ? 'text-success' : 'text-danger'}`}>{status}</span>
        </div>
    );
}
