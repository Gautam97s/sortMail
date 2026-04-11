'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    History,
    Search,
    Filter,
    ArrowLeft,
    Download,
    MoreHorizontal,
    User,
    CreditCard,
    Zap,
    LifeBuoy,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { api, endpoints } from '@/lib/api';

type LedgerTransaction = {
    id: string;
    user_id: string;
    user_email?: string | null;
    user_name?: string | null;
    amount: number;
    balance_after: number;
    transaction_type: string;
    operation_type?: string | null;
    status: string;
    created_at: string;
};

export default function CreditTransactionsPage() {
    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get<LedgerTransaction[]>(endpoints.adminCreditsTransactions, {
                    params: {
                        limit: 100,
                        offset: 0,
                        query: query || undefined,
                        transaction_type: typeFilter || undefined,
                        status: statusFilter || undefined,
                    },
                });
                if (!mounted) return;
                setTransactions(data || []);
            } catch {
                if (!mounted) return;
                setTransactions([]);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [query, typeFilter, statusFilter]);

    const rows = useMemo(() => transactions.map((tx) => {
        const amountSigned = tx.amount >= 0 ? `+${tx.amount}` : `${tx.amount}`;
        return {
            ...tx,
            amountSigned,
            userLabel: tx.user_name || tx.user_email || tx.user_id,
            method: tx.operation_type || tx.transaction_type,
        };
    }), [transactions]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
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
                <Button variant="outline" disabled title="Export is not wired yet" className="h-10 border-border-light text-xs font-bold uppercase tracking-wider shadow-sm gap-2">
                    <Download size={14} /> Export CSV
                </Button>
            </div>

            <Card className="border-border-light shadow-sm overflow-hidden">
                <div className="p-4 bg-paper-mid/50 border-b border-border-light flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search by ID, user, or amount..."
                            className="pl-9 h-9 text-xs border-border-light bg-white"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-border-light bg-white text-[10px] font-bold uppercase tracking-widest text-ink"
                            aria-label="Filter transaction type"
                        >
                            <option value="">All Types</option>
                            <option value="PURCHASE">Purchase</option>
                            <option value="DEDUCTION">AI Usage</option>
                            <option value="REFUND">Refund</option>
                            <option value="ADMIN_ADJUSTMENT">Admin Adjustment</option>
                            <option value="MONTHLY_ALLOWANCE">Monthly Allowance</option>
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 px-3 rounded-md border border-border-light bg-white text-[10px] font-bold uppercase tracking-widest text-ink"
                            aria-label="Filter transaction status"
                        >
                            <option value="">All Statuses</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="RESERVED">Reserved</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <Button variant="outline" size="sm" disabled title="Filter icon" className="h-9 gap-2 border-border-light text-ink text-[10px] font-bold uppercase tracking-widest bg-white">
                            <Filter size={12} /> Filter
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
                            {rows.map((tx) => (
                                <tr key={tx.id} className="hover:bg-paper-mid/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] text-ink-mid">{tx.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-paper-mid flex items-center justify-center shrink-0 border border-border-light">
                                                <User size={10} className="text-ink-light" />
                                            </div>
                                            <span className="text-xs font-medium text-ink">{tx.userLabel}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <TransactionTypeUI type={tx.transaction_type} />
                                    </td>
                                    <td className={`px-6 py-4 text-right font-mono font-bold text-xs ${tx.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                        {tx.amountSigned}
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono text-ink-light uppercase">{tx.method}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={tx.status} />
                                    </td>
                                    <td className="px-6 py-4 text-[10px] font-mono text-ink-light">{new Date(tx.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" disabled title="Row actions are not wired yet" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal size={14} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {!loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-ink-light">No transaction ledger entries available.</td>
                                </tr>
                            )}
                            {loading && (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-ink-light">Loading transaction ledger...</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 bg-paper-mid/10 border-t border-border-light flex justify-between items-center text-[10px] font-mono text-ink-light">
                    <span>Showing {rows.length} transactions</span>
                    <div className="flex gap-1">
                        <Button disabled size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase border-border-light bg-white">Previous</Button>
                        <Button disabled size="sm" variant="outline" className="h-7 text-[9px] font-bold uppercase border-border-light bg-white">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function TransactionTypeUI({ type }: { type: string }) {
    const icons: Record<string, any> = {
        PURCHASE: CreditCard,
        DEDUCTION: Zap,
        REFUND: LifeBuoy,
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
    const active = status === 'COMPLETED';
    return (
        <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-success' : 'bg-danger'}`} />
            <span className={`text-[10px] font-mono font-bold uppercase ${active ? 'text-success' : 'text-danger'}`}>{status}</span>
        </div>
    );
}
