"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { formatDistanceToNow, format } from "date-fns";
import { Progress } from "@/components/ui/progress";

const MaterialSymbol = ({ icon, filled = false, className = "" }: { icon: string; filled?: boolean; className?: string }) => (
    <span 
        className={`material-symbols-outlined ${className}`}
        style={{ fontVariationSettings: `'FILL' ${filled ? 1 : 0}` }}
    >
        {icon}
    </span>
);

interface CreditBalance {
    balance: number;
    plan: string;
    monthly_allowance: number;
    used_this_month: number;
    resets_on?: string;
}

interface Transaction {
    id: string;
    amount: number;
    balance_after: number;
    transaction_type: string;
    operation_type?: string;
    status: string;
    created_at: string;
}

const OPERATION_LABELS: Record<string, string> = {
    thread_summary: "Email Insight Synthesis",
    draft_reply: "Neural Draft Manifestation",
    task_generation: "Actionable Entity Extraction",
    monthly_allowance: "Matrix Allocation",
    admin_adjustment: "Manual Re-calibration",
    bonus: "Intelligence Bonus",
    purchase: "Matrix Expansion Purchase",
    refund: "Resource Restoration",
};

export default function SettingsBillingPage() {
    const { data: credits, isLoading: creditsLoading } = useQuery<CreditBalance>({
        queryKey: ["credits-me"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.creditsMe);
            return data;
        },
    });

    const { data: transactions = [], isLoading: txLoading } = useQuery<Transaction[]>({
        queryKey: ["credits-transactions"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.creditsTransactions, { params: { limit: 12 } });
            return data;
        },
    });

    const remainingMonthlyCredits = credits
        ? Math.max((credits.monthly_allowance || 0) - (credits.used_this_month || 0), 0)
        : 0;

    // Utilization matrix represents current billing-cycle allowance remaining,
    // not total wallet balance (which can exceed monthly allowance).
    const balancePct = credits && credits.monthly_allowance > 0
        ? Math.round((remainingMonthlyCredits / credits.monthly_allowance) * 100)
        : 0;

    const balanceColorClass = balancePct > 50 ? "text-primary" : balancePct > 20 ? "text-tertiary" : "text-error";
    const balanceBgClass = balancePct > 50 ? "bg-primary/10" : balancePct > 20 ? "bg-tertiary/10" : "bg-error/10";

    return (
        <div className="max-w-4xl space-y-12">
            <div className="space-y-1">
                <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Resource Management</h1>
                <p className="text-sm font-medium text-on-surface-variant opacity-80">Monitor intelligence allocations and transactional history.</p>
            </div>

            {/* Credit Balance Hub */}
            <div className="bg-white rounded-[40px] border border-outline-variant/10 p-10 space-y-10 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <MaterialSymbol icon="bolt" className="text-[200px]" />
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary-fixed/20 text-primary rounded-xl flex items-center justify-center">
                                <MaterialSymbol icon="offline_bolt" filled />
                            </div>
                            <div className="px-3 py-1 bg-on-surface text-surface font-black text-[9px] rounded-full uppercase tracking-widest">
                                {credits?.plan?.toUpperCase() || 'STANDARD'} ARCHITECTURE
                            </div>
                        </div>
                        <div className="flex items-baseline gap-4">
                            <span className="text-6xl font-headline font-bold text-on-surface tabular-nums">{credits?.balance ?? 0}</span>
                            <span className="text-sm font-black text-outline-variant uppercase tracking-widest">Available Credits</span>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button className="h-14 px-8 bg-primary text-on-primary rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                            <MaterialSymbol icon="upgrade" className="text-xl" />
                            Elevate Plan
                        </button>
                        <button className="h-14 px-8 bg-surface-container text-on-surface rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all border border-outline-variant/10">
                            <MaterialSymbol icon="add_card" className="text-xl" />
                            Inject Resources
                        </button>
                    </div>
                </div>

                <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-end text-[10px] font-black text-outline-variant uppercase tracking-widest px-1">
                        <div className="flex items-center gap-2">
                            <MaterialSymbol icon="analytics" className="text-sm" />
                            Utilization Matrix
                        </div>
                        <div className={balanceColorClass}>
                            {balancePct}% REMAINING
                        </div>
                    </div>
                    <div className="h-4 bg-surface-container rounded-full overflow-hidden border border-outline-variant/5 shadow-inner p-1">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${balancePct > 50 ? 'bg-primary shadow-[0_0_10px_rgba(var(--color-primary),0.3)]' : balancePct > 20 ? 'bg-tertiary' : 'bg-error'}`} 
                            style={{ width: `${balancePct}%` }} 
                        />
                    </div>
                    <div className="flex justify-between items-center px-1">
                        <p className="text-[10px] font-medium text-outline-variant italic">
                            Monthly allocation resets {credits?.resets_on ? format(new Date(credits.resets_on), "MMMM do, yyyy") : 'at end of cycle'}
                        </p>
                        <div className="text-[10px] font-black text-outline-variant uppercase tracking-widest">
                            {credits?.used_this_month ?? 0} / {credits?.monthly_allowance ?? 0} Consumed
                        </div>
                    </div>
                </div>
            </div>

            {/* Neural Transaction Ledger */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-xl bg-surface-container flex items-center justify-center text-outline">
                            <MaterialSymbol icon="receipt_long" />
                        </div>
                        <h2 className="font-headline text-xl font-bold text-on-surface tracking-tight">Transactional Ledger</h2>
                    </div>
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline px-4 py-2 hover:bg-primary-fixed/10 rounded-xl transition-all">
                        Complete History
                    </button>
                </div>

                {txLoading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded-[24px] bg-surface-container-low animate-pulse border border-outline-variant/10" />)}
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-[40px] border border-outline-variant/10 shadow-sm space-y-4">
                        <MaterialSymbol icon="history" className="text-4xl text-outline-variant opacity-30" />
                        <p className="text-sm font-medium text-outline-variant uppercase tracking-widest">No financial manifestations detected</p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {transactions.map(t => (
                            <div key={t.id} className="group bg-white rounded-[24px] p-5 flex items-center justify-between border border-outline-variant/10 hover:border-primary-fixed/30 hover:shadow-md transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`h-10 w-10 rounded-[14px] flex items-center justify-center border border-outline-variant/5 shadow-inner ${t.amount > 0 ? 'bg-primary-fixed/20 text-primary' : 'bg-surface-container text-outline'}`}>
                                        <MaterialSymbol icon={t.amount > 0 ? 'account_balance_wallet' : 'token'} className="text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-on-surface tracking-tight">
                                            {OPERATION_LABELS[t.operation_type || t.transaction_type] || t.transaction_type}
                                        </p>
                                        <p className="text-[10px] font-black text-outline-variant uppercase tracking-widest opacity-60 flex items-center gap-2">
                                            <MaterialSymbol icon="schedule" className="text-[10px]" />
                                            {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`text-lg font-headline font-bold tabular-nums ${t.amount > 0 ? 'text-primary' : 'text-on-surface'}`}>
                                        {t.amount > 0 ? '+' : ''}{t.amount}
                                    </div>
                                    <div className="text-[10px] font-black text-outline-variant uppercase tracking-widest opacity-40">
                                        Post-Manifest: {t.balance_after}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Information Callout */}
            <div className="p-6 bg-surface-container-low border border-outline-variant/10 rounded-[32px] flex items-start gap-4">
                <div className="h-8 w-8 rounded-lg bg-white border border-outline-variant/10 flex items-center justify-center text-primary mt-0.5">
                    <MaterialSymbol icon="info" className="text-lg" />
                </div>
                <div className="space-y-1">
                    <p className="text-xs font-black text-on-surface uppercase tracking-widest">Resource Sovereignty</p>
                    <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed opacity-80">
                        Credits represent units of neural computation within the SortMail ecosystem. Allocations reset at the start of each billing cycle. Unused units do not manifest in subsequent cycles unless specified by higher-tier architecture plans.
                    </p>
                </div>
            </div>
        </div>
    );
}
