"use client";

import React from "react";
import { ShieldCheck, Smartphone, Laptop, Globe, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/useSettings";

export default function SecuritySettingsPage() {
    const { data: settings, isLoading } = useSettings();
    const sessions = settings?.sessions || [];

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">Security</h1>
                <p className="text-ink-light mt-2">Security posture and active session visibility in one place.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-primary" />
                                Two-Factor Authentication
                            </CardTitle>
                            <CardDescription>
                                2FA enrollment management is not yet enabled from this workspace.
                            </CardDescription>
                        </div>
                        <Badge variant="outline">Planned</Badge>
                    </div>
                </CardHeader>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>Devices currently signed in to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {isLoading && (
                        <div className="text-sm text-ink-light">Loading sessions...</div>
                    )}

                    {!isLoading && sessions.length === 0 && (
                        <div className="text-sm text-ink-light">No active session records available.</div>
                    )}

                    {sessions.map((session: any) => (
                        <div key={session.id} className="rounded-xl border border-border-light p-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="h-10 w-10 rounded-lg bg-paper-mid text-ink-light flex items-center justify-center">
                                    {session.type === "mobile" ? <Smartphone className="w-4 h-4" /> : <Laptop className="w-4 h-4" />}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-semibold text-ink truncate">{session.device || "Unknown device"}</div>
                                    <div className="text-xs text-ink-light flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                                        <span className="inline-flex items-center gap-1"><Globe className="w-3 h-3" />{session.location || "Unknown"}</span>
                                        <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{session.lastActive || "Unknown"}</span>
                                    </div>
                                </div>
                            </div>
                            {session.isCurrent && <Badge className="bg-primary/10 text-primary border-primary/20">Current</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
