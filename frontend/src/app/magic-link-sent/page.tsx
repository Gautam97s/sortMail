"use client";

import React, { useEffect } from "react";
import gsap from "gsap";
import { Mail, ArrowLeft, RefreshCw, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MagicLinkSentPage() {
    useEffect(() => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

        tl.fromTo(".status-icon", { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" });
        tl.fromTo(".headline", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, "-=0.2");
        tl.fromTo(".subline", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, "-=0.3");
        tl.fromTo(".action-card", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, "-=0.4");
    }, []);

    const [resending, setResending] = React.useState(false);
    const [resent, setResent] = React.useState(false);

    const handleResend = async () => {
        const email = sessionStorage.getItem("pending_email");
        if (!email) return;

        try {
            setResending(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/magic-link`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setResent(true);
                setTimeout(() => setResent(false), 3000);
            }
        } catch (error) {
            console.error("Failed to resend magic link", error);
        } finally {
            setResending(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-paper flex items-center justify-center relative overflow-hidden">
            {/* Background Orbs matching login page */}
            <div className="absolute top-[-15%] left-[-10%] w-[700px] h-[700px] bg-[#C05E3C]/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-8%] w-[600px] h-[600px] bg-[#7C5CFC]/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[440px] w-full mx-auto px-6 text-center z-10">
                <div className="status-icon w-20 h-20 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-8">
                    <Mail className="w-10 h-10 text-success" />
                </div>

                <h1 className="headline font-display text-4xl text-ink leading-tight mb-4">
                    Check your email
                </h1>

                <p className="subline text-base text-ink-light leading-relaxed mb-10">
                    We&apos;ve sent a secure login link to your inbox. It will expire in 15 minutes.
                </p>

                <div className="action-card card p-8 text-left bg-white/80 backdrop-blur-sm shadow-xl shadow-ink/5">
                    <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-success" />
                        Next steps:
                    </h3>

                    <ul className="space-y-4 mb-8">
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-paper-deep flex items-center justify-center text-[10px] font-bold text-ink-light shrink-0 mt-0.5">1</div>
                            <p className="text-sm text-ink-light leading-relaxed">Open the email from <b>SortMail</b>.</p>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-paper-deep flex items-center justify-center text-[10px] font-bold text-ink-light shrink-0 mt-0.5">2</div>
                            <p className="text-sm text-ink-light leading-relaxed">Click the <b>&quot;Sign in to SortMail&quot;</b> button.</p>
                        </li>
                    </ul>

                    <div className="space-y-3">
                        <Button
                            className="w-full h-11 gap-2"
                            variant="outline"
                            onClick={handleResend}
                            disabled={resending || resent}
                        >
                            {resending ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : resent ? (
                                <>
                                    <CheckCircle2 size={16} className="text-success" />
                                    Sent!
                                </>
                            ) : (
                                <>
                                    <RefreshCw size={16} />
                                    Resend Link
                                </>
                            )}
                        </Button>
                        <Link href="/login" className="block">
                            <Button className="w-full h-11 gap-2 border-transparent hover:bg-paper-mid w-full" variant="ghost">
                                <ArrowLeft size={16} />
                                Back to login
                            </Button>
                        </Link>
                    </div>
                </div>

                <p className="mt-8 text-xs text-muted">
                    Didn&apos;t receive it? Check your spam folder or contact support.
                </p>
            </div>
        </main>
    );
}
