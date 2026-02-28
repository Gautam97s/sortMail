'use client';

import React from 'react';
import {
    FlaskConical,
    TrendingUp,
    MousePointer2,
    Users,
    ArrowLeft,
    Plus,
    Play,
    Square,
    BarChart3,
    ArrowRight,
    CheckCircle2,
    Zap,
    Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const mockExperiments = [
    { id: 'e1', title: 'AI Summary Button Color', status: 'Running', variantA: 'Accent Blue', variantB: 'Vibrant Indigo', traffic: '50/50', conversion: '+4.2%', started: '3 days ago' },
    { id: 'e2', title: 'Onboarding Flow v2', status: 'Paused', variantA: '3-step', variantB: '5-step with demo', traffic: '10/90', conversion: '-1.5%', started: '1 week ago' },
    { id: 'e3', title: 'Dashboard Widget Layout', status: 'Draft', variantA: 'List-first', variantB: 'Grid-first', traffic: '0/0', conversion: '-', started: '-' },
];

export default function ExperimentsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">A/B Experiments</h1>
                        <p className="text-ink-light text-sm">Managing feature flags, traffic splitting, and conversion optimization experiments.</p>
                    </div>
                </div>
                <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                    <Plus size={14} className="mr-2" /> Start Experiment
                </Button>
            </div>

            {/* Experiment Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <ExperimentStat label="Running" value="4" icon={Play} color="text-success" />
                <ExperimentStat label="Total Experiments" value="24" icon={FlaskConical} color="text-info" />
                <ExperimentStat label="Avg. Conversion Lift" value="+6.4%" icon={TrendingUp} color="text-accent" />
                <ExperimentStat label="Traffic Monitored" value="12.4k" icon={Users} color="text-ai" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Active Experiments */}
                <Card className="border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                            Live & Scheduled Tests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border-light">
                            {mockExperiments.map((exp) => (
                                <div key={exp.id} className="p-6 hover:bg-paper-mid/30 transition-colors group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-1">
                                            <h4 className="text-base font-bold text-ink">{exp.title}</h4>
                                            <div className="flex items-center gap-3 text-[10px] font-mono text-ink-light">
                                                <span className={`uppercase font-bold ${exp.status === 'Running' ? 'text-success' : 'text-warning'}`}>{exp.status}</span>
                                                <span className="opacity-30">•</span>
                                                <span>Traffic: {exp.traffic}</span>
                                                <span className="opacity-30">•</span>
                                                <span>Started {exp.started}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {exp.status === 'Running' ? (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-paper-mid group">
                                                    <Square size={14} />
                                                </Button>
                                            ) : (
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:bg-paper-mid group">
                                                    <Play size={14} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <VariantResult label="Variant A" name={exp.variantA} />
                                        <VariantResult label="Variant B" name={exp.variantB} lift={exp.conversion} active />
                                    </div>

                                    <div className="mt-4 flex justify-end">
                                        <Link href={`/admin/experiments/${exp.id}`}>
                                            <Button variant="link" className="text-[10px] font-bold uppercase tracking-widest text-accent p-0 h-auto">
                                                Detailed Analytics <ArrowRight size={12} className="ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Feature Flags & Insights */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50 bg-paper-mid/10">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Zap size={14} /> Global Feature Flags
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-border-light">
                                <FlagToggle label="Deep AI Analysis" description="Enable recursive thread intelligence" enabled />
                                <FlagToggle label="Bulk Email Sync" description="Enable parallel API fetch for inbox" enabled />
                                <FlagToggle label="Partner Referral UI" description="Show rewards tab in sidebar" />
                                <FlagToggle label="Dynamic Search" description="ElasticSearch integration layer" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-accent border-l-4 border-l-accent text-white">
                        <CardContent className="p-5 space-y-3">
                            <div className="flex items-center gap-2">
                                <Target size={18} />
                                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest">Optimization Strategy</h4>
                            </div>
                            <p className="text-[11px] text-white/80 leading-relaxed font-medium">
                                Current primary KPI: **Daily Active Retention (D7)**. All experiments should focus on engagement loops within the first week of signup.
                            </p>
                            <Button variant="ghost" className="w-full h-8 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-white/10 mt-2 border border-white/20">
                                View Strategy Doc
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function ExperimentStat({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                    <p className="text-xl font-display text-ink mt-0.5">{value}</p>
                </div>
                <div className="p-2 rounded-lg bg-paper-mid">
                    <Icon size={18} className={color} />
                </div>
            </CardContent>
        </Card>
    );
}

function VariantResult({ label, name, lift, active }: any) {
    return (
        <div className={`p-3 rounded-lg border flex flex-col gap-1 ${active ? 'bg-accent/5 border-accent/20' : 'bg-paper-mid/10 border-border-light/50'}`}>
            <span className="text-[9px] font-mono font-bold uppercase text-muted-foreground">{label}</span>
            <span className="text-xs font-bold text-ink truncate">{name}</span>
            {lift && (
                <span className={`text-[10px] font-mono font-bold mt-1 inline-flex items-center gap-1 ${lift.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                    {lift.startsWith('+') ? <TrendingUp size={10} /> : <TrendingUp size={10} className="rotate-180" />}
                    {lift}
                </span>
            )}
        </div>
    );
}

function FlagToggle({ label, description, enabled }: any) {
    return (
        <div className="p-4 flex items-center justify-between hover:bg-paper-mid/20 transition-colors">
            <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-ink">{label}</h5>
                <p className="text-[10px] text-ink-light">{description}</p>
            </div>
            <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${enabled ? 'bg-accent' : 'bg-border-light'}`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'left-6' : 'left-1'}`} />
            </div>
        </div>
    );
}
