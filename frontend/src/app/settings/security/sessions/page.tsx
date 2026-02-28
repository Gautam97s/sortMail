"use client";

import React, { useState } from "react";
import { Laptop, Smartphone, Monitor, Globe, Clock, Shield, LogOut, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { mockSessions } from "@/data/settings";

export default function SessionsPage() {
    const [sessions, setSessions] = useState(mockSessions);

    const revokeSession = (id: string) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'desktop': return <Monitor className="w-5 h-5" />;
            case 'mobile': return <Smartphone className="w-5 h-5" />;
            default: return <Laptop className="w-5 h-5" />;
        }
    };

    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-3xl text-ink font-bold">Active Sessions</h1>
                    <p className="text-ink-light mt-2">Manage all devices where you are currently signed in.</p>
                </div>
                <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/5" onClick={() => setSessions(sessions.filter(s => s.isCurrent))}>
                    Revoke All Other Sessions
                </Button>
            </div>

            <div className="space-y-4">
                {sessions.map((session) => (
                    <Card key={session.id} className={session.isCurrent ? "border-primary/20 bg-primary/5" : ""}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${session.isCurrent ? 'bg-primary/10 text-primary' : 'bg-paper-mid text-ink-light'}`}>
                                        {getIcon(session.type)}
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-semibold text-ink">{session.device}</h3>
                                            {session.isCurrent && (
                                                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-[10px] h-4 uppercase">Current</Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-sm text-ink-light">
                                            <span className="flex items-center gap-1.5">
                                                <Globe className="w-3.5 h-3.5" />
                                                {session.location}
                                            </span>
                                            <span className="flex items-center gap-1.5 text-xs opacity-60">
                                                {session.browser}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {session.lastActive}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {!session.isCurrent ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/5"
                                        onClick={() => revokeSession(session.id)}
                                    >
                                        Revoke Access
                                    </Button>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 text-ink-light">
                                                <MoreVertical className="w-4 h-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-danger gap-2">
                                                <LogOut className="w-4 h-4" />
                                                Sign out of all devices
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-ink text-paper border-none">
                <CardContent className="p-8 flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary">
                            <Shield className="w-5 h-5 fill-current" />
                            <h4 className="font-bold text-lg">Secure your account</h4>
                        </div>
                        <p className="text-paper/70 max-w-md text-sm">
                            Noticed a session you don&apos;t recognize? Revoke its access immediately and change your password.
                        </p>
                    </div>
                    <Button variant="secondary">Security Audit</Button>
                </CardContent>
            </Card>
        </div>
    );
}
