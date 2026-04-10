'use client';

import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Layers, BarChart3, ArrowLeft, TrendingUp, Activity, RefreshCw, LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { api, endpoints } from '@/lib/api';

type AIUsageRecord = {
    id: string;
    created_at: string | null;
    user_id: string;
    operation_type: string;
    model_name: string;
    provider: string | null;
    tokens_input: number;
    tokens_output: number;
    tokens_total: number;
    cost_cents: number;
    latency_ms: number | null;
    error_occurred: boolean;
    error_type: string | null;
};

type AIUsageResponse = {
    window: {
        hours: number;
        since: string;
    };
    totals: {
        calls: number;
        tokens_input: number;
        tokens_output: number;
        tokens_total: number;
        cost_cents: number;
        errors: number;
        avg_tokens_per_call: number;
        error_rate_pct: number;
    };
    bedrock: {
        calls: number;
        tokens_input: number;
        tokens_output: number;
        tokens_total: number;
        cost_cents: number;
        errors: number;
        avg_tokens_per_call: number;
        error_rate_pct: number;
    };
    by_model: Array<{
        model_name: string;
        calls: number;
        tokens_total: number;
        avg_latency_ms: number;
        errors: number;
    }>;
    records: AIUsageRecord[];
};

function formatNumber(value: number): string {
    return new Intl.NumberFormat().format(value || 0);
}

function formatUsdFromCents(cents: number): string {
    return `$${((cents || 0) / 100).toFixed(2)}`;
}

export default function AIUsagePage() {
    const [hours, setHours] = useState(24);

    const { data, isLoading, isFetching, isError, refetch } = useQuery<AIUsageResponse>({
        queryKey: ['admin-ai-usage', hours],
        queryFn: async () => {
            const response = await api.get(endpoints.adminMetricsAIUsage, {
                params: {
                    hours,
                    limit: 200,
                },
            });
            return response.data;
        },
        refetchInterval: 30000,
        staleTime: 10000,
    });

    const modelRows = useMemo(() => data?.by_model ?? [], [data]);
    const records = useMemo(() => data?.records ?? [], [data]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">AI Intelligence Usage</h1>
                        <p className="text-ink-light text-sm">Live Bedrock calls, token usage, and error telemetry from admin metrics API.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="h-10 rounded-md border border-border-light bg-white px-3 text-xs font-bold uppercase tracking-wider text-ink"
                    >
                        <option value={1}>Last 1h</option>
                        <option value={6}>Last 6h</option>
                        <option value={24}>Last 24h</option>
                        <option value={72}>Last 72h</option>
                        <option value={168}>Last 7d</option>
                    </select>
                    <Button
                        onClick={() => refetch()}
                        variant="outline"
                        className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm"
                    >
                        <RefreshCw size={14} className={`mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
                    </Button>
                </div>
            </div>

            {isError && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-4 text-sm text-red-700">
                        Failed to load admin AI usage metrics.
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UsageStat
                    label="Bedrock Tokens"
                    value={isLoading ? '...' : formatNumber(data?.bedrock.tokens_total || 0)}
                    sub={isLoading ? 'Loading...' : `${formatNumber(data?.bedrock.calls || 0)} Bedrock calls`}
                    icon={Layers}
                    color="text-ai"
                />
                <UsageStat
                    label="Avg Tokens/Call"
                    value={isLoading ? '...' : formatNumber(Math.round(data?.bedrock.avg_tokens_per_call || 0))}
                    sub={isLoading ? 'Loading...' : `All providers: ${formatNumber(Math.round(data?.totals.avg_tokens_per_call || 0))}`}
                    icon={Zap}
                    color="text-accent"
                />
                <UsageStat
                    label="Bedrock Error Rate"
                    value={isLoading ? '...' : `${(data?.bedrock.error_rate_pct || 0).toFixed(2)}%`}
                    sub={isLoading ? 'Loading...' : `${formatNumber(data?.bedrock.errors || 0)} errors`}
                    icon={Activity}
                    color="text-warning"
                />
                <UsageStat
                    label="Total Cost"
                    value={isLoading ? '...' : formatUsdFromCents(data?.totals.cost_cents || 0)}
                    sub={isLoading ? 'Loading...' : `Bedrock: ${formatUsdFromCents(data?.bedrock.cost_cents || 0)}`}
                    icon={BarChart3}
                    color="text-info"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Top Models By Tokens
                            <TrendingUp size={14} className="text-success" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 bg-white">
                        <div className="space-y-3">
                            {modelRows.slice(0, 8).map((row) => {
                                const pct = data?.totals.tokens_total ? (row.tokens_total / data.totals.tokens_total) * 100 : 0;
                                return (
                                    <div key={row.model_name} className="space-y-1">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-medium text-ink truncate pr-4">{row.model_name}</span>
                                            <span className="font-mono text-ink-light">{formatNumber(row.tokens_total)} tokens</span>
                                        </div>
                                        <div className="h-2 w-full rounded bg-paper-mid overflow-hidden">
                                            <div className="h-full bg-ai" style={{ width: `${Math.max(2, pct)}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                            {!isLoading && modelRows.length === 0 && (
                                <p className="text-sm text-ink-light">No usage records in selected window.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            Window Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <SummaryLine label="Since" value={data?.window?.since ? new Date(data.window.since).toLocaleString() : '-'} />
                        <SummaryLine label="Total Calls" value={formatNumber(data?.totals.calls || 0)} />
                        <SummaryLine label="Input Tokens" value={formatNumber(data?.totals.tokens_input || 0)} />
                        <SummaryLine label="Output Tokens" value={formatNumber(data?.totals.tokens_output || 0)} />
                        <SummaryLine label="Total Tokens" value={formatNumber(data?.totals.tokens_total || 0)} />
                        <SummaryLine label="Total Errors" value={formatNumber(data?.totals.errors || 0)} />
                        <SummaryLine label="Error Rate" value={`${(data?.totals.error_rate_pct || 0).toFixed(2)}%`} />
                        <SummaryLine label="Cost" value={formatUsdFromCents(data?.totals.cost_cents || 0)} />
                    </CardContent>
                </Card>
            </div>

            <Card className="border-border-light shadow-sm overflow-hidden">
                <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                    <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                        Recent AI Calls
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-paper-mid/30 text-ink-light uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="text-left px-4 py-3">Time</th>
                                    <th className="text-left px-4 py-3">Model</th>
                                    <th className="text-left px-4 py-3">Operation</th>
                                    <th className="text-left px-4 py-3">User</th>
                                    <th className="text-right px-4 py-3">Input</th>
                                    <th className="text-right px-4 py-3">Output</th>
                                    <th className="text-right px-4 py-3">Total</th>
                                    <th className="text-right px-4 py-3">Latency</th>
                                    <th className="text-right px-4 py-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.slice(0, 100).map((row) => (
                                    <tr key={row.id} className="border-t border-border-light/60 hover:bg-paper-mid/20">
                                        <td className="px-4 py-3 whitespace-nowrap">{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</td>
                                        <td className="px-4 py-3 max-w-[260px] truncate" title={row.model_name}>{row.model_name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{row.operation_type}</td>
                                        <td className="px-4 py-3 font-mono max-w-[180px] truncate" title={row.user_id}>{row.user_id}</td>
                                        <td className="px-4 py-3 text-right font-mono">{formatNumber(row.tokens_input || 0)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{formatNumber(row.tokens_output || 0)}</td>
                                        <td className="px-4 py-3 text-right font-mono font-bold">{formatNumber(row.tokens_total || 0)}</td>
                                        <td className="px-4 py-3 text-right font-mono">{row.latency_ms ?? '-'}</td>
                                        <td className="px-4 py-3 text-right">
                                            {row.error_occurred ? <span className="text-red-600 font-bold">Yes</span> : <span className="text-green-700">No</span>}
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && records.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-4 py-10 text-center text-ink-light">
                                            No AI usage records found for this window.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        {isLoading && <div className="p-6 text-sm text-ink-light">Loading usage records...</div>}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

function UsageStat({
    label,
    value,
    sub,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    sub: string;
    icon: LucideIcon;
    color: string;
}) {
    return (
        <Card className="border-border-light shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{label}</span>
                    <Icon size={16} className={color} />
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-display text-ink">{value}</p>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp size={10} className="text-success" />
                    <p className="text-[10px] text-ink-light font-mono leading-none">{sub}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between text-xs">
            <span className="text-ink-light">{label}</span>
            <span className="font-mono text-ink">{value}</span>
        </div>
    );
}
