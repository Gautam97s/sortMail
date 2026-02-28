"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CreditCard, ArrowRight, Zap, CheckCircle2 } from "lucide-react";

import { mockBillingPlan } from "@/data/settings";

export default function BillingExpiredPage() {
    const plan = mockBillingPlan;

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="h-20 w-20 bg-warning/10 rounded-2xl flex items-center justify-center text-warning mx-auto mb-8">
                    <AlertCircle size={40} />
                </div>

                <div className="space-y-3 mb-10">
                    <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Your Subscription has Expired</h1>
                    <p className="text-ink-light leading-relaxed">
                        Your account is currently in read-only mode. Renew your subscription to restore AI intelligence and automation features.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="card p-6 bg-paper-mid/50 border-warning/10 text-left">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted">Current Plan</span>
                            <span className="badge badge-warning">Expired</span>
                        </div>
                        <h3 className="text-xl font-display font-bold text-ink mb-1">{plan.name}</h3>
                        <p className="text-sm text-ink-light mb-6">Unlimited AI briefings & smart rules</p>

                        <div className="space-y-3 mb-6">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm text-ink-light">
                                    <CheckCircle2 size={16} className="text-success" />
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <button className="btn-primary w-full py-3 justify-center text-base">
                            <CreditCard size={18} />
                            Renew Subscription
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <Link href="/dashboard" className="btn-secondary gap-2 justify-center">
                            Return to Dashboard
                        </Link>
                        <Link href="/settings/billing" className="btn-secondary gap-2 justify-center">
                            Manage Billing
                        </Link>
                    </div>
                </div>

                <div className="mt-12 p-4 bg-accent/5 rounded-xl border border-accent/10">
                    <p className="text-xs text-ink-light leading-relaxed">
                        Need help? <a href="mailto:billing@sortmail.ai" className="text-accent hover:underline font-medium">Contact our billing team</a> for assistance with your account.
                    </p>
                </div>
            </div>
        </div>
    );
}
