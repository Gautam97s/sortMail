'use client';

import React from 'react';
import {
    TrendingUp,
    Users,
    UserCheck,
    MousePointer2,
    BarChart3,
    ArrowLeft,
    ChevronRight,
    Target,
    Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AnalyticsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Growth & Analytics</h1>
                        <p className="text-ink-light text-sm">Tracking active users, feature adoption, and retention cohorts.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        Export Cohorts
                    </Button>
                </div>
            </div>

            {/* Growth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <GrowthStat label="DAU / MAU" value="32.5%" sub="Industry avg: 20%" icon={Activity} color="text-accent" />
                <GrowthStat label="Active Users" value="1,284" sub="+4.2% this week" icon={Users} color="text-info" />
                <GrowthStat label="Retention (D30)" value="68%" sub="High engagement" icon={UserCheck} color="text-success" />
                <GrowthStat label="Conv. Rate" value="12.4%" sub="Trial to Pro" icon={Target} color="text-ai" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Cohort Analysis Placeholder */}
                <Card className="border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            Retention Cohorts (D1 - D30)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-paper-mid/20 text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                    <th className="px-4 py-3">Cohort</th>
                                    <th className="px-4 py-3">Users</th>
                                    {['D1', 'D7', 'D14', 'D30'].map(d => <th key={d} className="px-4 py-3 text-center">{d}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light">
                                <CohortRow date="Feb 12" users="342" rates={[92, 78, 65, 54]} />
                                <CohortRow date="Feb 05" users="298" rates={[89, 75, 62, 52]} />
                                <CohortRow date="Jan 28" users="412" rates={[94, 82, 70, 58]} />
                                <CohortRow date="Jan 21" users="210" rates={[88, 72, 60, 48]} />
                            </tbody>
                        </table>
                    </CardContent>
                </Card>

                {/* Feature Usage */}
                <Card className="border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Top Feature Adoption
                            <MousePointer2 size={14} className="opacity-40" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                        <FeatureStat label="AI Summary View" value="94%" sub="12.4k uses" color="bg-ai" />
                        <FeatureStat label="Smart Labels" value="78%" sub="8.2k uses" color="bg-accent" />
                        <FeatureStat label="Deep Search" value="62%" sub="4.1k uses" color="bg-info" />
                        <FeatureStat label="Referral System" value="12%" sub="142 uses" color="bg-success" />

                        <div className="pt-4 border-t border-border-light">
                            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-wider text-accent justify-between h-9 px-2 hover:bg-accent/5">
                                View Full Analytics Report
                                <ChevronRight size={14} />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function GrowthStat({ label, value, sub, icon: Icon, color }: any) {
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

function CohortRow({ date, users, rates }: any) {
    return (
        <tr className="hover:bg-paper-mid/30 transition-colors">
            <td className="px-4 py-4 text-xs font-medium text-ink">{date}</td>
            <td className="px-4 py-4 text-xs font-mono text-ink-light">{users}</td>
            {rates.map((r: number, i: number) => (
                <td key={i} className="px-4 py-4 text-center">
                    <div
                        className="text-[10px] font-bold font-mono px-2 py-1 rounded border inline-block min-w-[36px]"
                        style={{
                            backgroundColor: `rgba(var(--ai-rgb), ${r / 100 * 0.2})`,
                            borderColor: `rgba(var(--ai-rgb), ${r / 100 * 0.4})`,
                            color: `rgba(var(--ink-rgb), ${0.6 + (r / 100 * 0.4)})`
                        }}
                    >
                        {r}%
                    </div>
                </td>
            ))}
        </tr>
    );
}

function FeatureStat({ label, value, sub, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-xs font-medium text-ink">{label}</span>
                <span className="text-[10px] font-mono text-ink-mid">{value} • {sub}</span>
            </div>
            <div className="h-1.5 w-full bg-paper-mid rounded-full overflow-hidden">
                <div className={`h-full ${color}`} style={{ width: value }} />
            </div>
        </div>
    );
}
