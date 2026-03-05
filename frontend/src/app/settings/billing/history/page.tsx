"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { api, endpoints } from "@/lib/api";
import { format } from "date-fns";

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
    thread_summary: "Email Summary",
    draft_reply: "Draft Reply",
    task_generation: "Task Generation",
    monthly_allowance: "Monthly Allowance",
    admin_adjustment: "Admin Adjustment",
    bonus: "Bonus Credits",
    purchase: "Credit Purchase",
    refund: "Refund",
};

const ITEMS_PER_PAGE = 25;

export default function BillingHistoryPage() {
    const [page, setPage] = useState(0);

    const { data: transactions = [], isLoading } = useQuery<Transaction[]>({
        queryKey: ["credits-transactions", page],
        queryFn: async () => {
            const { data } = await api.get(endpoints.creditsTransactions, {
                params: {
                    limit: ITEMS_PER_PAGE,
                    offset: page * ITEMS_PER_PAGE
                }
            });
            return data;
        },
    });

    const isNextDisabled = transactions.length < ITEMS_PER_PAGE;
    const isPrevDisabled = page === 0;

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/settings/billing">
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-paper-mid">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="font-display text-2xl text-ink">Credit History</h1>
                    <p className="text-muted text-sm">A complete log of your credit usage and refills.</p>
                </div>
            </div>

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-paper-mid border-b border-border-light text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                <tr>
                                    <th className="px-6 py-3 font-bold">Date & Time</th>
                                    <th className="px-6 py-3 font-bold">Operation</th>
                                    <th className="px-6 py-3 font-bold">Credit Change</th>
                                    <th className="px-6 py-3 font-bold text-right">Balance After</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted">
                                            <div className="flex justify-center mb-2">
                                                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            Loading history...
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted">
                                            {page === 0 ? "You have no credit history yet." : "No more transactions found."}
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map(t => (
                                        <tr key={t.id} className="hover:bg-paper-mid/30 transition-colors">
                                            <td className="px-6 py-3">
                                                <p className="text-sm text-ink">{format(new Date(t.created_at), "MMM d, yyyy")}</p>
                                                <p className="text-xs text-muted font-mono">{format(new Date(t.created_at), "HH:mm:ss")}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <p className="text-sm font-medium text-ink">
                                                    {OPERATION_LABELS[t.operation_type || t.transaction_type] || t.operation_type || t.transaction_type}
                                                </p>
                                                <p className="text-[10px] text-muted font-mono uppercase tracking-wider">{t.status}</p>
                                            </td>
                                            <td className="px-6 py-3">
                                                <span className={`text-sm font-bold ${t.amount > 0 ? "text-success" : "text-danger"}`}>
                                                    {t.amount > 0 ? "+" : ""}{t.amount}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <span className="text-sm font-mono text-ink-light">
                                                    {t.balance_after}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    <div className="p-4 border-t border-border-light flex items-center justify-between">
                        <span className="text-xs text-muted">
                            Showing page {page + 1}
                        </span>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isPrevDisabled}
                                onClick={() => setPage(p => Math.max(0, p - 1))}
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isNextDisabled}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
