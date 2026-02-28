'use client';

import React from 'react';
import {
    Users,
    Zap,
    CreditCard,
    Activity,
    ArrowUpRight,
    Shield,
    AlertTriangle,
    BarChart3,
    ArrowRight,
    Server,
    DollarSign,
    UserPlus,
    Megaphone,
    LifeBuoy,
    Download,
    Globe,
    Layout,
    FlaskConical,
    Scale,
    Coins
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { mockUserProfile } from '@/data/user';

export default function AdminDashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-display text-ink mb-1">Admin Control Center</h1>
                <p className="text-ink-light text-sm">System oversight and user management for SortMail.</p>
            </div>

            {/* Top Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: '1,284', icon: Users, color: 'text-info', trend: '+12% this month' },
                    { label: 'AI Operations', value: '42.5k', icon: Zap, color: 'text-ai', trend: '+18% today' },
                    { label: 'Revenue (ARR)', value: '$124,500', icon: CreditCard, color: 'text-success', trend: '+5.2% monthly' },
                    { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-accent', trend: 'Healthy state' },
                ].map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <Card key={i} className="border-border-light shadow-sm hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3 text-muted-foreground">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest">{stat.label}</span>
                                    <Icon size={16} className={stat.color} />
                                </div>
                                <p className="text-2xl font-display text-ink">{stat.value}</p>
                                <p className="text-[10px] text-ink-light mt-1 font-mono">{stat.trend}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* System Oversight Grid */}
            <div className="space-y-4">
                <h2 className="text-xs font-mono font-bold text-ink-mid uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-info" /> System Oversight
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { label: 'Email Activity', href: '/admin/emails/activity', icon: Activity, color: 'text-info' },
                        { label: 'AI Usage', href: '/admin/ai/usage', icon: Zap, color: 'text-ai' },
                        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3, color: 'text-accent' },
                        { label: 'Security', href: '/admin/security', icon: Shield, color: 'text-success' },
                        { label: 'System Health', href: '/admin/system', icon: Server, color: 'text-warning' },
                        { label: 'Alerts Center', href: '/admin/alerts', icon: AlertTriangle, color: 'text-danger' },
                        { label: 'Billing', href: '/admin/billing', icon: DollarSign, color: 'text-success' },
                        { label: 'Invitations', href: '/admin/invites', icon: UserPlus, color: 'text-info' },
                        { label: 'Announcements', href: '/admin/announcements', icon: Megaphone, color: 'text-accent' },
                        { label: 'Support', href: '/admin/support', icon: LifeBuoy, color: 'text-warning' },
                        { label: 'Audit Export', href: '/admin/security/audit/export', icon: Download, color: 'text-info' },
                        { label: 'Compliance', href: '/admin/compliance', icon: Globe, color: 'text-success' },
                        { label: 'Templates', href: '/admin/templates', icon: Layout, color: 'text-accent' },
                        { label: 'Experiments', href: '/admin/experiments', icon: FlaskConical, color: 'text-ai' },
                        { label: 'Global Rules', href: '/admin/rules/global', icon: Scale, color: 'text-warning' },
                        { label: 'Credits', href: '/admin/credits', icon: Coins, color: 'text-success' },
                    ].map((link, i) => {
                        const Icon = link.icon;
                        return (
                            <Link key={i} href={link.href}>
                                <Card className="border-border-light hover:border-accent/30 hover:shadow-md transition-all cursor-pointer group h-full">
                                    <CardContent className="p-4 flex flex-col items-center text-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl bg-paper-mid flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <Icon size={18} className={link.color} />
                                        </div>
                                        <span className="text-[10px] font-mono font-bold uppercase tracking-tight text-ink-light group-hover:text-ink transition-colors">{link.label}</span>
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Management Quick Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-mono font-bold text-ink-mid uppercase tracking-widest flex items-center gap-2">
                            <Shield size={14} className="text-accent" /> Management
                        </h2>
                        <Link href="/admin/users">
                            <Button variant="link" className="text-xs text-accent p-0 h-auto font-bold uppercase tracking-wider">
                                View Detailed List <ArrowRight size={12} className="ml-1" />
                            </Button>
                        </Link>
                    </div>

                    <Card className="border-border-light bg-white overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-paper-mid border-b border-border-light text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-3 font-bold">User</th>
                                        <th className="px-6 py-3 font-bold">Plan</th>
                                        <th className="px-6 py-3 font-bold">Usage</th>
                                        <th className="px-6 py-3 font-bold">Activity</th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border-light">
                                    {[
                                        { name: 'Marcus Aurelius', email: 'marcus@stoic.com', plan: 'Enterprise', usage: '89%', status: 'Online', id: '1' },
                                        { name: 'Sarah Connor', email: 'sarah.c@resistance.org', plan: 'Pro', usage: '12%', status: 'Offline', id: '2' },
                                        { name: 'Thomas Anderson', email: 'neo@neb.io', plan: 'Pro', usage: '94%', status: 'Online', id: '3' },
                                        { name: 'Ellen Ripley', email: 'ripley@weyland.corp', plan: 'Free', usage: '2%', status: 'Offline', id: '4' },
                                    ].map((user) => (
                                        <tr key={user.id} className="hover:bg-paper-mid/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-ink">{user.name}</span>
                                                    <span className="text-[10px] text-ink-light font-mono">{user.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge plan={user.plan} />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 rounded-full bg-paper-mid overflow-hidden">
                                                        <div
                                                            className={`h-full ${parseInt(user.usage) > 80 ? 'bg-danger' : 'bg-accent'}`}
                                                            style={{ width: user.usage }}
                                                        />
                                                    </div>
                                                    <span className="text-[10px] font-mono">{user.usage}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Online' ? 'bg-success animate-pulse' : 'bg-muted'}`} />
                                                    <span className="text-xs text-ink-light">{user.status}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link href={`/admin/users/${user.id}`}>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ArrowUpRight size={14} className="text-accent" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* System Alerts / Health */}
                <div className="space-y-4">
                    <h2 className="text-xs font-mono font-bold text-ink-mid uppercase tracking-widest flex items-center gap-2">
                        <BarChart3 size={14} className="text-info" /> System Status
                    </h2>

                    <div className="space-y-3">
                        <HealthCard
                            title="Worker Queue"
                            status="Healthy"
                            detail="0 tasks deadlocked"
                            health="good"
                        />
                        <HealthCard
                            title="AI Inference API"
                            status="Degraded"
                            detail="Latency > 800ms"
                            health="warn"
                        />
                        <HealthCard
                            title="Primary Postgres"
                            status="Healthy"
                            detail="98% disk free"
                            health="good"
                        />
                    </div>

                    <Card className="bg-ink p-5 rounded-xl border-none text-white overflow-hidden relative group cursor-pointer shadow-lg shadow-ink/20">
                        <div className="relative z-10 flex flex-col h-full justify-between min-h-[120px]">
                            <div>
                                <h3 className="font-display text-lg mb-1">System Audit</h3>
                                <p className="text-white/60 text-xs">Run a full security and integrity check.</p>
                            </div>
                            <Button className="bg-white text-ink hover:bg-white/90 w-full mt-4 font-bold uppercase tracking-wider text-[10px] h-9">
                                Start Audit Now
                            </Button>
                        </div>
                        <AlertTriangle className="absolute -right-4 -bottom-4 text-white/5 w-24 h-24 rotate-12 group-hover:scale-110 transition-transform duration-500" />
                    </Card>
                </div>
            </div>
        </div>
    );
}

function Badge({ plan }: { plan: string }) {
    const colors: Record<string, string> = {
        'Enterprise': 'bg-indigo-100 text-indigo-700 border-indigo-200',
        'Pro': 'bg-accent/10 text-accent border-accent/20',
        'Free': 'bg-paper-mid text-ink-light border-border-light',
    };
    return (
        <span className={`text-[9px] font-mono font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${colors[plan] || colors['Free']}`}>
            {plan}
        </span>
    );
}

function HealthCard({ title, status, detail, health }: { title: string, status: string, detail: string, health: 'good' | 'warn' | 'error' }) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
                <div>
                    <h4 className="text-xs font-bold text-ink">{title}</h4>
                    <p className="text-[10px] text-ink-light mt-0.5">{detail}</p>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] font-mono font-bold uppercase ${health === 'good' ? 'text-success' : health === 'warn' ? 'text-warning' : 'text-danger'}`}>
                        {status}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}
