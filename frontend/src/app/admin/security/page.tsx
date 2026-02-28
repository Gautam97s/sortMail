'use client';

import React from 'react';
import {
    Shield,
    Lock,
    Key,
    Eye,
    AlertTriangle,
    ArrowLeft,
    ShieldAlert,
    History,
    MoreVertical,
    CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SecurityAuditPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Security & Audit Center</h1>
                        <p className="text-ink-light text-sm">Monitoring administrative actions, system access, and security policies.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-10 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        <History size={14} className="mr-2" /> View Full Logs
                    </Button>
                </div>
            </div>

            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SecurityStat label="Firewall Status" value="Active" icon={Shield} color="text-success" />
                <SecurityStat label="SSL Certificate" value="Valid (242d)" icon={Lock} color="text-info" />
                <SecurityStat label="Threat Level" value="Low" icon={ShieldAlert} color="text-success" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Audit Logs */}
                <Card className="lg:col-span-2 border-border-light shadow-sm">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                            <Eye size={14} /> Recent Administrative Actions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border-light">
                            <AuditLogItem
                                admin="Isabella R."
                                action="Updated pricing plans for Enterprise"
                                time="24 mins ago"
                                ip="192.168.1.42"
                            />
                            <AuditLogItem
                                admin="System"
                                action="Auto-blocked IP 45.23.12.9 (Brute force)"
                                time="1 hour ago"
                                ip="Edge Node"
                                important
                            />
                            <AuditLogItem
                                admin="Marcus A."
                                action="Manual user record deletion (ID: u912)"
                                time="2 hours ago"
                                ip="172.16.0.5"
                            />
                            <AuditLogItem
                                admin="Sarah C."
                                action="Changed API rate limits (Global)"
                                time="4 hours ago"
                                ip="10.0.0.124"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Security Config */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm bg-paper-mid/30">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Key size={14} /> Critical Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <SecurityConfigItem label="Multi-factor Auth" status="Required" />
                            <SecurityConfigItem label="Admin Idle Timeout" status="15 mins" />
                            <SecurityConfigItem label="IP Restricted Login" status="Internal Only" />
                            <Button className="w-full h-10 font-bold uppercase tracking-wider text-[10px] bg-accent mt-2 shadow-sm">
                                Manage Security Policies
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm border-l-4 border-l-warning">
                        <CardContent className="p-5 flex gap-4">
                            <AlertTriangle className="text-warning shrink-0" size={20} />
                            <div>
                                <h5 className="text-[10px] font-bold text-warning uppercase mb-1">Pending Security Audit</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    Last comprehensive audit was 42 days ago. Schedule a review for next week.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function SecurityStat({ label, value, icon: Icon, color }: any) {
    return (
        <Card className="border-border-light shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{label}</h4>
                    <p className="text-xl font-display text-ink mt-0.5">{value}</p>
                </div>
                <div className={`w-10 h-10 rounded-xl bg-paper-mid flex items-center justify-center shrink-0`}>
                    <Icon size={18} className={color} />
                </div>
            </CardContent>
        </Card>
    );
}

function AuditLogItem({ admin, action, time, ip, important }: any) {
    return (
        <div className={`p-4 flex items-start gap-4 hover:bg-paper-mid/30 transition-colors group ${important ? 'bg-danger/5' : ''}`}>
            <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${important ? 'bg-danger animate-pulse' : 'bg-success'}`} />
            <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                    <p className="text-sm text-ink-mid font-medium">{action}</p>
                    <button className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={14} />
                    </button>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-ink-light">
                    <span className="font-bold text-accent">{admin}</span>
                    <span className="opacity-30">•</span>
                    <span>{time}</span>
                    <span className="opacity-30">•</span>
                    <span>IP: {ip}</span>
                </div>
            </div>
        </div>
    );
}

function SecurityConfigItem({ label, status }: any) {
    return (
        <div className="flex justify-between items-center py-2 border-b border-border-light/50 last:border-0">
            <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">{label}</span>
            <span className="text-[10px] font-bold text-ink-mid flex items-center gap-1">
                <CheckCircle2 size={10} className="text-success" />
                {status}
            </span>
        </div>
    );
}
