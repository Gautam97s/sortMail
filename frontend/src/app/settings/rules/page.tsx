"use client";

import React, { useState } from "react";
import { Sliders, Plus, Play, Pause, Trash2, Edit2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

import { mockRules } from "@/data/settings";

export default function RulesSettingsPage() {
    const [rules, setRules] = useState(mockRules);

    const toggleRule = (id: string) => {
        setRules(rules.map(r => r.id === id ? { ...r, active: !r.active } : r));
    };

    return (
        <div className="max-w-5xl space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="font-display text-3xl text-ink font-bold">Automation Rules</h1>
                    <p className="text-ink-light mt-2">Create rules to automatically organize your inbox.</p>
                </div>
                <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Rule
                </Button>
            </div>

            <div className="space-y-4">
                {rules.map((rule) => (
                    <Card key={rule.id} className={`${!rule.active ? 'opacity-70' : ''} transition-opacity`}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-semibold text-ink">{rule.name}</h3>
                                        <Badge variant={rule.active ? "secondary" : "outline"} className="text-[10px] h-4">
                                            {rule.active ? "Active" : "Paused"}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-ink-light">
                                        <Zap className="w-3 h-3 text-accent" />
                                        <span>If {rule.trigger}</span>
                                        <span className="text-border mx-1">|</span>
                                        <span>Then {rule.action}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={rule.active}
                                        onCheckedChange={() => toggleRule(rule.id)}
                                    />
                                    <div className="w-[1px] h-8 bg-border ml-2 mr-1" />
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-ink-light">
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-ink-light hover:text-danger">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-dashed bg-transparent">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-12 w-12 rounded-full bg-paper-mid flex items-center justify-center text-ink-light">
                        <Sliders className="w-6 h-6" />
                    </div>
                    <div>
                        <h4 className="font-semibold text-ink">Smart Suggestion</h4>
                        <p className="text-sm text-ink-light max-w-sm mt-1">
                            Our AI detected that you archive 90% of emails from &quot;noreply@jira.com&quot;.
                            Want to create a rule for this?
                        </p>
                    </div>
                    <Button variant="outline" size="sm">Create Suggested Rule</Button>
                </CardContent>
            </Card>
        </div>
    );
}
