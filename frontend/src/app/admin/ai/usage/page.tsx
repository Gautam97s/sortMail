'use client';

import React from 'react';
import {
    Zap,
    Layers,
    AlertTriangle,
    BarChart3,
    PieChart,
    ArrowLeft,
    TrendingUp,
    TrendingDown,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AIUsagePage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">AI Intelligence Usage</h1>
                        <p className="text-ink-light text-sm">Monitoring model inference, token consumption, and cost efficiency.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <UsageStat label="Total Tokens" value="1.2M" sub="+14% vs yesterday" icon={Layers} color="text-ai" trend="up" />
                <UsageStat label="Avg Tokens/Req" value="842" sub="Optimized by 5%" icon={Zap} color="text-accent" trend="down" />
                <UsageStat label="Error Rate" value="0.04%" sub="System healthy" icon={Activity} color="text-success" trend="stable" />
                <UsageStat label="Daily Cost" value="$142.50" sub="Within budget" icon={BarChart3} color="text-info" trend="up" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Usage Chart Placeholder */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Token Consumption (Last 24h)
                            <TrendingUp size={14} className="text-success" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center min-h-[300px] bg-white">
                        <div className="w-full h-full flex items-end justify-between px-8 py-12 gap-2">
                            {[40, 60, 45, 90, 65, 30, 85, 45, 70, 50, 95, 80].map((h, i) => (
                                <div key={i} className="flex-1 bg-ai/10 border border-ai/20 rounded-t-sm relative group hover:bg-ai/30 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ink text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-mono">
                                        {h * 12}k tokens
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="w-full border-t border-border-light/50 p-4 bg-paper-mid/30 flex justify-between text-[9px] font-mono text-ink-light uppercase tracking-widest">
                            <span>00:00</span>
                            <span>06:00</span>
                            <span>12:00</span>
                            <span>18:00</span>
                            <span>23:59</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Model Distribution */}
                <Card className="border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            Model Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <DistributionItem label="GPT-4o (Standard)" value="72%" count="3.2k req" color="bg-ai" />
                        <DistributionItem label="GPT-4o-mini (Speed)" value="24%" count="1.1k req" color="bg-accent" />
                        <DistributionItem label="Gemini 1.5 Pro" value="4%" count="180 req" color="bg-info" />

                        <div className="pt-4 border-t border-border-light">
                            <div className="p-4 bg-warning/5 rounded-xl border border-warning/20 flex gap-3">
                                <AlertTriangle className="text-warning shrink-0" size={16} />
                                <div className="space-y-1">
                                    <h5 className="text-[10px] font-bold text-warning uppercase">Cost optimization alert</h5>
                                    <p className="text-[10px] text-ink-light font-medium leading-relaxed">
                                        Consider moving 12% of summarizing tasks to GPT-4o-mini to save approx. $12/day.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function UsageStat({ label, value, sub, icon: Icon, color, trend }: any) {
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
                    {trend === 'up' && <TrendingUp size={10} className="text-danger" />}
                    {trend === 'down' && <TrendingDown size={10} className="text-success" />}
                    <p className="text-[10px] text-ink-light font-mono leading-none">{sub}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function DistributionItem({ label, value, count, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-ink">{label}</span>
                <span className="text-[10px] font-mono text-ink-mid">{value} • {count}</span>
            </div>
            <div className="h-1.5 w-full bg-paper-mid rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: value }} />
            </div>
        </div>
    );
}
