"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Shield, Mail, Database, ExternalLink, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api, endpoints } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function SettingsPrivacyPage() {
    const { user } = useAuth();

    const { data: accounts = [] } = useQuery<any[]>({
        queryKey: ["connected-accounts", "settings-privacy"],
        queryFn: async () => {
            const { data } = await api.get(endpoints.connectedAccounts);
            return data;
        },
    });

    const activeAccounts = accounts.filter((a) => a.status === "ACTIVE").length;

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">Privacy & Data</h1>
                <p className="text-ink-light mt-2">Current account privacy posture and data handling entry points.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <StatusCard title="Auth Provider" value={user?.provider || "Unknown"} icon={<Shield className="w-4 h-4" />} />
                <StatusCard title="Connected Inboxes" value={String(activeAccounts)} icon={<Mail className="w-4 h-4" />} />
                <StatusCard title="Account Status" value={user?.is_active ? "Active" : "Inactive"} icon={<Database className="w-4 h-4" />} />
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Data Access & Export</CardTitle>
                    <CardDescription>
                        Use official legal and support channels for policy details and export/deletion requests.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary">OAuth-based mailbox access</Badge>
                        <Badge variant="outline">User-scoped data processing</Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 pt-1">
                        <Link href="/privacy" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                            Privacy Policy <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/terms" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                            Terms of Service <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        <Link href="/support" className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1">
                            Contact Support <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-danger/20 bg-danger/5">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-danger">
                        <TriangleAlert className="w-5 h-5" />
                        Dangerous Actions
                    </CardTitle>
                    <CardDescription>
                        Account removal and destructive operations are centralized in Danger Zone.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href="/settings/danger" className="text-sm font-semibold text-danger hover:underline">
                        Open Danger Zone
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}

function StatusCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
    return (
        <Card>
            <CardContent className="p-5">
                <div className="flex items-center justify-between text-muted-foreground mb-2">
                    <span className="text-[10px] uppercase tracking-widest font-bold">{title}</span>
                    {icon}
                </div>
                <div className="text-xl font-display text-ink">{value}</div>
            </CardContent>
        </Card>
    );
}
