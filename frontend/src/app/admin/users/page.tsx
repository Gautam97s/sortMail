'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    Search,
    Filter,
    Download,
    MoreHorizontal,
    UserPlus,
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { api, endpoints } from '@/lib/api';

type AdminUser = {
    id: string;
    email: string;
    name: string | null;
    provider: string;
    status: string;
    is_superuser: boolean;
    credits_balance: number;
    plan: string;
    created_at: string;
    last_login_at: string | null;
};

export default function UserListPage() {
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const { data } = await api.get(endpoints.adminUsers);
                if (mounted) setUsers(data || []);
            } finally {
                if (mounted) setLoading(false);
            }
        })();

        return () => {
            mounted = false;
        };
    }, []);

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            {/* Breadcrumbs / Back */}
            <Link href="/admin" className="flex items-center gap-2 text-xs font-mono font-bold text-accent hover:opacity-70 transition-opacity uppercase tracking-widest mb-2">
                <ArrowLeft size={12} /> Back to Dashboard
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display text-ink mb-1">User Directory</h1>
                    <p className="text-ink-light text-sm">Manage all registered users and their account properties.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="h-9 gap-2 border-border-light text-ink text-xs font-bold uppercase tracking-wider shadow-sm">
                        <Download size={14} /> Export CSV
                    </Button>
                    <Button className="h-9 gap-2 font-bold uppercase tracking-wider text-xs shadow-md">
                        <UserPlus size={14} /> Invite User
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <Card className="border-border-light bg-white shadow-sm">
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, email, or ID..."
                            className="pl-10 h-10 border-border-light focus-visible:ring-accent"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        <Button variant="outline" className="h-10 gap-2 border-border-light text-ink flex-1 md:flex-initial">
                            <Filter size={14} /> Filters
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* User Table */}
            <Card className="border-border-light bg-white overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-paper-mid border-b border-border-light text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                            <tr>
                                <th className="px-6 py-4 font-bold">User Information</th>
                                <th className="px-6 py-4 font-bold">Subscription</th>
                                <th className="px-6 py-4 font-bold text-center">Status</th>
                                <th className="px-6 py-4 font-bold">Joined</th>
                                <th className="px-6 py-4 font-bold">Credits Used</th>
                                <th className="px-6 py-4 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-light">
                                {!loading && filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-paper-mid/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold text-xs">
                                                {(user.name || user.email).split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-ink">{user.name || user.email}</span>
                                                <span className="text-[10px] text-ink-light font-mono leading-none mt-1">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <PlanBadge plan={user.plan} />
                                    </td>
                                    <td className="px-6 py-5 text-center">
                                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${user.status === 'ACTIVE' ? 'bg-success/5 text-success border-success/20' : 'bg-danger/5 text-danger border-danger/20'
                                            }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 font-mono text-[10px] text-ink-mid">
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-1.5 rounded-full bg-paper-mid overflow-hidden">
                                                <div
                                                    className={`h-full ${user.credits_balance > 85 ? 'bg-danger' : 'bg-accent'}`}
                                                    style={{ width: `${Math.min(100, user.credits_balance)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-mono">{user.credits_balance}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/users/${user.id}`}>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:bg-accent/5">
                                                    <ArrowUpRight size={14} />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground group-hover:text-ink transition-colors">
                                                <MoreHorizontal size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                                ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search size={24} className="opacity-20" />
                                            <p className="text-sm">{loading ? 'Loading users...' : 'No users found matching your search.'}</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-border-light bg-paper-mid/30 flex items-center justify-between">
                    <p className="text-[10px] text-ink-light font-mono">Showing 1 to {filteredUsers.length} of {users.length} entries</p>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border-light text-ink-mid" disabled>
                            <ChevronLeft size={14} />
                        </Button>
                        <div className="flex items-center gap-1">
                            <Button size="sm" className="h-8 w-8 p-0 text-[11px] font-mono">1</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[11px] font-mono hover:bg-white active:scale-95 transition-all">2</Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[11px] font-mono hover:bg-white active:scale-95 transition-all">3</Button>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-border-light text-ink-mid">
                            <ChevronRight size={14} />
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

function PlanBadge({ plan }: { plan: string }) {
    const colors: Record<string, string> = {
        'Enterprise': 'bg-indigo-100/50 text-indigo-700 border-indigo-200/50',
        'Pro': 'bg-accent/10 text-accent border-accent/20',
        'Free': 'bg-paper-mid text-ink-light border-border-light',
    };
    return (
        <span className={`text-[9px] font-mono font-bold uppercase tracking-tighter px-1.5 py-0.5 rounded border ${colors[plan] || colors['Free']}`}>
            {plan}
        </span>
    );
}
