"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Brain, Coins, Inbox, Users, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface CreditBalance {
    balance: number;
    plan: string;
    monthly_allowance: number;
    used_this_month: number;
}

interface NavCounts {
    inbox: number;
    actions: number;
    urgent: number;
    fyi: number;
    drafts: number;
}

export default function SettingsAIPage() {
    const { user } = useAuth();

    const { data: credits } = useQuery<CreditBalance>({
        queryKey: ["credits-me", "settings-ai"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.creditsMe);
            return data;
        },
    });

    const { data: counts } = useQuery<NavCounts>({
        queryKey: ["nav-counts", "settings-ai"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.navCounts);
            return data;
        },
    });

    const { data: accounts = [] } = useQuery<any[]>({
        queryKey: ["connected-accounts", "settings-ai"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.connectedAccounts);
            return data;
        },
    });

    const activeAccounts = accounts.filter((a) => a.status === "ACTIVE").length;

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">AI & Intelligence</h1>
                <p className="text-ink-light mt-2">Live status of your intelligence pipeline and usage footprint.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard title="Available Credits" value={String(credits?.balance ?? 0)} icon={<Coins className="w-4 h-4" />} />
                <MetricCard title="Used This Month" value={String(credits?.used_this_month ?? 0)} icon={<Brain className="w-4 h-4" />} />
                <MetricCard title="Inbox Threads" value={String(counts?.inbox ?? 0)} icon={<Inbox className="w-4 h-4" />} />
                <MetricCard title="Connected Inboxes" value={String(activeAccounts)} icon={<Users className="w-4 h-4" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                        Runtime AI Engine
                    </CardTitle>
                    <CardDescription>
                        SortMail currently runs intelligence processing through Amazon Bedrock-backed workflows configured on the server.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">Provider: Bedrock</Badge>
                    <Badge variant="outline">Per-user usage logging enabled</Badge>
                    <Badge variant="outline">Thread intelligence active</Badge>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Deep Metrics</CardTitle>
                    <CardDescription>
                        Token-level Bedrock usage and per-call telemetry are available from Admin metrics.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {user?.is_superuser ? (
                        <Link href="/admin/ai/usage" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
                            Open Admin AI Usage Dashboard
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <p className="text-sm text-ink-light">Ask an admin to share usage snapshots for token and cost analytics.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold">{title}</span>
                    {icon}
                </div>
                <div className="text-2xl font-display text-ink">{value}</div>
            </CardContent>
        </Card>
    );
}
