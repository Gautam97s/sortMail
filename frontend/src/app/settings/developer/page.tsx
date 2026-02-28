"use client";

import React, { useState } from "react";
import { Code2, Key, Globe, BookText, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { mockDeveloperSettings } from "@/data/settings";

export default function DeveloperSettingsPage() {
    const [apiKey] = useState(mockDeveloperSettings.apiKey);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText("sk_live_51P2u_example_key_12345");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-5xl space-y-8">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">Developer Tools</h1>
                <p className="text-ink-light mt-2">Build custom integrations and access our API.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle>API Keys</CardTitle>
                            <CardDescription>
                                Authenticate your requests to the SortMail API.
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="border-success/50 text-success bg-success/5">Live Mode</Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Secret Key</Label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    value={apiKey}
                                    readOnly
                                    className="font-mono bg-paper-mid border-dashed focus-visible:ring-0"
                                />
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-ink-light opacity-50">
                                    ••••••••
                                </div>
                            </div>
                            <Button variant="outline" size="icon" onClick={handleCopy}>
                                {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                            </Button>
                        </div>
                        <p className="text-xs text-ink-light">
                            Never share your API keys in client-side code or public repositories.
                        </p>
                    </div>
                    <div className="pt-2">
                        <Button variant="outline" className="text-danger border-danger/20 hover:bg-danger/5">
                            Revoke Key
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="w-5 h-5 text-accent" />
                            Webhooks
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-ink-light">
                            Receive real-time notifications for events like new emails processed or tasks created.
                        </p>
                        <Button variant="secondary" className="w-full">Configure Webhooks</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BookText className="w-5 h-5 text-accent" />
                            Documentation
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-ink-light">
                            Read our API guides and explore our client libraries for JavaScript, Python, and Ruby.
                        </p>
                        <Button variant="outline" className="w-full gap-2">
                            API Reference
                            <ExternalLink className="w-3 h-3" />
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-l-4 border-l-accent">
                <CardContent className="p-6">
                    <h4 className="font-semibold text-ink flex items-center gap-2">
                        <Code2 className="w-4 h-4" />
                        SortMail SDK v1.2 is here
                    </h4>
                    <p className="text-sm text-ink-light mt-1">
                        We&apos;ve added full TypeScript support and improved local testing tools.
                    </p>
                    <pre className="mt-4 p-3 bg-paper-dark rounded-lg text-xs font-mono text-ink-light overflow-x-auto">
                        npm install @sortmail/sdk
                    </pre>
                </CardContent>
            </Card>
        </div>
    );
}
