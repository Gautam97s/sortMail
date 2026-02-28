"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, Sparkles } from "lucide-react";

export default function ResetPasswordPage() {
    const [step, setStep] = useState<"request" | "success">("request");
    const [email, setEmail] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate API call
        setStep("success");
    };

    if (step === "success") {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="h-20 w-20 bg-success/10 rounded-full flex items-center justify-center text-success mx-auto">
                        <CheckCircle2 size={40} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Check your email</h1>
                        <p className="text-ink-light">
                            We&apos;ve sent a password reset link to <span className="font-medium text-ink">{email}</span>.
                            The link will expire in 1 hour.
                        </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                        <Link href="/login" className="btn-primary justify-center">
                            Back to Login
                        </Link>
                        <button
                            onClick={() => setStep("request")}
                            className="text-sm text-ink-light hover:text-accent underline"
                        >
                            Didn&apos;t receive anything? Try again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6">
            <div className="max-w-md w-full">
                <Link href="/login" className="inline-flex items-center gap-2 text-ink-light hover:text-accent transition-colors mb-8 group">
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    Back to login
                </Link>

                <div className="mb-10">
                    <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-6">
                        <KeyRound size={32} />
                    </div>
                    <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Reset password</h1>
                    <p className="text-ink-light mt-2">
                        Enter your email address and we&apos;ll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card p-8 space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-ink">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full pl-10 pr-4 py-3 bg-paper-mid border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none"
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn-primary w-full py-3 justify-center text-base">
                        Send Reset Link
                        <Sparkles size={18} />
                    </button>
                </form>

                <div className="mt-12 p-6 bg-accent/5 rounded-2xl border border-accent/10 text-center">
                    <p className="text-sm text-ink-light leading-relaxed">
                        <span className="font-semibold text-accent">Pro Tip:</span> If you use Google or Outlook login, you can reset your password directly through their respective security portals.
                    </p>
                </div>
            </div>
        </div>
    );
}
