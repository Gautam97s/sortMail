"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, X, Mail, CheckSquare, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import AppShell from "@/components/layout/AppShell";
import { api, endpoints } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    type: string;
    title: string;
    body?: string;
    action_url?: string;
    is_read: boolean;
    priority: string;
    created_at: string;
}

export default function NotificationsPage() {
    const queryClient = useQueryClient();

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["notifications"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.notifications);
            return data;
        },
    });

    const markRead = useMutation({
        mutationFn: (id: string) => api.post(`${endpoints.notifications}/${id}/read`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const markAllRead = useMutation({
        mutationFn: () => api.post(`${endpoints.notifications}/read-all`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const dismiss = useMutation({
        mutationFn: (id: string) => api.delete(`${endpoints.notifications}/${id}`),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case "email_urgent": return <Mail className="w-4 h-4 text-red-500" />;
            case "task_due": return <CheckSquare className="w-4 h-4 text-amber-500" />;
            case "follow_up_reminder": return <Clock className="w-4 h-4 text-blue-500" />;
            case "credit_low": return <Sparkles className="w-4 h-4 text-purple-500" />;
            default: return <Bell className="w-4 h-4 text-muted-foreground" />;
        }
    };

    if (isLoading) {
        return (
            <AppShell title="Notifications">
                <div className="max-w-3xl mx-auto space-y-3 p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}>
            <div className="max-w-3xl mx-auto space-y-6 p-6 md:p-10">
                <section className="relative overflow-hidden rounded-[32px] bg-white border border-outline-variant/10 p-6 md:p-8 tonal-shadow">
                    <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-tertiary-fixed/25 blur-3xl -mr-10 -mt-10" />
                    <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-fixed/25 text-tertiary text-[10px] font-bold uppercase tracking-[0.24em] w-fit">
                                <Bell className="h-3.5 w-3.5" />
                                Notifications
                            </div>
                            <h1 className="font-headline text-3xl font-bold text-on-surface tracking-tight">What needs your attention</h1>
                            <p className="text-sm text-on-surface-variant max-w-xl">
                                Read the highest-signal updates first, then clear the rest in one pass.
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAllRead.mutate()}
                                disabled={markAllRead.isPending}
                                className="rounded-2xl border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container"
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Unread</div>
                            <div className="text-2xl font-headline font-bold text-on-surface mt-1">{unreadCount}</div>
                        </div>
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Delivered today</div>
                            <div className="text-2xl font-headline font-bold text-on-surface mt-1">{notifications.length}</div>
                        </div>
                        <div className="rounded-2xl bg-surface-container-low px-4 py-3">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Priority</div>
                            <div className="text-2xl font-headline font-bold text-on-surface mt-1">{notifications.filter((n) => n.priority === 'high').length}</div>
                        </div>
                    </div>
                </section>

                {notifications.length === 0 ? (
                    <Card className="p-12 text-center text-muted-foreground rounded-[32px] border-outline-variant/10">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm">You&apos;re all caught up!</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((n) => (
                            <Card
                                key={n.id}
                                className={`p-5 flex items-start gap-4 transition-all group rounded-[28px] border-outline-variant/10 ${!n.is_read ? "border-primary/30 bg-primary/5 shadow-sm" : "bg-white"}`}
                            >
                                <div className="mt-0.5 p-2.5 rounded-2xl bg-surface-container">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-sm font-medium truncate ${!n.is_read ? "text-ink" : "text-ink-light"}`}>
                                            {n.title}
                                        </p>
                                        {!n.is_read && (
                                            <Badge variant="secondary" className="text-xs shrink-0 bg-primary/10 text-primary">New</Badge>
                                        )}
                                    </div>
                                    {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                                    </p>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {!n.is_read && (
                                        <Button size="icon" variant="ghost" className="h-7 w-7 rounded-xl" onClick={() => markRead.mutate(n.id)}>
                                            <CheckCheck className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                    {n.action_url && (
                                        <Button size="sm" variant="outline" asChild className="h-7 text-xs rounded-xl">
                                            <Link href={n.action_url}>View</Link>
                                        </Button>
                                    )}
                                    <Button size="icon" variant="ghost" className="h-7 w-7 rounded-xl text-muted-foreground hover:text-danger" onClick={() => dismiss.mutate(n.id)}>
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </AppShell>
    );
}
