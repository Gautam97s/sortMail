"use client";

import React from "react";
import Link from "next/link";
import { Lock, Mail, ArrowRight, ShieldAlert, History } from "lucide-react";

export default function AccountLockedPage() {
    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="relative inline-block mb-8">
                    <div className="h-24 w-24 bg-danger/10 rounded-3xl flex items-center justify-center text-danger rotate-6">
                        <Lock size={48} />
                    </div>
                    <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-warning/20 rounded-full flex items-center justify-center text-warning border-4 border-paper">
                        <ShieldAlert size={20} />
                    </div>
                </div>

                <div className="space-y-3 mb-10">
                    <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Account Locked</h1>
                    <p className="text-ink-light leading-relaxed">
                        For your security, your account has been temporarily locked due to too many failed login attempts.
                    </p>
                </div>

                <div className="card p-8 text-left space-y-6 bg-paper-mid/50 border-danger/10">
                    <div className="flex gap-4 items-start pb-4 border-b border-border/50">
                        <div className="mt-1 text-danger">
                            <History size={20} />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-ink">Wait 30 minutes</p>
                            <p className="text-xs text-ink-light">Your account will automatically unlock after a short cooling-off period.</p>
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <Link href="/login" className="btn-secondary w-full justify-center">
                            Back to login
                        </Link>
                        <a href="mailto:security@sortmail.ai" className="btn-primary w-full justify-center bg-danger hover:bg-danger/90 border-danger/10">
                            <Mail size={16} />
                            Contact Security Team
                        </a>
                    </div>
                </div>

                <p className="text-xs text-muted mt-10 max-w-xs mx-auto">
                    If you didn&apos;t attempt these logins, please secure your email account and contact us immediately.
                </p>
            </div>
        </div>
    );
}
