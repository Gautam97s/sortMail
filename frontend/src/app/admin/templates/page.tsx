'use client';

import React, { useState } from 'react';
import {
    Layout,
    Mail,
    Eye,
    Edit3,
    ArrowLeft,
    CheckCircle2,
    Settings,
    Plus,
    Search,
    ChevronRight,
    Smartphone,
    Monitor
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockTemplates = [
    { id: 't1', name: 'Welcome Email', category: 'Transactional', status: 'Active', updated: '2 days ago', version: 'v2.4' },
    { id: 't2', name: 'Password Reset', category: 'Auth', status: 'Active', updated: '1 week ago', version: 'v1.1' },
    { id: 't3', name: 'Daily Briefing', category: 'Product', status: 'Active', updated: 'Today', version: 'v3.0' },
    { id: 't4', name: 'Billing Failed', category: 'Financial', status: 'Active', updated: '3 weeks ago', version: 'v1.0' },
];

export default function TemplateManagementPage() {
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Template Management</h1>
                        <p className="text-ink-light text-sm">Managing transactional email layouts, system notifications, and UI components.</p>
                    </div>
                </div>
                <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                    <Plus size={14} className="mr-2" /> New Template
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Template List */}
                <Card className="border-border-light shadow-sm overflow-hidden">
                    <CardHeader className="bg-paper-mid/50 border-b border-border-light">
                        <CardTitle className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center justify-between">
                            All Templates
                            <div className="relative w-32">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                <Input placeholder="Filter..." className="pl-7 h-7 text-[10px] bg-white border-border-light" />
                            </div>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-border-light">
                            {mockTemplates.map((tmp) => (
                                <div key={tmp.id} className="p-4 flex items-center gap-4 hover:bg-paper-mid/30 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-accent">
                                    <div className="w-8 h-8 rounded-lg bg-paper-mid flex items-center justify-center shrink-0 border border-border-light">
                                        <Mail size={14} className="text-ink-light" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-ink truncate">{tmp.name}</h4>
                                        <div className="flex items-center gap-2 text-[9px] font-mono text-ink-light uppercase">
                                            <span className="text-accent">{tmp.category}</span>
                                            <span className="opacity-30">•</span>
                                            <span>{tmp.version}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Template Preview */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-border-light shadow-sm bg-paper-mid/10 min-h-[500px] flex flex-col">
                        <CardHeader className="border-b border-border-light bg-white py-3 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-xs font-bold text-ink">Preview: Welcome Email</span>
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-success/10 text-success border border-success/20 uppercase">Live</span>
                            </div>
                            <div className="flex border border-border-light rounded overflow-hidden">
                                <button
                                    onClick={() => setViewMode('desktop')}
                                    className={`p-1.5 transition-colors ${viewMode === 'desktop' ? 'bg-paper-mid text-accent' : 'bg-white text-muted-foreground'}`}
                                >
                                    <Monitor size={14} />
                                </button>
                                <button
                                    onClick={() => setViewMode('mobile')}
                                    className={`p-1.5 transition-colors ${viewMode === 'mobile' ? 'bg-paper-mid text-accent' : 'bg-white text-muted-foreground'}`}
                                >
                                    <Smartphone size={14} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 flex-1 flex justify-center bg-paper-mid/5">
                            <div className={`shadow-xl border border-border-light flex flex-col bg-white transition-all duration-300 ${viewMode === 'desktop' ? 'w-full max-w-lg rounded-xl' : 'w-72 rounded-3xl h-[480px] overflow-hidden'}`}>
                                <div className="h-10 bg-accent w-full flex items-center justify-center text-white font-display text-lg tracking-wider">
                                    SortMail
                                </div>
                                <div className="p-6 space-y-4">
                                    <h2 className="text-xl font-bold text-ink">Welcome to the future of email, {'{{name}}'}.</h2>
                                    <p className="text-sm text-ink-light leading-relaxed">
                                        We&apos;re excited to have you on board. Your account is ready and your first daily briefing is waiting for you in the dashboard.
                                    </p>
                                    <div className="py-4">
                                        <div className="h-10 w-full bg-accent rounded text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-md">
                                            Explore Dashboard
                                        </div>
                                    </div>
                                    <p className="text-xs text-ink-mid">
                                        Need help? Reply to this email or visit our <span className="text-accent underline">Support Center</span>.
                                    </p>
                                </div>
                                <div className="mt-auto p-4 bg-paper-mid/20 text-center text-[9px] text-ink-light uppercase tracking-widest">
                                    © 2024 SortMail. All Rights Reserved.
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-4 border-t border-border-light bg-white flex justify-end gap-3">
                            <Button variant="outline" className="h-9 gap-2 text-xs font-bold uppercase tracking-wider border-border-light">
                                <Edit3 size={14} /> Edit Template
                            </Button>
                            <Button className="h-9 gap-2 text-xs font-bold uppercase tracking-wider bg-accent shadow-sm">
                                <Settings size={14} /> Variables
                            </Button>
                        </div>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-info/5 border-l-4 border-l-info">
                        <CardContent className="p-4 flex gap-4">
                            <div className="p-2 rounded bg-white border border-border-light shadow-sm">
                                <Mail size={18} className="text-info" />
                            </div>
                            <div>
                                <h5 className="text-[10px] font-bold text-info uppercase mb-1">Visual Testing</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    All templates are automatically verified for Dark Mode compatibility and mobile responsiveness during the build phase.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
