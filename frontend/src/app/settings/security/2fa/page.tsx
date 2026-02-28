"use client";

import React, { useState } from "react";
import { Smartphone, ShieldCheck, Key, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function TwoFactorAuthPage() {
    const [enabled, setEnabled] = useState(false);
    const [showSetup, setShowSetup] = useState(false);

    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="font-display text-3xl text-ink font-bold">Two-Factor Authentication</h1>
                <p className="text-ink-light mt-2">Add an extra layer of security to your account.</p>
            </div>

            <Card className={enabled ? "border-success/20 bg-success/5" : ""}>
                <CardHeader>
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-success/10 text-success' : 'bg-paper-mid text-ink-light'}`}>
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle>Authenticator App</CardTitle>
                                <CardDescription>Use an app like Google Authenticator or 1Password.</CardDescription>
                            </div>
                        </div>
                        <Switch checked={enabled} onCheckedChange={(val) => {
                            if (val) setShowSetup(true);
                            else setEnabled(false);
                        }} />
                    </div>
                </CardHeader>
                {enabled && (
                    <CardContent className="pt-0">
                        <div className="flex items-center gap-2 text-sm text-success">
                            <CheckCircle2 className="w-4 h-4" />
                            Active and protecting your account.
                        </div>
                    </CardContent>
                )}
            </Card>

            {showSetup && !enabled && (
                <Card className="border-accent/20 animate-in fade-in slide-in-from-top-4 duration-300">
                    <CardHeader>
                        <CardTitle className="text-lg">Setup Authenticator App</CardTitle>
                        <CardDescription>Scan the QR code with your security app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-48 h-48 bg-white border-8 border-white rounded-lg shadow-sm flex items-center justify-center p-2">
                                {/* Placeholder for QR code */}
                                <div className="w-full h-full bg-paper-dark flex items-center justify-center text-ink-light text-[10px] text-center p-4">
                                    [QR CODE PLACEHOLDER]
                                </div>
                            </div>
                            <div className="flex-1 space-y-4">
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">1. Scan the QR code</p>
                                    <p className="text-xs text-ink-light">If you can&apos;t scan it, enter this code manually: <code className="bg-paper-mid px-1 rounded text-accent">JBSWY3DPEHPK3PXP</code></p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">2. Enter verification code</p>
                                    <div className="flex gap-2">
                                        <Input placeholder="000000" className="max-w-[120px] text-center tracking-widest font-mono" maxLength={6} />
                                        <Button onClick={() => {
                                            setEnabled(true);
                                            setShowSetup(false);
                                        }}>Verify & Enable</Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-paper-mid text-ink-light rounded-xl flex items-center justify-center">
                            <Key className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Backup Codes</CardTitle>
                            <CardDescription>Generated recovery codes to access your account if you lose your phone.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-ink-light">Backup codes provide access if you lose your authentication device. Each code can only be used once.</p>
                    <Button variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Generate New Codes
                    </Button>
                </CardContent>
            </Card>

            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-4">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                    <p className="font-semibold">Important Security Note</p>
                    <p className="mt-1 opacity-80">We recommend saving your backup codes in a secure password manager. If you lose both your phone and backup codes, account recovery can take up to 7 days.</p>
                </div>
            </div>
        </div>
    );
}
