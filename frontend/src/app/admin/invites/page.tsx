'use client';

import React from 'react';
import {
    UserPlus,
    Mail,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowLeft,
    Search,
    Filter,
    MoreHorizontal,
    Send,
    UserCheck,
    Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

const mockInvites = [
    { id: 'i1', email: 'guest@philosophy.com', status: 'Pending', sentAt: '2024-02-28', expiresAt: '2024-03-05', invitedBy: 'Marcus A.' },
    { id: 'i2', email: 'neo@neb.io', status: 'Accepted', sentAt: '2024-02-20', expiresAt: '-', invitedBy: 'Isabella R.' },
    { id: 'i3', email: 'trinity@matrix.net', status: 'Expired', sentAt: '2024-01-15', expiresAt: '2024-01-22', invitedBy: 'Marcus A.' },
    { id: 'i4', email: 'morpheus@zion.gov', status: 'Pending', sentAt: '2024-02-26', expiresAt: '2024-03-03', invitedBy: 'Sarah C.' },
];

export default function InvitesManagementPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-4">
                    <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest">
                        <ArrowLeft size={12} /> Admin Home
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display text-ink mb-1">Invitation Management</h1>
                        <p className="text-ink-light text-sm">Track user invitations, manage pending requests, and bulk invite teams.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button className="h-10 font-bold uppercase tracking-wider text-xs shadow-md bg-accent">
                        <UserPlus size={14} className="mr-2" /> Create New Invite
                    </Button>
                </div>
            </div>

            {/* Invite Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <InviteStat label="Total Sent" value="1,420" sub="All time" icon={Mail} color="text-info" />
                <InviteStat label="Pending" value="42" sub="Requires follow-up" icon={Clock} color="text-warning" />
                <InviteStat label="Acceptance Rate" value="88%" sub="High conversion" icon={UserCheck} color="text-success" />
            </div>

            {/* List & Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Invites Table */}
                <Card className="lg:col-span-2 border-border-light shadow-sm overflow-hidden">
                    <div className="p-4 bg-paper-mid/50 border-b border-border-light flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search invites..."
                                className="pl-9 h-9 text-xs border-border-light bg-white"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="h-9 gap-2 border-border-light text-ink text-[10px] font-bold uppercase tracking-widest">
                            <Filter size={12} /> Filter Status
                        </Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-paper-mid text-[9px] font-mono text-ink-light uppercase tracking-widest border-b border-border-light">
                                <tr>
                                    <th className="px-6 py-3">Recipient Email</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3">Invited By</th>
                                    <th className="px-6 py-3">Sent Date</th>
                                    <th className="px-6 py-3 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-light text-sm">
                                {mockInvites.map((invite) => (
                                    <tr key={invite.id} className="hover:bg-paper-mid/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-ink">{invite.email}</td>
                                        <td className="px-6 py-4">
                                            <InviteStatus status={invite.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs font-mono text-ink-mid">{invite.invitedBy}</td>
                                        <td className="px-6 py-4 text-xs text-ink-light font-mono">{invite.sentAt}</td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                                <MoreHorizontal size={14} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Bulk Actions */}
                <div className="space-y-6">
                    <Card className="border-border-light shadow-sm">
                        <CardHeader className="pb-3 border-b border-border-light/50">
                            <CardTitle className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Send size={14} /> Bulk Generator
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-5 space-y-4">
                            <p className="text-xs text-ink-light leading-relaxed">
                                Generate a single link that can be used by up to 50 recipients.
                            </p>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-ink uppercase mb-1 block">Maximum Uses</label>
                                    <Input type="number" defaultValue={50} className="h-9 text-xs border-border-light" />
                                </div>
                                <div>
                                    <label className="text-[9px] font-mono font-bold text-ink uppercase mb-1 block">Access Group</label>
                                    <select className="w-full h-9 rounded-md border border-border-light bg-white text-xs px-2 focus:ring-1 focus:ring-accent outline-none">
                                        <option>Early Adopters</option>
                                        <option>Beta Testers</option>
                                        <option>Corporate Partners</option>
                                    </select>
                                </div>
                                <Button className="w-full h-9 font-bold uppercase tracking-wider text-[10px] bg-accent/10 text-accent border border-accent/20 hover:bg-accent hover:text-white transition-all shadow-sm">
                                    Generate Bulk Link
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-border-light shadow-sm bg-warning/5 border-l-4 border-l-warning">
                        <CardContent className="p-4 flex gap-4">
                            <Users size={20} className="text-warning shrink-0" />
                            <div>
                                <h5 className="text-[10px] font-bold text-warning uppercase mb-1">Invite Limit Reached?</h5>
                                <p className="text-[11px] text-ink-light leading-relaxed">
                                    You have used 85% of your available invitation slots for the Q1 growth cohort.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InviteStat({ label, value, sub, icon: Icon, color }: any) {
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

function InviteStatus({ status }: { status: string }) {
    const styles: Record<string, string> = {
        'Accepted': 'bg-success/10 text-success border-success/20',
        'Pending': 'bg-warning/10 text-warning border-warning/20',
        'Expired': 'bg-danger/10 text-danger border-danger/20',
    };
    const icon = {
        'Accepted': <CheckCircle2 size={10} />,
        'Pending': <Clock size={10} />,
        'Expired': <XCircle size={10} />,
    }[status];

    return (
        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border inline-flex items-center gap-1.5 ${styles[status]}`}>
            {icon} {status}
        </span>
    );
}
