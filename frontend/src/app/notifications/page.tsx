"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, X, Mail, CheckSquare, Sparkles, Clock, ShieldAlert } from "lucide-react";
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
        staleTime: 1000 * 30,
        refetchOnWindowFocus: true,
    });

    const { data: prefs } = useQuery({
        queryKey: ["notification-preferences"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.notificationPrefs);
            return data as {
                push_enabled: boolean;
                email_enabled: boolean;
                in_app_enabled: boolean;
            };
        },
        staleTime: 1000 * 60,
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

    const updatePrefs = useMutation({
        mutationFn: (payload: { push_enabled?: boolean }) => api.patch(endpoints.notificationPrefs, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notification-preferences"] }),
    });

    const enableBrowserPush = async () => {
        if (typeof window === 'undefined' || !("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            updatePrefs.mutate({ push_enabled: true });
        }
    };

    const unreadCount = notifications.filter((n) => !n.is_read).length;

    const getIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case "EMAIL_URGENT": return <Mail className="w-4 h-4 text-red-500" />;
            case "TASK_DUE": return <CheckSquare className="w-4 h-4 text-amber-500" />;
            case "FOLLOW_UP_REMINDER": return <Clock className="w-4 h-4 text-blue-500" />;
            case "CREDIT_LOW": return <Sparkles className="w-4 h-4 text-purple-500" />;
            case "ACCOUNT_UPDATE": return <ShieldAlert className="w-4 h-4 text-orange-500" />;
            default: return <Bell className="w-4 h-4 text-muted-foreground" />;
        }
    };

    if (isLoading) {
        return (
            <AppShell title="Notifications">
                <div className="max-w-[960px] mx-auto space-y-3 p-4 md:p-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 rounded-xl bg-paper-mid animate-pulse" />
                    ))}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}>
            <div className="max-w-[960px] mx-auto space-y-5 p-4 md:p-6">
                <section className="relative overflow-hidden rounded-2xl bg-white border border-outline-variant/10 p-5 md:p-6 tonal-shadow">
                    <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-tertiary-fixed/25 blur-2xl -mr-8 -mt-8" />
                    <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-5">
                        <div className="space-y-2 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tertiary-fixed/25 text-tertiary text-[10px] font-bold uppercase tracking-[0.24em] w-fit">
                                <Bell className="h-3.5 w-3.5" />
                                Notifications
                            </div>
                            <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface tracking-tight">What needs your attention</h1>
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
                                className="rounded-xl border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container h-9 px-3 text-[12px]"
                            >
                                <CheckCheck className="h-4 w-4 mr-2" />
                                Mark all read
                            </Button>
                        )}
                        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={enableBrowserPush}
                                disabled={updatePrefs.isPending}
                                className="rounded-xl border-outline-variant/20 bg-surface-container-lowest hover:bg-surface-container h-9 px-3 text-[12px]"
                            >
                                Enable push
                            </Button>
                        )}
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Unread</div>
                            <div className="text-xl font-headline font-bold text-on-surface mt-1">{unreadCount}</div>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Delivered today</div>
                            <div className="text-xl font-headline font-bold text-on-surface mt-1">{notifications.length}</div>
                        </div>
                        <div className="rounded-xl bg-surface-container-low px-3 py-2.5">
                            <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-outline">Priority</div>
                            <div className="text-xl font-headline font-bold text-on-surface mt-1">{notifications.filter((n) => n.priority.toUpperCase() === 'HIGH').length}</div>
                        </div>
                    </div>
                </section>

                {notifications.length === 0 ? (
                    <Card className="p-8 text-center text-muted-foreground rounded-2xl border-outline-variant/10">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-lg font-medium">No notifications</p>
                        <p className="text-sm">You&apos;re all caught up!</p>
                    </Card>
                ) : (
                    <div className="space-y-2.5">
                        {notifications.map((n) => (
                            <Card
                                key={n.id}
                                className={`p-4 flex items-start gap-3 transition-all group rounded-2xl border-outline-variant/10 ${!n.is_read ? "border-primary/30 bg-primary/5 shadow-sm" : "bg-white"}`}
                            >
                                <div className="mt-0.5 p-2 rounded-xl bg-surface-container">
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className={`text-[13px] font-medium truncate ${!n.is_read ? "text-ink" : "text-ink-light"}`}>
                                            {n.title}
                                        </p>
                                        {!n.is_read && (
                                            <Badge variant="secondary" className="text-[10px] shrink-0 bg-primary/10 text-primary">New</Badge>
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
