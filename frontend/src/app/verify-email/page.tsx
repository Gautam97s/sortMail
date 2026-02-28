"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Sparkles, ArrowRight, Mail, Loader2, XCircle, RefreshCw } from "lucide-react";

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"verifying" | "success" | "error" | "resend">("verifying");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            setStatus("error");
            return;
        }

        // Simulate email verification
        const timer = setTimeout(() => {
            setStatus("success");
            // Auto-redirect after success
            const redirectTimer = setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
            return () => clearTimeout(redirectTimer);
        }, 2000);

        return () => clearTimeout(timer);
    }, [searchParams, router]);

    const handleResend = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Resending verification email to:", email);
        setStatus("success");
    };

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
            <div className="max-w-md w-full">
                {status === "verifying" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="relative mx-auto w-20 h-20">
                            <div className="absolute inset-0 rounded-full border-4 border-accent/20"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center text-accent">
                                <Mail size={32} />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Verifying Email</h1>
                            <p className="text-ink-light leading-relaxed">
                                Just a moment while we confirm your identity and secure your account.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs text-muted font-medium bg-paper-mid py-2 px-4 rounded-full w-fit mx-auto">
                            <Loader2 size={12} className="animate-spin" />
                            SECURE HANDSHAKE IN PROGRESS
                        </div>
                    </div>
                )}

                {status === "success" && (
                    <div className="space-y-8 animate-in fade-in zoom-in slide-in-from-bottom-4 duration-700">
                        <div className="h-24 w-24 bg-success/10 rounded-3xl flex items-center justify-center text-success mx-auto relative">
                            <CheckCircle2 size={48} />
                            <div className="absolute -top-2 -right-2 h-10 w-10 bg-ai/10 rounded-full flex items-center justify-center text-ai animate-pulse">
                                <Sparkles size={20} />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Email Verified!</h1>
                            <p className="text-ink-light leading-relaxed">
                                Your account is now fully verified. Welcome to the future of email intelligence.
                            </p>
                        </div>

                        <div className="card p-8 bg-paper-mid/30 border-success/10 space-y-6">
                            <Link href="/dashboard" className="btn-primary w-full py-4 justify-center text-lg">
                                Go to Dashboard
                                <ArrowRight size={20} />
                            </Link>
                        </div>

                        <p className="text-xs text-muted italic">
                            Redirecting to your inbox in 3 seconds...
                        </p>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="h-20 w-20 bg-danger/10 rounded-full flex items-center justify-center text-danger mx-auto">
                            <XCircle size={40} />
                        </div>
                        <div className="space-y-3">
                            <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Invalid Link</h1>
                            <p className="text-ink-light leading-relaxed">
                                The verification link is invalid, has expired, or has already been used.
                            </p>
                        </div>
                        <div className="pt-4 flex flex-col gap-3">
                            <button
                                onClick={() => setStatus("resend")}
                                className="btn-primary justify-center"
                            >
                                Resend verification email
                            </button>
                            <Link href="/login" className="text-sm text-ink-light hover:text-accent underline">
                                Back to login
                            </Link>
                        </div>
                    </div>
                )}

                {status === "resend" && (
                    <div className="space-y-8 animate-in fade-in duration-500 text-left">
                        <div className="text-center">
                            <div className="h-16 w-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mx-auto mb-6">
                                <RefreshCw size={32} />
                            </div>
                            <h1 className="font-display text-3xl text-ink font-bold tracking-tight">Resend Link</h1>
                            <p className="text-ink-light mt-2">
                                Enter your email below to receive a new verification link.
                            </p>
                        </div>

                        <form onSubmit={handleResend} className="card p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-ink">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="w-full px-4 py-3 bg-paper-mid border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent transition-all outline-none"
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full py-3 justify-center">
                                Send New Link
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-paper flex items-center justify-center p-6 text-center">
                <div className="max-w-md w-full space-y-4">
                    <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
                    <p className="text-ink-light font-medium tracking-wide">INITIALIZING...</p>
                </div>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
