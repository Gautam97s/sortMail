'use client';

import React from 'react';
import {
    Cpu,
    Database,
    HardDrive,
    Server,
    Zap,
    ArrowLeft,
    Activity,
    Code,
    Terminal,
    Settings,
    ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SystemHealthPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Infrastructure Health</h1>
                        <p className="text-ink-light text-sm">Monitoring server-side performance, database load, and worker concurrency.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        Cluster Config
                    </Button>
                </div>
            </div>

            {/* System Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <HealthStat label="Main API" value="99.99%" sub="Uptime (30d)" icon={Server} color="text-success" />
                <HealthStat label="Worker Pool" value="82%" sub="Current Load" icon={Cpu} color="text-warning" />
                <HealthStat label="Postgres" value="12ms" sub="Avg Queries" icon={Database} color="text-info" />
                <HealthStat label="Redis Cache" value="94.2%" sub="Hit Rate" icon={Zap} color="text-accent" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Metric Charts Placeholder */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            Real-time Resource Utilization
                            <span className="flex items-center gap-1.5 text-[9px] text-success animate-pulse">
                                <Activity size={10} /> Live Tracking
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 bg-white min-h-[340px] flex flex-col gap-8">
                        <ResourceBar label="CPU Usage" value={42} color="bg-accent" />
                        <ResourceBar label="RAM Consumption" value={68} color="bg-info" />
                        <ResourceBar label="Disk I/O" value={15} color="bg-success" />
                        <ResourceBar label="Network Thru" value={28} color="bg-ai" />
                    </CardContent>
                </Card>

                {/* System Config & Tools */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="bg-white border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Terminal size={14} /> Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-2">
                            <ActionButton icon={RefreshCcw} label="Flush Redis Cache" />
                            <ActionButton icon={Settings} label="Reload Envars" />
                            <ActionButton icon={ShieldCheck} label="Rotate API Keys" />
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-ink text-white">
                        <CardHeader className="pb-3 border-b border-white/10">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest flex items-center gap-2 text-white/50">
                                <Code size={14} /> Critical Environment
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="font-mono text-[11px] space-y-3">
                                <EnvRow label="NODE_ENV" value="production" />
                                <EnvRow label="VERCEL_REGION" value="iad1" />
                                <EnvRow label="MAX_WORKERS" value="12" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function HealthStat({ label, value, sub, icon: Icon, color }: any) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl bg-paper-mid flex items-center justify-center mb-3">
                    <Icon size={18} className={color} />
                </div>
                <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                <p className="text-xl font-display text-ink mt-0.5">{value}</p>
                <p className="text-[10px] text-ink-light mt-0.5 font-mono">{sub}</p>
            </CardContent>
        </Card>
    );
}

function ResourceBar({ label, value, color }: any) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-[10px] font-mono font-bold text-ink uppercase tracking-widest">{label}</span>
                <span className="text-[11px] font-mono text-ink-light">{value}%</span>
            </div>
            <div className="h-2 w-full bg-paper-mid rounded-full overflow-hidden border border-border-light/50">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, label }: any) {
    return (
        <Button variant="ghost" className="w-full justify-start text-[11px] font-bold uppercase tracking-wider h-10 px-3 hover:bg-paper-mid hover:text-ink">
            <Icon size={14} className="mr-3 text-muted-foreground" />
            {label}
        </Button>
    );
}

function EnvRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-baseline gap-4">
            <span className="text-white/40 uppercase tracking-tighter">{label}</span>
            <span className="text-success truncate">{value}</span>
        </div>
    );
}

const RefreshCcw = ({ size, className }: any) => (
    <Activity size={size} className={className} />
);
