"use client";

import React from "react";
import Image from "next/image"; // Added import for Image
import { Blocks, Plus, ExternalLink, Settings2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { mockIntegrations } from "@/data/settings";

export default function IntegrationsSettingsPage() {
    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-3xl text-ink font-bold">Integrations</h1>
                    <p className="text-ink-light mt-2">Connect SortMail with your favorite tools and services.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Request Integration
                </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {mockIntegrations.map((app) => (
                    <Card key={app.id} className={app.status === 'pro' ? 'opacity-70' : ''}>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-white rounded-lg border border-border-light flex items-center justify-center p-2">
                                        {/* Replaced <img> with <Image /> and added alt text, width, and height */}
                                        <Image src={app.icon} alt={`${app.name} icon`} width={24} height={24} className="h-6 w-6 object-contain" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-base font-body">{app.name}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-1">{app.description}</CardDescription>
                                    </div>
                                </div>
                                {app.status === 'connected' ? (
                                    <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                                        <Check className="h-3 w-3 mr-1" /> Connected
                                    </Badge>
                                ) : app.status === 'pro' ? (
                                    <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">Pro Only</Badge>
                                ) : null}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {app.status === 'connected' ? (
                                <>
                                    <div className="flex items-center justify-between text-sm py-2 px-3 bg-paper-mid rounded-md border border-border-light">
                                        <span className="text-ink-light truncate mr-2">{app.account}</span>
                                        <Button variant="ghost" size="sm" className="h-7 text-xs text-danger hover:bg-danger/5 px-2">Disconnect</Button>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <Switch id={`sync-${app.id}`} defaultChecked />
                                            <Label htmlFor={`sync-${app.id}`} className="font-normal text-sm">Sync enabled</Label>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-ink-light">
                                            <Settings2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-between pt-2">
                                    <p className="text-xs text-ink-light italic">Not configured yet</p>
                                    <Button
                                        variant={app.status === 'pro' ? 'outline' : 'default'}
                                        size="sm"
                                        className="h-8 text-xs"
                                        disabled={app.status === 'pro'}
                                    >
                                        {app.status === 'pro' ? 'Upgrade to Connect' : 'Connect Account'}
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="bg-ink text-paper border-none overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Blocks className="w-32 h-32" />
                </div>
                <CardContent className="p-8 relative z-10">
                    <div className="max-w-md space-y-4">
                        <h4 className="text-2xl font-bold font-display">Custom Webhooks</h4>
                        <p className="text-paper/80">
                            Build your own integrations using our powerful webhook system.
                            Trigger any action in external apps when specific events occur in SortMail.
                        </p>
                        <Button variant="secondary" className="gap-2">
                            Go to Webhook Settings
                            <ExternalLink className="w-4 h-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
